import requests
import logging
import time
from typing import List, Dict
import asyncio

logger = logging.getLogger(__name__)

COINGECKO_API_URL = "https://api.coingecko.com/api/v3"

crypto_cache = {
    'data': [],
    'timestamp': 0
}
CACHE_TTL = 300  

def get_cached_top_cryptocurrencies(limit: int = 10) -> List[Dict]:
    current_time = time.time()
    if current_time - crypto_cache['timestamp'] > CACHE_TTL or not crypto_cache['data']:
        data = get_top_cryptocurrencies_from_api(limit=100) 
        if data:
            crypto_cache['data'] = data
            crypto_cache['timestamp'] = current_time
    return crypto_cache['data'][:limit]

def get_top_cryptocurrencies_from_api(limit: int) -> List[Dict]:
    try:
        url = f"{COINGECKO_API_URL}/coins/markets"
        params = {
            'vs_currency': 'usd',
            'order': 'market_cap_desc',
            'per_page': limit,
            'page': 1,
            'sparkline': 'false'
        }
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error: {e}")
        return []
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return []

def format_top_cryptocurrencies(data: List[Dict], usd_to_rub: float) -> str:
    if not data:
        return "❌ Не удалось получить данные о рейтинге криптовалют."
    output = "🏆 <b>Топ криптовалют по рыночной капитализации</b>:\n\n"
    for coin in data:
        name = coin['name']
        symbol = coin['symbol'].upper()
        price_usd = coin['current_price']
        price_rub = price_usd * usd_to_rub
        market_cap = coin['market_cap']
        market_cap_rub = market_cap * usd_to_rub
        output += (f"<b>{coin['market_cap_rank']}. {name} ({symbol})</b>\n"
                   f"💰 Цена: ${price_usd:,.2f} / {price_rub:,.2f}₽\n"
                   f"💎 Рыночная капитализация: ${market_cap:,.0f} / {market_cap_rub:,.0f}₽\n\n")
    return output.strip()

async def update_crypto_cache():
    while True:
        data = get_top_cryptocurrencies_from_api(limit=100)
        if data:
            crypto_cache['data'] = data
            crypto_cache['timestamp'] = time.time()
            logger.info("Crypto cache updated")
        await asyncio.sleep(CACHE_TTL)
