'use client';

import ProductShowcase from '@/components/homepage/ProductShowcase';
import { Product } from '@/types/Product';

interface Props {
    title: string;
    products?: Product[];
    loading?: boolean;
}

export default function RelatedProductsSection({
    title,
    products = [],
    loading,
}: Props) {
    if (loading) {
        return (
            <section className="border-t border-gray-200 dark:border-gray-700 pt-12">
                <ProductShowcase
                    title={title}
                    description="Loading products..."
                    singleRow={true}
                />
            </section>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <section className="border-t border-gray-200 dark:border-gray-700 pt-12">
            <ProductShowcase
                productsData={products}
                title={title}
                description="Handpicked pieces for discerning taste"
                singleRow={true}
                className="px-0!"
            />
        </section>
    );
}