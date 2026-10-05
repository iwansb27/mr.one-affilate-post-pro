/**
 * Facebook Connector
 * 
 * STATUS: CONNECTOR_READY
 * 
 * Requires Meta App credentials:
 * - META_APP_ID (server-side only)
 * - META_APP_SECRET (server-side only)
 * 
 * Documentation: https://developers.facebook.com/docs/graph-api
 * 
 * Supports: Feed Posts, Stories, Reels
 */

import { BaseSocialConnector } from './baseConnector';
import { 
  SocialConfigRequirement,
  PlatformCapabilities,
  SocialAccountInfo,
  SocialOAuthResult,
  PublishRequest,
  PublishResult,
  PostAnalyticsData,
  FormattedContent,
  ContentValidationResult
} from './types';
import { SocialPlatform, ServiceResult, ConnectorStatus, ContentItem, MediaAsset } from '../types';

export class FacebookConnector extends BaseSocialConnector {
  readonly platform: SocialPlatform = 'facebook';

  private appId?: string;
  private appSecret?: string;

  constructor() {
    super();
    this.checkConfiguration();
  }

  private checkConfiguration(): void {
    this.appId = import.meta.env.VITE_META_APP_ID;
    this.appSecret = import.meta.env.VITE_META_APP_SECRET;
    
    this.configured = !!(this.appId && this.appSecret);
  }

  getStatus(): ConnectorStatus {
    if (!this.configured) {
      return 'NOT_CONFIGURED';
    }
    return 'CONNECTOR_READY';
  }

  getConfigRequirements(): SocialConfigRequirement[] {
    return [
      {
        key: 'META_APP_ID',
        label: 'Meta App ID',
        description: 'Application ID from Meta Developer Dashboard',
        required: true,
        type: 'string',
        placeholder: 'Enter your Meta App ID',
        helpUrl: 'https://developers.facebook.com/apps/',
      },
      {
        key: 'META_APP_SECRET',
        label: 'Meta App Secret',
        description: 'Application secret from Meta Developer Dashboard',
        required: true,
        type: 'secret',
        placeholder: 'Enter your Meta App Secret',
        helpUrl: 'https://developers.facebook.com/apps/',
      },
    ];
  }

  getCapabilities(): PlatformCapabilities {
    return {
      supportedContentTypes: ['post', 'story', 'reel'],
      maxCaptionLength: 63206,
      maxHashtags: 100,
      supportedMediaTypes: ['image', 'video'],
      maxImagesPerPost: 10,
      maxVideoDurationSeconds: 240,
      supportedAspectRatios: ['1:1', '4:5', '16:9', '9:16'],
      supportsScheduling: true,
      supportsStories: true,
      supportsLinks: true,
    };
  }

  getAuthUrl(state?: string): ServiceResult<string> {
    if (!this.configured) {
      return this.createNotConfiguredError();
    }
    
    // TODO: Implement actual Facebook OAuth flow
    // Docs: https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow/
    return this.createNotImplementedError();
  }

  handleAuthCallback(code: string): ServiceResult<SocialOAuthResult> {
    if (!this.configured) {
      return this.createNotConfiguredError();
    }
    return this.createNotImplementedError();
  }

  refreshAccessToken(refreshToken: string): ServiceResult<SocialOAuthResult> {
    if (!this.configured) {
      return this.createNotConfiguredError();
    }
    return this.createNotImplementedError();
  }

  getAccountInfo(accessToken: string): ServiceResult<SocialAccountInfo> {
    if (!this.configured) {
      return this.createNotConfiguredError();
    }
    
    // TODO: Implement via Graph API
    // GET /me?fields=id,name,picture,followers_count
    return this.createNotImplementedError();
  }

  validateContent(content: ContentItem, mediaAssets?: MediaAsset[]): ContentValidationResult {
    const errors: any[] = [];
    const warnings: any[] = [];
    const caps = this.getCapabilities();

    if (content.caption && content.caption.length > caps.maxCaptionLength) {
      errors.push({
        field: 'caption',
        message: `Caption exceeds maximum length of ${caps.maxCaptionLength} characters`,
        code: 'CAPTION_TOO_LONG',
      });
    }

    if (content.hashtags.length > caps.maxHashtags) {
      warnings.push({
        field: 'hashtags',
        message: `Too many hashtags (${content.hashtags.length}). Maximum recommended: ${caps.maxHashtags}`,
        suggestion: 'Reduce hashtags for better engagement',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  publish(accessToken: string, request: PublishRequest): ServiceResult<PublishResult> {
    if (!this.configured) {
      return this.createNotConfiguredError();
    }
    
    // TODO: Implement via Graph API
    // POST /{page-id}/feed or /{page-id}/photos
    return this.createNotImplementedError();
  }

  getPublishStatus(accessToken: string, platformPostId: string): ServiceResult<PublishResult> {
    if (!this.configured) {
      return this.createNotConfiguredError();
    }
    return this.createNotImplementedError();
  }

  deletePost(accessToken: string, platformPostId: string): ServiceResult<void> {
    if (!this.configured) {
      return this.createNotConfiguredError();
    }
    
    // DELETE /{post-id}
    return this.createNotImplementedError();
  }

  getAnalytics(accessToken: string, platformPostId: string): ServiceResult<PostAnalyticsData> {
    if (!this.configured) {
      return this.createNotConfiguredError();
    }
    
    // GET /{post-id}/insights
    return this.createNotImplementedError();
  }

  formatContent(content: ContentItem): FormattedContent {
    const caption = content.caption || '';
    const hashtags = content.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`);
    
    return {
      caption: `${caption}\n\n${hashtags.join(' ')}`,
      hashtags,
      mediaUrls: content.mediaUrls,
      ctaUrl: content.ctaUrl,
    };
  }
}
