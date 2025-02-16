import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch('https://www.cbr.ru/scripts/XML_daily.asp');
        const data = await response.text();
        return new NextResponse(data);
    } catch (error) {
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch currency data' }), {
            status: 500,
        });
    }
}