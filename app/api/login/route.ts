import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/app/common/database';
import UserModel from '@/app/common/database/models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

interface LoginBody {
    username?: string;
    password?: string;
    remember?: boolean;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET || 'your_default_access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET || 'your_default_refresh_secret';

export async function POST(req: NextRequest) {
    try {
        const body: LoginBody = await req.json();
        const { username, password, remember } = body;

        if (!username || !password) {
            return NextResponse.json(
                { status: 'error', message: 'Username and password are required.' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const user = await UserModel.findOne({ username }).select('+password').lean();

        if (!user) {
            // A common security practice is to return a generic 401 to prevent username enumeration
            return NextResponse.json({ status: 'error', message: 'Invalid credentials' }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.password || '');

        if (!isMatch) {
            return NextResponse.json({ status: 'error', message: 'Invalid credentials' }, { status: 401 });
        }

        const REFRESH_MAX_AGE = remember ? 7 * 24 * 60 * 60 : 24 * 60 * 60; // 7 days or 1 day (in seconds)
        const ACCESS_MAX_AGE = 60 * 60;  // 1 hour (in seconds)

        const payload = {
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role,
            avatarUrl: user.avatarUrl,
        };

        const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: `${ACCESS_MAX_AGE}s` });
        const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: `${REFRESH_MAX_AGE}s` });

        const response = NextResponse.json({ status: 'ok', data: { accessToken } });
        const cookieStore = await cookies();

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as 'lax' | 'strict' | 'none', // Type assertion for TypeScript safety
            path: '/', // Ensure cookies are accessible throughout the application
        };

        cookieStore.set('refreshToken', refreshToken, {
            ...cookieOptions,
            maxAge: REFRESH_MAX_AGE,
        });

        cookieStore.set('accessToken', accessToken, {
            ...cookieOptions,
            maxAge: ACCESS_MAX_AGE,
        });

        return response;

    } catch (err) {
        if (err instanceof SyntaxError) {
            console.warn('Login: invalid JSON payload');
            return NextResponse.json({ status: 'error', message: 'Invalid request body format (JSON)' }, { status: 400 });
        }

        console.error('Login endpoint error:', err);
        return NextResponse.json(
            { status: 'error', message: 'An internal server error occurred during login.' },
            { status: 500 }
        );
    }
}