import connectToDatabase from "@/app/common/database";
import MenuModel from "@/app/common/database/models/Menu";
import { Menu } from "@/app/common/types/menu";
import { getCloudnary } from "@/app/common/util/cloudnary.util";
import { dataUrlToFileBuffer } from "@/app/common/util/uri-to-file";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

const saveMenuImage = async (dataUrl: string): Promise<string | undefined> => {
    try {
        const { buffer } = dataUrlToFileBuffer(dataUrl);
        const filename = `${crypto.randomUUID()}.png`;

        return await new Promise((resolve, reject) => {
            getCloudnary().uploader.upload_stream({
                folder: path.join('gaysay', 'uploads', 'menu'),
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
        console.warn('Failed to process image, continuing without it.', fileError);
        return undefined;
    }
};

const handleImageUpdate = async (imageUrlField: string | undefined): Promise<string | null | undefined> => {
    if (imageUrlField !== undefined) {
        if (typeof imageUrlField === 'string' && imageUrlField.startsWith('data:')) {
            const uploadedUrl = await saveMenuImage(imageUrlField);
            return uploadedUrl;
        } else if (imageUrlField === null) {
            return null;
        } else if (typeof imageUrlField === 'string' && !imageUrlField.startsWith('data:')) {
            return imageUrlField;
        }
    }
    return undefined;
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolved = await params;
        const id = resolved?.id;
        if (!id) return NextResponse.json({ message: 'id is required' }, { status: 400 });

        await connectToDatabase();
        const menu = await MenuModel.findById(id);
        if (!menu) return NextResponse.json({ message: 'Not found' }, { status: 404 });
        return NextResponse.json(menu, { status: 200 });
    } catch (err) {
        console.error('GET /api/menu/[id] error', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        if (!id) return NextResponse.json({ message: 'Menu ID is required' }, { status: 400 });

        const payload = await req.json();

        if (!payload || Object.keys(payload).length === 0) {
            return NextResponse.json({ message: 'Update payload cannot be empty' }, { status: 400 });
        }

        delete payload._id;

        await connectToDatabase();

        const updateData = {} as Menu;

        const newMenuImgUrl = await handleImageUpdate(payload.menuImgUrl);
        if (newMenuImgUrl !== undefined) {
            updateData.menuImgUrl = newMenuImgUrl || undefined;
        }

        if (typeof payload.name === 'string') updateData.name = payload.name;
        if (typeof payload.description === 'string') updateData.description = payload.description;
        if (typeof payload.catagory === 'string') updateData.catagory = payload.catagory;
        if (typeof payload.price === 'number') updateData.price = payload.price;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: 'No valid fields provided for update' }, { status: 400 });
        }

        // Perform the update
        const updated = await MenuModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updated) return NextResponse.json({ message: 'Menu item not found' }, { status: 404 });

        revalidatePath('/');

        return NextResponse.json({ message: 'Menu item updated successfully', data: updated }, { status: 200 });
    } catch (err) {
        if (err instanceof SyntaxError) return NextResponse.json({ message: 'Invalid JSON payload' }, { status: 400 });
        console.error('PUT /api/menu/[id] error', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolved = await params;
        const id = resolved?.id;
        if (!id) return NextResponse.json({ message: 'id is required' }, { status: 400 });

        await connectToDatabase();
        const removed = await MenuModel.findByIdAndDelete(id);
        if (!removed) return NextResponse.json({ message: 'Not found' }, { status: 404 });

        revalidatePath('/');

        return NextResponse.json({ message: 'Deleted' }, { status: 200 });
    } catch (err) {
        console.error('DELETE /api/menu/[id] error', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}