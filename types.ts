
export interface Player {
  id: string;
  name: string;
  nickname: string;
  avatarUrl: string;
  dci?: string;
  balance: number;
  lastActivity?: string; // ISO String
}

export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  imageUrl: string;
  collection?: string;
  costPrice?: number;
}

export interface EventParticipant {
  playerId: string;
  name: string;
  avatarUrl: string;
  paid: boolean;
}

export interface Event {
  id: string;
  date: string; // ISO String for easier sorting
  title: string;
  price: number;
  time: string;
  maxEnrolled: number;
  participants: EventParticipant[];
}

export interface Transaction {
  id: string;
  playerId: string;
  type: 'credit' | 'debit';
  title: string;
  date: string; // ISO String
  amount: number;
  icon: string;
}


export interface CartItem extends Product {
  quantity: number;
}

export interface StoreProfile {
  name: string;
  avatarUrl: string;
  role: string;
}

export interface StoreSettings {
  notifications: boolean;
  darkMode: boolean;
  soundEffects: boolean;
}
