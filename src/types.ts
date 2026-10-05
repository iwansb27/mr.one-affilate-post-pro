export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  marketplace: 'shopee' | 'lazada' | 'tokopedia';
  rating: number;
  sold: number;
  commission: number;
  category: string;
  affiliateLink: string;
  selected: boolean;
}

export interface ScheduledPost {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  platforms: ('facebook' | 'instagram' | 'youtube' | 'tiktok')[];
  scheduledDate: string;
  scheduledTime: string;
  caption: string;
  hashtags: string[];
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
  marketplace: string;
}

export interface SocialAccount {
  id: string;
  platform: 'facebook' | 'instagram' | 'youtube' | 'tiktok';
  username: string;
  connected: boolean;
  followers: number;
}

export type TabType = 'dashboard' | 'products' | 'content' | 'schedule' | 'accounts';
