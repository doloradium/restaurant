import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db-helpers';
import crypto from 'crypto';

// This endpoint receives webhooks from Yookassa when payment status changes
export async function POST(req: NextRequest) {
    try {
        // Get the raw request body for signature verification
        const rawBody = await req.text();
        const body = JSON.parse(rawBody);

        // Get the webhook signature from headers
        const signature = req.headers.get('Webhook-Signature') || '';
        const secretKey = process.env.YOUKASSA_KEY || '';

        console.log('Received Yookassa webhook:', body);
        console.log('Headers:', Object.fromEntries(req.headers.entries()));

        // Verify signature if provided
        if (signature && secretKey) {
            try {
                // Parse the signature components
                const signatureParts = signature.split('.');
                if (signatureParts.length === 2) {
                    const [timestamp, receivedSignature] = signatureParts;

                    // Create the string to sign
                    const stringToSign = `${timestamp}.${rawBody}`;

                    // Calculate HMAC using secret key
                    const hmac = crypto.createHmac('sha256', secretKey);
                    hmac.update(stringToSign);
                    const calculatedSignature = hmac.digest('hex');

                    // Verify signatures match
                    if (calculatedSignature !== receivedSignature) {
                        console.error('Invalid webhook signature');
                        return NextResponse.json(
                            { error: 'Invalid signature' },
                            { status: 401 }
                        );
                    }
                    console.log('Webhook signature verified successfully');
                }
            } catch (error) {
                console.error('Error verifying signature:', error);
                // Continue processing even if signature verification fails in development
                if (process.env.NODE_ENV === 'production') {
                    return NextResponse.json(
                        { error: 'Signature verification failed' },
                        { status: 401 }
                    );
                }
            }
        }

        // Handle different event types
        const event = body.event;
        const { object } = body;
        const paymentId = object.id;
        const paymentStatus = object.status;

        // Get the order ID from metadata - Yookassa stores it in the metadata object
        const orderId = object.metadata?.orderId || object.metadata?.order_id;

        if (!orderId) {
            console.error(
                'No order ID found in payment metadata:',
                object.metadata
            );
            return NextResponse.json(
                { error: 'No order ID in payment metadata' },
                { status: 400 }
            );
        }

        console.log(
            `Processing payment ${paymentId} for order ${orderId}, status: ${paymentStatus}, event: ${event}`
        );

        // Handle successful payment events - consolidated for better reliability
        const successEvents = [
            'payment.succeeded',
            'payment.waiting_for_capture',
            'payment.canceled',
        ];

        const successStatuses = ['succeeded', 'waiting_for_capture', 'pending'];

        // Check if this is a payment success event
        if (
            successEvents.includes(event) ||
            successStatuses.includes(paymentStatus)
        ) {
            // First check if order exists
            const order = await dbHelpers.order.findUnique({
                where: { id: Number(orderId) },
            });

            if (!order) {
                console.error(`Order ${orderId} not found`);
                return NextResponse.json(
                    { error: 'Order not found' },
                    { status: 404 }
                );
            }

            // Only update if it's a success event
            if (
                event === 'payment.succeeded' ||
                paymentStatus === 'succeeded'
            ) {
                console.log(
                    `Payment success detected for order ${orderId}. Current status: ${order.status}, isPaid: ${order.isPaid}`
                );

                // Always update to confirmed and paid status
                const updatedOrder = await dbHelpers.order.update({
                    where: { id: Number(orderId) },
                    data: {
                        status: 'CONFIRMED',
                        isPaid: true,
                    },
                });

                console.log(
                    `Successfully updated order ${orderId}, new status: ${updatedOrder.status}, isPaid: ${updatedOrder.isPaid}`
                );

                return NextResponse.json({
                    success: true,
                    message: 'Order status updated to CONFIRMED and paid',
                    orderId: orderId,
                    status: updatedOrder.status,
                });
            }
            // Handle waiting_for_capture status (payment authorized but not captured)
            else if (
                event === 'payment.waiting_for_capture' ||
                paymentStatus === 'waiting_for_capture'
            ) {
                console.log(`Payment waiting for capture for order ${orderId}`);

                // Update order status if needed but don't mark as paid yet
                if (order.status === 'PENDING') {
                    const updatedOrder = await dbHelpers.order.update({
                        where: { id: Number(orderId) },
                        data: {
                            status: 'CONFIRMED',
                            // Don't set isPaid yet since it's just authorized
                        },
                    });

                    console.log(
                        `Updated order ${orderId} to CONFIRMED (waiting for capture), isPaid: ${updatedOrder.isPaid}`
                    );
                }

                return NextResponse.json({
                    success: true,
                    message: 'Payment authorized, waiting for capture',
                    orderId: orderId,
                });
            }
            // Handle canceled payment
            else if (
                event === 'payment.canceled' ||
                paymentStatus === 'canceled'
            ) {
                console.log(`Payment for order ${orderId} was canceled`);

                // Update order status to canceled if it's not already in a final state
                if (
                    order.status === 'PENDING' ||
                    order.status === 'CONFIRMED'
                ) {
                    const updatedOrder = await dbHelpers.order.update({
                        where: { id: Number(orderId) },
                        data: {
                            status: 'CANCELED',
                            isPaid: false,
                        },
                    });

                    console.log(
                        `Updated order ${orderId} to CANCELED, isPaid: ${updatedOrder.isPaid}`
                    );
                }

                return NextResponse.json({
                    success: true,
                    message: 'Order marked as canceled',
                    orderId: orderId,
                });
            }
        }

        // For any other event, just acknowledge receipt
        console.log(
            `Received unhandled event ${event} with status ${paymentStatus}`
        );
        return NextResponse.json({
            status: 'acknowledged',
            message: `Event ${event} with status ${paymentStatus} received`,
        });
    } catch (error) {
        console.error('Error processing Yookassa webhook:', error);
        return NextResponse.json(
            { error: 'Failed to process webhook' },
            { status: 500 }
        );
    }
}
