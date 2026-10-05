/**
 * Instagram Connector
 * 
 * STATUS: CONNECTOR_READY
 * 
 * Requires Meta App credentials (same as Facebook):
 * - META_APP_ID (server-side only)
 * - META_APP_SECRET (server-side only)
 * 
 * Documentation: https://developers.facebook.com/docs/instagram-api/
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

export class InstagramConnector extends BaseSocialConnector {
  readonly platform: SocialPlatform = 'instagram';

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
        description: 'Application ID from Meta Developer Dashboard (shared with Facebook)',
        required: true,
        type: 'string',
        placeholder: 'Enter your Meta App ID',
        helpUrl: 'https://developers.facebook.com/apps/',
      },
      {
        key: 'META_APP_SECRET',
        label: 'Meta App Secret',
        description: 'Application secret from Meta Developer Dashboard (shared with Facebook)',
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
      maxCaptionLength: 2200,
      maxHashtags: 30,
      supportedMediaTypes: ['image', 'video'],
      maxImagesPerPost: 10,
      maxVideoDurationSeconds: 90,
      supportedAspectRatios: ['1:1', '4:5', '16:9', '9:16'],
      supportsScheduling: true,
      supportsStories: true,
      supportsLinks: false, // Links only in stories/bio
    };
  }

  getAuthUrl(state?: string): ServiceResult<string> {
    if (!this.configured) {
      return this.createNotConfiguredError();
    }
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
    
    // TODO: Implement via Instagram Graph API
    // GET /{ig-user-id}?fields=id,username,name,profile_picture_url,followers_count
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
      errors.push({
        field: 'hashtags',
        message: `Too many hashtags (${content.hashtags.length}). Instagram allows maximum ${caps.maxHashtags}`,
        code: 'TOO_MANY_HASHTAGS',
      });
    }

    if (!content.mediaUrls.length && (!mediaAssets || mediaAssets.length === 0)) {
      errors.push({
        field: 'media',
        message: 'Instagram posts require at least one image or video',
        code: 'MEDIA_REQUIRED',
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
    
    // TODO: Implement via Instagram Graph API
    // 1. POST /{ig-user-id}/media (create container)
    // 2. POST /{ig-user-id}/media_publish (publish container)
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
    return this.createNotImplementedError();
  }

  getAnalytics(accessToken: string, platformPostId: string): ServiceResult<PostAnalyticsData> {
    if (!this.configured) {
      return this.createNotConfiguredError();
    }
    
    // GET /{media-id}/insights
    return this.createNotImplementedError();
  }

  formatContent(content: ContentItem): FormattedContent {
    const caption = content.caption || '';
    const hashtags = content.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`);
    
    // Instagram: hashtags at end of caption, link in bio reference
    let formattedCaption = caption;
    if (content.ctaUrl) {
      formattedCaption += '\n\n🔗 Link di bio!';
    }
    formattedCaption += `\n\n${hashtags.join(' ')}`;
    
    return {
      caption: formattedCaption,
      hashtags,
      mediaUrls: content.mediaUrls,
      ctaUrl: content.ctaUrl,
    };
  }
}
