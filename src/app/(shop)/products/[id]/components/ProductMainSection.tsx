'use client';

import ProductImageGallery from '@/components/product/ProductImageGallery';
import ProductDetails from '@/components/product/ProductDetails';
import ProductReviews from '@/components/product/ProductReviews';
import { Product } from '@/types/Product';

interface Props {
    product: Product;
    quantity: number;
    setQuantity: (q: number) => void;
    actions: any;
    userId?: string;
}

export default function ProductMainSection({
    product,
    quantity,
    setQuantity,
    actions,
    userId,
}: Props) {
    const images = [
        product.mainImage,
        ...(product.galleryImages || []),
    ].filter((img): img is NonNullable<typeof img> => Boolean(img));
    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-[40%] md:sticky md:top-14">
                <ProductImageGallery images={images} productName={product.name} />
            </div>

            <div className="md:w-[60%] space-y-8">
                <ProductDetails
                    product={product}
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                    onAddToCart={actions.handleAddToCart}
                    onBuyNow={actions.handleBuyNow}
                    isInCart={actions.isInCart}
                    cartQuantity={actions.cartItem?.quantity}
                    isUpdatingCart={actions.isUpdatingCart}
                    buyingNow={actions.buyingNow}
                />

                <ProductReviews productId={product._id} userId={userId} />
            </div>
        </div>
    );
}