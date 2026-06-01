export type WeightUnit = "kg" | "lb";

export type WeightEntry = {
  id: string;
  date: string;
  weight: number;
  unit: WeightUnit;
  note?: string;
  createdAt: string;
  updatedAt: string;
};
