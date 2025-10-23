import mongoose, { Schema, model, models, type Document, type Model } from 'mongoose'
import { AuditDocument } from '../../types/audit'

interface SellsDocument extends AuditDocument, Document {
    itemId: Schema.Types.ObjectId,
    unitsSold: Array<{
        frequency: number,
        timestamp: Date
    }>,
    isClosed: boolean,
    totalFreq?: number
}

const SellsSchema = new Schema<SellsDocument>({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Menu',
    },
    unitsSold: {
        type: [{
            frequency: { type: Number, required: true },
            timestamp: { type: Date, required: true }
        }]
    },
    totalFreq: {
        type: Number,
        required: false,
        default: 0
    },
    isClosed: { type: Boolean, default: false }
}, { timestamps: true })

SellsSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        ret.id = ret._id?.toString()
        delete ret._id
        return ret
    },
})

const SellsModel: Model<SellsDocument> = (models.Sells as Model<SellsDocument>) || model<SellsDocument>('Sells', SellsSchema)

export default SellsModel