import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('accessToken');
        cookieStore.delete('refreshToken');

        return NextResponse.json({ message: 'Logged out successfully.' }, { status: 200 });
    } catch (err) {
        console.error('Logout error', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}