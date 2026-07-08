export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryFull extends Category {
  active: boolean;
}

export interface ProductPhoto {
  id: string;
  url: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductVariation {
  id: string;
  name: string;
  value: string;
}

export interface ProductSummary {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  categoryName: string;
  mainImageUrl: string | null;
  displayPrice: number;
  minQuantity?: number;
}

export interface ProductDetail extends ProductSummary {
  status: 'ATIVO' | 'INATIVO';
  photos: ProductPhoto[];
  variations: ProductVariation[];
}

export interface ProductAdmin {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  categoryName: string;
  supplierId: string | null;
  sku: string | null;
  purchasePrice: number | null;
  minQuantity: number;
  priceA: number;
  priceB: number;
  priceC: number;
  mainImageUrl: string | null;
  status: 'ATIVO' | 'INATIVO';
  photos: ProductPhoto[];
  variations: ProductVariation[];
}

export interface ProductRequest {
  name: string;
  description?: string;
  categoryId: string;
  supplierId?: string;
  sku?: string;
  purchasePrice?: number;
  minQuantity?: number;
  priceA: number;
  priceB: number;
  priceC: number;
  mainImageUrl?: string;
}
