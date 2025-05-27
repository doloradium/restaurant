// Script to create a cook user in the database
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    try {
        // Check if cook already exists
        const existingCook = await prisma.user.findUnique({
            where: {
                email: 'cook@restaurant.com',
            },
        });

        if (existingCook) {
            console.log('Cook user already exists');
            return;
        }

        // Create the cook user
        const passwordHash = await bcrypt.hash('password123', 10);
        const cook = await prisma.user.create({
            data: {
                name: 'Chef',
                surname: 'Cook',
                email: 'cook@restaurant.com',
                phoneNumber: '123-456-7890',
                passwordHash,
                role: 'COOK',
            },
        });

        console.log('Cook user created successfully:', cook);
    } catch (error) {
        console.error('Error creating cook user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
