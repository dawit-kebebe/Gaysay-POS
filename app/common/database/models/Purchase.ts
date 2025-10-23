import { Schema, model, models, type Document, type Model } from 'mongoose'
import { AuditDocument } from '../../types/audit'
import { PurchaseItem } from '../../types/purchase'

interface PurchaseDocument extends AuditDocument, Document, Omit<PurchaseItem, 'id' | 'createdAt' | 'updatedAt'> { }

const PurchaseSchema = new Schema<PurchaseDocument>(
    {
        name: { type: String, required: true, trim: true },
        description: {
            type: String,
            required: false,
            trim: true,
        },
        unitPrice: { type: Number, required: true, min: 0.01 },
        quantity: { type: Number, required: true, min: 1 },
        isClosed: { type: Boolean, required: false, default: false }
    },
    { timestamps: true }
)

// Ensure password is never output and normalize id field
PurchaseSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        ret.id = ret._id?.toString()
        delete ret._id
        return ret
    },
})

// Reuse model if already compiled (Next.js hot-reload, serverless, etc.)
const PurchaseModel: Model<PurchaseDocument> = (models.purchase as Model<PurchaseDocument>) || model<PurchaseDocument>('Purchase', PurchaseSchema)

export default PurchaseModel
