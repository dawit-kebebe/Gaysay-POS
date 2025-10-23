import connectToDatabase from "@/app/common/database";
import SellsModel from "@/app/common/database/models/Sells";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        if (!payload || !payload.id) return NextResponse.json({ message: 'id is required' }, { status: 400 });

        await connectToDatabase();

        const openSells = await SellsModel.findOne({ _id: payload.id, isClosed: false });
        if (!openSells) return NextResponse.json({ message: 'Open sells not found', status: 404 }, { status: 404 });

        openSells.isClosed = true;
        const savedItem = await openSells.save();

        return NextResponse.json({ message: 'Sells closed successfully', data: savedItem }, { status: 200 });
    } catch (err) {
        if (err instanceof SyntaxError) return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
        console.error('POST /api/sells/close error', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}