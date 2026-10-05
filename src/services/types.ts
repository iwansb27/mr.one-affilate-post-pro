/**
 * Core Domain Types
 * These types represent the actual database entities
 * and are used throughout the service layer.
 */

// ============================================
// ENUMS
// ============================================

export type Marketplace = 'shopee' | 'lazada' | 'tokopedia';

export type SocialPlatform = 'facebook' | 'instagram' | 'youtube' | 'tiktok';

export type ProductStatus = 'active' | 'inactive' | 'out_of_stock' | 'deleted';

export type PostStatus = 'draft' | 'scheduled' | 'processing' | 'published' | 'failed' | 'cancelled';

export type ConnectionStatus = 'connected' | 'disconnected' | 'expired' | 'error';

export type ConnectorStatus = 'NOT_CONFIGURED' | 'CONNECTOR_READY' | 'CONNECTED' | 'ERROR';

export type PromotionStyle = 'review' | 'haul' | 'comparison' | 'tutorial' | 'unboxing';

export type ContentType = 'post' | 'story' | 'reel' | 'short' | 'video';

export type PublishAttemptStatus = 'success' | 'failed' | 'timeout' | 'rate_limited';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

// ============================================
// ENTITIES
// ============================================

export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  workspaceName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceAccount {
  id: string;
  userId: string;
  marketplace: Marketplace;
  accountName?: string;
  tokenExpiresAt?: string;
  accountData?: Record<string, unknown>;
  status: ConnectionStatus;
  connectedAt?: string;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateProduct {
  id: string;
  userId: string;
  marketplaceAccountId?: string;
  marketplace: Marketplace;
  externalProductId: string;
  productUrl?: string;
  affiliateUrl?: string;
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  commissionRate?: number;
  currency: string;
  imageUrls: string[];
  category?: string;
  rating?: number;
  soldCount: number;
  stockCount?: number;
  status: ProductStatus;
  selected: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateLink {
  id: string;
  userId: string;
  productId: string;
  originalUrl: string;
  affiliateUrl: string;
  trackingId?: string;
  marketplace: Marketplace;
  clickCount: number;
  conversionCount: number;
  revenue: number;
  lastClickedAt?: string;
  status: 'active' | 'expired' | 'invalid';
  createdAt: string;
  updatedAt: string;
}

export interface MediaAsset {
  id: string;
  userId: string;
  productId?: string;
  assetType: 'image' | 'video' | 'thumbnail';
  url: string;
  storagePath?: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  aspectRatio?: string;
  durationSeconds?: number;
  platformCompatibility: SocialPlatform[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SocialAccount {
  id: string;
  userId: string;
  platform: SocialPlatform;
  platformAccountId: string;
  username?: string;
  displayName?: string;
  profileUrl?: string;
  avatarUrl?: string;
  tokenExpiresAt?: string;
  followersCount: number;
  accountData?: Record<string, unknown>;
  status: ConnectionStatus;
  connectedAt?: string;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentItem {
  id: string;
  userId: string;
  productId: string;
  platform: SocialPlatform;
  contentType: ContentType;
  title?: string;
  caption?: string;
  hashtags: string[];
  ctaText?: string;
  ctaUrl?: string;
  mediaAssetId?: string;
  mediaUrls: string[];
  promotionStyle: PromotionStyle;
  aiGenerated: boolean;
  aiProvider?: string;
  aiModel?: string;
  status: 'draft' | 'approved' | 'rejected' | 'scheduled' | 'published';
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledPost {
  id: string;
  userId: string;
  contentId: string;
  socialAccountId: string;
  scheduledAt: string;
  timezone: string;
  idempotencyKey: string;
  status: PostStatus;
  priority: number;
  retryCount: number;
  maxRetries: number;
  publishedAt?: string;
  errorMessage?: string;
  platformResponse?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PublishJob {
  id: string;
  scheduledPostId: string;
  jobType: 'publish' | 'retry' | 'cancel';
  status: JobStatus;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PublishAttempt {
  id: string;
  scheduledPostId: string;
  attemptNumber: number;
  status: PublishAttemptStatus;
  response?: Record<string, unknown>;
  errorCode?: string;
  errorMessage?: string;
  retryAfterSeconds?: number;
  createdAt: string;
}

export interface PostAnalytics {
  id: string;
  scheduledPostId: string;
  platform: SocialPlatform;
  impressions: number;
  reach: number;
  clicks: number;
  conversions: number;
  likes: number;
  comments: number;
  shares: number;
  revenue: number;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// SERVICE RESPONSE TYPES
// ============================================

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
