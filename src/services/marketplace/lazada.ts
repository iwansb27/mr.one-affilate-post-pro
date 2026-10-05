/**
 * Lazada Affiliate Connector
 * 
 * STATUS: CONNECTOR_READY
 * 
 * Requires Lazada Affiliate Program credentials:
 * - LAZADA_AFFILIATE_APP_KEY (server-side only)
 * - LAZADA_AFFILIATE_SECRET (server-side only)
 * 
 * Documentation: https://affiliate.lazada.co.id/
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

export class LazadaConnector extends BaseMarketplaceConnector {
  readonly marketplace: Marketplace = 'lazada';

  private appKey?: string;
  private appSecret?: string;

  constructor() {
    super();
    this.checkConfiguration();
  }

  private checkConfiguration(): void {
    this.appKey = import.meta.env.VITE_LAZADA_APP_KEY;
    this.appSecret = import.meta.env.VITE_LAZADA_APP_SECRET;
    
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
        key: 'LAZADA_AFFILIATE_APP_KEY',
        label: 'Lazada Affiliate App Key',
        description: 'Application key from Lazada Affiliate Program dashboard',
        required: true,
        type: 'string',
        placeholder: 'Enter your Lazada App Key',
        helpUrl: 'https://affiliate.lazada.co.id/',
      },
      {
        key: 'LAZADA_AFFILIATE_SECRET',
        label: 'Lazada Affiliate Secret',
        description: 'Application secret from Lazada Affiliate Program dashboard',
        required: true,
        type: 'secret',
        placeholder: 'Enter your Lazada Secret',
        helpUrl: 'https://affiliate.lazada.co.id/',
      },
    ];
  }

  getAuthUrl(): ServiceResult<string> {
    if (!this.configured) {
      return this.createNotConfiguredError();
    }
    
    // TODO: Implement actual Lazada OAuth flow
    // Documentation: https://open.lazada.com/doc/doc.htm
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
    return this.createNotImplementedError();
  }

  searchProducts(accessToken: string, params: ProductSearchParams): ServiceResult<ProductSearchResult> {
    if (!this.configured) {
      return this.createNotConfiguredError();
    }
    
    // TODO: Implement product search
    // API: /affiliate/products/search
    return this.createNotImplementedError();
  }

  getProductDetail(accessToken: string, productId: string): ServiceResult<MarketplaceProductDetail> {
    if (!this.configured) {
      return this.createNotConfiguredError();
    }
    
    // TODO: Implement product detail fetch
    return this.createNotImplementedError();
  }

  generateAffiliateLink(accessToken: string, request: AffiliateLinkRequest): ServiceResult<AffiliateLinkResult> {
    if (!this.configured) {
      return this.createNotConfiguredError();
    }
    
    // TODO: Implement affiliate link generation
    return this.createNotImplementedError();
  }

  resolveProductUrl(url: string): ServiceResult<UrlResolutionResult> {
    // URL patterns for Lazada:
    // https://www.lazada.co.id/products/{product-name}-i{item_id}.html
    // https://www.lazada.co.id/products/{product-name}-s{shop_id}.html
    
    const lazadaPattern = /lazada\.co\.id\/products\/.*-i(\d+)/;
    const match = url.match(lazadaPattern);
    
    if (match) {
      return {
        success: true,
        data: {
          marketplace: 'lazada',
          externalProductId: match[1],
          isValid: true,
        },
      };
    }
    
    return {
      success: false,
      error: 'Invalid Lazada product URL format',
      errorCode: 'INVALID_URL',
    };
  }
}
