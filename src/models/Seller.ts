import mongoose, { Document, Schema } from 'mongoose';

export interface ISeller extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    password: string;
    businessName: string;
    contactPerson: string;
    phone?: string;
    address?: string;
    businessType?: string;
    gstNumber?: string;
    status: 'active' | 'inactive' | 'pending' | 'suspended';
    createdAt: Date;
    updatedAt: Date;
    lastLogin?: Date;
    totalProducts: number;
    totalSales: number;
    revenue: number;
    commission: number;
    rating?: number;
    verified: boolean;
    resetCode?: string;
    resetCodeExpires?: Date;
}

const SellerSchema = new Schema<ISeller>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please enter a valid email'
            ]
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
        },
        businessName: {
            type: String,
            required: [true, 'Business name is required'],
            trim: true,
            maxlength: 200
        },
        contactPerson: {
            type: String,
            required: [true, 'Contact person name is required'],
            trim: true,
            maxlength: 100
        },
        phone: {
            type: String,
            trim: true,
            match: [/^[+]?[\d\s\-\(\)]+$/, 'Invalid phone number']
        },
        address: {
            type: String,
            trim: true,
            maxlength: 500
        },
        businessType: {
            type: String,
            enum: ['manufacturer', 'wholesaler', 'retailer', 'distributor', 'other'],
            trim: true
        },
        gstNumber: {
            type: String,
            trim: true,
            uppercase: true,
            match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number format']
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'pending', 'suspended'],
            default: 'pending'
        },
        lastLogin: {
            type: Date,
            default: null
        },
        totalProducts: {
            type: Number,
            default: 0,
            min: 0
        },
        totalSales: {
            type: Number,
            default: 0,
            min: 0
        },
        revenue: {
            type: Number,
            default: 0,
            min: 0
        },
        commission: {
            type: Number,
            default: 10,
            min: 0,
            max: 100
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        verified: {
            type: Boolean,
            default: false
        },
        resetCode: {
            type: String,
            select: false
        },
        resetCodeExpires: {
            type: Date,
            select: false
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                delete (ret as any).password;
                return ret;
            }
        }
    }
);

// Indexes
SellerSchema.index({ status: 1 });
SellerSchema.index({ verified: 1 });
SellerSchema.index({ createdAt: -1 });
SellerSchema.index({ revenue: -1 });
SellerSchema.index({ businessType: 1 });

// Pre-save middleware for data normalization only
SellerSchema.pre('save', function (next) {
    if (this.email) {
        this.email = this.email.toLowerCase().trim();
    }
    if (this.gstNumber) {
        this.gstNumber = this.gstNumber.toUpperCase().trim();
    }
    next();
});

const Seller = mongoose.models.Seller || mongoose.model<ISeller>('Seller', SellerSchema);

export default Seller;
