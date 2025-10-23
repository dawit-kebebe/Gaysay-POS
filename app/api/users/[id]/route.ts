import connectToDatabase from "@/app/common/database";
import UserModel from "@/app/common/database/models/User";
import { getCloudnary } from "@/app/common/util/cloudnary.util";
import { dataUrlToFileBuffer } from "@/app/common/util/uri-to-file";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import crypto from 'crypto';
import fs from 'fs/promises';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from "next/server";
import path from "path";

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

// async function deleteFile(relativeUrl: string | undefined | null): Promise<void> {
//     if (!relativeUrl) return;
//     try {
//         const filePath = path.join(process.cwd(), 'public', relativeUrl);
//         await fs.unlink(filePath);
//     } catch (error) {
//         console.error(`Failed to delete file at ${relativeUrl}:`, error);
//     }
// }

// async function saveAvatar(dataUrl: string): Promise<string> {
//     const { buffer } = dataUrlToFileBuffer(dataUrl);
//     const filename = `${crypto.randomUUID()}.png`;
//     const relativeUrl = path.join(AVATAR_DIR, filename);
//     const absolutePath = path.join(process.cwd(), 'public', relativeUrl);

//     await fs.mkdir(path.dirname(absolutePath), { recursive: true });
//     await fs.writeFile(absolutePath, buffer);

//     return relativeUrl;
// }

const saveAvatar = async (dataUrl: string): Promise<string | undefined> => {
    try {
        const { buffer } = dataUrlToFileBuffer(dataUrl);
        const filename = `${crypto.randomUUID()}.png`;

        return await new Promise((resolve, reject) => {
            getCloudnary().uploader.upload_stream({
                folder: path.join('gaysay', 'uploads', 'avatars'),
                public_id: `${filename}`,
                overwrite: true,
                resource_type: 'image',
            }, (error: UploadApiErrorResponse | undefined, uploadResult: UploadApiResponse | undefined) => {
                if (error) {
                    return reject(error);
                }

                return resolve(uploadResult?.secure_url);
            }).end(buffer);
        })

    } catch (fileError) {
        console.warn('Failed to process avatar image, continuing without it.', fileError);
        return undefined;
    }
};

export async function GET(_: NextRequest, { params }: RouteContext) {
    try {
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid User ID format' }, { status: 400 });
        }

        await connectToDatabase();

        const user = await UserModel.findById(id).select('-password');

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });

    } catch (err) {
        console.error('GET /api/users/[id] error', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
    try {
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid User ID format' }, { status: 400 });
        }

        const payload = await req.json();
        if (!payload || Object.keys(payload).length === 0) {
            return NextResponse.json({ message: 'Update body is required' }, { status: 400 });
        }

        if (payload.password !== undefined) {
            return NextResponse.json({ message: 'Password update must use the /password endpoint.' }, { status: 400 });
        }

        await connectToDatabase();

        const updateData: Record<string, unknown> = { ...payload };
        // let oldAvatarUrl: string | undefined | null;

        if (updateData.avatarUrl !== undefined) {
            // const existingUser = await UserModel.findById(id).select('avatarUrl');
            // if (existingUser) {
            //     oldAvatarUrl = existingUser.avatarUrl;
            // }

            if (typeof updateData.avatarUrl === 'string' && updateData.avatarUrl.startsWith('data:')) {
                try {
                    updateData.avatarUrl = await saveAvatar(updateData.avatarUrl);
                    // await deleteFile(oldAvatarUrl);
                } catch (fileError) {
                    console.warn('PUT /api/users/[id]: Failed to process new avatar image, skipping file update.', fileError);
                    delete updateData.avatarUrl;
                }
            } else if (updateData.avatarUrl === null || updateData.avatarUrl === '') {
                updateData.avatarUrl = null;
                // await deleteFile(oldAvatarUrl);
            } else {
                delete updateData.avatarUrl;
            }
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(updatedUser, { status: 200 });

    } catch (err) {
        console.error('PUT /api/users/[id] error', err);

        if (err instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid JSON body.' }, { status: 400 });
        }

        const anyErr = err as { code?: number };
        if (anyErr?.code === 11000) {
            return NextResponse.json({ message: 'Username already exists.' }, { status: 409 });
        }
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
    try {
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid User ID format' }, { status: 400 });
        }

        await connectToDatabase();

        // const userToDelete = await UserModel.findById(id).select('avatarUrl');

        const deletedUser = await UserModel.findByIdAndDelete(id);

        if (!deletedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // await deleteFile(userToDelete?.avatarUrl);

        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });

    } catch (err) {
        console.error('DELETE /api/users/[id] error', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}