import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

interface Currency {
    code: string;
    name: string;
    value: number;
    change?: number;
    icon: string;
}

interface CurrencyCardProps {
    currency: Currency;
}

const CurrencyCard = ({ currency }: CurrencyCardProps) => (
    <Card className="bg-[#1C1B33] border-[#2D2B52]">
        <CardContent className="p-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-white">{currency.code}</h3>
                    <p className="text-sm text-gray-400">{currency.name}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-semibold text-gray-300">{currency.value.toFixed(2)} <span className="font-extrabold text-white">₽</span></p>
                    {currency.change !== undefined && (
                        <p className={`text-sm ${currency.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {currency.change >= 0 ? '+' : ''}{currency.change.toFixed(2)}%
                        </p>
                    )}
                </div>
            </div>
        </CardContent>
    </Card>
);

const LiveCurrencyRates = () => {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currencyIcons: { [key: string]: string } = {
        USD: '🇺🇸',
        EUR: '🇪🇺',
        GBP: '🇬🇧',
        JPY: '🇯🇵',
    };

    const currencyNames: { [key: string]: string } = {
        USD: 'US Dollar',
        EUR: 'Euro',
        GBP: 'British Pound',
        JPY: 'Japanese Yen',
    };

    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const response = await fetch('/api/currency');
                const text = await response.text();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(text, 'text/xml');

                const requiredCurrencies = ['USD', 'EUR', 'GBP', 'JPY'];
                const currencyData: Currency[] = [];

                const valutes = xmlDoc.getElementsByTagName('Valute');

                Array.from(valutes).forEach((valute) => {
                    const charCode = valute.querySelector('CharCode')?.textContent;

                    if (charCode && requiredCurrencies.includes(charCode)) {
                        const nominal = Number(valute.querySelector('Nominal')?.textContent || '1');
                        const value = Number(valute.querySelector('Value')?.textContent?.replace(',', '.') || '0');

                        currencyData.push({
                            code: charCode,
                            name: currencyNames[charCode],
                            value: charCode === 'JPY' ? value / nominal : value,
                            change: 0,
                            icon: currencyIcons[charCode],
                        });
                    }
                });

                setCurrencies(currencyData);
                setLoading(false);
            } catch (err) {
                setError('Ошибка при загрузке данных');
                setLoading(false);
                console.error('Error fetching currency data:', err);
            }
        };

        fetchCurrencies();
        const interval = setInterval(fetchCurrencies, 300000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 p-4">
                {error}
            </div>
        );
    }

    return (
        <div className="mt-20">
            <div className="flex items-center justify-center mb-8">
                <Info className="h-6 w-6 text-[#6366F1] mr-2" />
                <h2 className="text-2xl font-bold text-white">Live Currency Rates</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {currencies.map((currency) => (
                    <CurrencyCard key={currency.code} currency={currency} />
                ))}
            </div>
        </div>
    );
};

export default LiveCurrencyRates;