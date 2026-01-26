'use client';

import { useEffect, useState } from 'react';
import { Category } from '@/types/Product';
import CategoryGrid from '@/components/inspiration/CategoryGrid';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories', {
          cache: 'no-store',
        });

        if (!res.ok) throw new Error('Failed to fetch categories');

        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error('Category fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <main className="min-h-screen bg-white dark:bg-[#0f1419]">
      <CategoryGrid
        inspiration={{ categories }}
        loading={loading}
      />
    </main>
  );
}