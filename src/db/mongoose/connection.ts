import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/viteapi'

export async function connectMongo() {
  await mongoose.connect(MONGO_URI)
  console.log('✅ Mongo connected')
}

const baseSchemaOptions = { timestamps: true }

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }
}, baseSchemaOptions)

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }
}, baseSchemaOptions)

export const UserModel = mongoose.model('User', userSchema)
export const ProductModel = mongoose.model('Product', productSchema) 
