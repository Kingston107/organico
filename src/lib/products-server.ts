import type { Product, ProductCategory } from '@/types/store';
import { INITIAL_PRODUCTS } from '@/lib/catalog';
import { getSupabaseServerClient } from '@/lib/supabase/server';

interface DbProductRow {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  material_badge: string;
  short_description: string;
  description: string;
  sustainability_note: string;
  price_inr: number;
  compare_at_inr: number | null;
  image_url: string;
  stock: number;
  featured: boolean;
}

function mapRowToProduct(row: DbProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    materialBadge: row.material_badge,
    shortDescription: row.short_description,
    description: row.description,
    sustainabilityNote: row.sustainability_note,
    priceInr: row.price_inr,
    compareAtInr: row.compare_at_inr ?? undefined,
    imageUrl: row.image_url,
    stock: row.stock,
    featured: row.featured,
  };
}

export async function getCatalogProducts(): Promise<Product[]> {
  try {
    const supabase = await getSupabaseServerClient();
    if (!supabase) return INITIAL_PRODUCTS;

    const { data, error } = await supabase
      .from('products')
      .select(
        'id, slug, name, category, material_badge, short_description, description, sustainability_note, price_inr, compare_at_inr, image_url, stock, featured'
      )
      .order('featured', { ascending: false })
      .order('price_inr', { ascending: true });

    if (error || !data || data.length === 0) {
      return INITIAL_PRODUCTS;
    }

    return (data as DbProductRow[]).map(mapRowToProduct);
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getCatalogProducts();
  return products.find((p) => p.slug === slug) ?? null;
}
