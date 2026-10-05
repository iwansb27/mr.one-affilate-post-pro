-- ============================================
-- AffiliatePost Pro - Database Schema
-- Supabase PostgreSQL Migration
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  workspace_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MARKETPLACE ACCOUNTS
-- Stores OAuth tokens for marketplace APIs
-- ============================================
CREATE TABLE marketplace_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  marketplace TEXT NOT NULL CHECK (marketplace IN ('shopee', 'lazada', 'tokopedia')),
  account_name TEXT,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  account_data JSONB,
  status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'expired', 'error')),
  connected_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, marketplace)
);

-- ============================================
-- AFFILIATE PRODUCTS
-- Products fetched from marketplace APIs
-- ============================================
CREATE TABLE affiliate_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  marketplace_account_id UUID REFERENCES marketplace_accounts(id) ON DELETE SET NULL,
  marketplace TEXT NOT NULL CHECK (marketplace IN ('shopee', 'lazada', 'tokopedia')),
  external_product_id TEXT NOT NULL,
  product_url TEXT,
  affiliate_url TEXT,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(15, 2),
  original_price DECIMAL(15, 2),
  discount_percentage DECIMAL(5, 2),
  commission_rate DECIMAL(5, 2),
  currency TEXT DEFAULT 'IDR',
  image_urls TEXT[],
  category TEXT,
  rating DECIMAL(3, 2),
  sold_count BIGINT DEFAULT 0,
  stock_count BIGINT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock', 'deleted')),
  selected BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, marketplace, external_product_id)
);

-- ============================================
-- AFFILIATE LINKS
-- Tracks generated affiliate links
-- ============================================
CREATE TABLE affiliate_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES affiliate_products(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  tracking_id TEXT,
  marketplace TEXT NOT NULL,
  click_count BIGINT DEFAULT 0,
  conversion_count BIGINT DEFAULT 0,
  revenue DECIMAL(15, 2) DEFAULT 0,
  last_clicked_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'invalid')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MEDIA ASSETS
-- Images, videos, thumbnails
-- ============================================
CREATE TABLE media_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES affiliate_products(id) ON DELETE SET NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'video', 'thumbnail')),
  url TEXT NOT NULL,
  storage_path TEXT,
  file_name TEXT,
  mime_type TEXT,
  file_size BIGINT,
  width INT,
  height INT,
  aspect_ratio TEXT,
  duration_seconds DECIMAL(10, 2),
  platform_compatibility TEXT[] DEFAULT ARRAY['facebook', 'instagram', 'youtube', 'tiktok'],
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SOCIAL ACCOUNTS
-- OAuth connections to social media platforms
-- ============================================
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'youtube', 'tiktok')),
  platform_account_id TEXT NOT NULL,
  username TEXT,
  display_name TEXT,
  profile_url TEXT,
  avatar_url TEXT,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  followers_count BIGINT DEFAULT 0,
  account_data JSONB,
  status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'expired', 'error')),
  connected_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform, platform_account_id)
);

-- ============================================
-- CONTENT ITEMS
-- Generated content for each platform
-- ============================================
CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES affiliate_products(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'youtube', 'tiktok')),
  content_type TEXT DEFAULT 'post' CHECK (content_type IN ('post', 'story', 'reel', 'short', 'video')),
  title TEXT,
  caption TEXT,
  hashtags TEXT[],
  cta_text TEXT,
  cta_url TEXT,
  media_asset_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
  media_urls TEXT[],
  promotion_style TEXT DEFAULT 'review' CHECK (promotion_style IN ('review', 'haul', 'comparison', 'tutorial', 'unboxing')),
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_provider TEXT,
  ai_model TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'rejected', 'scheduled', 'published')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SCHEDULED POSTS
-- Posts scheduled for publishing
-- ============================================
CREATE TABLE scheduled_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
  social_account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'Asia/Jakarta',
  idempotency_key TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'processing', 'published', 'failed', 'cancelled')),
  priority INT DEFAULT 0,
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  published_at TIMESTAMPTZ,
  error_message TEXT,
  platform_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PUBLISH JOBS
-- Background jobs for publishing
-- ============================================
CREATE TABLE publish_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheduled_post_id UUID REFERENCES scheduled_posts(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('publish', 'retry', 'cancel')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PUBLISH ATTEMPTS
-- Track each publish attempt for retry logic
-- ============================================
CREATE TABLE publish_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheduled_post_id UUID REFERENCES scheduled_posts(id) ON DELETE CASCADE,
  attempt_number INT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'timeout', 'rate_limited')),
  response JSONB,
  error_code TEXT,
  error_message TEXT,
  retry_after_seconds INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ANALYTICS
-- Track performance metrics
-- ============================================
CREATE TABLE post_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheduled_post_id UUID REFERENCES scheduled_posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  impressions BIGINT DEFAULT 0,
  reach BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  conversions BIGINT DEFAULT 0,
  likes BIGINT DEFAULT 0,
  comments BIGINT DEFAULT 0,
  shares BIGINT DEFAULT 0,
  revenue DECIMAL(15, 2) DEFAULT 0,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(scheduled_post_id, platform)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_affiliate_products_user_marketplace ON affiliate_products(user_id, marketplace);
CREATE INDEX idx_affiliate_products_status ON affiliate_products(status);
CREATE INDEX idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX idx_scheduled_posts_scheduled_at ON scheduled_posts(scheduled_at);
CREATE INDEX idx_scheduled_posts_user_status ON scheduled_posts(user_id, status);
CREATE INDEX idx_publish_jobs_status ON publish_jobs(status);
CREATE INDEX idx_publish_jobs_scheduled_at ON publish_jobs(scheduled_at);
CREATE INDEX idx_content_items_product ON content_items(product_id);
CREATE INDEX idx_content_items_platform ON content_items(platform);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE publish_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE publish_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can access own marketplace accounts" ON marketplace_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own products" ON affiliate_products FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own links" ON affiliate_links FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own media" ON media_assets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own social accounts" ON social_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own content" ON content_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own scheduled posts" ON scheduled_posts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own publish jobs" ON publish_jobs FOR ALL USING (
  EXISTS (SELECT 1 FROM scheduled_posts WHERE id = publish_jobs.scheduled_post_id AND user_id = auth.uid())
);
CREATE POLICY "Users can access own publish attempts" ON publish_attempts FOR ALL USING (
  EXISTS (SELECT 1 FROM scheduled_posts WHERE id = publish_attempts.scheduled_post_id AND user_id = auth.uid())
);
CREATE POLICY "Users can access own analytics" ON post_analytics FOR ALL USING (
  EXISTS (SELECT 1 FROM scheduled_posts WHERE id = post_analytics.scheduled_post_id AND user_id = auth.uid())
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketplace_accounts_updated_at BEFORE UPDATE ON marketplace_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_affiliate_products_updated_at BEFORE UPDATE ON affiliate_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_affiliate_links_updated_at BEFORE UPDATE ON affiliate_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_assets_updated_at BEFORE UPDATE ON media_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON social_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_items_updated_at BEFORE UPDATE ON content_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scheduled_posts_updated_at BEFORE UPDATE ON scheduled_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_publish_jobs_updated_at BEFORE UPDATE ON publish_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_post_analytics_updated_at BEFORE UPDATE ON post_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
