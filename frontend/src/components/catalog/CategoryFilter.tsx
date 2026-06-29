import type { Category } from '../../types/product';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelect: (categoryId: string | null) => void;
}

export function CategoryFilter({ categories, selectedCategoryId, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`rounded-full px-3 py-1 text-sm ${
          selectedCategoryId === null ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-900'
        }`}
      >
        Todas
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={`rounded-full px-3 py-1 text-sm ${
            selectedCategoryId === category.id ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-900'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
