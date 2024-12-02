import os
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher, Router, F
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, CallbackQuery
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.filters import Command
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import asyncio
import requests

load_dotenv()
API_TOKEN = os.getenv('BOT_TOKEN')

CURRENCY_URL = "https://www.cbr.ru/scripts/XML_daily.asp"
CRYPTO_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd"

bot = Bot(token=API_TOKEN)
dp = Dispatcher(storage=MemoryStorage())
router = Router()

active_users = set()

def get_usd_rate():
    try:
        response = requests.get(CURRENCY_URL)
        response.encoding = "utf-8"
        data = response.text
        usd_rate = float(data.split('<CharCode>USD</CharCode>')[1].split('<Value>')[1].split('</Value>')[0].replace(',', '.'))
        return usd_rate
    except Exception:
        return None

def get_currency_rates():
    try:
        response = requests.get(CURRENCY_URL)
        response.encoding = "utf-8"
        data = response.text
        usd_rate = float(data.split('<CharCode>USD</CharCode>')[1].split('<Value>')[1].split('</Value>')[0].replace(',', '.'))
        eur_rate = float(data.split('<CharCode>EUR</CharCode>')[1].split('<Value>')[1].split('</Value>')[0].replace(',', '.'))
        return f"Курс валют на сегодня:\n💵 Доллар: {int(usd_rate)}₽\n💶 Евро: {int(eur_rate)}₽"
    except Exception as e:
        return f"Ошибка при получении курса валют: {e}"

def get_crypto_rates():
    try:
        usd_rate = get_usd_rate()
        if not usd_rate:
            return "Ошибка при получении курса доллара"

        response = requests.get(CRYPTO_URL)
        data = response.json()
        
        bitcoin_usd = data['bitcoin']['usd']
        ethereum_usd = data['ethereum']['usd']
        
        bitcoin_rub = int(bitcoin_usd * usd_rate)
        ethereum_rub = int(ethereum_usd * usd_rate)
        
        return (f"Курс криптовалют:\n"
                f"₿ Биткоин: ${int(bitcoin_usd)} = {bitcoin_rub:,}₽\n"
                f"Ξ Эфириум: ${int(ethereum_usd)} = {ethereum_rub:,}₽")
    except Exception as e:
        return f"Ошибка при получении курса криптовалют: {e}"

async def send_all_rates(chat_id):
    currency_rates = get_currency_rates()
    crypto_rates = get_crypto_rates()
    await bot.send_message(chat_id, f"{currency_rates}\n\n{crypto_rates}")

@router.message(Command("start"))
async def start_command(message: Message):
    user_id = message.from_user.id
    active_users.add(user_id)  
    
    button = InlineKeyboardButton(text="📊 Посмотреть курсы", callback_data="show_rates")
    keyboard = InlineKeyboardMarkup(inline_keyboard=[[button]])
    
    await message.answer(
        "Привет! Я буду автоматически отправлять тебе курсы валют и криптовалют каждое утро.\n"
        "Также ты можешь посмотреть текущие курсы, нажав на кнопку ниже или написав 'курс'.",
        reply_markup=keyboard
    )
    await send_all_rates(user_id)

@router.message(Command("stop"))
async def stop_command(message: Message):
    user_id = message.from_user.id
    if user_id in active_users:
        active_users.remove(user_id)
        await message.answer("Вы отписались от автоматической рассылки курсов.")
    else:
        await message.answer("Вы уже отписаны от рассылки.")

@router.callback_query(F.data == "show_rates")
async def send_rates_on_button_click(callback_query: CallbackQuery):
    await send_all_rates(callback_query.from_user.id)
    await callback_query.answer()

@router.message(F.text.lower() == "курс")
async def send_rates_now(message: Message):
    await send_all_rates(message.chat.id)

async def scheduled_jobs():
    for user_id in active_users:
        try:
            await send_all_rates(user_id)
        except Exception as e:
            print(f"Error sending scheduled message to user {user_id}: {e}")

scheduler = AsyncIOScheduler()

async def scheduler_setup():
    scheduler.add_job(scheduled_jobs, "cron", hour=8, minute=0)
    scheduler.start()

async def main():
    dp.include_router(router)
    await scheduler_setup()
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())