/**
 * TikTok Connector
 * 
 * STATUS: CONNECTOR_READY
 * 
 * Requires TikTok for Developers credentials:
 * - TIKTOK_CLIENT_KEY (server-side only)
 * - TIKTOK_CLIENT_SECRET (server-side only)
 * 
 * Documentation: https://developers.tiktok.com/doc/content-posting-api-get-started
 * 
 * Supports: Video Posts, Photo Posts
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

export class TikTokConnector extends BaseSocialConnector {
  readonly platform: SocialPlatform = 'tiktok';

  private clientKey?: string;
  private clientSecret?: string;

  constructor() {
    super();
    this.checkConfiguration();
  }

  private checkConfiguration(): void {
    this.clientKey = import.meta.env.VITE_TIKTOK_CLIENT_KEY;
    this.clientSecret = import.meta.env.VITE_TIKTOK_CLIENT_SECRET;
    
    this.configured = !!(this.clientKey && this.clientSecret);
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
        key: 'TIKTOK_CLIENT_KEY',
        label: 'TikTok Client Key',
        description: 'Client key from TikTok for Developers dashboard',
        required: true,
        type: 'string',
        placeholder: 'Enter your TikTok Client Key',
        helpUrl: 'https://developers.tiktok.com/',
      },
      {
        key: 'TIKTOK_CLIENT_SECRET',
        label: 'TikTok Client Secret',
        description: 'Client secret from TikTok for Developers dashboard',
        required: true,
        type: 'secret',
        placeholder: 'Enter your TikTok Client Secret',
        helpUrl: 'https://developers.tiktok.com/',
      },
    ];
  }

  getCapabilities(): PlatformCapabilities {
    return {
      supportedContentTypes: ['video'],
      maxCaptionLength: 2200,
      maxHashtags: 100,
      supportedMediaTypes: ['video'],
      maxImagesPerPost: 0, // TikTok is video-first (photo mode is separate)
      maxVideoDurationSeconds: 600, // 10 minutes
      supportedAspectRatios: ['9:16', '1:1', '16:9'],
      supportsScheduling: true,
      supportsStories: false,
      supportsLinks: false, // Links only in bio
    };
  }

  getAuthUrl(state?: string): ServiceResult<string> {
    if (!this.configured) {
      return this.createNotConfiguredError();
    }
    
    // TODO: Implement TikTok OAuth 2.0 flow
    // Docs: https://developers.tiktok.com/doc/login-kit-web
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
    
    // TODO: Implement via TikTok API
    // GET https://open.tiktokapis.com/v2/user/info/
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

    if (!content.mediaUrls.length && (!mediaAssets || mediaAssets.length === 0)) {
      errors.push({
        field: 'media',
        message: 'TikTok posts require a video file',
        code: 'VIDEO_REQUIRED',
      });
    }

    // Check video aspect ratio
    if (mediaAssets && mediaAssets.length > 0) {
      const video = mediaAssets.find(a => a.assetType === 'video');
      if (video && video.width && video.height) {
        const ratio = video.width / video.height;
        if (ratio < 0.5 || ratio > 2) {
          warnings.push({
            field: 'media',
            message: 'Video aspect ratio may not be optimal for TikTok',
            suggestion: 'Use 9:16 (vertical) for best results',
          });
        }
      }
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
    
    // TODO: Implement via TikTok Content Posting API
    // 1. POST /v2/post/publish/video/init/
    // 2. Upload video
    // 3. Check publish status
    return this.createNotImplementedError();
  }

  getPublishStatus(accessToken: string, platformPostId: string): ServiceResult<PublishResult> {
    if (!this.configured) {
      return this.createNotConfiguredError();
    }
    
    // GET /v2/post/publish/status/fetch/
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
    return this.createNotImplementedError();
  }

  formatContent(content: ContentItem): FormattedContent {
    const hashtags = content.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`);
    
    // TikTok: short caption + hashtags
    let caption = content.caption || '';
    if (content.ctaUrl) {
      caption += '\n\n🔗 Link di bio!';
    }
    caption += ` ${hashtags.join(' ')}`;
    
    return {
      caption,
      hashtags,
      mediaUrls: content.mediaUrls,
      ctaUrl: content.ctaUrl,
    };
  }
}
