from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import httpx
import asyncio
import xml.etree.ElementTree as ET
from datetime import datetime
import random
from fastapi.background import BackgroundTasks

# Модели данных
class CurrencyRate(BaseModel):
    code: str
    name: str
    rate: float
    change: float
    lastUpdated: str

class CurrencyHistoryPoint(BaseModel):
    date: str
    value: str

class Statistics(BaseModel):
    high24h: float
    low24h: float
    change7d: float
    change30d: float

# Создаем приложение
app = FastAPI()

# Добавляем CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Хранилище данных
class CurrencyStorage:
    def __init__(self):
        self.rates: Dict[str, CurrencyRate] = {}
        self.history: Dict[str, List[CurrencyHistoryPoint]] = {}
        self.last_update: Optional[str] = None
        self.connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.connections:
            try:
                await connection.send_json(message)
            except WebSocketDisconnect:
                self.connections.remove(connection)

storage = CurrencyStorage()

# Функции для работы с данными ЦБ РФ
async def fetch_cbr_data():
    url = "https://www.cbr.ru/scripts/XML_daily.asp"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.text

def parse_xml_rates(xml_data: str) -> Dict[str, CurrencyRate]:
    rates = {}
    root = ET.fromstring(xml_data)

    for valute in root.findall('Valute'):
        code = valute.find('CharCode').text
        name = valute.find('Name').text
        nominal = float(valute.find('Nominal').text)
        value = float(valute.find('Value').text.replace(',', '.'))
        rate = value / nominal

        # Генерируем случайное изменение для демонстрации
        change = random.uniform(-0.5, 0.5)

        rates[code] = CurrencyRate(
            code=code,
            name=name,
            rate=rate,
            change=change,
            lastUpdated=datetime.now().isoformat()
        )

    return rates

# Периодическое обновление данных
async def update_currency_data():
    while True:
        try:
            xml_data = await fetch_cbr_data()
            storage.rates = parse_xml_rates(xml_data)
            storage.last_update = datetime.now().isoformat()

            # Отправляем обновления всем подключенным клиентам
            await storage.broadcast({
                "type": "rates_update",
                "data": {code: rate.dict() for code, rate in storage.rates.items()}
            })

        except Exception as e:
            print(f"Error updating currency data: {e}")

        # Ждем 12 часов перед следующим обновлением
        await asyncio.sleep(12 * 60 * 60)

# API endpoints
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(update_currency_data())

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await storage.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Здесь можно добавить обработку входящих сообщений
    except WebSocketDisconnect:
        storage.disconnect(websocket)

@app.get("/api/currencies")
async def get_currencies():
    return [{"code": code, "name": rate.name} for code, rate in storage.rates.items()]

@app.get("/api/currencies/{code}")
async def get_currency(code: str):
    if code not in storage.rates:
        return {"error": "Currency not found"}

    rate = storage.rates[code]
    return {
        **rate.dict(),
        "statistics": {
            "high24h": rate.rate * 1.05,
            "low24h": rate.rate * 0.95,
            "change7d": random.uniform(-5, 5),
            "change30d": random.uniform(-10, 10)
        }
    }

@app.get("/api/currencies/{code}/history")
async def get_currency_history(code: str, range: str = "30"):
    if code not in storage.rates:
        return {"error": "Currency not found"}

    # Генерируем исторические данные для демонстрации
    days = int(range)
    base_rate = storage.rates[code].rate
    history = []

    for i in range(days):
        date = (datetime.now() - datetime.timedelta(days=i)).strftime("%Y-%m-%d")
        value = base_rate * (1 + random.uniform(-0.1, 0.1))
        history.append({"date": date, "value": f"{value:.4f}"})

    return history

@app.get("/api/convert")
async def convert_currency(from_currency: str, to_currency: str, amount: float):
    if from_currency not in storage.rates or to_currency not in storage.rates:
        return {"error": "Currency not found"}

    from_rate = storage.rates[from_currency].rate
    to_rate = storage.rates[to_currency].rate
    result = amount * (to_rate / from_rate)

    return {
        "result": result,
        "rate": to_rate / from_rate
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)