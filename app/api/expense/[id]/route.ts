import connectToDatabase from '@/app/common/database';
import PurchaseModel from '@/app/common/database/models/Purchase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolved = await params;
        const id = resolved?.id;
        if (!id) return NextResponse.json({ message: 'id is required' }, { status: 400 });

        await connectToDatabase();
        const purchase = await PurchaseModel.findById(id);
        if (!purchase) return NextResponse.json({ message: 'Not found' }, { status: 404 });
        return NextResponse.json(purchase, { status: 200 });
    } catch (err) {
        console.error('GET /api/expense/[id] error', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolved = await params;
        const id = resolved?.id;
        if (!id) return NextResponse.json({ message: 'id is required' }, { status: 400 });

        const payload = await req.json();
        await connectToDatabase();

        const updated = await PurchaseModel.findByIdAndUpdate(id, payload, { new: true });
        if (!updated) return NextResponse.json({ message: 'Not found' }, { status: 404 });
        return NextResponse.json({ message: 'Updated', data: updated }, { status: 200 });
    } catch (err) {
        if (err instanceof SyntaxError) return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
        console.error('PUT /api/expense/[id] error', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolved = await params;
        const id = resolved?.id;
        if (!id) return NextResponse.json({ message: 'id is required' }, { status: 400 });

        await connectToDatabase();
        const doc = await PurchaseModel.findById(id);
        if (!doc) return NextResponse.json({ message: 'Not found' }, { status: 404 });
        await doc.deleteOne();
        return NextResponse.json({ message: 'Deleted' }, { status: 200 });
    } catch (err) {
        console.error('DELETE /api/expense/[id] error', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
