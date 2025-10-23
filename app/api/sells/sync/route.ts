import connectToDatabase from "@/app/common/database";
import SellsModel from "@/app/common/database/models/Sells";
import { totalFreq } from "@/app/common/util/total-freq.unit";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        if (!payload || !payload.id) return NextResponse.json({ message: 'id is required' }, { status: 400 });

        await connectToDatabase();

        const openSells = await SellsModel.findOne({ _id: payload.id, isClosed: false });
        if (!openSells) return NextResponse.json({ message: 'Open sells not found' }, { status: 404 });

        openSells.unitsSold.push({ frequency: payload.frequency ?? 1, timestamp: new Date() });
        openSells.totalFreq = totalFreq(openSells.unitsSold);

        const savedItem = await openSells.save();

        return NextResponse.json({ message: 'Sells frequency added successfully', data: savedItem }, { status: 201 });
    } catch (err) {
        if (err instanceof SyntaxError) return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
        console.error('POST /api/sells/sync error', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}