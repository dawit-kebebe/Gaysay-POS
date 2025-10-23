import connectToDatabase from "@/app/common/database";
import UserModel from "@/app/common/database/models/User";
import { User } from "@/app/common/types/user";
import { getCloudnary } from "@/app/common/util/cloudnary.util";
import { dataUrlToFileBuffer } from "@/app/common/util/uri-to-file";
import { type UploadApiErrorResponse, type UploadApiResponse } from "cloudinary";
import crypto from 'crypto';
import { NextRequest, NextResponse } from "next/server";
import path from "path";

const saveAvatar = async (dataUrl: string): Promise<string | undefined> => {
    try {
        const { buffer } = dataUrlToFileBuffer(dataUrl);
        const filename = `${crypto.randomUUID()}.png`;
        // const relativeUrl = path.join('/gaysay/uploads', 'avatars', filename);
        // const absolutePath = path.join(process.cwd(), 'public', relativeUrl);

        // await fs.mkdir(path.dirname(absolutePath), { recursive: true });
        // await fs.writeFile(absolutePath, buffer);
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

        // return relativeUrl;
    } catch (fileError) {
        console.warn('Failed to process avatar image, continuing without it.', fileError);
        return undefined;
    }
};

export async function GET() {
    try {
        await connectToDatabase();
        const users = await UserModel.find({}).select('-password');
        return NextResponse.json(users, { status: 200 });
    } catch (err) {
        console.error('GET /api/users error', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}


export async function POST(req: NextRequest) {
    try {
        const payload: User = await req.json();
        const { name, username, password, role, avatarUrl } = payload;

        if (!name || !username || !password || !role) {
            return NextResponse.json(
                { message: 'Missing required fields: name, username, password, and role are mandatory.' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        let uploadedAvatarUrl: string | undefined;
        if (avatarUrl) {
            uploadedAvatarUrl = await saveAvatar(avatarUrl);
        }

        const userCreated = await UserModel.create({
            name,
            username,
            password, // Password hashing should occur automatically via Mongoose pre('save') hook
            role,
            avatarUrl: uploadedAvatarUrl,
        });

        const userObject = userCreated.toObject();
        delete userObject.password;

        return NextResponse.json(userObject, { status: 201 });

    } catch (err) {
        if (err instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid JSON body.' }, { status: 400 });
        }

        const anyErr = err as { code?: number; message?: string };

        if (anyErr.code === 11000) {
            return NextResponse.json({ message: 'Username already exists.' }, { status: 409 });
        }

        console.error('POST /api/users error', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}