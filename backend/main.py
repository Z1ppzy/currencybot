import sqlite3
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Разрешаем запросы со всех источников
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Модели данных для ответа
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
    lastUpdated: str
    statistics: Statistics


DB_PATH = "currency.db"


def convert_date_format(date_str: str) -> str:
    """
    Преобразует дату из формата dd/mm/yyyy в формат yyyy-mm-dd
    """
    dt = datetime.strptime(date_str, "%d/%m/%Y")
    return dt.strftime("%Y-%m-%d")


@app.get("/api/currencies/{code}", response_model=CurrencyRateResponse)
def get_currency(code: str):
    code = code.upper()
    today = datetime.now()
    today_str = today.strftime("%d/%m/%Y")
    iso_today = convert_date_format(today_str)

    # Получаем вчерашнюю дату для расчёта дневного изменения
    yesterday = today - timedelta(days=1)
    yesterday_str = yesterday.strftime("%d/%m/%Y")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Для корректного сравнения дат используем преобразование:
    date_conversion = "substr(date, 7, 4) || '-' || substr(date, 4, 2) || '-' || substr(date, 1, 2)"

    # 1. Получаем курс на выбранную (сегодняшнюю) дату, учитывая nominal
    cursor.execute("""
        SELECT currency_code, currency_name, value, nominal
        FROM currency
        WHERE date = ? AND currency_code = ?
    """, (today_str, code))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="В базе нет данных для данной валюты на сегодня")
    curr_code, curr_name, curr_value, curr_nominal = row
    actual_rate = curr_value / curr_nominal

    # 2. Рассчитываем дневное изменение (сравниваем с вчерашним курсом)
    cursor.execute("""
        SELECT value, nominal
        FROM currency
        WHERE date = ? AND currency_code = ?
    """, (yesterday_str, code))
    row_yesterday = cursor.fetchone()
    if row_yesterday:
        y_value, y_nominal = row_yesterday
        yesterday_rate = y_value / y_nominal
        daily_change = actual_rate - yesterday_rate
    else:
        daily_change = 0.0

    # 3. Статистика за последние 7 дней: максимум и минимум (с учётом nominal)
    seven_days_ago = today - timedelta(days=7)
    iso_seven_days_ago = seven_days_ago.strftime("%Y-%m-%d")
    cursor.execute(f"""
        SELECT MAX(value/nominal), MIN(value/nominal)
        FROM currency 
        WHERE currency_code = ?
          AND date({date_conversion}) BETWEEN date(?) AND date(?)
    """, (code, iso_seven_days_ago, iso_today))
    row_stats = cursor.fetchone()
    high7d, low7d = row_stats if row_stats else (actual_rate, actual_rate)
    if high7d is None:
        high7d = actual_rate
    if low7d is None:
        low7d = actual_rate

    # 4. Извлекаем курс 14 дней назад для расчёта изменения за 14 дней
    date_14 = today - timedelta(days=14)
    date_14_str = date_14.strftime("%d/%m/%Y")
    cursor.execute("""
        SELECT value, nominal
        FROM currency
        WHERE date = ? AND currency_code = ?
    """, (date_14_str, code))
    row_14 = cursor.fetchone()
    if row_14:
        val14, nom14 = row_14
        rate_14 = val14 / nom14
        change14d = actual_rate - rate_14
    else:
        change14d = 0.0

    # 5. Извлекаем курс 30 дней назад для расчёта изменения за 30 дней
    date_30 = today - timedelta(days=30)
    date_30_str = date_30.strftime("%d/%m/%Y")
    cursor.execute("""
        SELECT value, nominal
        FROM currency
        WHERE date = ? AND currency_code = ?
    """, (date_30_str, code))
    row_30 = cursor.fetchone()
    if row_30:
        val30, nom30 = row_30
        rate_30 = val30 / nom30
        change30d = actual_rate - rate_30
    else:
        change30d = 0.0

    conn.close()

    response = {
        "code": curr_code,
        "name": curr_name,
        "rate": actual_rate,
        "change": daily_change,
        "lastUpdated": datetime.now().isoformat(),
        "statistics": {
            "high7d": high7d,
            "low7d": low7d,
            "change14d": change14d,
            "change30d": change30d
        }
    }
    return response


@app.get("/api/currencies")
def get_currencies():
    """
    Возвращает список валют, для которых есть данные на текущую дату.
    """
    today_str = datetime.now().strftime("%d/%m/%Y")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT DISTINCT currency_code, currency_name
        FROM currency
        WHERE date = ?
    """, (today_str,))
    rows = cursor.fetchall()
    conn.close()
    currencies = [{"code": row[0], "name": row[1]} for row in rows]
    return currencies


@app.get("/api/currencies/{code}/history")
def get_currency_history(code: str, days: int = 30):
    """
    Возвращает историю курсов для выбранной валюты за указанное число дней.
    """
    code = code.upper()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    start_date = datetime.now() - timedelta(days=days)
    iso_start = start_date.strftime("%Y-%m-%d")
    date_conversion = "substr(date, 7, 4) || '-' || substr(date, 4, 2) || '-' || substr(date, 1, 2)"
    cursor.execute(f"""
        SELECT date, value/nominal
        FROM currency
        WHERE currency_code = ?
          AND date({date_conversion}) >= date(?)
        ORDER BY date({date_conversion}) DESC
    """, (code, iso_start))
    rows = cursor.fetchall()
    conn.close()
    history = [{"date": row[0], "value": row[1]} for row in rows]
    return history


@app.get("/api/currencies/{code}/history_range")
def get_currency_history_range(
        code: str,
        start: str = Query(..., description="Начальная дата в формате dd/mm/yyyy"),
        end: str = Query(..., description="Конечная дата в формате dd/mm/yyyy")
):
    """
    Возвращает историю курсов для выбранной валюты за указанный период.
    Параметры:
    - start: начальная дата в формате dd/mm/yyyy
    - end: конечная дата в формате dd/mm/yyyy
    """
    code = code.upper()
    # Преобразуем входные даты в ISO формат для сравнения
    try:
        iso_start = convert_date_format(start)
        iso_end = convert_date_format(end)
    except ValueError:
        raise HTTPException(status_code=400, detail="Неверный формат даты. Ожидается dd/mm/yyyy.")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    date_conversion = "substr(date, 7, 4) || '-' || substr(date, 4, 2) || '-' || substr(date, 1, 2)"
    cursor.execute(f"""
        SELECT date, value/nominal
        FROM currency
        WHERE currency_code = ?
          AND date({date_conversion}) BETWEEN date(?) AND date(?)
        ORDER BY date({date_conversion}) ASC
    """, (code, iso_start, iso_end))
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        raise HTTPException(status_code=404, detail="Нет данных за указанный период для данной валюты")
    history = [{"date": row[0], "value": row[1]} for row in rows]
    return {"code": code, "history": history}


@app.get("/api/convert")
def convert_currency(from_currency: str, to_currency: str, amount: float):
    """
    Конвертация суммы из одной валюты в другую по курсу на сегодня.
    """
    from_currency = from_currency.upper()
    to_currency = to_currency.upper()
    today_str = datetime.now().strftime("%d/%m/%Y")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Получаем данные для from_currency с учетом nominal
    cursor.execute("""
        SELECT value, nominal
        FROM currency
        WHERE date = ? AND currency_code = ?
    """, (today_str, from_currency))
    row_from = cursor.fetchone()
    # Получаем данные для to_currency
    cursor.execute("""
        SELECT value, nominal
        FROM currency
        WHERE date = ? AND currency_code = ?
    """, (today_str, to_currency))
    row_to = cursor.fetchone()
    conn.close()
    if not row_from or not row_to:
        raise HTTPException(status_code=404, detail="Данные для одной из валют не найдены")
    from_rate = row_from[0] / row_from[1]
    to_rate = row_to[0] / row_to[1]
    result = amount * (to_rate / from_rate)
    return {"result": result, "rate": to_rate / from_rate}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
