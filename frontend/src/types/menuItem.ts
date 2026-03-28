export type ItemType = 'Drink' | 'Food';

export interface MenuItemDto {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  categoryName: string;
  itemType: ItemType;
  isAlcoholic: boolean;
  alcoholPercentage?: number;
  imageUrl?: string;
  isAvailable: boolean;
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface CreateMenuItemDto {
  name: string;
  price: number;
  categoryId: number;
  itemType: ItemType;
  isAlcoholic: boolean;
  alcoholPercentage?: number;
  imageUrl?: string;
  isAvailable: boolean;
}
