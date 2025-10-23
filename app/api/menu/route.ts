import connectToDatabase from "@/app/common/database";
import MenuModel from "@/app/common/database/models/Menu";
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
        // const relativeUrl = path.join('gaysay', 'uploads', 'menu', filename);
        // const absolutePath = path.join(process.cwd(), 'public', relativeUrl);

        // await fs.mkdir(path.dirname(absolutePath), { recursive: true });
        // await fs.writeFile(absolutePath, buffer);
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

        // return relativeUrl;
    } catch (fileError) {
        console.warn('Failed to process avatar image, continuing without it.', fileError);
        return undefined;
    }
};

export async function GET(_: NextRequest) {
    try {
        await connectToDatabase();
        const menu = await MenuModel.find({});
        return NextResponse.json(menu, { status: 200 });
    } catch (err) {
        console.error('GET /api/menu error', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();

        if (!payload || typeof payload.name !== 'string' || typeof payload.catagory !== 'string' || typeof payload.price !== 'number') {
            return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
        }

        await connectToDatabase();

        let uploadedImgUrl: string | undefined;
        if (payload.menuImgUrl) {
            // const { buffer } = dataUrlToFileBuffer(payload.menuImgUrl);
            // const filename = crypto.randomUUID() + '.png';
            // uploadedImgUrl = path.join('/uploads', filename);
            // const uploadedImgSrc = path.join(process.cwd(), 'public', uploadedImgUrl);
            // // Ensure directory exists then write file asynchronously
            // await fs.mkdir(path.dirname(uploadedImgSrc), { recursive: true });
            // await fs.writeFile(uploadedImgSrc, buffer);
            uploadedImgUrl = await saveMenuImage(payload.menuImgUrl);
        }

        const menuCreated = await MenuModel.create({
            name: payload.name,
            description: payload.description,
            catagory: payload.catagory,
            price: payload.price,
            menuImgUrl: uploadedImgUrl,
        });

        revalidatePath('/');

        return NextResponse.json({ message: 'Menu created successfully', data: menuCreated }, { status: 201 });
    } catch (err) {
        if (err instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
        }
        console.error('POST /api/menu error', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
