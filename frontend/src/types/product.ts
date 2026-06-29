export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductSummary {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  categoryName: string;
  mainImageUrl: string | null;
  displayPrice: number;
}

export interface ProductDetail extends ProductSummary {
  status: 'ATIVO' | 'INATIVO';
}
