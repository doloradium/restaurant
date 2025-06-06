import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const paymentId = searchParams.get('paymentId');

        if (!paymentId) {
            return NextResponse.json(
                { error: 'Payment ID is required' },
                { status: 400 }
            );
        }

        const merchantId = '1101454'; // ID магазина Юкассы
        const secretKey = process.env.YOUKASSA_KEY;

        if (!secretKey) {
            console.error(
                'YOUKASSA_KEY is not defined in environment variables'
            );
            return NextResponse.json(
                { error: 'Payment provider configuration not found' },
                { status: 500 }
            );
        }

        // Prepare authentication for YooKassa API
        const authHeader = Buffer.from(`${merchantId}:${secretKey}`).toString(
            'base64'
        );

        const response = await fetch(
            `https://api.yookassa.ru/v3/payments/${paymentId}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${authHeader}`,
                },
            }
        );

        const paymentResponse = await response.json();

        if (!response.ok) {
            console.error('YooKassa API error:', paymentResponse);
            return NextResponse.json(
                {
                    error:
                        paymentResponse.description ||
                        'Payment status check failed',
                },
                { status: response.status }
            );
        }

        return NextResponse.json(paymentResponse);
    } catch (error) {
        console.error('Error checking YooKassa payment status:', error);
        return NextResponse.json(
            { error: 'Failed to check payment status' },
            { status: 500 }
        );
    }
}
