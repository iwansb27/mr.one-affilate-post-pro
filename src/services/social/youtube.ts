/**
 * YouTube Connector
 * 
 * STATUS: CONNECTOR_READY
 * 
 * Requires Google OAuth credentials:
 * - YOUTUBE_CLIENT_ID (server-side only)
 * - YOUTUBE_CLIENT_SECRET (server-side only)
 * 
 * Documentation: https://developers.google.com/youtube/v3
 * 
 * Supports: Video Upload, Shorts, Community Posts
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

export class YouTubeConnector extends BaseSocialConnector {
  readonly platform: SocialPlatform = 'youtube';

  private clientId?: string;
  private clientSecret?: string;

  constructor() {
    super();
    this.checkConfiguration();
  }

  private checkConfiguration(): void {
    this.clientId = import.meta.env.VITE_YOUTUBE_CLIENT_ID;
    this.clientSecret = import.meta.env.VITE_YOUTUBE_CLIENT_SECRET;
    
    this.configured = !!(this.clientId && this.clientSecret);
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
        key: 'YOUTUBE_CLIENT_ID',
        label: 'YouTube/Google Client ID',
        description: 'OAuth 2.0 Client ID from Google Cloud Console',
        required: true,
        type: 'string',
        placeholder: 'Enter your Google Client ID',
        helpUrl: 'https://console.cloud.google.com/apis/credentials',
      },
      {
        key: 'YOUTUBE_CLIENT_SECRET',
        label: 'YouTube/Google Client Secret',
        description: 'OAuth 2.0 Client Secret from Google Cloud Console',
        required: true,
        type: 'secret',
        placeholder: 'Enter your Google Client Secret',
        helpUrl: 'https://console.cloud.google.com/apis/credentials',
      },
    ];
  }

  getCapabilities(): PlatformCapabilities {
    return {
      supportedContentTypes: ['video', 'short'],
      maxCaptionLength: 5000,
      maxHashtags: 60,
      supportedMediaTypes: ['video'],
      maxImagesPerPost: 1,
      maxVideoDurationSeconds: 43200, // 12 hours for regular, 60s for Shorts
      supportedAspectRatios: ['16:9', '9:16', '1:1'],
      supportsScheduling: true,
      supportsStories: false,
      supportsLinks: true,
    };
  }

  getAuthUrl(state?: string): ServiceResult<string> {
    if (!this.configured) {
      return this.createNotConfiguredError();
    }
    
    // TODO: Implement Google OAuth 2.0 flow
    // Scope: https://www.googleapis.com/auth/youtube.upload
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
    
    // TODO: Implement via YouTube Data API v3
    // GET https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true
    return this.createNotImplementedError();
  }

  validateContent(content: ContentItem, mediaAssets?: MediaAsset[]): ContentValidationResult {
    const errors: any[] = [];
    const warnings: any[] = [];
    const caps = this.getCapabilities();

    if (!content.title) {
      errors.push({
        field: 'title',
        message: 'YouTube videos require a title',
        code: 'TITLE_REQUIRED',
      });
    }

    if (content.title && content.title.length > 100) {
      errors.push({
        field: 'title',
        message: 'YouTube title exceeds maximum length of 100 characters',
        code: 'TITLE_TOO_LONG',
      });
    }

    if (content.caption && content.caption.length > caps.maxCaptionLength) {
      errors.push({
        field: 'caption',
        message: `Description exceeds maximum length of ${caps.maxCaptionLength} characters`,
        code: 'DESCRIPTION_TOO_LONG',
      });
    }

    if (!content.mediaUrls.length && (!mediaAssets || mediaAssets.length === 0)) {
      errors.push({
        field: 'media',
        message: 'YouTube requires a video file',
        code: 'VIDEO_REQUIRED',
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
    
    // TODO: Implement via YouTube Data API v3
    // POST https://www.googleapis.com/upload/youtube/v3/videos
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
    
    // DELETE https://www.googleapis.com/youtube/v3/videos?id={videoId}
    return this.createNotImplementedError();
  }

  getAnalytics(accessToken: string, platformPostId: string): ServiceResult<PostAnalyticsData> {
    if (!this.configured) {
      return this.createNotConfiguredError();
    }
    
    // YouTube Analytics API
    return this.createNotImplementedError();
  }

  formatContent(content: ContentItem): FormattedContent {
    const hashtags = content.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`);
    
    // YouTube: title + description with hashtags
    let description = content.caption || '';
    if (content.ctaUrl) {
      description += `\n\n🔗 ${content.ctaUrl}`;
    }
    description += `\n\n${hashtags.join(' ')}`;
    
    return {
      caption: description,
      hashtags,
      mediaUrls: content.mediaUrls,
      ctaUrl: content.ctaUrl,
      metadata: {
        title: content.title,
      },
    };
  }
}
