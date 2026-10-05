// ============================================
// MARKETPLACE & PRODUCT TYPES
// ============================================

export type Marketplace = 'shopee' | 'lazada' | 'tokopedia';

export type ProductStatus = 'draft' | 'ready' | 'archived';

export interface AffiliateProduct {
  id: string;
  marketplace: Marketplace;
  productUrl: string;
  affiliateUrl: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  commission: number;
  imageUrl: string;
  videoUrl?: string;
  notes?: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

// Legacy Product interface for backward compatibility
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  marketplace: Marketplace;
  rating: number;
  sold: number;
  commission: number;
  category: string;
  affiliateLink: string;
  selected: boolean;
}

// ============================================
// CONTENT TYPES
// ============================================

export type SocialPlatform = 'facebook' | 'tiktok' | 'youtube';

export type ContentStyle = 
  | 'review' 
  | 'soft_selling' 
  | 'problem_solution' 
  | 'promotional' 
  | 'educational' 
  | 'short_hook';

export type ContentStatus = 
  | 'draft' 
  | 'review' 
  | 'approved' 
  | 'rejected' 
  | 'scheduled' 
  | 'published' 
  | 'failed';

export interface ContentItem {
  id: string;
  productId: string;
  platform: SocialPlatform;
  title?: string;
  caption: string;
  hashtags: string[];
  cta: string;
  contentStyle: ContentStyle;
  mediaAssetId?: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// MEDIA ASSET TYPES
// ============================================

export type MediaType = 'image' | 'video' | 'thumbnail';

export interface MediaAsset {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  mimeType?: string;
  aspectRatio?: string;
  createdAt: string;
}

// ============================================
// SCHEDULING TYPES
// ============================================

export type PostStatus = 
  | 'draft' 
  | 'scheduled' 
  | 'processing' 
  | 'published' 
  | 'failed' 
  | 'cancelled';

export interface ScheduledPost {
  id: string;
  contentId: string;
  productId: string;
  productName: string;
  productImage: string;
  platform: SocialPlatform;
  scheduledAt: string;
  timezone: string;
  status: PostStatus;
  idempotencyKey: string;
  bufferPostId?: string;
  publishedAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// Legacy ScheduledPost for backward compatibility
export interface LegacyScheduledPost {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  platforms: SocialPlatform[];
  scheduledDate: string;
  scheduledTime: string;
  caption: string;
  hashtags: string[];
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
  marketplace: string;
}

// ============================================
// BUFFER & SOCIAL ACCOUNT TYPES
// ============================================

export interface BufferChannel {
  id: string;
  platform: SocialPlatform;
  profileId: string;
  username: string;
  avatar?: string;
  connected: boolean;
  connectedAt?: string;
}

export interface SocialAccount {
  id: string;
  platform: SocialPlatform | 'instagram';
  username: string;
  connected: boolean;
  followers: number;
}

// ============================================
// QUEUE GENERATION TYPES
// ============================================

export type Frequency = '1x/day' | '2x/day' | 'custom';

export interface QueueGenerationRequest {
  contentIds: string[];
  platforms: SocialPlatform[];
  frequency: Frequency;
  startDate: string;
  days: number;
  timezone: string;
  preferredTimes?: string[];
}

// ============================================
// APP NAVIGATION
// ============================================

export type TabType = 'dashboard' | 'products' | 'content' | 'review' | 'schedule' | 'accounts';
