import mongoose, { type Mongoose } from 'mongoose'

type MongooseCache = { conn: Mongoose | null; promise: Promise<Mongoose> | null }
const globalForMongoose = globalThis as unknown as { _mongoose?: MongooseCache }

const cached: MongooseCache = globalForMongoose._mongoose || { conn: null, promise: null }
if (!globalForMongoose._mongoose) {
    globalForMongoose._mongoose = cached
}

export async function connectToDatabase(): Promise<Mongoose> {
    const MONGODB_URI = process.env.MONGODB_URI

    if (!MONGODB_URI) {
        throw new Error('Missing environment variable: MONGODB_URI')
    }

    if (cached.conn) return cached.conn

    if (!cached.promise) {
        mongoose.set('strictQuery', true)
        cached.promise = mongoose.connect(MONGODB_URI, {
            dbName: process.env.MONGODB_DB,
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10,
        }).catch(err => {
            cached.promise = null;
            throw err;
        })
    }

    cached.conn = await cached.promise
    return cached.conn
}

export default connectToDatabase
