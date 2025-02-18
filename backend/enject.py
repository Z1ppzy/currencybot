import requests
import xml.etree.ElementTree as ET
import sqlite3
from datetime import datetime, timedelta


def create_db():
    conn = sqlite3.connect("currency.db")
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS currency (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        date TEXT,
                        currency_code TEXT,
                        currency_name TEXT,
                        value REAL)''')
    conn.commit()
    conn.close()


def data_exists(date):
    """Проверяет, есть ли данные за указанную дату в БД"""
    conn = sqlite3.connect("currency.db")
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM currency WHERE date = ?", (date,))
    count = cursor.fetchone()[0]
    conn.close()
    return count > 0


def insert_data(date, currency_code, currency_name, value):
    conn = sqlite3.connect("currency.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO currency (date, currency_code, currency_name, value) VALUES (?, ?, ?, ?)",
                   (date, currency_code, currency_name, value))
    conn.commit()
    conn.close()


def get_currency_rates(year: int, month: int):
    print(f"Начинаем сбор данных за {month:02}/{year}")
    for day in range(1, 32):
        try:
            date_str = f"{day:02}/{month:02}/{year}"

            # Проверяем, есть ли уже данные за эту дату
            if data_exists(date_str):
                print(f"Данные за {date_str} уже существуют, пропускаем...")
                continue

            url = f"https://cbr.ru/scripts/XML_daily.asp?date_req={date_str}"
            response = requests.get(url)

            if response.status_code != 200:
                print(f"Ошибка получения данных за {date_str}")
                continue

            root = ET.fromstring(response.content)
            if not root.findall("Valute"):
                print(f"Нет данных за {date_str}, пропускаем")
                continue

            for valute in root.findall("Valute"):
                currency_code = valute.find("CharCode").text
                currency_name = valute.find("Name").text
                value = float(valute.find("Value").text.replace(",", "."))
                insert_data(date_str, currency_code, currency_name, value)

            print(f"Успешно добавлены данные за {date_str}")
        except Exception as e:
            print(f"Ошибка обработки {date_str}: {e}")


def collect_data_for_period(start_year: int, end_year: int):
    for year in range(start_year, end_year + 1):
        for month in range(1, 13):
            get_currency_rates(year, month)


# Создание базы данных
create_db()

# Запрос данных за период с 2012 по 2025 год
collect_data_for_period(2012, 2025)
