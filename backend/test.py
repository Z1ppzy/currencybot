import sqlite3
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple


class CurrencyDataFetcher:
    def __init__(self, db_path: str = "currency.db"):
        self.db_path = db_path

    def validate_date(self, day: str, month: str, year: str) -> bool:
        try:
            datetime(int(year), int(month), int(day))
            return True
        except ValueError:
            return False

    def validate_currency_code(self, code: str) -> bool:
        valid_currencies = {'USD', 'EUR', 'RUB', 'GBP', 'CNY', 'JPY', 'SEK'}
        return code.upper() in valid_currencies

    def get_date_input(self) -> None:
        while True:
            try:
                day = input("Введите число (1-31): ")
                month = input("Введите месяц (1-12): ")
                year = input("Введите год (например, 2024): ")

                if not self.validate_date(day, month, year):
                    print("Ошибка: Некорректная дата!")
                    continue

                currency_code = input("Введите код валюты (например, USD, EUR, RUB): ").upper()
                if not self.validate_currency_code(currency_code):
                    print("Ошибка: Неподдерживаемый код валюты!")
                    continue

                date_str = f"{int(day):02d}/{int(month):02d}/{int(year)}"
                print(f"Вы выбрали дату: {date_str} и валюту: {currency_code}")
                self.fetch_data_from_db(date_str, currency_code)
                break

            except ValueError as e:
                print(f"Ошибка: Введите корректные числовые значения! {str(e)}")

    def fetch_data_from_db(self, date_str: str, currency_code: str) -> None:
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            # Получаем текущий курс с учетом поля nominal
            cursor.execute("""
                SELECT currency_code, currency_name, value, nominal
                FROM currency 
                WHERE date = ? AND currency_code = ?
            """, (date_str, currency_code))
            rows = cursor.fetchall()

            if rows:
                for row in rows:
                    currency_code, currency_name, value, nominal = row
                    # Вычисляем фактический курс за единицу валюты
                    actual_rate = value / nominal
                    print(f"\nДанные на выбранную дату:")
                    print(f"Код валюты: {currency_code}")
                    print(f"Название: {currency_name}")
                    print(f"Курс: {actual_rate:.4f}")

                    # Преобразуем выбранную дату в объект datetime и ISO-формат
                    date_obj = datetime.strptime(date_str, "%d/%m/%Y")
                    date_iso = date_obj.strftime("%Y-%m-%d")

                    # Функция для преобразования даты из БД (dd/mm/yyyy) в ISO формат внутри запроса:
                    date_conversion = "substr(date, 7, 4) || '-' || substr(date, 4, 2) || '-' || substr(date, 1, 2)"

                    # Статистика за 7 дней (учитываем деление на номинал)
                    seven_days_ago = date_obj - timedelta(days=7)
                    seven_days_ago_iso = seven_days_ago.strftime("%Y-%m-%d")
                    cursor.execute(f"""
                        SELECT MAX(value/nominal), MIN(value/nominal)
                        FROM currency 
                        WHERE currency_code = ? 
                          AND date({date_conversion}) <= date(?)
                          AND date({date_conversion}) >= date(?)
                    """, (currency_code, date_iso, seven_days_ago_iso))
                    high7d, low7d = cursor.fetchone()

                    # Статистика за 14 дней
                    fourteen_days_ago = date_obj - timedelta(days=14)
                    fourteen_days_ago_iso = fourteen_days_ago.strftime("%Y-%m-%d")
                    cursor.execute(f"""
                        SELECT MAX(value/nominal), MIN(value/nominal)
                        FROM currency 
                        WHERE currency_code = ? 
                          AND date({date_conversion}) <= date(?)
                          AND date({date_conversion}) >= date(?)
                    """, (currency_code, date_iso, fourteen_days_ago_iso))
                    high14d, low14d = cursor.fetchone()

                    # Статистика за 30 дней (только максимум)
                    thirty_days_ago = date_obj - timedelta(days=30)
                    thirty_days_ago_iso = thirty_days_ago.strftime("%Y-%m-%d")
                    cursor.execute(f"""
                        SELECT MAX(value/nominal)
                        FROM currency 
                        WHERE currency_code = ? 
                          AND date({date_conversion}) <= date(?)
                          AND date({date_conversion}) >= date(?)
                    """, (currency_code, date_iso, thirty_days_ago_iso))
                    high30d = cursor.fetchone()[0]

                    print("\nСтатистика за последние периоды:")
                    print(f"7 дней - Макс: {high7d if high7d is not None else actual_rate:.4f}, Мин: {low7d if low7d is not None else actual_rate:.4f}")
                    print(f"14 дней - Макс: {high14d if high14d is not None else actual_rate:.4f}, Мин: {low14d if low14d is not None else actual_rate:.4f}")
                    print(f"30 дней - Макс: {high30d if high30d is not None else actual_rate:.4f}")

            else:
                print("Нет данных на указанную дату или валюту.")

        except sqlite3.Error as e:
            print(f"Ошибка при работе с базой данных: {str(e)}")
        finally:
            conn.close()


if __name__ == "__main__":
    fetcher = CurrencyDataFetcher()
    fetcher.get_date_input()
