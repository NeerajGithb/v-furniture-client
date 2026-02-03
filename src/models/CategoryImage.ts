import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategoryImage extends Document {
  imageType: string;
  url: string;
  publicId: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategoryImageSchema = new Schema<ICategoryImage>(
  {
    imageType: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// index (single, no duplicate)
CategoryImageSchema.index({ imageType: 1 });

const CategoryImage: Model<ICategoryImage> =
  mongoose.models.CategoryImage ||
  mongoose.model<ICategoryImage>("CategoryImage", CategoryImageSchema);

export default CategoryImage;
