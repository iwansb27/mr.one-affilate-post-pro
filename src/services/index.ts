/**
 * Service Layer Index
 * 
 * Central export for all services.
 */

// Database
export { getSupabase, isSupabaseConfigured, getSupabaseStatus, initializeSupabase } from './database/supabaseClient';

// Marketplace Connectors
export { marketplaceConnectorRegistry } from './marketplace/registry';
export { ShopeeConnector } from './marketplace/shopee';
export { LazadaConnector } from './marketplace/lazada';
export { TokopediaConnector } from './marketplace/tokopedia';
export type { IMarketplaceConnector, MarketplaceConnectorRegistry } from './marketplace/types';

// Social Media Connectors
export { socialConnectorRegistry } from './social/registry';
export { FacebookConnector } from './social/facebook';
export { InstagramConnector } from './social/instagram';
export { YouTubeConnector } from './social/youtube';
export { TikTokConnector } from './social/tiktok';
export type { ISocialConnector, SocialConnectorRegistry } from './social/types';

// Content Engine
export { contentEngine, ContentEngine } from './content/contentEngine';
export type { AIProvider, CaptionGenerationParams, HashtagGenerationParams } from './content/contentEngine';

// Scheduler & Publisher
export { schedulerService, SchedulerService } from './scheduler/scheduler';
export { publisherService, PublisherService } from './scheduler/publisher';
export type { ScheduleRequest, SchedulerStatus } from './scheduler/scheduler';
export type { PublishExecutionResult } from './scheduler/publisher';

// Types
export * from './types';
