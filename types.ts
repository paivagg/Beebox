
export interface Player {
  id: string;
  name: string;
  nickname: string;
  avatar_url: string;
  dci?: string;
  email?: string;
  balance: number;
  last_activity?: string; // ISO String
  credit_updated_at?: string; // ISO String
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  image_url: string;
  product_collection?: string;
  cost_price?: number;
  updated_at?: string;
}

export interface EventParticipant {
  player_id: string;
  name: string;
  avatar_url: string;
  paid: boolean;
}

export interface Event {
  id: string;
  date: string; // ISO String for easier sorting
  title: string;
  price: number;
  time: string;
  max_enrolled: number;
  participants: EventParticipant[];
  status?: 'scheduled' | 'finalized';
  updated_at?: string;
}

export interface Transaction {
  id: string;
  player_id: string;
  type: 'credit' | 'debit';
  category?: 'product' | 'event' | 'deposit' | 'adjustment';
  event_id?: string;
  title: string;
  date: string; // ISO String
  amount: number;
  icon: string;
  isExpired?: boolean;
  updated_at?: string;
}


export interface CartItem extends Product {
  quantity: number;
}

export interface StoreProfile {
  id: string;
  name: string;
  avatar_url: string;
  role: string;
  updated_at?: string;
}

export interface StoreSettings {
  id: string;
  notifications: boolean;
  darkMode: boolean;
  soundEffects: boolean;
  updated_at?: string;
}
