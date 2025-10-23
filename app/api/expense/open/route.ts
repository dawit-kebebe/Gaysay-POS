import connectToDatabase from '@/app/common/database';
import PurchaseModel from '@/app/common/database/models/Purchase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        await connectToDatabase();
        const purchases = await PurchaseModel.find({ isClosed: false });
        return NextResponse.json(purchases, { status: 200 });
    } catch (err) {
        console.error('GET /api/expense/open error', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        if (!payload || !payload.name || payload.unitPrice == null || payload.quantity == null) {
            return NextResponse.json({ message: 'name, unitPrice and quantity are required' }, { status: 400 });
        }

        await connectToDatabase();

        const created = await PurchaseModel.create({
            name: payload.name,
            description: payload.description ?? '',
            unitPrice: Number(payload.unitPrice),
            quantity: Number(payload.quantity),
        });

        return NextResponse.json({ message: 'Purchase created', data: created }, { status: 201 });
    } catch (err) {
        if (err instanceof SyntaxError) return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
        console.error('POST /api/expense/open error', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
