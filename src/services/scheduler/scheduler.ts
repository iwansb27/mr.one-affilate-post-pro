/**
 * Scheduler Service
 * 
 * Manages scheduling of posts for publishing.
 * 
 * STATUS: SERVICE READY
 * 
 * This service prepares jobs for execution but requires an external
 * worker/cron process to actually trigger job execution.
 * 
 * Required external trigger:
 * - Cron job running every minute: check for due posts
 * - OR: Background worker polling the database
 * - OR: Supabase Edge Function triggered by pg_cron
 * 
 * The scheduler stores jobs in the database with proper timezone handling,
 * idempotency keys, and status tracking.
 */

import { ScheduledPost, PostStatus, ServiceResult, SocialPlatform } from '../types';
import { getSupabase, isSupabaseConfigured } from '../database/supabaseClient';

// ============================================
// SCHEDULER TYPES
// ============================================

export interface ScheduleRequest {
  contentId: string;
  socialAccountId: string;
  scheduledAt: Date;
  timezone: string;
  priority?: number;
  maxRetries?: number;
}

export interface SchedulerStatus {
  isConfigured: boolean;
  pendingJobs: number;
  processingJobs: number;
  failedJobs: number;
  lastCheckAt?: string;
}

// ============================================
// IDEMPOTENCY KEY GENERATOR
// ============================================

function generateIdempotencyKey(contentId: string, socialAccountId: string, scheduledAt: Date): string {
  const timestamp = scheduledAt.toISOString();
  const raw = `${contentId}:${socialAccountId}:${timestamp}`;
  
  // Simple hash for idempotency
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return `sched_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`;
}

// ============================================
// SCHEDULER SERVICE
// ============================================

export class SchedulerService {
  /**
   * Check if the scheduler backend is properly configured
   */
  isConfigured(): boolean {
    return isSupabaseConfigured();
  }

  /**
   * Get scheduler status
   */
  async getStatus(): Promise<SchedulerStatus> {
    if (!this.isConfigured()) {
      return {
        isConfigured: false,
        pendingJobs: 0,
        processingJobs: 0,
        failedJobs: 0,
      };
    }

    const supabase = getSupabase();
    if (!supabase) {
      return {
        isConfigured: false,
        pendingJobs: 0,
        processingJobs: 0,
        failedJobs: 0,
      };
    }

    try {
      const [pending, processing, failed] = await Promise.all([
        supabase.from('scheduled_posts').select('id', { count: 'exact', head: true }).eq('status', 'scheduled'),
        supabase.from('scheduled_posts').select('id', { count: 'exact', head: true }).eq('status', 'processing'),
        supabase.from('scheduled_posts').select('id', { count: 'exact', head: true }).eq('status', 'failed'),
      ]);

      return {
        isConfigured: true,
        pendingJobs: pending.count || 0,
        processingJobs: processing.count || 0,
        failedJobs: failed.count || 0,
        lastCheckAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        isConfigured: false,
        pendingJobs: 0,
        processingJobs: 0,
        failedJobs: 0,
      };
    }
  }

  /**
   * Schedule a post for publishing
   */
  async schedulePost(request: ScheduleRequest): Promise<ServiceResult<ScheduledPost>> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Scheduler is not configured. Set up Supabase connection first.',
        errorCode: 'NOT_CONFIGURED',
      };
    }

    const supabase = getSupabase();
    if (!supabase) {
      return {
        success: false,
        error: 'Failed to get Supabase client',
        errorCode: 'CLIENT_ERROR',
      };
    }

    const idempotencyKey = generateIdempotencyKey(
      request.contentId,
      request.socialAccountId,
      request.scheduledAt
    );

    const now = new Date().toISOString();
    const postData = {
      content_id: request.contentId,
      social_account_id: request.socialAccountId,
      scheduled_at: request.scheduledAt.toISOString(),
      timezone: request.timezone,
      idempotency_key: idempotencyKey,
      status: 'scheduled' as PostStatus,
      priority: request.priority || 0,
      retry_count: 0,
      max_retries: request.maxRetries || 3,
      created_at: now,
      updated_at: now,
    };

    try {
      // Check for duplicate
      const { data: existing } = await supabase
        .from('scheduled_posts')
        .select('id')
        .eq('idempotency_key', idempotencyKey)
        .single();

      if (existing) {
        return {
          success: false,
          error: 'Duplicate schedule detected. This post is already scheduled.',
          errorCode: 'DUPLICATE',
        };
      }

      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert(postData)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message,
          errorCode: 'DB_ERROR',
        };
      }

      // Create publish job
      await supabase.from('publish_jobs').insert({
        scheduled_post_id: data.id,
        job_type: 'publish',
        status: 'pending',
        scheduled_at: request.scheduledAt.toISOString(),
        created_at: now,
        updated_at: now,
      });

      return {
        success: true,
        data: this.mapToScheduledPost(data),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to schedule post',
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Cancel a scheduled post
   */
  async cancelPost(postId: string): Promise<ServiceResult<void>> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Scheduler is not configured',
        errorCode: 'NOT_CONFIGURED',
      };
    }

    const supabase = getSupabase();
    if (!supabase) {
      return {
        success: false,
        error: 'Failed to get Supabase client',
        errorCode: 'CLIENT_ERROR',
      };
    }

    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString() 
        })
        .eq('id', postId)
        .in('status', ['draft', 'scheduled']);

      if (error) {
        return {
          success: false,
          error: error.message,
          errorCode: 'DB_ERROR',
        };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to cancel post',
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Get posts due for publishing (called by worker/cron)
   * 
   * This method is meant to be called by an external worker process
   * that runs periodically (e.g., every minute via cron).
   */
  async getDuePosts(): Promise<ServiceResult<ScheduledPost[]>> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Scheduler is not configured',
        errorCode: 'NOT_CONFIGURED',
      };
    }

    const supabase = getSupabase();
    if (!supabase) {
      return {
        success: false,
        error: 'Failed to get Supabase client',
        errorCode: 'CLIENT_ERROR',
      };
    }

    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('status', 'scheduled')
        .lte('scheduled_at', now)
        .order('priority', { ascending: false })
        .order('scheduled_at', { ascending: true })
        .limit(50);

      if (error) {
        return {
          success: false,
          error: error.message,
          errorCode: 'DB_ERROR',
        };
      }

      return {
        success: true,
        data: (data || []).map(this.mapToScheduledPost),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch due posts',
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Mark a post as processing (called by worker before publishing)
   */
  async markAsProcessing(postId: string): Promise<ServiceResult<void>> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Not configured', errorCode: 'NOT_CONFIGURED' };
    }

    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, error: 'Client error', errorCode: 'CLIENT_ERROR' };
    }

    const { error } = await supabase
      .from('scheduled_posts')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString() 
      })
      .eq('id', postId)
      .eq('status', 'scheduled');

    if (error) {
      return { success: false, error: error.message, errorCode: 'DB_ERROR' };
    }

    return { success: true };
  }

  /**
   * Mark a post as published
   */
  async markAsPublished(postId: string, platformResponse?: Record<string, unknown>): Promise<ServiceResult<void>> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Not configured', errorCode: 'NOT_CONFIGURED' };
    }

    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, error: 'Client error', errorCode: 'CLIENT_ERROR' };
    }

    const now = new Date().toISOString();
    const { error } = await supabase
      .from('scheduled_posts')
      .update({ 
        status: 'published',
        published_at: now,
        platform_response: platformResponse,
        updated_at: now,
      })
      .eq('id', postId);

    if (error) {
      return { success: false, error: error.message, errorCode: 'DB_ERROR' };
    }

    return { success: true };
  }

  /**
   * Mark a post as failed and schedule retry
   */
  async markAsFailed(postId: string, errorMessage: string, retryAfter?: number): Promise<ServiceResult<void>> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Not configured', errorCode: 'NOT_CONFIGURED' };
    }

    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, error: 'Client error', errorCode: 'CLIENT_ERROR' };
    }

    const now = new Date().toISOString();

    // Get current retry count
    const { data: post } = await supabase
      .from('scheduled_posts')
      .select('retry_count, max_retries')
      .eq('id', postId)
      .single();

    if (!post) {
      return { success: false, error: 'Post not found', errorCode: 'NOT_FOUND' };
    }

    const newRetryCount = (post.retry_count || 0) + 1;

    if (newRetryCount >= (post.max_retries || 3)) {
      // Max retries reached, mark as failed permanently
      await supabase
        .from('scheduled_posts')
        .update({ 
          status: 'failed',
          error_message: errorMessage,
          retry_count: newRetryCount,
          updated_at: now,
        })
        .eq('id', postId);
    } else {
      // Schedule retry with exponential backoff
      const backoffMs = (retryAfter || Math.pow(2, newRetryCount) * 60) * 1000;
      const retryAt = new Date(Date.now() + backoffMs).toISOString();

      await supabase
        .from('scheduled_posts')
        .update({ 
          status: 'scheduled',
          error_message: errorMessage,
          retry_count: newRetryCount,
          scheduled_at: retryAt,
          updated_at: now,
        })
        .eq('id', postId);
    }

    // Record attempt
    await supabase.from('publish_attempts').insert({
      scheduled_post_id: postId,
      attempt_number: newRetryCount,
      status: 'failed',
      error_message: errorMessage,
      retry_after_seconds: retryAfter,
      created_at: now,
    });

    return { success: true };
  }

  /**
   * Record a successful publish attempt
   */
  async recordSuccess(postId: string, response?: Record<string, unknown>): Promise<ServiceResult<void>> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Not configured', errorCode: 'NOT_CONFIGURED' };
    }

    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, error: 'Client error', errorCode: 'CLIENT_ERROR' };
    }

    const now = new Date().toISOString();

    // Get current retry count
    const { data: post } = await supabase
      .from('scheduled_posts')
      .select('retry_count')
      .eq('id', postId)
      .single();

    await supabase.from('publish_attempts').insert({
      scheduled_post_id: postId,
      attempt_number: (post?.retry_count || 0) + 1,
      status: 'success',
      response,
      created_at: now,
    });

    return { success: true };
  }

  private mapToScheduledPost(row: any): ScheduledPost {
    return {
      id: row.id,
      userId: row.user_id,
      contentId: row.content_id,
      socialAccountId: row.social_account_id,
      scheduledAt: row.scheduled_at,
      timezone: row.timezone,
      idempotencyKey: row.idempotency_key,
      status: row.status,
      priority: row.priority || 0,
      retryCount: row.retry_count || 0,
      maxRetries: row.max_retries || 3,
      publishedAt: row.published_at,
      errorMessage: row.error_message,
      platformResponse: row.platform_response,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

// ============================================
// WORKER TRIGGER DOCUMENTATION
// ============================================

/**
 * WORKER EXECUTION GUIDE
 * 
 * This scheduler requires an external process to execute due jobs.
 * 
 * Option 1: Supabase Edge Function + pg_cron
 * ```sql
 * -- Enable pg_cron in Supabase dashboard
 * -- Create a function that calls the Edge Function
 * SELECT cron.schedule(
 *   'check-due-posts',
 *   '* * * * *', -- every minute
 *   $$ SELECT net.http_post(
 *     url := 'https://your-project.supabase.co/functions/v1/execute-due-posts',
 *     headers := '{"Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
 *   ) $$
 * );
 * ```
 * 
 * Option 2: External Cron Job
 * ```bash
 * # Crontab entry
 * * * * * * curl -X POST https://your-app.com/api/scheduler/tick
 * ```
 * 
 * Option 3: Node.js Worker
 * ```typescript
 * import { SchedulerService } from './services/scheduler/scheduler';
 * import { PublisherService } from './services/scheduler/publisher';
 * 
 * const scheduler = new SchedulerService();
 * const publisher = new PublisherService();
 * 
 * setInterval(async () => {
 *   const duePosts = await scheduler.getDuePosts();
 *   if (duePosts.success && duePosts.data) {
 *     for (const post of duePosts.data) {
 *       await publisher.executePost(post);
 *     }
 *   }
 * }, 60000); // every minute
 * ```
 */

// Singleton instance
export const schedulerService = new SchedulerService();
