import connectToDatabase from "@/app/common/database";
import SellsModel from "@/app/common/database/models/Sells";
import { NextRequest, NextResponse } from "next/server";

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
                    frequency: payload.frequency ?? 1,
                    timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
                },
            ],
        });

        return NextResponse.json({ message: 'Sells opened successfully', data: sellsOpened }, { status: 201 });
    } catch (err) {
        if (err instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
        }
        console.error('POST /api/sells error', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}