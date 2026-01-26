export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbConnect';
import Product from '@/models/product';
import Category from '@/models/category';
import SubCategory from '@/models/subcategory';
import Inspiration from '@/models/Inspiration';
import { getCached, setCache, CACHE_TTL } from '@/lib/cache';

interface AutocompleteItem {
  text: string;
  type: 'exact' | 'product' | 'category' | 'subcategory' | 'brand' | 'material' | 'color' | 'inspiration';
  count?: number;
  image?: string;
  category?: string;
}

interface QueryContext {
  mainEntity: string;
  priceConstraint?: { value: number; operator: 'under' | 'above' | 'around'; max?: number };
  colorConstraint?: string;
  materialConstraint?: string;
  sizeConstraint?: string;
  brandConstraint?: string;
  styleConstraint?: string;
  roomConstraint?: string;
}

interface CachedProduct {
  name: string;
  slug: string;
  brand?: string;
  material?: string;
  colorOptions?: string[];
  size?: string[];
  tags?: string[];
  totalSold: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  categorySlug?: string;
  subcategorySlug?: string;
  searchKeywords?: string[];
  mainImage?: { url: string; alt?: string; publicId?: string };
  galleryImages?: { url: string; alt?: string; publicId: string }[];
  finalPrice?: number;
  originalPrice?: number;
  attributes?: {
    seater?: number;
    color?: string;
    material?: string;
    style?: string;
    room?: string;
  };
}

interface MemoryCache {
  categories: Array<{ name: string; slug: string; image?: string }>;
  subcategories: Array<{ name: string; slug: string; image?: string }>;
  inspirations: Array<{ title: string; image?: string }>;
  products: CachedProduct[];
  brands: Array<{ name: string; count: number }>;
  materials: Array<{ name: string; count: number }>;
  colors: Array<{ name: string; count: number }>;
  lastUpdate: number;
}

let memoryCache: MemoryCache | null = null;

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const MIN_RESULTS = 6;
const MAX_RESULTS = 8;

// Enhanced keyword lists
const PRICE_KEYWORDS = ['under', 'below', 'above', 'over', 'around', 'upto', 'up to', 'less than', 'more than', 'between', 'from', 'to'];
const COLOR_KEYWORDS = ['red', 'blue', 'black', 'white', 'brown', 'grey', 'gray', 'green', 'yellow', 'beige', 'cream', 'orange', 'pink', 'purple', 'navy', 'maroon', 'gold', 'silver', 'bronze'];
const MATERIAL_KEYWORDS = ['wood', 'wooden', 'metal', 'fabric', 'leather', 'plastic', 'glass', 'marble', 'steel', 'iron', 'velvet', 'cotton', 'linen', 'silk', 'rattan', 'bamboo', 'oak', 'teak', 'pine'];
const SIZE_KEYWORDS = ['king', 'queen', 'single', 'double', 'twin', 'full', 'small', 'large', 'medium', 'mini', 'xl', 'xxl', '2 seater', '3 seater', '4 seater', '5 seater', '6 seater', '7 seater', 'compact', 'oversized'];
const STYLE_KEYWORDS = ['modern', 'contemporary', 'traditional', 'vintage', 'rustic', 'industrial', 'minimalist', 'scandinavian', 'bohemian', 'classic', 'luxury', 'premium'];
const ROOM_KEYWORDS = ['living room', 'bedroom', 'dining room', 'office', 'study', 'kitchen', 'bathroom', 'outdoor', 'patio', 'balcony'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ autocomplete: [] });
    }

    const cacheKey = `autocomplete:${query.toLowerCase()}`;
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    await ensureMemoryCacheLoaded();

    const context = analyzeQuery(query);
    const autocomplete = buildContextAwareSuggestions(query, context);

    const result = { autocomplete };
    await setCache(cacheKey, result, CACHE_TTL.SUGGESTIONS);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Autocomplete error:', error);
    return NextResponse.json({ autocomplete: [] });
  }
}

async function ensureMemoryCacheLoaded() {
  const now = Date.now();

  if (memoryCache && (now - memoryCache.lastUpdate) < CACHE_DURATION) {
    return;
  }

  await connectDB();

  const [categories, subcategories, inspirations, products] = await Promise.all([
    Category.find({}).select('name slug mainImage').lean(),
    SubCategory.find({}).select('name slug mainImage').lean(),
    Inspiration.find({}).select('title heroImage').lean(),
    Product.find({ isActive: true, isPublished: true })
      .select('name slug brand material colorOptions size tags totalSold isFeatured isBestSeller isNewArrival categorySlug subcategorySlug searchKeywords mainImage galleryImages attributes finalPrice originalPrice')
      .sort({ totalSold: -1, isFeatured: -1, isBestSeller: -1 })
      .limit(1000)
      .lean()
  ]);

  const brandMap = new Map<string, number>();
  const materialMap = new Map<string, number>();
  const colorMap = new Map<string, number>();

  products.forEach((p: any) => {
    if (p.brand) brandMap.set(p.brand, (brandMap.get(p.brand) || 0) + 1);
    if (p.material) materialMap.set(p.material, (materialMap.get(p.material) || 0) + 1);
    if (p.attributes?.material) materialMap.set(p.attributes.material, (materialMap.get(p.attributes.material) || 0) + 1);

    if (p.colorOptions?.length) {
      p.colorOptions.forEach((c: string) => colorMap.set(c, (colorMap.get(c) || 0) + 1));
    }
    if (p.attributes?.color) {
      colorMap.set(p.attributes.color, (colorMap.get(p.attributes.color) || 0) + 1);
    }
  });

  memoryCache = {
    categories: categories.map((c: any) => ({
      name: c.name,
      slug: c.slug,
      image: c.mainImage?.url
    })),
    subcategories: subcategories.map((sc: any) => ({
      name: sc.name,
      slug: sc.slug,
      image: sc.mainImage?.url
    })),
    inspirations: inspirations.map((i: any) => ({
      title: i.title,
      image: i.heroImage?.url
    })),
    products: products as any as CachedProduct[],
    brands: Array.from(brandMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    materials: Array.from(materialMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    colors: Array.from(colorMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    lastUpdate: now
  };
}

function analyzeQuery(query: string): QueryContext {
  const queryLower = query.toLowerCase().trim();
  const words = queryLower.split(/\s+/);

  const context: QueryContext = { mainEntity: '' };

  // Enhanced price detection
  PRICE_KEYWORDS.forEach(keyword => {
    const keywordPattern = keyword.replace(/\s+/g, '\\s+');
    const regex = new RegExp(`\\b${keywordPattern}\\s+(rs\\.?\\s*)?([\\d,]+k?)\\b`, 'i');
    const match = queryLower.match(regex);

    if (match) {
      const priceStr = match[2].replace(/,/g, '');
      let value = parseInt(priceStr);

      // Handle 'k' suffix
      if (priceStr.toLowerCase().endsWith('k')) {
        value = parseInt(priceStr.slice(0, -1)) * 1000;
      }

      if (value) {
        context.priceConstraint = {
          value,
          operator: ['under', 'below', 'less', 'upto', 'up'].includes(keyword.split(' ')[0]) ? 'under' :
            ['above', 'over', 'more'].includes(keyword.split(' ')[0]) ? 'above' : 'around'
        };
      }
    }
  });

  // Detect "between X and Y" price range
  const betweenMatch = queryLower.match(/between\s+(rs\.?\s*)?([\\d,]+k?)\s+(?:and|to|-)\s+(rs\.?\s*)?([\\d,]+k?)/i);
  if (betweenMatch) {
    const min = parseInt(betweenMatch[2].replace(/,/g, '').replace('k', '000'));
    const max = parseInt(betweenMatch[4].replace(/,/g, '').replace('k', '000'));
    context.priceConstraint = {
      value: min,
      operator: 'under',
      max
    };
  }

  // Detect colors
  COLOR_KEYWORDS.forEach(color => {
    const colorRegex = new RegExp(`\\b${color}\\b`, 'i');
    if (colorRegex.test(queryLower)) {
      context.colorConstraint = color;
    }
  });

  // Detect materials
  MATERIAL_KEYWORDS.forEach(material => {
    const materialRegex = new RegExp(`\\b${material}\\b`, 'i');
    if (materialRegex.test(queryLower)) {
      context.materialConstraint = material;
    }
  });

  // Detect sizes
  SIZE_KEYWORDS.forEach(size => {
    const sizePattern = size.replace(/\s+/g, '\\s+');
    const sizeRegex = new RegExp(`\\b${sizePattern}\\b`, 'i');
    if (sizeRegex.test(queryLower)) {
      context.sizeConstraint = size;
    }
  });

  // Detect styles
  STYLE_KEYWORDS.forEach(style => {
    const styleRegex = new RegExp(`\\b${style}\\b`, 'i');
    if (styleRegex.test(queryLower)) {
      context.styleConstraint = style;
    }
  });

  // Detect rooms
  ROOM_KEYWORDS.forEach(room => {
    const roomPattern = room.replace(/\s+/g, '\\s+');
    const roomRegex = new RegExp(`\\b${roomPattern}\\b`, 'i');
    if (roomRegex.test(queryLower)) {
      context.roomConstraint = room;
    }
  });

  // Detect brands
  if (memoryCache) {
    memoryCache.brands.forEach(b => {
      const brandRegex = new RegExp(`\\b${b.name.toLowerCase()}\\b`, 'i');
      if (brandRegex.test(queryLower)) {
        context.brandConstraint = b.name;
      }
    });
  }

  // Extract main entity (the core product type)
  const stopWords = [
    ...PRICE_KEYWORDS,
    ...COLOR_KEYWORDS,
    ...MATERIAL_KEYWORDS,
    ...SIZE_KEYWORDS,
    ...STYLE_KEYWORDS,
    ...ROOM_KEYWORDS,
    'the', 'a', 'an', 'with', 'for', 'in', 'on', 'at', 'to', 'from', 'rs', '₹', 'and', 'or'
  ];

  const mainWords = words.filter(w =>
    w.length > 2 &&
    !stopWords.includes(w) &&
    !/^\d+$/.test(w) &&
    !w.match(/^[,.\-]+$/)
  );

  // Try to find the most relevant product entity
  if (mainWords.length > 0) {
    // Check if any word matches a category or subcategory
    if (memoryCache) {
      // First try multi-word combinations (e.g., "sofa set", "dining table")
      if (mainWords.length >= 2) {
        const twoWordCombo = `${mainWords[0]} ${mainWords[1]}`;
        const matchesCategory = memoryCache.categories.some(c =>
          c.name.toLowerCase().includes(twoWordCombo) || twoWordCombo.includes(c.name.toLowerCase())
        );
        const matchesSubcategory = memoryCache.subcategories.some(sc =>
          sc.name.toLowerCase().includes(twoWordCombo) || twoWordCombo.includes(sc.name.toLowerCase())
        );

        if (matchesCategory || matchesSubcategory) {
          context.mainEntity = twoWordCombo;
          return context;
        }
      }

      // Then try single words
      for (const word of mainWords) {
        const matchesCategory = memoryCache.categories.some(c =>
          c.name.toLowerCase().includes(word) || word.includes(c.name.toLowerCase())
        );
        const matchesSubcategory = memoryCache.subcategories.some(sc =>
          sc.name.toLowerCase().includes(word) || word.includes(sc.name.toLowerCase())
        );

        if (matchesCategory || matchesSubcategory) {
          context.mainEntity = word;
          return context;
        }
      }
    }

    // Use the first meaningful word
    context.mainEntity = mainWords[0];
  } else {
    // Fallback to first word with length > 2
    context.mainEntity = words.find(w => w.length > 2) || words[0] || '';
  }

  return context;
}

function buildContextAwareSuggestions(query: string, context: QueryContext): AutocompleteItem[] {
  if (!memoryCache) return [];

  const suggestions: AutocompleteItem[] = [];
  const seen = new Set<string>();
  const queryLower = query.toLowerCase().trim();

  // Extract the base query (what user actually typed)
  const baseQuery = queryLower;

  // Check if query ends with space (complete word)
  const hasTrailingSpace = query.endsWith(' ');

  const addUnique = (text: string, type: AutocompleteItem['type'], count?: number, image?: string, category?: string) => {
    const key = text.toLowerCase();

    // Smart filtering based on type
    let shouldInclude = false;

    if (type === 'product') {
      // For products: must contain the main entity (e.g., "sofa"), not necessarily the full query
      // This allows "Modern Black Sectional Sofa" to match "black sofa"
      if (context.mainEntity) {
        shouldInclude = key.includes(context.mainEntity.toLowerCase());
      } else {
        shouldInclude = key.includes(baseQuery);
      }
    } else if (type === 'exact') {
      // Exact matches always included
      shouldInclude = true;
    } else {
      // For categories, subcategories, brands, etc.: must contain base query or be built from it
      shouldInclude = key.includes(baseQuery);
    }

    if (!shouldInclude) {
      return;
    }

    if (!seen.has(key)) {
      seen.add(key);

      const item: AutocompleteItem = { text, type };
      if (count !== undefined) item.count = count;
      if (image) item.image = image;
      if (category) item.category = category;

      suggestions.push(item);
    }
  };

  // Only add exact match if query has trailing space (complete word)
  if (hasTrailingSpace && queryLower.trim().length > 0) {
    // Try to find an image for the exact match
    let exactImage: string | undefined;
    let exactCategory: string | undefined;

    // Check if it matches a category
    const matchingCategory = memoryCache.categories.find(c =>
      c.name.toLowerCase() === queryLower.trim()
    );
    if (matchingCategory) {
      exactImage = matchingCategory.image;
      exactCategory = matchingCategory.name;
    }

    // Check if it matches a subcategory
    if (!exactImage) {
      const matchingSubcategory = memoryCache.subcategories.find(sc =>
        sc.name.toLowerCase() === queryLower.trim()
      );
      if (matchingSubcategory) {
        exactImage = matchingSubcategory.image;
        exactCategory = matchingSubcategory.name;
      }
    }

    // Check if it matches a product
    if (!exactImage) {
      const matchingProduct = memoryCache.products.find(p =>
        p.name.toLowerCase() === queryLower.trim()
      );
      if (matchingProduct) {
        exactImage = (matchingProduct as any).mainImage?.url;
        exactCategory = matchingProduct.brand || 'Product';
      }
    }

    suggestions.push({
      text: query.trim(),
      type: 'exact',
      ...(exactImage && { image: exactImage }),
      ...(exactCategory && { category: exactCategory })
    });
    seen.add(queryLower.trim());
  }

  const hasPrice = context.priceConstraint !== undefined;
  const hasColor = context.colorConstraint !== undefined;
  const hasMaterial = context.materialConstraint !== undefined;
  const hasSize = context.sizeConstraint !== undefined;
  const hasBrand = context.brandConstraint !== undefined;
  const hasStyle = context.styleConstraint !== undefined;
  const hasRoom = context.roomConstraint !== undefined;

  // Priority 1: Exact and high-relevance product matches (MOST IMPORTANT)
  if (context.mainEntity) {
    const relevantProducts = memoryCache.products.filter(p => {
      const nameLower = p.name.toLowerCase();
      const entityLower = context.mainEntity.toLowerCase();

      // Scoring system for better relevance
      const startsWithEntity = nameLower.startsWith(entityLower);
      const containsEntity = nameLower.includes(entityLower);
      const inTags = p.tags?.some(t => t.toLowerCase().includes(entityLower));
      const inKeywords = p.searchKeywords?.some(k => k.toLowerCase().includes(entityLower));
      const inBrand = p.brand?.toLowerCase().includes(entityLower);

      // Match constraints if specified
      let matchesConstraints = true;
      if (context.colorConstraint && p.colorOptions) {
        const colorMatch = p.colorOptions.some(c =>
          c.toLowerCase().includes(context.colorConstraint!)
        );
        matchesConstraints = matchesConstraints && colorMatch;
      }
      if (context.materialConstraint) {
        const materialMatch = Boolean(
          p.material?.toLowerCase().includes(context.materialConstraint) ||
          p.attributes?.material?.toLowerCase().includes(context.materialConstraint)
        );
        matchesConstraints = matchesConstraints && materialMatch;
      }
      if (context.sizeConstraint) {
        const sizeMatch = Boolean(
          p.size?.some(s => s.toLowerCase().includes(context.sizeConstraint!)) ||
          p.name.toLowerCase().includes(context.sizeConstraint!) ||
          p.attributes?.seater?.toString().includes(context.sizeConstraint!)
        );
        matchesConstraints = matchesConstraints && sizeMatch;
      }
      if (context.styleConstraint) {
        const styleMatch = Boolean(
          p.tags?.some(t => t.toLowerCase().includes(context.styleConstraint!)) ||
          p.attributes?.style?.toLowerCase().includes(context.styleConstraint!) ||
          p.name.toLowerCase().includes(context.styleConstraint!)
        );
        matchesConstraints = matchesConstraints && styleMatch;
      }
      if (context.roomConstraint) {
        const roomMatch = Boolean(
          p.tags?.some(t => t.toLowerCase().includes(context.roomConstraint!)) ||
          p.attributes?.room?.toLowerCase().includes(context.roomConstraint!) ||
          p.categorySlug?.toLowerCase().includes(context.roomConstraint!)
        );
        matchesConstraints = matchesConstraints && roomMatch;
      }
      if (context.priceConstraint) {
        const price = p.finalPrice || p.originalPrice || 0;
        let priceMatch = false;

        if (context.priceConstraint.operator === 'under') {
          priceMatch = price <= context.priceConstraint.value;
          if (context.priceConstraint.max) {
            priceMatch = price >= context.priceConstraint.value && price <= context.priceConstraint.max;
          }
        } else if (context.priceConstraint.operator === 'above') {
          priceMatch = price >= context.priceConstraint.value;
        } else if (context.priceConstraint.operator === 'around') {
          const range = context.priceConstraint.value * 0.2; // 20% range
          priceMatch = Math.abs(price - context.priceConstraint.value) <= range;
        }

        matchesConstraints = matchesConstraints && priceMatch;
      }

      return (startsWithEntity || containsEntity || inTags || inKeywords || inBrand) && matchesConstraints;
    });

    relevantProducts
      .sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();

        // Prioritize exact starts with query
        const aStarts = aName.startsWith(queryLower);
        const bStarts = bName.startsWith(queryLower);
        if (aStarts !== bStarts) return aStarts ? -1 : 1;

        // Then featured/bestseller
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        if (a.isBestSeller !== b.isBestSeller) return a.isBestSeller ? -1 : 1;

        // Then by sales
        return (b.totalSold || 0) - (a.totalSold || 0);
      })
      .slice(0, 15)
      .forEach(p => {
        const categoryName = p.categorySlug || p.brand || 'Furniture';
        // Extract image URL from mainImage object
        const imageUrl = (p as any).mainImage?.url;
        addUnique(p.name, 'product', undefined, imageUrl, categoryName);
      });
  }

  // Priority 2: Categories and Subcategories (only show exact matches, not combinations)
  memoryCache.categories.forEach(c => {
    const categoryName = c.name.toLowerCase();
    if (categoryName.includes(queryLower)) {
      addUnique(c.name, 'category', undefined, c.image, c.name);
    }
  });

  memoryCache.subcategories.forEach(sc => {
    const subcategoryName = sc.name.toLowerCase();
    if (subcategoryName.includes(queryLower)) {
      addUnique(sc.name, 'subcategory', undefined, sc.image, sc.name);
    }
  });

  // Priority 3: Brands, materials, colors (only if they match the query)
  memoryCache.brands.forEach(b => {
    const brandLower = b.name.toLowerCase();
    if (brandLower.includes(queryLower)) {
      addUnique(b.name, 'brand', b.count);
    }
  });

  memoryCache.materials.forEach(m => {
    const materialLower = m.name.toLowerCase();
    if (materialLower.includes(queryLower)) {
      addUnique(m.name, 'material', m.count);
    }
  });

  memoryCache.colors.forEach(c => {
    const colorLower = c.name.toLowerCase();
    if (colorLower.includes(queryLower)) {
      addUnique(c.name, 'color', c.count);
    }
  });

  // Priority 4: Constraint-based suggestions (only if we don't have enough results)
  if (suggestions.length < MIN_RESULTS && (hasPrice || hasColor || hasMaterial || hasSize || hasBrand || hasStyle || hasRoom)) {
    buildConstraintSuggestions(context, addUnique);
  }

  // Priority 5: Inspirations (must include query)
  memoryCache.inspirations.forEach(i => {
    const titleLower = i.title.toLowerCase();
    if (titleLower.includes(queryLower)) {
      addUnique(i.title, 'inspiration', undefined, i.image, 'Inspiration');
    }
  });

  // Priority 6: Smart variations
  if (suggestions.length < MIN_RESULTS && context.mainEntity) {
    addEntityVariations(context.mainEntity, addUnique, context);
  }


  // Return only MIN_RESULTS items (filtering already done in addUnique)
  return suggestions.slice(0, MIN_RESULTS);
}

function buildConstraintSuggestions(
  context: QueryContext,
  addUnique: (text: string, type: AutocompleteItem['type'], count?: number, image?: string, category?: string) => void
) {
  const { mainEntity, priceConstraint, colorConstraint, materialConstraint, sizeConstraint, brandConstraint, styleConstraint, roomConstraint } = context;

  if (!mainEntity) return;

  // Price-based suggestions
  if (priceConstraint) {
    const ranges = generatePriceRanges(priceConstraint.value);
    ranges.forEach(price => {
      addUnique(`${mainEntity} under ${price}`, 'product');
    });

    // Combine price with other constraints
    if (colorConstraint) {
      addUnique(`${colorConstraint} ${mainEntity} under ${priceConstraint.value}`, 'product');
    }
    if (materialConstraint) {
      addUnique(`${materialConstraint} ${mainEntity} under ${priceConstraint.value}`, 'product');
    }
    if (sizeConstraint) {
      addUnique(`${sizeConstraint} ${mainEntity} under ${priceConstraint.value}`, 'product');
    }
    if (brandConstraint) {
      addUnique(`${brandConstraint} ${mainEntity} under ${priceConstraint.value}`, 'product');
    }
    if (styleConstraint) {
      addUnique(`${styleConstraint} ${mainEntity} under ${priceConstraint.value}`, 'product');
    }
  }

  // Color-based suggestions
  if (colorConstraint) {
    addUnique(`${colorConstraint} ${mainEntity}`, 'color');

    // Suggest other popular colors
    const popularColors = ['black', 'white', 'brown', 'grey', 'beige'];
    popularColors.forEach(color => {
      if (color !== colorConstraint.toLowerCase()) {
        addUnique(`${color} ${mainEntity}`, 'color');
      }
    });
  }

  // Material-based suggestions
  if (materialConstraint) {
    addUnique(`${materialConstraint} ${mainEntity}`, 'material');

    // Suggest related materials
    const materialRelations: Record<string, string[]> = {
      'wood': ['wooden', 'teak', 'oak'],
      'wooden': ['wood', 'teak', 'oak'],
      'metal': ['steel', 'iron'],
      'fabric': ['velvet', 'cotton', 'linen'],
      'leather': ['faux leather', 'genuine leather']
    };

    const related = materialRelations[materialConstraint.toLowerCase()] || [];
    related.forEach(mat => {
      addUnique(`${mat} ${mainEntity}`, 'material');
    });
  }

  // Size-based suggestions
  if (sizeConstraint) {
    // Only add if size constraint is different from main entity (avoid "single single")
    if (sizeConstraint.toLowerCase() !== mainEntity.toLowerCase()) {
      addUnique(`${sizeConstraint} ${mainEntity}`, 'product');
    }

    // Suggest related sizes
    const sizeRelations: Record<string, string[]> = {
      'king': ['queen', 'king size'],
      'queen': ['king', 'queen size'],
      '3 seater': ['2 seater', '4 seater', '5 seater'],
      '2 seater': ['3 seater', 'compact'],
      'large': ['medium', 'xl'],
      'small': ['compact', 'mini']
    };

    const related = sizeRelations[sizeConstraint.toLowerCase()] || [];
    related.slice(0, 2).forEach(size => {
      addUnique(`${size} ${mainEntity}`, 'product');
    });
  }

  // Brand-based suggestions
  if (brandConstraint) {
    addUnique(`${brandConstraint} ${mainEntity}`, 'brand');
  }

  // Style-based suggestions
  if (styleConstraint) {
    addUnique(`${styleConstraint} ${mainEntity}`, 'product');

    // Suggest related styles
    const styleRelations: Record<string, string[]> = {
      'modern': ['contemporary', 'minimalist'],
      'contemporary': ['modern', 'minimalist'],
      'traditional': ['classic', 'vintage'],
      'vintage': ['traditional', 'rustic'],
      'luxury': ['premium', 'elegant']
    };

    const related = styleRelations[styleConstraint.toLowerCase()] || [];
    related.forEach(style => {
      addUnique(`${style} ${mainEntity}`, 'product');
    });
  }

  // Room-based suggestions
  if (roomConstraint) {
    addUnique(`${mainEntity} for ${roomConstraint}`, 'product');

    // Suggest related rooms
    const roomRelations: Record<string, string[]> = {
      'living room': ['bedroom', 'dining room'],
      'bedroom': ['living room', 'guest room'],
      'dining room': ['living room', 'kitchen'],
      'office': ['study', 'home office']
    };

    const related = roomRelations[roomConstraint.toLowerCase()] || [];
    related.forEach(room => {
      addUnique(`${mainEntity} for ${room}`, 'product');
    });
  }
}

function generatePriceRanges(basePrice: number): number[] {
  const ranges: number[] = [];

  if (basePrice <= 5000) {
    ranges.push(5000, 10000, 15000);
  } else if (basePrice <= 10000) {
    ranges.push(5000, 10000, 15000, 20000);
  } else if (basePrice <= 20000) {
    ranges.push(10000, 15000, 20000, 25000, 30000);
  } else if (basePrice <= 50000) {
    ranges.push(20000, 30000, 40000, 50000);
  } else {
    ranges.push(50000, 75000, 100000);
  }

  return ranges.filter(r => r !== basePrice).slice(0, 3);
}

function addEntityVariations(
  entity: string,
  addUnique: (text: string, type: AutocompleteItem['type'], count?: number, image?: string, category?: string) => void,
  context: QueryContext
) {
  if (!memoryCache) return;

  // Smart variations based on entity type
  const entityLower = entity.toLowerCase();

  // Get products matching this entity to extract real data
  const matchingProducts = memoryCache.products.filter(p =>
    p.name.toLowerCase().includes(entityLower)
  );

  if (matchingProducts.length === 0) return;

  // Try to find the most common "full product name" pattern
  // e.g., if entity is "single", extract "single bed" from "Single Bed" product name
  let baseProductName = entity;

  // Extract product type by finding common patterns after the entity word
  // First, get the full entity word from product names (e.g., "sin" -> "single")
  const fullEntityWords = new Map<string, number>();
  matchingProducts.forEach(p => {
    const words = p.name.toLowerCase().split(' ');
    const matchingWord = words.find(w => w.includes(entityLower) || entityLower.includes(w));
    if (matchingWord) {
      fullEntityWords.set(matchingWord, (fullEntityWords.get(matchingWord) || 0) + 1);
    }
  });

  // Get the most common full entity word
  let fullEntityWord = entity;
  if (fullEntityWords.size > 0) {
    fullEntityWord = Array.from(fullEntityWords.entries())
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  const productTypes = new Map<string, number>();
  matchingProducts.forEach(p => {
    const nameLower = p.name.toLowerCase();
    const words = nameLower.split(' ');

    // Find entity word index
    const entityIndex = words.findIndex(w => w.includes(entityLower) || entityLower.includes(w));

    // Get the word after entity (e.g., "single" -> "bed")
    if (entityIndex >= 0 && entityIndex < words.length - 1) {
      const nextWord = words[entityIndex + 1];
      productTypes.set(nextWord, (productTypes.get(nextWord) || 0) + 1);
    }
  });

  // Use the most common product type if found
  if (productTypes.size > 0) {
    const mostCommonType = Array.from(productTypes.entries())
      .sort((a, b) => b[1] - a[1])[0][0];
    baseProductName = `${fullEntityWord} ${mostCommonType}`;
  }

  // Extract real colors from matching products
  const colorsSet = new Set<string>();
  matchingProducts.forEach(p => {
    p.colorOptions?.forEach(c => colorsSet.add(c.toLowerCase()));
    if (p.attributes?.color) colorsSet.add(p.attributes.color.toLowerCase());
  });

  // Extract real materials from matching products
  const materialsSet = new Set<string>();
  matchingProducts.forEach(p => {
    if (p.material) materialsSet.add(p.material.toLowerCase());
    if (p.attributes?.material) materialsSet.add(p.attributes.material.toLowerCase());
  });

  // Extract price ranges from matching products
  const prices = matchingProducts
    .map(p => p.finalPrice || p.originalPrice || 0)
    .filter(p => p > 0)
    .sort((a, b) => a - b);


  const suggestions: string[] = [];
  const usedProductIndexes = new Set<number>();
  const productImageUsage = new Map<number, number>(); // Track which image index we're using per product

  // Helper to get next available image from a product (cycles through mainImage + galleryImages)
  const getNextImage = (productIndex: number): string | undefined => {
    const product = matchingProducts[productIndex];
    if (!product) return undefined;

    const timesUsed = productImageUsage.get(productIndex) || 0;
    productImageUsage.set(productIndex, timesUsed + 1);

    // First use: return mainImage
    if (timesUsed === 0) {
      return (product as any).mainImage?.url;
    }

    // Subsequent uses: cycle through galleryImages
    const gallery = (product as any).galleryImages || [];
    if (gallery.length > 0) {
      const galleryIndex = (timesUsed - 1) % gallery.length;
      return gallery[galleryIndex]?.url || (product as any).mainImage?.url;
    }

    return (product as any).mainImage?.url;
  };

  // Helper to get a unique product that hasn't been used yet
  const getUniqueProduct = (filter?: (p: CachedProduct) => boolean): CachedProduct | undefined => {
    for (let i = 0; i < matchingProducts.length; i++) {
      if (!usedProductIndexes.has(i)) {
        const product = matchingProducts[i];
        if (!filter || filter(product)) {
          usedProductIndexes.add(i);
          return product;
        }
      }
    }
    // Fallback: return any matching product
    return matchingProducts.find(filter || (() => true));
  };


  // Add color-based suggestions with images (limit to 2)
  const topColors = Array.from(colorsSet).slice(0, 2);
  topColors.forEach(color => {
    const suggestionText = `${baseProductName} ${color}`;
    // Find a unique product with this color
    const matchingProduct = getUniqueProduct(p =>
      p.colorOptions?.some(c => c.toLowerCase() === color) ||
      p.attributes?.color?.toLowerCase() === color
    );
    const productIndex = matchingProduct ? matchingProducts.indexOf(matchingProduct) : -1;
    const image = productIndex >= 0 ? getNextImage(productIndex) : undefined;
    addUnique(suggestionText, 'product', undefined, image, matchingProduct?.brand);
  });

  // Add price-based suggestions with images (limit to 3)
  if (prices.length > 0) {
    const minPrice = prices[0];
    const maxPrice = prices[prices.length - 1];
    const midPrice = prices[Math.floor(prices.length / 2)];

    const priceRanges: number[] = [];
    // Suggest price ranges based on actual product prices
    if (maxPrice <= 5000) {
      priceRanges.push(5000);
    } else if (maxPrice <= 10000) {
      priceRanges.push(10000);
    } else if (maxPrice <= 20000) {
      priceRanges.push(15000, 20000);
    } else {
      priceRanges.push(20000, 30000);
    }

    priceRanges.forEach(priceLimit => {
      const suggestionText = `${baseProductName} under ${priceLimit}`;
      // Find a unique product under this price
      const matchingProduct = getUniqueProduct(p =>
        (p.finalPrice || p.originalPrice || 0) <= priceLimit
      );
      const productIndex = matchingProduct ? matchingProducts.indexOf(matchingProduct) : -1;
      const image = productIndex >= 0 ? getNextImage(productIndex) : undefined;
      addUnique(suggestionText, 'product', undefined, image, matchingProduct?.brand);
    });
  }

  // Add material-based suggestion with image (limit to 1)
  const topMaterial = Array.from(materialsSet)[0];
  if (topMaterial) {
    const suggestionText = `${topMaterial} ${baseProductName}`;
    // Find a unique product with this material
    const matchingProduct = getUniqueProduct(p =>
      p.material?.toLowerCase() === topMaterial ||
      p.attributes?.material?.toLowerCase() === topMaterial
    );
    const productIndex = matchingProduct ? matchingProducts.indexOf(matchingProduct) : -1;
    const image = productIndex >= 0 ? getNextImage(productIndex) : undefined;
    addUnique(suggestionText, 'product', undefined, image, matchingProduct?.brand);
  }
}