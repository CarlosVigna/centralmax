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
  maxDiscountPercent: number;
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
  maxDiscountPercent?: number;
  mainImageUrl?: string;
}

export interface VolumeDiscount {
  id: string;
  minQuantity: number;
  discountPercent: number;
  createdAt: string;
}

export interface PriceHistory {
  id: string;
  oldPurchasePrice: number | null;
  newPurchasePrice: number | null;
  oldPriceA: number | null;
  newPriceA: number | null;
  oldPriceB: number | null;
  newPriceB: number | null;
  oldPriceC: number | null;
  newPriceC: number | null;
  changedAt: string;
}

export interface ImportResult {
  total: number;
  created: number;
  updated: number;
  errors: Array<{ line: number; error: string }>;
}
