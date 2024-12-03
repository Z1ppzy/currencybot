import os
import time
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher, Router, F
from aiogram.types import Message, ReplyKeyboardMarkup, KeyboardButton
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.filters.command import Command
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import asyncio
import requests
from datetime import datetime
import logging
import pytz
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from typing import Dict, Optional
import pickle

from crypto_rankings import (
    get_cached_top_cryptocurrencies,
    format_top_cryptocurrencies,
    update_crypto_cache
)

logging.basicConfig(
    level=logging.INFO,  
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

load_dotenv()
API_TOKEN = os.getenv('BOT_TOKEN')

if not API_TOKEN:
    logger.error("BOT_TOKEN не найден. Убедитесь, что он задан в файле .env")
    exit(1)

CURRENCY_URL = "https://www.cbr.ru/scripts/XML_daily.asp"
CRYPTO_URL = ("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,"
              "ethereum&vs_currencies=usd")

bot = Bot(token=API_TOKEN)
dp = Dispatcher(storage=MemoryStorage())
router = Router()

moscow_tz = pytz.timezone('Europe/Moscow')

active_users = set()

@dataclass
class Rate:
    current: float
    previous: Optional[float] = None

    def update(self, new_value: float) -> tuple[float, Optional[float]]:
        self.previous = self.current
        self.current = new_value
        return self.current, self.previous

class GlobalRates:
    def __init__(self):
        self.rates: Dict[str, Rate] = {}

    def get_or_create(self, currency: str) -> Rate:
        if currency not in self.rates:
            self.rates[currency] = Rate(0)
        return self.rates[currency]

    def update(self, currency: str, value: float) -> tuple[float, Optional[float]]:
        rate = self.get_or_create(currency)
        return rate.update(value)

global_rates = GlobalRates()

DATA_DIR = os.path.join(os.getcwd(), 'data')

# Убеждаемся, что директория существует
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)
    logger.info(f"Data directory created at {DATA_DIR}")
else:
    logger.info(f"Data directory exists at {DATA_DIR}")

RATES_FILE = os.path.join(DATA_DIR, 'rates.pkl')
USERS_FILE = os.path.join(DATA_DIR, 'users.pkl')

def create_main_keyboard():
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="💰 Курсы валют"),
             KeyboardButton(text="🪙 Криптовалюты")],
            [KeyboardButton(text="📊 Все курсы"),
             KeyboardButton(text="🏆 Топ криптовалют")],
            [KeyboardButton(text="ℹ️ Помощь")]
        ],
        resize_keyboard=True,
        input_field_placeholder="Выберите действие"
    )

def format_rate_change(current: float, previous: Optional[float],
                       currency_code: str) -> str:
    if previous is None or previous == 0:
        return f"{current:.2f}₽"

    change = current - previous
    percent = (change / previous) * 100 if previous else 0

    value_str = f"{current:.2f}"

    if change > 0:
        return (f"{value_str}₽ (📈 +{change:.2f}₽, +{percent:.2f}%)")
    elif change < 0:
        return (f"{value_str}₽ (📉 {change:.2f}₽, {percent:.2f}%)")
    else:
        return f"{value_str}₽ (➖ 0.00₽, 0.00%)"

def parse_cbr_xml(xml_content):
    try:
        root = ET.fromstring(xml_content)
        currencies = {}
        for valute in root.findall(".//Valute"):
            char_code = valute.find('CharCode').text
            value = float(valute.find('Value').text.replace(',', '.'))
            nominal = int(valute.find('Nominal').text)
            currencies[char_code] = value / nominal
        return currencies
    except Exception as e:
        logger.error(f"Error parsing CBR XML: {e}")
        return None

def get_currency_rates():
    try:
        current_time = datetime.now(moscow_tz).strftime('%H:%M:%S')
        output = [f"💰 Курс валют на {current_time} МСК:\n"]

        for currency, code, symbol in [
            ("Доллар США", "USD", "💵"),
            ("Евро", "EUR", "💶"),
            ("Юань", "CNY", "🇨🇳"),
            ("Иена", "JPY", "🇯🇵")
        ]:
            rate = global_rates.get_or_create(code)
            current = rate.current
            previous = rate.previous
            formatted_rate = format_rate_change(current, previous, code)
            output.append(f"{symbol} {currency}: {formatted_rate}")

        return "\n".join(output)
    except Exception as e:
        logger.error(f"Error getting currency rates: {e}")
        return ("❌ Ошибка при получении курса валют. Попробуйте позже.")

def get_crypto_rates():
    try:
        current_time = datetime.now(moscow_tz).strftime('%H:%M:%S')

        usd_rate = global_rates.get_or_create('USD').current
        btc_rate = global_rates.get_or_create('BTC')
        eth_rate = global_rates.get_or_create('ETH')

        btc_usd = btc_rate.current / usd_rate if usd_rate else 0
        eth_usd = eth_rate.current / usd_rate if usd_rate else 0

        btc_formatted = format_rate_change(btc_rate.current,
                                           btc_rate.previous, 'BTC')
        eth_formatted = format_rate_change(eth_rate.current,
                                           eth_rate.previous, 'ETH')

        return (f"🪙 Курс криптовалют на {current_time} МСК:\n\n"
                f"₿ Bitcoin:\n${int(btc_usd):,} = {btc_formatted}\n\n"
                f"Ξ Ethereum:\n${int(eth_usd):,} = {eth_formatted}")
    except Exception as e:
        logger.error(f"Error getting crypto rates: {e}")
        return ("❌ Ошибка при получении курса криптовалют. Попробуйте позже.")

async def send_all_rates(chat_id):
    currency_rates = get_currency_rates()
    crypto_rates = get_crypto_rates()
    await bot.send_message(
        chat_id,
        f"{currency_rates}\n\n{'-' * 30}\n\n{crypto_rates}",
        reply_markup=create_main_keyboard()
    )

@router.message(Command(commands=["start"]))
async def start_command(message: Message):
    user_id = message.from_user.id
    username = message.from_user.username or "Unknown"
    logger.info(f"New user started bot - ID: {user_id}, Username: @{username}")

    active_users.add(user_id)

    welcome_text = (
        f"👋 Привет, {message.from_user.first_name}!\n\n"
        "Я бот для отслеживания курсов валют и криптовалют. "
        "Буду присылать тебе актуальные курсы каждое утро в 8:00.\n\n"
        "🔸 Используй кнопки меню для получения информации\n"
        "🔸 Команда /stop - отписаться от рассылки\n"
        "🔸 Команда /help - получить справку"
    )

    await message.answer(welcome_text, reply_markup=create_main_keyboard())
    await send_all_rates(user_id)
    save_users()  

@router.message(Command(commands=["help"]))
@router.message(F.text == "ℹ️ Помощь")
async def help_command(message: Message):
    logger.info(f"Help requested by user {message.from_user.id}")
    help_text = (
        "📌 Доступные команды:\n\n"
        "💰 Курсы валют - актуальные курсы валют (USD, EUR, CNY, JPY)\n"
        "🪙 Криптовалюты - курсы криптовалют\n"
        "🏆 Топ криптовалют - рейтинг топовых криптовалют\n"
        "   Использование: /topcrypto [количество], по умолчанию 10, максимум 100\n"
        "📊 Все курсы - показать все курсы\n"
        "/stop - отписаться от рассылки\n"
        "/start - подписаться на рассылку\n"
        "/help - показать эту справку\n\n"
        "❗️ Курсы обновляются каждые 5 минут\n"
        "❗️ При нажатии на кнопки курсы обновляются в режиме реального времени\n"
        "📈📉 Стрелки показывают изменение курса относительно предыдущего запроса"
    )
    await message.answer(help_text, reply_markup=create_main_keyboard())

@router.message(Command(commands=["stop"]))
async def stop_command(message: Message):
    user_id = message.from_user.id
    logger.info(f"User {user_id} requested to stop notifications")

    if user_id in active_users:
        active_users.remove(user_id)
        logger.info(f"User {user_id} unsubscribed from notifications")
        await message.answer(
            "✅ Вы отписались от автоматической рассылки курсов.\n"
            "Чтобы подписаться снова, используйте команду /start",
            reply_markup=create_main_keyboard()
        )
        save_users() 
    else:
        await message.answer(
            "ℹ️ Вы уже отписаны от рассылки.\n"
            "Чтобы подписаться, используйте команду /start",
            reply_markup=create_main_keyboard()
        )

@router.message(F.text == "💰 Курсы валют")
async def currency_rates_command(message: Message):
    logger.info(f"Currency rates requested by user {message.from_user.id}")
    rates = get_currency_rates()
    await message.answer(rates, reply_markup=create_main_keyboard())

@router.message(F.text == "🪙 Криптовалюты")
async def crypto_rates_command(message: Message):
    logger.info(f"Crypto rates requested by user {message.from_user.id}")
    rates = get_crypto_rates()
    await message.answer(rates, reply_markup=create_main_keyboard())

@router.message(F.text == "📊 Все курсы")
async def all_rates_command(message: Message):
    logger.info(f"All rates requested by user {message.from_user.id}")
    await send_all_rates(message.chat.id)

@router.message(Command(commands=["topcrypto"]))
@router.message(F.text == "🏆 Топ криптовалют")
async def top_crypto_command(message: Message):
    logger.info(f"Top cryptocurrencies requested by user {message.from_user.id}")

    if message.text.startswith('/topcrypto'):
        parts = message.text.split()
        if len(parts) > 1:
            args = parts[1]
        else:
            args = ''
        try:
            limit = int(args)
            if limit < 1 or limit > 100:
                limit = 10  
        except ValueError:
            limit = 10 
    else:
        limit = 5

    data = get_cached_top_cryptocurrencies(limit)
    usd_rate = global_rates.get_or_create('USD').current or 0
    formatted_data = format_top_cryptocurrencies(data, usd_to_rub=usd_rate)
    await message.answer(formatted_data, reply_markup=create_main_keyboard(), parse_mode='HTML')

def initialize_rates():
    load_rates()
    response = requests.get(CURRENCY_URL)
    response.encoding = "utf-8"
    current_rates = parse_cbr_xml(response.text)

    if current_rates:
        for code in ["USD", "EUR", "CNY", "JPY"]:
            rate = global_rates.get_or_create(code)
            rate.current = current_rates[code]
            if rate.previous is None:
                rate.previous = current_rates[code]
    else:
        logger.error("Failed to initialize currency rates.")

    response = requests.get(CRYPTO_URL)
    data = response.json()

    if data:
        usd_rate = current_rates.get('USD', 0)
        btc_usd = data['bitcoin']['usd']
        eth_usd = data['ethereum']['usd']
        btc_rub = btc_usd * usd_rate
        eth_rub = eth_usd * usd_rate

        for code, value in [("BTC", btc_rub), ("ETH", eth_rub)]:
            rate = global_rates.get_or_create(code)
            rate.current = value
            if rate.previous is None:
                rate.previous = value
    else:
        logger.error("Failed to initialize crypto rates.")

def save_rates():
    with open(RATES_FILE, 'wb') as f:
        pickle.dump(global_rates, f)
    logger.info(f"Rates saved to {RATES_FILE}")

def load_rates():
    global global_rates
    if os.path.exists(RATES_FILE):
        with open(RATES_FILE, 'rb') as f:
            global_rates = pickle.load(f)
        logger.info(f"Rates loaded from {RATES_FILE}")
    else:
        logger.info("No rates.pkl file found. Initializing rates.")

def save_users():
    with open(USERS_FILE, 'wb') as f:
        pickle.dump(active_users, f)
    logger.info(f"Active users saved to {USERS_FILE}")

def load_users():
    global active_users
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'rb') as f:
            active_users = pickle.load(f)
        logger.info(f"Active users loaded from {USERS_FILE}")
    else:
        logger.info("No users.pkl file found. Starting with empty user list.")

async def update_rates_periodically():
    while True:
        response = requests.get(CURRENCY_URL)
        response.encoding = "utf-8"
        current_rates = parse_cbr_xml(response.text)

        if current_rates:
            for code in ["USD", "EUR", "CNY", "JPY"]:
                rate = global_rates.get_or_create(code)
                rate.update(current_rates[code])

        response = requests.get(CRYPTO_URL)
        data = response.json()

        if data:
            usd_rate = global_rates.get_or_create('USD').current
            btc_usd = data['bitcoin']['usd']
            eth_usd = data['ethereum']['usd']
            btc_rub = btc_usd * usd_rate
            eth_rub = eth_usd * usd_rate

            for code, value in [("BTC", btc_rub), ("ETH", eth_rub)]:
                rate = global_rates.get_or_create(code)
                rate.update(value)

        save_rates()  
        await asyncio.sleep(300) 

async def scheduled_jobs():
    current_time = datetime.now(moscow_tz).strftime('%H:%M:%S')
    logger.info(f"Running scheduled job at {current_time}")
    logger.info(f"Sending scheduled messages to {len(active_users)} users")

    for user_id in active_users:
        try:
            await send_all_rates(user_id)
            logger.info(f"Successfully sent scheduled message to user {user_id}")
        except Exception as e:
            logger.error(f"Error sending scheduled message to user {user_id}: {e}")

scheduler = AsyncIOScheduler()

async def scheduler_setup():
    scheduler.add_job(scheduled_jobs, "cron", hour=8, minute=0)
    scheduler.start()
    logger.info("Scheduler started successfully")

async def main():
    logger.info("Starting bot...")
    dp.include_router(router)
    load_users()  
    initialize_rates()
    await scheduler_setup()
    asyncio.create_task(update_rates_periodically())
    asyncio.create_task(update_crypto_cache()) 
    logger.info("Bot is running...")
    try:
        await dp.start_polling(bot)
    finally:
        save_rates()  
        save_users() 

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Bot stopped")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
