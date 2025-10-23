import { Role } from '@/app/common/types/role'
import type { User as UserType } from '@/app/common/types/user'
import { Schema, model, models, type Document, type Model } from 'mongoose'
import { AuditDocument } from '../../types/audit'

interface UserDocument extends AuditDocument, Document, Omit<UserType, 'id'> { }

const UserSchema = new Schema<UserDocument>(
    {
        name: { type: String, required: true, trim: true },
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: { type: String, required: false, select: false },
        role: { type: String, required: true, enum: Role, index: true },
        avatarUrl: { type: String, required: false, trim: true },
    },
    { timestamps: true }
)

// Ensure password is never output and normalize id field
UserSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        ret.id = ret._id?.toString()
        delete ret._id
        delete ret.password
        return ret
    },
})

// Reuse model if already compiled (Next.js hot-reload, serverless, etc.)
const UserModel: Model<UserDocument> = (models.User as Model<UserDocument>) || model<UserDocument>('User', UserSchema)

export default UserModel
