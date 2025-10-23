import connectToDatabase from "@/app/common/database";
import SellsModel from "@/app/common/database/models/Sells";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolved = await params;
        const id = resolved?.id;
        if (!id) return NextResponse.json({ message: 'id is required' }, { status: 400 });

        await connectToDatabase();
        const sells = await SellsModel.findById(id);
        if (!sells) return NextResponse.json({ message: 'Not found' }, { status: 404 });
        return NextResponse.json(sells, { status: 200 });
    } catch (err) {
        console.error('GET /api/sells/open/[id] error', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolved = await params;
        const id = resolved?.id;
        if (!id) return NextResponse.json({ message: 'id is required' }, { status: 400 });

        await connectToDatabase();

        const sells = await SellsModel.findById(id);
        if (!sells) return NextResponse.json({ message: 'Not found' }, { status: 404 });

        await sells.deleteOne();

        return NextResponse.json({ message: 'Sells deleted successfully' }, { status: 200 });
    } catch (err) {
        console.error('DELETE /api/sells/open/[id] error', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}