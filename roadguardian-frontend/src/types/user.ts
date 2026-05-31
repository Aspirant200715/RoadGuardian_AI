export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'citizen' | 'authority';
  points: number;
  badges: Badge[];
  phone?: string;
  aadhaar?: string;
  state?: string;
  address?: string;
  avatar?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}
