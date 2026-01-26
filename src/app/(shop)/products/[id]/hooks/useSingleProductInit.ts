"use client";

import { useEffect } from "react";
import { useProductStore } from "@/stores/productStore";
import { useProduct, useRelatedProducts } from "@/hooks/useProductData";

export const useSingleProductInit = (productId?: string) => {
  const { quantity, setQuantity } = useProductStore();

  const {
    data: product,
    isLoading: loading,
    error,
  } = useProduct(productId || "");

  const categoryName = product?.categoryId?.name;

  const { data: relatedProducts = [], isLoading: loadingRelated } =
    useRelatedProducts(categoryName, productId);

  // Debug logging
  useEffect(() => {
    if (product) {
      console.log('Product loaded:', {
        productId: product._id,
        categoryId: product.categoryId,
        categoryName: categoryName,
        relatedProductsCount: relatedProducts.length
      });
    }
  }, [product, categoryName, relatedProducts]);

  // Reset quantity when product changes
  useEffect(() => {
    if (product) {
      setQuantity(1);
    }
  }, [product, setQuantity]);

  return {
    product,
    relatedProducts,
    allProducts: [], // Empty for now, can be populated if needed
    loading,
    loadingMore: loadingRelated,
    loadingAll: false,
    error: error ? String(error) : null,
    quantity,
    setQuantity,
    hasFetched: !loading,
  };
};