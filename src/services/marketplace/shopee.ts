/**
 * Shopee Affiliate Connector
 * 
 * STATUS: CONNECTOR_READY
 * 
 * Requires Shopee Affiliate Program credentials:
 * - SHOPEE_AFFILIATE_APP_KEY (server-side only)
 * - SHOPEE_AFFILIATE_SECRET (server-side only)
 * 
 * Documentation: https://affiliate.shopee.co.id/
 * 
 * This connector implements the IMarketplaceConnector interface
 * but returns NOT_CONFIGURED until proper credentials are provided.
 */

import { BaseMarketplaceConnector } from './baseConnector';
import { 
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
import { Marketplace, ServiceResult, ConnectorStatus } from '../types';

export class ShopeeConnector extends BaseMarketplaceConnector {
  readonly marketplace: Marketplace = 'shopee';

  private appKey?: string;
  private appSecret?: string;

  constructor() {
    super();
    this.checkConfiguration();
  }

  private checkConfiguration(): void {
    this.appKey = import.meta.env.VITE_SHOPEE_APP_KEY;
    this.appSecret = import.meta.env.VITE_SHOPEE_APP_SECRET;
    
    // Note: In production, these should be server-side only
    // For now, we check if they exist to determine connector status
    this.configured = !!(this.appKey && this.appSecret);
  }

  getStatus(): ConnectorStatus {
    if (!this.configured) {
      return 'NOT_CONFIGURED';
    }
    return 'CONNECTOR_READY';
  }

  getConfigRequirements(): ConfigRequirement[] {
    return [
      {
        key: 'SHOPEE_AFFILIATE_APP_KEY',
        label: 'Shopee Affiliate App Key',
        description: 'Application key from Shopee Affiliate Program dashboard',
        required: true,
        type: 'string',
        placeholder: 'Enter your Shopee App Key',
        helpUrl: 'https://affiliate.shopee.co.id/docs/api',
      },
      {
        key: 'SHOPEE_AFFILIATE_SECRET',
        label: 'Shopee Affiliate Secret',
        description: 'Application secret from Shopee Affiliate Program dashboard',
        required: true,
        type: 'secret',
        placeholder: 'Enter your Shopee Secret',
        helpUrl: 'https://affiliate.shopee.co.id/docs/api',
      },
    ];
  }

  getAuthUrl(): ServiceResult<string> {
    if (!this.configured) {
      return this.createNotConfiguredError();
    }
    
    // TODO: Implement actual Shopee OAuth flow
    // Documentation: https://open.shopee.com/developer-guide/22
    return this.createNotImplementedError();
  }

  handleAuthCallback(code: string): ServiceResult<MarketplaceOAuthResult> {
    if (!this.configured) {
      return this.createNotConfiguredError();
    }
    
    // TODO: Implement token exchange
    return this.createNotImplementedError();
  }

  refreshAccessToken(refreshToken: string): ServiceResult<MarketplaceOAuthResult> {
    if (!this.configured) {
      return this.createNotConfiguredError();
    }
    
    // TODO: Implement token refresh
    return this.createNotImplementedError();
  }

  getAccountInfo(accessToken: string): ServiceResult<MarketplaceAccountInfo> {
    if (!this.configured) {
      return this.createNotConfiguredError();
    }
    
    // TODO: Implement account info fetch
    // API: GET /api/v4/affiliate/get_partner_info
    return this.createNotImplementedError();
  }

  searchProducts(accessToken: string, params: ProductSearchParams): ServiceResult<ProductSearchResult> {
    if (!this.configured) {
      return this.createNotConfiguredError();
    }
    
    // TODO: Implement product search
    // API: POST /api/v4/affiliate/search_products
    return this.createNotImplementedError();
  }

  getProductDetail(accessToken: string, productId: string): ServiceResult<MarketplaceProductDetail> {
    if (!this.configured) {
      return this.createNotConfiguredError();
    }
    
    // TODO: Implement product detail fetch
    // API: GET /api/v4/affiliate/get_product_detail
    return this.createNotImplementedError();
  }

  generateAffiliateLink(accessToken: string, request: AffiliateLinkRequest): ServiceResult<AffiliateLinkResult> {
    if (!this.configured) {
      return this.createNotConfiguredError();
    }
    
    // TODO: Implement affiliate link generation
    // API: POST /api/v4/affiliate/create_short_link
    return this.createNotImplementedError();
  }

  resolveProductUrl(url: string): ServiceResult<UrlResolutionResult> {
    // URL patterns for Shopee:
    // https://shopee.co.id/product-name-i.{shop_id}.{item_id}
    // https://shopee.co.id/{shop_name}/{product-name}-i.{shop_id}.{item_id}
    
    const shopeePattern = /shopee\.co\.id.*i\.(\d+)\.(\d+)/;
    const match = url.match(shopeePattern);
    
    if (match) {
      return {
        success: true,
        data: {
          marketplace: 'shopee',
          externalProductId: match[2],
          isValid: true,
        },
      };
    }
    
    return {
      success: false,
      error: 'Invalid Shopee product URL format',
      errorCode: 'INVALID_URL',
    };
  }
}
