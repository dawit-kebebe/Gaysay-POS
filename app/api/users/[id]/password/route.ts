import connectToDatabase from "@/app/common/database";
import UserModel from "@/app/common/database/models/User";
import { UpdatePasswordPayload } from "@/app/common/types/user";
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
    try {
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid User ID format' }, { status: 400 });
        }

        const payload: UpdatePasswordPayload = await req.json();
        const { newPassword } = payload;

        if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
            return NextResponse.json({ message: 'Password is required and must be at least 8 characters long.' }, { status: 400 });
        }

        await connectToDatabase();

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const updatedUser = await UserModel.findByIdAndUpdate(
            id,
            { $set: { password: hashedPassword } },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });

    } catch (err) {
        console.error('PUT /api/users/[id]/password error', err);

        if (err instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid JSON body.' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
