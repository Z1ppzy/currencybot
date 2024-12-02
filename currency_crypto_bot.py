import os
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher, Router, F
from aiogram.types import (Message, InlineKeyboardMarkup, InlineKeyboardButton, 
                         CallbackQuery, ReplyKeyboardMarkup, KeyboardButton)
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.filters import Command
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import asyncio
import requests
from datetime import datetime
import logging
import pytz
import xml.etree.ElementTree as ET


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


console_handler = logging.StreamHandler()
console_formatter = logging.Formatter(
    '\033[92m%(asctime)s\033[0m - '  
    '\033[94m%(levelname)s\033[0m - ' 
    '%(message)s',                     
    datefmt='%Y-%m-%d %H:%M:%S'
)
console_handler.setFormatter(console_formatter)
logger.addHandler(console_handler)

load_dotenv()
API_TOKEN = os.getenv('BOT_TOKEN')
if not API_TOKEN:
    logger.error("❌ BOT_TOKEN not found in .env file!")
    exit(1)


CURRENCY_URL = "https://www.cbr.ru/scripts/XML_daily.asp"
CRYPTO_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd"


bot = Bot(token=API_TOKEN)
dp = Dispatcher(storage=MemoryStorage())
router = Router()

active_users = set()

moscow_tz = pytz.timezone('Europe/Moscow')

def create_main_keyboard():
    keyboard = ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="💰 Курсы валют"), KeyboardButton(text="🪙 Криптовалюты")],
            [KeyboardButton(text="📊 Все курсы")],
            [KeyboardButton(text="ℹ️ Помощь")]
        ],
        resize_keyboard=True,
        input_field_placeholder="Выберите действие"
    )
    return keyboard

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

def format_currency(value, currency_code):
    if currency_code == 'JPY':
        return f"{value:.2f}" 
    return f"{int(value):,}"   

def get_currency_rates():
    try:
        logger.info("Fetching currency rates from CBR...")
        response = requests.get(CURRENCY_URL)
        response.encoding = "utf-8"
        
        currencies = parse_cbr_xml(response.text)
        if not currencies:
            return "❌ Ошибка при парсинге курсов валют"

        current_time = datetime.now(moscow_tz).strftime('%H:%M:%S')
        
        return (f"💰 Курс валют на {current_time} МСК:\n\n"
                f"💵 Доллар США: {format_currency(currencies['USD'], 'USD')}₽\n"
                f"💶 Евро: {format_currency(currencies['EUR'], 'EUR')}₽\n"
                f"🇨🇳 Юань: {format_currency(currencies['CNY'], 'CNY')}₽\n"
                f"🇯🇵 Иена: {format_currency(currencies['JPY'], 'JPY')}₽")
    except Exception as e:
        logger.error(f"Error getting currency rates: {e}")
        return "❌ Ошибка при получении курса валют. Попробуйте позже."

def get_usd_rate():
    try:
        response = requests.get(CURRENCY_URL)
        response.encoding = "utf-8"
        currencies = parse_cbr_xml(response.text)
        return currencies.get('USD')
    except Exception as e:
        logger.error(f"Error getting USD rate: {e}")
        return None

def get_crypto_rates():
    try:
        logger.info("Fetching crypto rates...")
        usd_rate = get_usd_rate()
        if not usd_rate:
            return "❌ Ошибка при получении курса доллара"

        response = requests.get(CRYPTO_URL)
        data = response.json()
        
        bitcoin_usd = data['bitcoin']['usd']
        ethereum_usd = data['ethereum']['usd']
        
        bitcoin_rub = int(bitcoin_usd * usd_rate)
        ethereum_rub = int(ethereum_usd * usd_rate)
        
        current_time = datetime.now(moscow_tz).strftime('%H:%M:%S')
        
        return (f"🪙 Курс криптовалют на {current_time} МСК:\n\n"
                f"₿ Bitcoin:\n${int(bitcoin_usd):,} = {bitcoin_rub:,}₽\n\n"
                f"Ξ Ethereum:\n${int(ethereum_usd):,} = {ethereum_rub:,}₽")
    except Exception as e:
        logger.error(f"Error getting crypto rates: {e}")
        return "❌ Ошибка при получении курса криптовалют. Попробуйте позже."

async def send_all_rates(chat_id):
    currency_rates = get_currency_rates()
    crypto_rates = get_crypto_rates()
    await bot.send_message(
        chat_id, 
        f"{currency_rates}\n\n{'-' * 30}\n\n{crypto_rates}",
        reply_markup=create_main_keyboard()
    )

@router.message(Command("start"))
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

@router.message(Command("help"))
@router.message(F.text == "ℹ️ Помощь")
async def help_command(message: Message):
    logger.info(f"Help requested by user {message.from_user.id}")
    help_text = (
        "📌 Доступные команды:\n\n"
        "💰 Курсы валют - актуальные курсы валют (USD, EUR, CNY, JPY)\n"
        "🪙 Криптовалюты - курсы криптовалют\n"
        "📊 Все курсы - показать все курсы\n"
        "/stop - отписаться от рассылки\n"
        "/start - подписаться на рассылку\n"
        "/help - показать эту справку\n\n"
        "❗️ Курсы обновляются каждое утро в 8:00\n"
        "❗️ При нажатии на кнопки курсы обновляются в режиме реального времени"
    )
    await message.answer(help_text, reply_markup=create_main_keyboard())

@router.message(Command("stop"))
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
    await scheduler_setup()
    logger.info("Bot is running...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Bot stopped")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")