/**
 * Social Media Connector Interface
 * 
 * All social media connectors (Facebook, Instagram, YouTube, TikTok) must implement this interface.
 * This allows adding new platforms without changing the core application logic.
 */

import { SocialPlatform, ServiceResult, ConnectorStatus, ContentItem, MediaAsset } from '../types';

// ============================================
// OAUTH / AUTHENTICATION
// ============================================

export interface SocialAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope?: string[];
}

export interface SocialOAuthResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
  scope?: string;
}

export interface SocialAccountInfo {
  platformAccountId: string;
  username: string;
  displayName?: string;
  profileUrl?: string;
  avatarUrl?: string;
  followersCount: number;
  isVerified?: boolean;
  accountType?: string;
}

// ============================================
// CONTENT PUBLISHING
// ============================================

export interface PublishRequest {
  content: ContentItem;
  mediaAssets?: MediaAsset[];
  scheduledAt?: string;
}

export interface PublishResult {
  platformPostId: string;
  platformUrl: string;
  publishedAt: string;
  status: 'published' | 'scheduled' | 'processing';
  metadata?: Record<string, unknown>;
}

export interface PublishError {
  code: string;
  message: string;
  retryable: boolean;
  retryAfterSeconds?: number;
  details?: Record<string, unknown>;
}

// ============================================
// PLATFORM CAPABILITIES
// ============================================

export interface PlatformCapabilities {
  supportedContentTypes: ('post' | 'story' | 'reel' | 'short' | 'video')[];
  maxCaptionLength: number;
  maxHashtags: number;
  supportedMediaTypes: ('image' | 'video')[];
  maxImagesPerPost: number;
  maxVideoDurationSeconds?: number;
  supportedAspectRatios: string[];
  supportsScheduling: boolean;
  supportsStories: boolean;
  supportsLinks: boolean;
}

// ============================================
// CONTENT VALIDATION
// ============================================

export interface ContentValidationResult {
  isValid: boolean;
  errors: ContentValidationError[];
  warnings: ContentValidationWarning[];
}

export interface ContentValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ContentValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// ============================================
// ANALYTICS
// ============================================

export interface PostAnalyticsData {
  platformPostId: string;
  impressions: number;
  reach: number;
  clicks: number;
  likes: number;
  comments: number;
  shares: number;
  saves?: number;
  engagementRate?: number;
}

// ============================================
// CONNECTOR INTERFACE
// ============================================

export interface ISocialConnector {
  /**
   * Get the platform this connector supports
   */
  readonly platform: SocialPlatform;

  /**
   * Check if the connector is properly configured with credentials
   */
  getStatus(): ConnectorStatus;

  /**
   * Get configuration requirements for this connector
   */
  getConfigRequirements(): SocialConfigRequirement[];

  /**
   * Get platform capabilities and limitations
   */
  getCapabilities(): PlatformCapabilities;

  /**
   * Generate OAuth authorization URL
   */
  getAuthUrl(state?: string): ServiceResult<string>;

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  handleAuthCallback(code: string): ServiceResult<SocialOAuthResult>;

  /**
   * Refresh expired access token
   */
  refreshAccessToken(refreshToken: string): ServiceResult<SocialOAuthResult>;

  /**
   * Get account information for the authenticated user
   */
  getAccountInfo(accessToken: string): ServiceResult<SocialAccountInfo>;

  /**
   * Validate content before publishing
   */
  validateContent(content: ContentItem, mediaAssets?: MediaAsset[]): ContentValidationResult;

  /**
   * Publish content to the platform
   */
  publish(accessToken: string, request: PublishRequest): ServiceResult<PublishResult>;

  /**
   * Get publish status for a scheduled post
   */
  getPublishStatus(accessToken: string, platformPostId: string): ServiceResult<PublishResult>;

  /**
   * Delete a published post
   */
  deletePost(accessToken: string, platformPostId: string): ServiceResult<void>;

  /**
   * Get analytics for a published post
   */
  getAnalytics(accessToken: string, platformPostId: string): ServiceResult<PostAnalyticsData>;

  /**
   * Format content specifically for this platform
   */
  formatContent(content: ContentItem): FormattedContent;
}

// ============================================
// FORMATTED CONTENT
// ============================================

export interface FormattedContent {
  caption: string;
  hashtags: string[];
  mediaUrls: string[];
  ctaUrl?: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// CONFIGURATION
// ============================================

export interface SocialConfigRequirement {
  key: string;
  label: string;
  description: string;
  required: boolean;
  type: 'string' | 'secret' | 'url' | 'boolean';
  placeholder?: string;
  helpUrl?: string;
}

// ============================================
// CONNECTOR REGISTRY
// ============================================

export interface SocialConnectorRegistry {
  getConnector(platform: SocialPlatform): ISocialConnector | null;
  getAllConnectors(): ISocialConnector[];
  registerConnector(connector: ISocialConnector): void;
  isConfigured(platform: SocialPlatform): boolean;
}
