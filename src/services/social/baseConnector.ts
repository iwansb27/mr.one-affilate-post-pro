/**
 * Base Social Media Connector
 * 
 * Abstract base class for all social media connectors.
 * Provides common functionality and enforces interface compliance.
 */

import { ISocialConnector, SocialConfigRequirement, PlatformCapabilities, SocialAccountInfo, SocialOAuthResult, PublishRequest, PublishResult, PostAnalyticsData, FormattedContent, ContentValidationResult } from './types';
import { SocialPlatform, ServiceResult, ConnectorStatus, ContentItem, MediaAsset } from '../types';

export abstract class BaseSocialConnector implements ISocialConnector {
  abstract readonly platform: SocialPlatform;
  
  protected configured: boolean = false;
  protected configError?: string;

  abstract getStatus(): ConnectorStatus;
  abstract getConfigRequirements(): SocialConfigRequirement[];
  abstract getCapabilities(): PlatformCapabilities;
  abstract getAuthUrl(state?: string): ServiceResult<string>;
  abstract handleAuthCallback(code: string): ServiceResult<SocialOAuthResult>;
  abstract refreshAccessToken(refreshToken: string): ServiceResult<SocialOAuthResult>;
  abstract getAccountInfo(accessToken: string): ServiceResult<SocialAccountInfo>;
  abstract validateContent(content: ContentItem, mediaAssets?: MediaAsset[]): ContentValidationResult;
  abstract publish(accessToken: string, request: PublishRequest): ServiceResult<PublishResult>;
  abstract getPublishStatus(accessToken: string, platformPostId: string): ServiceResult<PublishResult>;
  abstract deletePost(accessToken: string, platformPostId: string): ServiceResult<void>;
  abstract getAnalytics(accessToken: string, platformPostId: string): ServiceResult<PostAnalyticsData>;
  abstract formatContent(content: ContentItem): FormattedContent;

  protected createNotConfiguredError<T>(): ServiceResult<T> {
    return {
      success: false,
      error: `${this.platform} connector is not configured. Please set up API credentials.`,
      errorCode: 'NOT_CONFIGURED',
    };
  }

  protected createNotImplementedError<T>(): ServiceResult<T> {
    return {
      success: false,
      error: `${this.platform} connector is ready but API integration is not yet implemented.`,
      errorCode: 'NOT_IMPLEMENTED',
    };
  }
}
