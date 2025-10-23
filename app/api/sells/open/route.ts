import connectToDatabase from "@/app/common/database";
import SellsModel from "@/app/common/database/models/Sells";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        await connectToDatabase();
        const sells = await SellsModel.find({ isClosed: false }).populate('itemId');
        return NextResponse.json(sells, { status: 200 });
    } catch (err) {
        console.error('GET /api/sells/open error', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        if (!payload || !payload.itemId) {
            return NextResponse.json({ message: 'itemId is required' }, { status: 400 });
        }

        await connectToDatabase();

        const alreadyOpenedSells = await SellsModel.findOne({ itemId: payload.itemId, isClosed: false });
        if (alreadyOpenedSells) {
            return NextResponse.json({ message: 'There is already an open sells on this item. Please close it first.' }, { status: 409 });
        }

        const sellsOpened = await SellsModel.create({
            itemId: payload.itemId,
            unitsSold: [
                {
                    frequency: payload.frequency || 0,
                    timestamp: new Date(),
                },
            ],
            totalFreq: payload.frequency || 0,
            isClosed: false,
        });

        return NextResponse.json({ message: 'Sells opened successfully', data: sellsOpened }, { status: 201 });
    } catch (err) {
        if (err instanceof SyntaxError) return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
        console.error('POST /api/sells/open error', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}