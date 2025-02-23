import sqlite3
import requests
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz
import logging
from typing import List, Optional, Tuple
from contextlib import contextmanager
from pathlib import Path

# Конфигурация
DB_PATH = Path("currency.db")
CBR_URL = "https://www.cbr.ru/scripts/XML_daily.asp"
MOSCOW_TZ = pytz.timezone("Europe/Moscow")

# Настройка логирования
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Инициализация FastAPI
app = FastAPI(
    title="Currency Rates API",
    description="API для получения курсов валют ЦБ РФ",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Модели данных
class Statistics(BaseModel):
    high7d: float
    low7d: float
    change14d: float
    change30d: float


class CurrencyRateResponse(BaseModel):
    code: str
    name: str
    rate: float
    change: float
    last_updated: str
    statistics: Statistics


class CurrencyInfo(BaseModel):
    code: str
    name: str


class HistoryEntry(BaseModel):
    date: str
    value: float


class HistoryResponse(BaseModel):
    code: str
    history: List[HistoryEntry]


class ConvertResponse(BaseModel):
    result: float
    rate: float


# Утилиты
def to_iso_date(date_str: str) -> str:
    """Конвертация даты из dd/mm/yyyy в YYYY-MM-DD"""
    return datetime.strptime(date_str, "%d/%m/%Y").strftime("%Y-%m-%d")


class DatabaseManager:
    """Управление базой данных SQLite"""

    @staticmethod
    @contextmanager
    def connection():
        conn = sqlite3.connect(DB_PATH)
        try:
            yield conn
        finally:
            conn.close()

    @classmethod
    def init(cls):
        """Инициализация базы данных"""
        with cls.connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS currency (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT,
                    currency_code TEXT,
                    currency_name TEXT,
                    value REAL,
                    nominal REAL,
                    UNIQUE(date, currency_code)
                )
            """)
            conn.commit()
        logger.info("База данных инициализирована")


class CurrencyService:
    """Логика работы с валютами"""

    @staticmethod
    def fetch_rates(date_str: str) -> List[Tuple[str, str, str, float, float]]:
        """Получение данных с ЦБ РФ"""
        try:
            response = requests.get(f"{CBR_URL}?date_req={date_str}", timeout=10)
            response.raise_for_status()
            root = ET.fromstring(response.content)
            if not root.findall("Valute"):
                raise ValueError(f"Нет данных за {date_str}")

            return [
                (
                    date_str,
                    valute.find("CharCode").text,
                    valute.find("Name").text,
                    float(valute.find("Value").text.replace(",", ".")),
                    float(valute.find("Nominal").text.replace(",", "."))
                )
                for valute in root.findall("Valute")
            ]
        except (requests.RequestException, ET.ParseError, ValueError) as e:
            logger.error(f"Ошибка получения данных за {date_str}: {e}")
            raise

    @staticmethod
    def upsert_rates(rows: List[Tuple[str, str, str, float, float]]):
        """Обновление или вставка данных в БД"""
        with DatabaseManager.connection() as conn:
            conn.executemany("""
                INSERT OR REPLACE INTO currency (id, date, currency_code, currency_name, value, nominal)
                VALUES (
                    (SELECT id FROM currency WHERE date = ? AND currency_code = ?),
                    ?, ?, ?, ?, ?
                )
            """, [(r[0], r[1], *r) for r in rows])
            conn.commit()
        logger.info(f"Обновлены данные за {rows[0][0]} ({len(rows)} валют)")

    @classmethod
    def update_today(cls, force_sync: bool = False):
        """Обновление данных за текущий день"""
        today = datetime.now().strftime("%d/%m/%Y")
        try:
            rows = cls.fetch_rates(today)
            cls.upsert_rates(rows)
        except Exception as e:
            logger.error(f"Ошибка обновления данных за {today}: {e}")
            if force_sync:
                raise  # Принудительно поднимаем ошибку при синхронном вызове
            return False
        return True

    @staticmethod
    def latest_date() -> Optional[str]:
        """Получение последней даты из БД"""
        with DatabaseManager.connection() as conn:
            result = conn.execute("""
                SELECT date 
                FROM currency 
                ORDER BY strftime('%Y-%m-%d', 
                        substr(date, 7, 4) || '-' || 
                        substr(date, 4, 2) || '-' || 
                        substr(date, 1, 2)) DESC 
                LIMIT 1
            """).fetchone()
            return result[0] if result else None

    @staticmethod
    def get_rate_at_or_before(cursor, code: str, target_date: str) -> Optional[float]:
        """Получение курса на дату или ближайшую предыдущую дату"""
        iso_target = to_iso_date(target_date)
        row = cursor.execute("""
            SELECT value, nominal
            FROM currency
            WHERE currency_code = ? AND 
                  strftime('%Y-%m-%d', substr(date, 7, 4) || '-' || 
                  substr(date, 4, 2) || '-' || substr(date, 1, 2)) <= ?
            ORDER BY strftime('%Y-%m-%d', substr(date, 7, 4) || '-' || 
                    substr(date, 4, 2) || '-' || substr(date, 1, 2)) DESC
            LIMIT 1
        """, (code, iso_target)).fetchone()
        if row:
            logger.debug(f"Найден курс для {code} на {target_date}: {row[0] / row[1]}")
            return row[0] / row[1]
        logger.warning(f"Нет данных для {code} на или до {target_date}")
        return None


# API эндпоинты
@app.get("/api/currencies/{code}", response_model=CurrencyRateResponse)
async def get_currency(code: str):
    code = code.upper()
    last_date = CurrencyService.latest_date()
    if not last_date:
        raise HTTPException(status_code=404, detail="Нет данных в базе")

    last_date_obj = datetime.strptime(last_date, "%d/%m/%Y")

    with DatabaseManager.connection() as conn:
        cursor = conn.cursor()

        # Текущий курс
        row = cursor.execute("""
            SELECT currency_code, currency_name, value, nominal
            FROM currency
            WHERE date = ? AND currency_code = ?
        """, (last_date, code)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Нет данных для {code} за {last_date}")

        curr_code, curr_name, value, nominal = row
        rate = value / nominal

        # Дневное изменение
        yesterday = (last_date_obj - timedelta(days=1)).strftime("%d/%m/%Y")
        row_y = cursor.execute("""
            SELECT value, nominal
            FROM currency
            WHERE date = ? AND currency_code = ?
        """, (yesterday, code)).fetchone()
        daily_change = (rate - (row_y[0] / row_y[1])) if row_y else 0.0

        # Статистика за 7 дней
        seven_days_ago = (last_date_obj - timedelta(days=7)).strftime("%Y-%m-%d")
        high7d, low7d = cursor.execute("""
            SELECT MAX(value/nominal), MIN(value/nominal)
            FROM currency
            WHERE currency_code = ? AND 
                  strftime('%Y-%m-%d', substr(date, 7, 4) || '-' || 
                  substr(date, 4, 2) || '-' || substr(date, 1, 2)) >= ?
        """, (code, seven_days_ago)).fetchone() or (rate, rate)
        high7d = high7d or rate
        low7d = low7d or rate

        # Изменение за 14 дней
        date_14 = (last_date_obj - timedelta(days=14)).strftime("%d/%m/%Y")
        rate_14 = CurrencyService.get_rate_at_or_before(cursor, code, date_14)
        change14d = (rate - rate_14) if rate_14 is not None else 0.0

        # Изменение за 30 дней
        date_30 = (last_date_obj - timedelta(days=30)).strftime("%d/%m/%Y")
        rate_30 = CurrencyService.get_rate_at_or_before(cursor, code, date_30)
        change30d = (rate - rate_30) if rate_30 is not None else 0.0

    return CurrencyRateResponse(
        code=curr_code,
        name=curr_name,
        rate=rate,
        change=daily_change,
        last_updated=last_date_obj.isoformat(),
        statistics=Statistics(
            high7d=high7d,
            low7d=low7d,
            change14d=change14d,
            change30d=change30d
        )
    )


@app.get("/api/currencies", response_model=List[CurrencyInfo])
async def get_currencies():
    last_date = CurrencyService.latest_date()
    if not last_date:
        raise HTTPException(status_code=404, detail="Нет данных в базе")

    with DatabaseManager.connection() as conn:
        rows = conn.execute("""
            SELECT DISTINCT currency_code, currency_name
            FROM currency
            WHERE date = ?
        """, (last_date,)).fetchall()
        return [CurrencyInfo(code=row[0], name=row[1]) for row in rows]


@app.get("/api/currencies/{code}/history", response_model=List[HistoryEntry])
async def get_history(code: str, days: int = Query(30, ge=1, le=365)):
    code = code.upper()
    last_date = CurrencyService.latest_date()
    if not last_date:
        raise HTTPException(status_code=404, detail="Нет данных в базе")

    start_date = (datetime.strptime(last_date, "%d/%m/%Y") - timedelta(days=days)).strftime("%Y-%m-%d")

    with DatabaseManager.connection() as conn:
        rows = conn.execute("""
            SELECT date, value/nominal
            FROM currency
            WHERE currency_code = ? AND 
                  strftime('%Y-%m-%d', substr(date, 7, 4) || '-' || 
                  substr(date, 4, 2) || '-' || substr(date, 1, 2)) >= ?
            ORDER BY strftime('%Y-%m-%d', substr(date, 7, 4) || '-' || 
                    substr(date, 4, 2) || '-' || substr(date, 1, 2)) ASC
        """, (code, start_date)).fetchall()
        if not rows:
            raise HTTPException(status_code=404, detail=f"Нет истории для {code}")
        return [HistoryEntry(date=row[0], value=row[1]) for row in rows]


@app.get("/api/currencies/{code}/history_range", response_model=HistoryResponse)
async def get_history_range(
        code: str,
        start: str = Query(..., regex=r"^\d{2}/\d{2}/\d{4}$", description="dd/mm/yyyy"),
        end: str = Query(..., regex=r"^\d{2}/\d{2}/\d{4}$", description="dd/mm/yyyy")
):
    code = code.upper()
    try:
        start_dt = datetime.strptime(start, "%d/%m/%Y")
        end_dt = datetime.strptime(end, "%d/%m/%Y")
        if start_dt > end_dt:
            raise ValueError("Начальная дата позже конечной")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Ошибка даты: {str(e)}")

    with DatabaseManager.connection() as conn:
        rows = conn.execute("""
            SELECT date, value/nominal
            FROM currency
            WHERE currency_code = ? AND 
                  strftime('%Y-%m-%d', substr(date, 7, 4) || '-' || 
                  substr(date, 4, 2) || '-' || substr(date, 1, 2)) 
                  BETWEEN ? AND ?
            ORDER BY strftime('%Y-%m-%d', substr(date, 7, 4) || '-' || 
                    substr(date, 4, 2) || '-' || substr(date, 1, 2)) ASC
        """, (code, to_iso_date(start), to_iso_date(end))).fetchall()
        if not rows:
            raise HTTPException(status_code=404, detail=f"Нет данных для {code} в диапазоне")
        return HistoryResponse(
            code=code,
            history=[HistoryEntry(date=row[0], value=row[1]) for row in rows]
        )


@app.get("/api/convert", response_model=ConvertResponse)
async def convert(
        from_currency: str,
        to_currency: str,
        amount: float = Query(..., gt=0, description="Сумма для конвертации")
):
    from_currency, to_currency = from_currency.upper(), to_currency.upper()
    last_date = CurrencyService.latest_date()
    if not last_date:
        raise HTTPException(status_code=404, detail="Нет данных в базе")

    with DatabaseManager.connection() as conn:
        row_from = conn.execute("""
            SELECT value, nominal
            FROM currency
            WHERE date = ? AND currency_code = ?
        """, (last_date, from_currency)).fetchone()
        row_to = conn.execute("""
            SELECT value, nominal
            FROM currency
            WHERE date = ? AND currency_code = ?
        """, (last_date, to_currency)).fetchone()

        if not row_from or not row_to:
            raise HTTPException(status_code=404, detail="Валюта не найдена")

        from_rate = row_from[0] / row_from[1]
        to_rate = row_to[0] / row_to[1]
        rate = to_rate / from_rate
        return ConvertResponse(result=amount * rate, rate=rate)


@app.on_event("startup")
async def startup():
    # Инициализация базы данных
    DatabaseManager.init()

    # Синхронное обновление данных при запуске
    if not CurrencyService.update_today(force_sync=True):
        logger.error("Не удалось обновить данные при запуске")
        raise RuntimeError("Не удалось выполнить начальное обновление данных")

    # Настройка планировщика для асинхронных обновлений
    scheduler = AsyncIOScheduler(timezone=MOSCOW_TZ)
    scheduler.add_job(
        CurrencyService.update_today,
        CronTrigger(hour="0,12", minute="5", timezone=MOSCOW_TZ)
    )
    scheduler.start()
    logger.info("Планировщик запущен: обновление в 00:05 и 12:05 MSK")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)