/**
 * Publisher Service
 * 
 * Executes the actual publishing of posts to social media platforms.
 * Uses social connectors to handle platform-specific publishing logic.
 * 
 * STATUS: SERVICE READY
 * 
 * This service orchestrates the publishing process:
 * 1. Validate content for target platform
 * 2. Format content according to platform requirements
 * 3. Call platform API via connector
 * 4. Record result (success/failure)
 * 5. Handle retries with exponential backoff
 */

import { ScheduledPost, ServiceResult, ContentItem, SocialAccount } from '../types';
import { socialConnectorRegistry } from '../social/registry';
import { schedulerService } from './scheduler';
import { getSupabase, isSupabaseConfigured } from '../database/supabaseClient';

// ============================================
// PUBLISHER TYPES
// ============================================

export interface PublishExecutionResult {
  scheduledPostId: string;
  platform: string;
  success: boolean;
  platformPostId?: string;
  platformUrl?: string;
  error?: string;
  retryable?: boolean;
  retryAfterSeconds?: number;
  attemptNumber: number;
}

// ============================================
// PUBLISHER SERVICE
// ============================================

export class PublisherService {
  /**
   * Execute a scheduled post
   * 
   * This is the main entry point called by the worker/cron process.
   * It handles the full publish lifecycle:
   * - Mark as processing
   * - Validate content
   * - Publish via connector
   * - Record result
   * - Handle retries
   */
  async executePost(scheduledPost: ScheduledPost): Promise<PublishExecutionResult> {
    const result: PublishExecutionResult = {
      scheduledPostId: scheduledPost.id,
      platform: '',
      success: false,
      attemptNumber: scheduledPost.retryCount + 1,
    };

    try {
      // Step 1: Mark as processing
      const processingResult = await schedulerService.markAsProcessing(scheduledPost.id);
      if (!processingResult.success) {
        result.error = 'Failed to mark post as processing';
        return result;
      }

      // Step 2: Get content and social account details
      const contentAndAccount = await this.getContentAndAccount(
        scheduledPost.contentId,
        scheduledPost.socialAccountId
      );

      if (!contentAndAccount) {
        result.error = 'Failed to fetch content or social account';
        await schedulerService.markAsFailed(scheduledPost.id, result.error);
        return result;
      }

      const { content, socialAccount } = contentAndAccount;
      result.platform = content.platform;

      // Step 3: Get connector
      const connector = socialConnectorRegistry.getConnector(content.platform);
      if (!connector) {
        result.error = `No connector found for platform: ${content.platform}`;
        result.retryable = false;
        await schedulerService.markAsFailed(scheduledPost.id, result.error);
        return result;
      }

      // Step 4: Check connector status
      if (connector.getStatus() !== 'CONNECTED') {
        result.error = `${content.platform} connector is not connected. Status: ${connector.getStatus()}`;
        result.retryable = false;
        await schedulerService.markAsFailed(scheduledPost.id, result.error);
        return result;
      }

      // Step 5: Validate content
      const validation = connector.validateContent(content);
      if (!validation.isValid) {
        result.error = `Content validation failed: ${validation.errors.map(e => e.message).join(', ')}`;
        result.retryable = false;
        await schedulerService.markAsFailed(scheduledPost.id, result.error);
        return result;
      }

      // Step 6: Publish
      // Note: In production, we'd need the access token from the social account
      // For now, this will fail because connectors return NOT_IMPLEMENTED
      const accessToken = (socialAccount.accountData?.accessToken as string) || '';
      const publishResult = connector.publish(accessToken, { content });

      if (publishResult.success && publishResult.data) {
        // Success
        result.success = true;
        result.platformPostId = publishResult.data.platformPostId;
        result.platformUrl = publishResult.data.platformUrl;

        await schedulerService.markAsPublished(scheduledPost.id, {
          platformPostId: publishResult.data.platformPostId,
          platformUrl: publishResult.data.platformUrl,
        });
        await schedulerService.recordSuccess(scheduledPost.id, publishResult.data as any);
      } else {
        // Failure
        result.error = publishResult.error || 'Unknown publish error';
        result.retryable = true;

        await schedulerService.markAsFailed(
          scheduledPost.id,
          result.error,
          publishResult.errorCode === 'RATE_LIMITED' ? 3600 : undefined
        );
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Unexpected error during publish';
      result.error = errorMsg;
      result.retryable = true;
      await schedulerService.markAsFailed(scheduledPost.id, errorMsg);
    }

    return result;
  }

  /**
   * Execute all due posts
   * Called by worker/cron process
   */
  async executeDuePosts(): Promise<PublishExecutionResult[]> {
    const results: PublishExecutionResult[] = [];

    const duePostsResult = await schedulerService.getDuePosts();
    if (!duePostsResult.success || !duePostsResult.data) {
      return results;
    }

    for (const post of duePostsResult.data) {
      const result = await this.executePost(post);
      results.push(result);
    }

    return results;
  }

  /**
   * Get content and social account from database
   */
  private async getContentAndAccount(
    contentId: string,
    socialAccountId: string
  ): Promise<{ content: ContentItem; socialAccount: SocialAccount } | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const [contentResult, accountResult] = await Promise.all([
        supabase.from('content_items').select('*').eq('id', contentId).single(),
        supabase.from('social_accounts').select('*').eq('id', socialAccountId).single(),
      ]);

      if (contentResult.error || accountResult.error) {
        return null;
      }

      return {
        content: this.mapToContentItem(contentResult.data),
        socialAccount: this.mapToSocialAccount(accountResult.data),
      };
    } catch {
      return null;
    }
  }

  private mapToContentItem(row: any): ContentItem {
    return {
      id: row.id,
      userId: row.user_id,
      productId: row.product_id,
      platform: row.platform,
      contentType: row.content_type,
      title: row.title,
      caption: row.caption,
      hashtags: row.hashtags || [],
      ctaText: row.cta_text,
      ctaUrl: row.cta_url,
      mediaAssetId: row.media_asset_id,
      mediaUrls: row.media_urls || [],
      promotionStyle: row.promotion_style,
      aiGenerated: row.ai_generated || false,
      aiProvider: row.ai_provider,
      aiModel: row.ai_model,
      status: row.status,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapToSocialAccount(row: any): SocialAccount {
    return {
      id: row.id,
      userId: row.user_id,
      platform: row.platform,
      platformAccountId: row.platform_account_id,
      username: row.username,
      displayName: row.display_name,
      profileUrl: row.profile_url,
      avatarUrl: row.avatar_url,
      tokenExpiresAt: row.token_expires_at,
      followersCount: row.followers_count || 0,
      accountData: row.account_data,
      status: row.status,
      connectedAt: row.connected_at,
      lastSyncAt: row.last_sync_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

// Singleton instance
export const publisherService = new PublisherService();
