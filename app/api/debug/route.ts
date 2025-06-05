import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { dbHelpers } from '@/lib/db-helpers';

export async function GET() {
    try {
        // Log all prisma keys for inspection
        console.log('Prisma keys:', Object.keys(prisma));

        // Get model names
        const modelNames = Object.getOwnPropertyNames(prisma).filter(
            (key) =>
                typeof prisma[key as keyof typeof prisma] === 'object' &&
                !key.startsWith('$') &&
                key !== '_baseDmmf' &&
                key !== '_middlewares' &&
                key !== '_transactionId'
        );

        console.log('Model names:', modelNames);

        // Try to get a user and their addresses using our helper functions
        const firstUser = await dbHelpers.user.findFirst({
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        let userAddresses = [];
        if (firstUser) {
            try {
                userAddresses = await dbHelpers.address.findMany({
                    where: { userId: firstUser.id },
                });
            } catch (err) {
                console.error('Failed to fetch addresses:', err);
            }
        }

        return NextResponse.json({
            modelNames,
            firstUser,
            userAddresses,
            prismaKeys: Object.keys(prisma),
            helpersAvailable: {
                addressHelpers: !!dbHelpers.address,
                userHelpers: !!dbHelpers.user,
                orderHelpers: !!dbHelpers.order,
            },
        });
    } catch (error: any) {
        console.error('Debug endpoint error:', error);
        return NextResponse.json(
            {
                error: 'Error accessing database models',
                details: String(error),
                stack: error.stack,
            },
            { status: 500 }
        );
    }
}
