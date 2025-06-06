import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const { amount, description, returnUrl, metadata } = await req.json();

        if (!amount || !returnUrl) {
            return NextResponse.json(
                { error: 'Amount and returnUrl are required' },
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

        const idempotenceKey = uuidv4();
        const paymentData = {
            amount: {
                value: amount.toFixed(2),
                currency: 'RUB',
            },
            capture: true,
            confirmation: {
                type: 'redirect',
                return_url: returnUrl,
            },
            description: description || 'Оплата заказа в ресторане',
            metadata: metadata || {},
        };

        // Prepare authentication for YooKassa API
        const authHeader = Buffer.from(`${merchantId}:${secretKey}`).toString(
            'base64'
        );

        const response = await fetch('https://api.yookassa.ru/v3/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Idempotence-Key': idempotenceKey,
                Authorization: `Basic ${authHeader}`,
            },
            body: JSON.stringify(paymentData),
        });

        const paymentResponse = await response.json();

        if (!response.ok) {
            console.error('YooKassa API error:', paymentResponse);
            return NextResponse.json(
                {
                    error:
                        paymentResponse.description ||
                        'Payment creation failed',
                },
                { status: response.status }
            );
        }

        return NextResponse.json(paymentResponse);
    } catch (error) {
        console.error('Error creating YooKassa payment:', error);
        return NextResponse.json(
            { error: 'Failed to create payment' },
            { status: 500 }
        );
    }
}
