/**
 * Base Marketplace Connector
 * 
 * Abstract base class for all marketplace connectors.
 * Provides common functionality and enforces interface compliance.
 */

import { 
  IMarketplaceConnector, 
  ConfigRequirement,
  MarketplaceAccountInfo,
  MarketplaceOAuthResult,
  ProductSearchParams,
  ProductSearchResult,
  MarketplaceProductDetail,
  AffiliateLinkRequest,
  AffiliateLinkResult,
  UrlResolutionResult
} from './types';
import { Marketplace, AffiliateProduct, ServiceResult, ConnectorStatus } from '../types';

export abstract class BaseMarketplaceConnector implements IMarketplaceConnector {
  abstract readonly marketplace: Marketplace;
  
  protected configured: boolean = false;
  protected configError?: string;

  abstract getStatus(): ConnectorStatus;
  abstract getConfigRequirements(): ConfigRequirement[];
  abstract getAuthUrl(): ServiceResult<string>;
  abstract handleAuthCallback(code: string): ServiceResult<MarketplaceOAuthResult>;
  abstract refreshAccessToken(refreshToken: string): ServiceResult<MarketplaceOAuthResult>;
  abstract getAccountInfo(accessToken: string): ServiceResult<MarketplaceAccountInfo>;
  abstract searchProducts(accessToken: string, params: ProductSearchParams): ServiceResult<ProductSearchResult>;
  abstract getProductDetail(accessToken: string, productId: string): ServiceResult<MarketplaceProductDetail>;
  abstract generateAffiliateLink(accessToken: string, request: AffiliateLinkRequest): ServiceResult<AffiliateLinkResult>;
  abstract resolveProductUrl(url: string): ServiceResult<UrlResolutionResult>;

  toAffiliateProduct(userId: string, detail: MarketplaceProductDetail, accountId?: string): AffiliateProduct {
    const now = new Date().toISOString();
    return {
      id: crypto.randomUUID(),
      userId,
      marketplaceAccountId: accountId,
      marketplace: this.marketplace,
      externalProductId: detail.externalProductId,
      productUrl: detail.productUrl,
      affiliateUrl: undefined, // Will be set after generating affiliate link
      title: detail.title,
      description: detail.description,
      price: detail.price,
      originalPrice: detail.originalPrice,
      discountPercentage: detail.discountPercentage,
      commissionRate: detail.commissionRate,
      currency: detail.currency,
      imageUrls: detail.imageUrls,
      category: detail.category,
      rating: detail.rating,
      soldCount: detail.soldCount,
      stockCount: detail.stockCount,
      status: 'active',
      selected: false,
      metadata: {
        specifications: detail.specifications,
        variants: detail.variants,
      },
      createdAt: now,
      updatedAt: now,
    };
  }

  protected createNotConfiguredError<T>(): ServiceResult<T> {
    return {
      success: false,
      error: `${this.marketplace} connector is not configured. Please set up API credentials.`,
      errorCode: 'NOT_CONFIGURED',
    };
  }

  protected createNotImplementedError<T>(): ServiceResult<T> {
    return {
      success: false,
      error: `${this.marketplace} connector is ready but API integration is not yet implemented.`,
      errorCode: 'NOT_IMPLEMENTED',
    };
  }
}
