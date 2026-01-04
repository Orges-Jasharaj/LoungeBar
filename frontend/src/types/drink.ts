export interface DrinkDto {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  categoryName: string;
  isAlcoholic: boolean;
  alcoholPercentage?: number;
  imageUrl?: string;
  isAvailable: boolean;
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

