// Single file to process search queries and extract filters
import { SearchFilters } from './types';

export interface ProcessedQuery {
  searchText: string; // Clean text for MongoDB search
  filters: SearchFilters;
  categories: string[];
  subcategories: string[];
  brands: string[];
}

// Keywords that map to categories (must match database category names exactly)
const CATEGORY_MAP: Record<string, string[]> = {
  'Sofa': ['sofa', 'couch', 'settee'],
  'Chair': ['chair', 'seat'],
  'Armchair': ['armchair'],
  'Bed': ['bed', 'mattress', 'bedframe', 'cot'],
  'Bookshelf': ['bookshelf', 'shelf', 'rack'],
  'Dresser': ['dresser'],
  'TV Stand': ['tv stand', 'tv unit', 'television stand'],
  'Desk': ['desk', 'study table', 'work table'],
  'Cabinet': ['cabinet'],
  'Bench': ['bench'],
  'Shoe Rack': ['shoe rack', 'shoe storage'],
  'Dining Table': ['dining table'],
  'Coffee Table': ['coffee table'],
};

// Subcategories with their parent categories (parent must match database category name exactly)
const SUBCATEGORY_MAP: Record<string, { parent: string; keywords: string[] }> = {
  'sectional-sofa': { parent: 'Sofa', keywords: ['sectional sofa', 'sectional'] },
  'recliner-sofa': { parent: 'Sofa', keywords: ['recliner sofa', 'reclining sofa'] },
  'sleeper-sofa': { parent: 'Sofa', keywords: ['sleeper sofa', 'sofa bed', 'sleeper'] },
  'loveseat-sofa': { parent: 'Sofa', keywords: ['loveseat sofa', 'loveseat', 'love seat'] },
  'chesterfield-sofa': { parent: 'Sofa', keywords: ['chesterfield sofa', 'chesterfield'] },
  'l-shaped-sofa': { parent: 'Sofa', keywords: ['l shaped sofa', 'l-shaped sofa', 'l shape sofa'] },
  
  'office-chair': { parent: 'Chair', keywords: ['office chair', 'desk chair'] },
  'dining-chair': { parent: 'Chair', keywords: ['dining chair'] },
  'recliner-chair': { parent: 'Chair', keywords: ['recliner chair', 'reclining chair'] },
  'accent-chair': { parent: 'Chair', keywords: ['accent chair'] },
  
  'king-size-bed': { parent: 'Bed', keywords: ['king size bed', 'king bed'] },
  'queen-size-bed': { parent: 'Bed', keywords: ['queen size bed', 'queen bed'] },
  'single-bed': { parent: 'Bed', keywords: ['single bed'] },
  'double-bed': { parent: 'Bed', keywords: ['double bed'] },
  'bunk-bed': { parent: 'Bed', keywords: ['bunk bed'] },
};

export class QueryProcessor {
  static process(rawQuery: string): ProcessedQuery {
    // Convert hyphens to spaces (from URL)
    let query = rawQuery.toLowerCase().replace(/-/g, ' ').trim();
    
    const result: ProcessedQuery = {
      searchText: '',
      filters: {},
      categories: [],
      subcategories: [],
      brands: [],
    };

    // Extract price
    const priceRange = this.extractPrice(query);
    if (priceRange) {
      result.filters.priceRange = priceRange;
      // Remove price text from query
      query = query.replace(/(?:under|below|above|over|between|around|upto|up\s*to|less\s*than|more\s*than)\s*(?:rs\.?\s*)?[\d,]+k?(?:\s*(?:and|to|-|–)\s*(?:rs\.?\s*)?[\d,]+k?)?/gi, '').trim();
    }

    // Extract colors
    const colors = this.extractColors(query);
    if (colors.length > 0) {
      result.filters.colors = colors;
      // Remove color words from query
      colors.forEach(color => {
        query = query.replace(new RegExp(`\\b${color}\\b`, 'gi'), '').trim();
      });
    }

    // Extract materials
    const materials = this.extractMaterials(query);
    if (materials.length > 0) {
      result.filters.materials = materials;
      // Remove material words from query
      materials.forEach(material => {
        query = query.replace(new RegExp(`\\b${material}\\b`, 'gi'), '').trim();
      });
    }

    // Extract sizes
    const sizes = this.extractSizes(query);
    if (sizes.length > 0) {
      // Keep sizes in search text as they're part of product names
      // e.g., "king size bed" - we want to search for this
    }

    // Extract subcategories first (more specific)
    const { subcategories, parentCategories } = this.extractSubcategories(query);
    result.subcategories = subcategories;
    result.categories = parentCategories;

    // If no subcategories found, try to extract categories
    if (result.categories.length === 0) {
      result.categories = this.extractCategories(query);
    }

    // Remove detected category/subcategory keywords from search text
    if (result.categories.length > 0 || result.subcategories.length > 0) {
      // Remove category keywords
      for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
        for (const keyword of keywords) {
          query = query.replace(new RegExp(`\\b${keyword}\\b`, 'gi'), '').trim();
        }
      }
      
      // Remove subcategory keywords
      for (const [subcategory, config] of Object.entries(SUBCATEGORY_MAP)) {
        for (const keyword of config.keywords) {
          query = query.replace(new RegExp(`\\b${keyword}\\b`, 'gi'), '').trim();
        }
      }
    }

    // Clean up query - remove extra spaces
    query = query.replace(/\s+/g, ' ').trim();
    
    // Final search text
    result.searchText = query;

    return result;
  }

  private static extractPrice(query: string): { min?: number; max?: number } | null {
    query = query.replace(/(\d),(\d)/g, '$1$2'); // Remove commas
    
    // Under/below patterns
    const underMatch = query.match(/(?:under|below|less\s*than|upto|up\s*to)\s*(?:rs\.?\s*)?(\d+)k?/i);
    if (underMatch) {
      const value = parseInt(underMatch[1]);
      const multiplier = underMatch[0].toLowerCase().includes('k') ? 1000 : 1;
      return { max: value * multiplier };
    }

    // Above/over patterns
    const overMatch = query.match(/(?:above|over|more\s*than|from)\s*(?:rs\.?\s*)?(\d+)k?/i);
    if (overMatch) {
      const value = parseInt(overMatch[1]);
      const multiplier = overMatch[0].toLowerCase().includes('k') ? 1000 : 1;
      return { min: value * multiplier };
    }

    // Range patterns
    const rangeMatch = query.match(/(?:between\s*)?(?:rs\.?\s*)?(\d+)k?\s*(?:and|to|-|–)\s*(?:rs\.?\s*)?(\d+)k?/i);
    if (rangeMatch) {
      const min = parseInt(rangeMatch[1]);
      const max = parseInt(rangeMatch[2]);
      const hasK = rangeMatch[0].toLowerCase().includes('k');
      return {
        min: hasK ? min * 1000 : min,
        max: hasK ? max * 1000 : max,
      };
    }

    // Around pattern
    const aroundMatch = query.match(/(?:around|approximately|about)\s*(?:rs\.?\s*)?(\d+)k?/i);
    if (aroundMatch) {
      const value = parseInt(aroundMatch[1]);
      const multiplier = aroundMatch[0].toLowerCase().includes('k') ? 1000 : 1;
      const price = value * multiplier;
      const range = price * 0.2;
      return { min: price - range, max: price + range };
    }

    return null;
  }

  private static extractColors(query: string): string[] {
    const colors = [
      'red', 'blue', 'green', 'yellow', 'black', 'white', 'brown',
      'grey', 'gray', 'pink', 'purple', 'orange', 'beige', 'cream',
      'navy', 'maroon', 'gold', 'silver'
    ];
    
    const found: string[] = [];
    for (const color of colors) {
      if (new RegExp(`\\b${color}\\b`, 'i').test(query)) {
        found.push(color);
      }
    }
    return found;
  }

  private static extractMaterials(query: string): string[] {
    const materials = [
      'wood', 'wooden', 'metal', 'steel', 'iron', 'plastic', 'glass',
      'leather', 'fabric', 'cotton', 'velvet', 'oak', 'pine', 'teak'
    ];
    
    const found: string[] = [];
    for (const material of materials) {
      if (new RegExp(`\\b${material}\\b`, 'i').test(query)) {
        found.push(material);
      }
    }
    return found;
  }

  private static extractSizes(query: string): string[] {
    const sizes = [
      'king', 'queen', 'single', 'double', 'twin',
      'large', 'medium', 'small',
      '2 seater', '3 seater', '4 seater', '5 seater'
    ];
    
    const found: string[] = [];
    for (const size of sizes) {
      if (new RegExp(`\\b${size}\\b`, 'i').test(query)) {
        found.push(size);
      }
    }
    return found;
  }

  private static extractSubcategories(query: string): { subcategories: string[]; parentCategories: string[] } {
    const subcategories: string[] = [];
    const parentCategories: string[] = [];
    
    for (const [subcategory, config] of Object.entries(SUBCATEGORY_MAP)) {
      for (const keyword of config.keywords) {
        if (new RegExp(`\\b${keyword}\\b`, 'i').test(query)) {
          subcategories.push(subcategory);
          if (!parentCategories.includes(config.parent)) {
            parentCategories.push(config.parent);
          }
          break;
        }
      }
    }
    
    return { subcategories, parentCategories };
  }

  private static extractCategories(query: string): string[] {
    const categories: string[] = [];
    
    for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
      for (const keyword of keywords) {
        if (new RegExp(`\\b${keyword}\\b`, 'i').test(query)) {
          categories.push(category);
          break;
        }
      }
    }
    
    return categories;
  }
}