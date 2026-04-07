import { Role } from '@/app/common/types/role'
import type { User as UserType } from '@/app/common/types/user'
import { Schema, model, models, type Document, type Model } from 'mongoose'
import { AuditDocument } from '@/app/common/types/audit'

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
        const { _id, password, ...rest } = ret
        rest.id = _id?.toString()
        return rest
    },
})

// Reuse model if already compiled (Next.js hot-reload, serverless, etc.)
const UserModel: Model<UserDocument> = (models.User as Model<UserDocument>) || model<UserDocument>('User', UserSchema)

export default UserModel
