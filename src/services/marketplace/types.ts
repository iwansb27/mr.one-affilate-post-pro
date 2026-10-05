/**
 * Marketplace Connector Interface
 * 
 * All marketplace connectors (Shopee, Lazada, Tokopedia) must implement this interface.
 * This allows adding new marketplaces without changing the core application logic.
 */

import { Marketplace, AffiliateProduct, ServiceResult, ConnectorStatus } from '../types';

// ============================================
// OAUTH / AUTHENTICATION
// ============================================

export interface MarketplaceAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope?: string[];
}

export interface MarketplaceOAuthResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
  scope?: string;
}

export interface MarketplaceAccountInfo {
  accountId: string;
  accountName: string;
  shopName?: string;
  profileUrl?: string;
  avatarUrl?: string;
  country?: string;
}

// ============================================
// PRODUCT SEARCH & FETCH
// ============================================

export interface ProductSearchParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'price' | 'rating' | 'sales' | 'newest' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface ProductSearchResult {
  products: MarketplaceProductSummary[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface MarketplaceProductSummary {
  externalProductId: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  imageUrl: string;
  rating?: number;
  soldCount?: number;
  category?: string;
  productUrl: string;
}

export interface MarketplaceProductDetail {
  externalProductId: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  commissionRate?: number;
  currency: string;
  imageUrls: string[];
  category: string;
  rating?: number;
  soldCount: number;
  stockCount?: number;
  productUrl: string;
  specifications?: Record<string, string>;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  variantId: string;
  name: string;
  price: number;
  stockCount?: number;
  imageUrl?: string;
}

// ============================================
// AFFILIATE LINK
// ============================================

export interface AffiliateLinkRequest {
  productUrl: string;
  trackingId?: string;
  campaignId?: string;
}

export interface AffiliateLinkResult {
  originalUrl: string;
  affiliateUrl: string;
  trackingId?: string;
  expiresAt?: string;
}

// ============================================
// URL RESOLUTION
// ============================================

export interface UrlResolutionResult {
  marketplace: Marketplace;
  externalProductId: string;
  isValid: boolean;
  error?: string;
}

// ============================================
// CONNECTOR INTERFACE
// ============================================

export interface IMarketplaceConnector {
  /**
   * Get the marketplace this connector supports
   */
  readonly marketplace: Marketplace;

  /**
   * Check if the connector is properly configured with credentials
   */
  getStatus(): ConnectorStatus;

  /**
   * Get configuration requirements for this connector
   */
  getConfigRequirements(): ConfigRequirement[];

  /**
   * Generate OAuth authorization URL
   */
  getAuthUrl(): ServiceResult<string>;

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  handleAuthCallback(code: string): ServiceResult<MarketplaceOAuthResult>;

  /**
   * Refresh expired access token
   */
  refreshAccessToken(refreshToken: string): ServiceResult<MarketplaceOAuthResult>;

  /**
   * Get account information for the authenticated user
   */
  getAccountInfo(accessToken: string): ServiceResult<MarketplaceAccountInfo>;

  /**
   * Search products from marketplace
   */
  searchProducts(accessToken: string, params: ProductSearchParams): ServiceResult<ProductSearchResult>;

  /**
   * Get detailed product information
   */
  getProductDetail(accessToken: string, productId: string): ServiceResult<MarketplaceProductDetail>;

  /**
   * Generate affiliate link for a product
   */
  generateAffiliateLink(accessToken: string, request: AffiliateLinkRequest): ServiceResult<AffiliateLinkResult>;

  /**
   * Resolve a product URL to extract marketplace and product ID
   */
  resolveProductUrl(url: string): ServiceResult<UrlResolutionResult>;

  /**
   * Convert marketplace product to internal AffiliateProduct format
   */
  toAffiliateProduct(userId: string, detail: MarketplaceProductDetail, accountId?: string): AffiliateProduct;
}

// ============================================
// CONFIGURATION
// ============================================

export interface ConfigRequirement {
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

export interface MarketplaceConnectorRegistry {
  getConnector(marketplace: Marketplace): IMarketplaceConnector | null;
  getAllConnectors(): IMarketplaceConnector[];
  registerConnector(connector: IMarketplaceConnector): void;
  isConfigured(marketplace: Marketplace): boolean;
}
