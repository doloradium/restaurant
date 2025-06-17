import { prisma } from './prisma';

// Helper functions to abstract away model name case issues
export const dbHelpers = {
    // Address model helpers
    address: {
        create: async (data: any) => {
            try {
                return await prisma.address.create({ data });
            } catch (error) {
                console.error('Error creating address:', error);
                try {
                    // Try alternative casing if first attempt fails
                    return await (prisma as any).Address.create({ data });
                } catch (innerError) {
                    console.error('Error with alternative casing:', innerError);
                    throw innerError;
                }
            }
        },
        findMany: async (params: any) => {
            try {
                return await prisma.address.findMany(params);
            } catch (error) {
                console.error('Error finding addresses:', error);
                try {
                    // Try alternative casing
                    return await (prisma as any).Address.findMany(params);
                } catch (innerError) {
                    console.error('Error with alternative casing:', innerError);
                    throw innerError;
                }
            }
        },
        update: async (params: any) => {
            try {
                return await prisma.address.update(params);
            } catch (error) {
                console.error('Error updating address:', error);
                try {
                    // Try alternative casing
                    return await (prisma as any).Address.update(params);
                } catch (innerError) {
                    console.error('Error with alternative casing:', innerError);
                    throw innerError;
                }
            }
        },
        delete: async (params: any) => {
            try {
                return await prisma.address.delete(params);
            } catch (error) {
                console.error('Error deleting address:', error);
                try {
                    // Try alternative casing
                    return await (prisma as any).Address.delete(params);
                } catch (innerError) {
                    console.error('Error with alternative casing:', innerError);
                    throw innerError;
                }
            }
        },
    },

    // User model helpers
    user: {
        update: async (params: any) => {
            return await prisma.user.update(params);
        },
        findFirst: async (params: any) => {
            return await prisma.user.findFirst(params);
        },
    },

    // Order model helpers
    order: {
        create: async (params: any) => {
            try {
                return await prisma.order.create(params);
            } catch (error) {
                console.error('Error creating order:', error);
                try {
                    // Try with explicit conversion for addressId if that's the issue
                    if (params.data.addressId) {
                        const data = {
                            ...params.data,
                            address: {
                                connect: { id: Number(params.data.addressId) },
                            },
                            user: {
                                connect: { id: Number(params.data.userId) },
                            },
                        };
                        // Remove the addressId
                        delete data.addressId;

                        return await prisma.order.create({
                            ...params,
                            data,
                        });
                    }
                    throw error;
                } catch (innerError) {
                    console.error(
                        'Error with alternative approach:',
                        innerError
                    );
                    throw innerError;
                }
            }
        },
        findMany: async (params: any) => {
            try {
                return await prisma.order.findMany(params);
            } catch (error) {
                console.error('Error finding orders:', error);
                // Try alternative approach without address include
                if (params.include?.address) {
                    const modifiedParams = {
                        ...params,
                        include: {
                            ...params.include,
                            address: false,
                        },
                    };
                    const orders = await prisma.order.findMany(modifiedParams);

                    // Manually fetch addresses if needed
                    if (orders.length > 0) {
                        const addressIds = orders
                            .map((order) => order.addressId)
                            .filter(Boolean);
                        if (addressIds.length > 0) {
                            const addresses = await dbHelpers.address.findMany({
                                where: {
                                    id: { in: addressIds },
                                },
                            });

                            // Manually join addresses to orders
                            return orders.map((order) => ({
                                ...order,
                                address:
                                    addresses.find(
                                        (addr: any) =>
                                            addr.id === order.addressId
                                    ) || null,
                            }));
                        }
                    }
                    return orders;
                }
                throw error;
            }
        },
        findUnique: async (params: any) => {
            try {
                return await prisma.order.findUnique(params);
            } catch (error) {
                console.error('Error finding order:', error);
                throw error;
            }
        },
        update: async (params: any) => {
            try {
                return await prisma.order.update(params);
            } catch (error) {
                console.error('Error updating order:', error);
                throw error;
            }
        },
    },
};
