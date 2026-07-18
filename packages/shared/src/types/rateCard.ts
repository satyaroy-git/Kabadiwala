export interface ScrapCategory {
  id: string;
  name: string;
  name_hindi: string;
  name_odia?: string;
  name_marathi?: string;
  name_tamil?: string;
  name_telugu?: string;
  name_kannada?: string;
  icon: string; // emoji or icon name
  parent_id: string | null;
  description: string;
  unit: 'kg' | 'piece' | 'unit';
  is_active: boolean;
  sort_order: number;
}

export interface RateCard {
  id: string;
  category_id: string;
  category_name: string;
  category_icon: string;
  rate_per_kg: number;
  previous_rate: number | null;
  rate_change: number | null; // percentage change
  effective_from: string;
  effective_to: string | null;
  updated_at: string;
}

export interface RateCardDisplay {
  category: ScrapCategory;
  current_rate: number;
  previous_rate: number | null;
  trend: 'up' | 'down' | 'stable';
  change_percentage: number;
  last_updated: string;
}

export interface RateUpdateRequest {
  category_id: string;
  new_rate_per_kg: number;
  effective_from: string;
}
