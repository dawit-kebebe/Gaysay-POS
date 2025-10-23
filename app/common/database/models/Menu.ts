import { Schema, model, models, type Document, type Model } from 'mongoose'
import { AuditDocument } from '../../types/audit'
import { Menu } from '../../types/menu'

interface MenuDocument extends AuditDocument, Document, Omit<Menu, 'id'> { }

const MenuSchema = new Schema<MenuDocument>(
    {
        name: { type: String, required: true, trim: true },
        description: {
            type: String,
            required: false,
            trim: true,
        },
        catagory: { type: String, required: true },
        price: { type: Number, required: true, min: 0.01 },
        menuImgUrl: { type: String, required: false },
    },
    { timestamps: true }
)

// Ensure password is never output and normalize id field
MenuSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        ret.id = ret._id?.toString()
        delete ret._id
        return ret
    },
})

// Reuse model if already compiled (Next.js hot-reload, serverless, etc.)
const MenuModel: Model<MenuDocument> = (models.Menu as Model<MenuDocument>) || model<MenuDocument>('Menu', MenuSchema)

export default MenuModel
