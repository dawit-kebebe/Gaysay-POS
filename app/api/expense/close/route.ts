import connectToDatabase from '@/app/common/database';
import PurchaseModel from '@/app/common/database/models/Purchase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        if (!payload || !payload.id) return NextResponse.json({ message: 'id is required' }, { status: 400 });

        await connectToDatabase();

        const doc = await PurchaseModel.findById(payload.id);
        if (!doc) return NextResponse.json({ message: 'Not found' }, { status: 404 });

        doc.isClosed = true;
        await doc.save();

        return NextResponse.json({ message: 'Closed', data: doc }, { status: 200 });
    } catch (err) {
        if (err instanceof SyntaxError) return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
        console.error('POST /api/expense/close error', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
