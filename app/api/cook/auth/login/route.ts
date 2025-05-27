import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
    try {
        // Parse the request body
        let email, password;
        try {
            const body = await req.json();
            email = body.email;
            password = body.password;
        } catch (error) {
            console.error('Error parsing request body:', error);
            return NextResponse.json(
                { error: 'Invalid JSON payload' },
                { status: 400 }
            );
        }

        // Input validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        console.log(`Attempting login for email: ${email}`);

        // Find the user
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        // Check if user exists
        if (!user) {
            console.log(`User not found: ${email}`);
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Verify this is a cook user
        if (user.role !== 'COOK') {
            console.log(`User ${email} has role ${user.role}, not COOK`);
            return NextResponse.json(
                {
                    error: 'Access denied. Only cooks can access this dashboard.',
                },
                { status: 403 }
            );
        }

        // Compare passwords
        try {
            const passwordMatch = await bcrypt.compare(
                password,
                user.passwordHash
            );

            if (!passwordMatch) {
                console.log(`Invalid password for user: ${email}`);
                return NextResponse.json(
                    { error: 'Invalid email or password' },
                    { status: 401 }
                );
            }
        } catch (error) {
            console.error('Error comparing passwords:', error);
            return NextResponse.json(
                { error: 'Authentication error' },
                { status: 500 }
            );
        }

        // Generate JWT token
        let token;
        try {
            token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );
        } catch (error) {
            console.error('Error generating JWT:', error);
            return NextResponse.json(
                { error: 'Authentication error' },
                { status: 500 }
            );
        }

        // Create response and set cookie
        try {
            const response = NextResponse.json({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });

            response.cookies.set('cook_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Use secure in production
                sameSite: 'strict',
                maxAge: 86400, // 24 hours
                path: '/',
            });

            console.log(`Successful login for: ${email}`);
            return response;
        } catch (error) {
            console.error('Error setting cookies:', error);
            return NextResponse.json(
                { error: 'Error setting authentication cookie' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Cook login error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
        );
    }
}
