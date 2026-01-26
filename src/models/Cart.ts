import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  productId: Schema.Types.ObjectId;
  quantity: number;
  selectedVariant?: {
    color?: string;
    size?: string;
    sku?: string;
  };
  addedAt: Date;
}

export interface ICart extends Document {
  userId: Schema.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  selectedVariant: {
    color: String,
    size: String,
    sku: String,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [CartItemSchema],
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);