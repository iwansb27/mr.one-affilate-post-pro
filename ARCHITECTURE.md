# AffiliatePost Pro - Architecture Documentation

## 📊 Current Status: MVP Foundation (Phase 1-2 Complete)

**Build Status:** ✅ PASSING  
**Typecheck Status:** ✅ PASSING  
**UI Status:** ✅ FUNCTIONAL  
**Backend Status:** 🔌 SERVICE LAYER READY (requires configuration)  
**Connectors Status:** 🔌 CONNECTOR READY (requires credentials)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                    │
│                                                               │
│  Components:                                                  │
│  ├── Dashboard (stats + overview)                            │
│  ├── ProductSelector (browse + filter products)              │
│  ├── ContentCreator (generate + preview content)             │
│  ├── ScheduleManager (list + calendar view)                  │
│  └── AccountManager (connection management)                  │
│                                                               │
│  Service Layer:                                               │
│  ├── services/database/supabaseClient.ts                     │
│  ├── services/marketplace/ (Shopee, Lazada, Tokopedia)       │
│  ├── services/social/ (Facebook, Instagram, YouTube, TikTok) │
│  ├── services/content/contentEngine.ts                       │
│  └── services/scheduler/ (scheduler.ts, publisher.ts)        │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  SUPABASE (Backend-as-a-Service)              │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   Auth   │  │PostgreSQL│  │ Storage  │  │Edge Func │    │
│  │  (Users) │  │ (Tables) │  │ (Media)  │  │  (APIs)  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                               │
│  Schema: supabase/migrations/001_initial_schema.sql          │
│  Status: NOT CONFIGURED (requires VITE_SUPABASE_URL)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
src/
├── App.tsx                          # Main app with system status
├── main.tsx                         # Entry point
├── index.css                        # Tailwind CSS
├── vite-env.d.ts                    # Vite type declarations
├── types.ts                         # UI-level types
│
├── components/                      # UI Components
│   ├── Sidebar.tsx                  # Navigation sidebar
│   ├── Dashboard.tsx                # Stats overview
│   ├── ProductSelector.tsx          # Product browser
│   ├── ContentCreator.tsx           # Content generation
│   ├── ScheduleManager.tsx          # Post scheduling
│   ├── AccountManager.tsx           # Account connections
│   └── StatusBadge.tsx              # Status indicator
│
├── data/
│   └── sampleData.ts                # Demo data (for UI preview)
│
└── services/                        # Service Layer (Backend Logic)
    ├── index.ts                     # Service exports
    ├── types.ts                     # Core domain types
    │
    ├── database/
    │   └── supabaseClient.ts        # Supabase initialization
    │
    ├── marketplace/                 # Marketplace Connectors
    │   ├── types.ts                 # Connector interfaces
    │   ├── baseConnector.ts         # Abstract base class
    │   ├── shopee.ts                # Shopee connector
    │   ├── lazada.ts                # Lazada connector
    │   ├── tokopedia.ts             # Tokopedia connector
    │   └── registry.ts              # Connector registry
    │
    ├── social/                      # Social Media Connectors
    │   ├── types.ts                 # Connector interfaces
    │   ├── baseConnector.ts         # Abstract base class
    │   ├── facebook.ts              # Facebook connector
    │   ├── instagram.ts             # Instagram connector
    │   ├── youtube.ts               # YouTube connector
    │   ├── tiktok.ts                # TikTok connector
    │   └── registry.ts              # Connector registry
    │
    ├── content/
    │   └── contentEngine.ts         # Content generation engine
    │
    └── scheduler/
        ├── scheduler.ts             # Job scheduling service
        └── publisher.ts             # Publish execution service

supabase/
└── migrations/
    └── 001_initial_schema.sql       # Database schema
```

---

## 🔌 Connector Status

### Marketplace Connectors

| Marketplace | Status | Evidence | Requirement |
|-------------|--------|----------|-------------|
| Shopee | CONNECTOR_READY | `src/services/marketplace/shopee.ts` | VITE_SHOPEE_APP_KEY, VITE_SHOPEE_APP_SECRET |
| Lazada | CONNECTOR_READY | `src/services/marketplace/lazada.ts` | VITE_LAZADA_APP_KEY, VITE_LAZADA_APP_SECRET |
| Tokopedia | CONNECTOR_READY | `src/services/marketplace/tokopedia.ts` | VITE_TOKOPEDIA_CLIENT_ID, VITE_TOKOPEDIA_CLIENT_SECRET |

### Social Media Connectors

| Platform | Status | Evidence | Requirement |
|----------|--------|----------|-------------|
| Facebook | CONNECTOR_READY | `src/services/social/facebook.ts` | VITE_META_APP_ID, VITE_META_APP_SECRET |
| Instagram | CONNECTOR_READY | `src/services/social/instagram.ts` | VITE_META_APP_ID, VITE_META_APP_SECRET |
| YouTube | CONNECTOR_READY | `src/services/social/youtube.ts` | VITE_YOUTUBE_CLIENT_ID, VITE_YOUTUBE_CLIENT_SECRET |
| TikTok | CONNECTOR_READY | `src/services/social/tiktok.ts` | VITE_TIKTOK_CLIENT_KEY, VITE_TIKTOK_CLIENT_SECRET |

### Other Services

| Service | Status | Evidence | Requirement |
|---------|--------|----------|-------------|
| Database (Supabase) | NOT CONFIGURED | `src/services/database/supabaseClient.ts` | VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY |
| Content Engine (Template) | FUNCTIONAL | `src/services/content/contentEngine.ts` | None |
| Content Engine (AI) | NOT CONFIGURED | `src/services/content/contentEngine.ts` | VITE_OPENAI_API_KEY |
| Scheduler | SERVICE READY | `src/services/scheduler/scheduler.ts` | Supabase + External Worker |
| Publisher | SERVICE READY | `src/services/scheduler/publisher.ts` | Connected social accounts |

---

## 🗄️ Database Schema

Full schema available at: `supabase/migrations/001_initial_schema.sql`

### Tables

| Table | Purpose | RLS Enabled |
|-------|---------|-------------|
| users | User accounts | ✅ |
| marketplace_accounts | OAuth tokens for marketplaces | ✅ |
| affiliate_products | Product data from marketplaces | ✅ |
| affiliate_links | Generated affiliate URLs | ✅ |
| media_assets | Images, videos, thumbnails | ✅ |
| social_accounts | OAuth tokens for social platforms | ✅ |
| content_items | Generated content per platform | ✅ |
| scheduled_posts | Posts scheduled for publishing | ✅ |
| publish_jobs | Background job queue | ✅ |
| publish_attempts | Retry tracking | ✅ |
| post_analytics | Performance metrics | ✅ |

---

## 🔐 Security Status

| Aspect | Status | Notes |
|--------|--------|-------|
| API Keys in Frontend | ⚠️ RISK | VITE_ prefixed keys exposed to browser |
| OAuth Tokens | NOT IMPLEMENTED | No token storage yet |
| Row Level Security | SCHEMA READY | Policies defined but not active |
| Server-side Proxy | NOT IMPLEMENTED | API calls should go through Edge Functions |
| Environment Variables | DOCUMENTED | .env.example provided |
| Token Encryption | NOT IMPLEMENTED | Need encryption for stored tokens |

### Security Recommendation

For production:
1. Move all API secrets to server-side only (remove VITE_ prefix)
2. Use Supabase Edge Functions as API proxy
3. Encrypt OAuth tokens before storing in database
4. Implement proper RLS policies
5. Add rate limiting and audit logging

---

## 🚀 Deployment Requirements

### Minimum for MVP

1. **Supabase Project**
   - Create project at supabase.com
   - Run migration: `supabase/migrations/001_initial_schema.sql`
   - Get URL and anon key
   - Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

2. **At Least One Marketplace Connector**
   - Register at affiliate program
   - Get API credentials
   - Set environment variables

3. **At Least One Social Media Connector**
   - Create app at developer platform
   - Get OAuth credentials
   - Set environment variables

4. **Worker/Cron for Scheduler**
   - Set up Supabase Edge Function OR
   - External cron job OR
   - Node.js worker process

### Recommended for Production

- All marketplace connectors configured
- All social media connectors configured
- AI content generation (OpenAI API)
- Media storage (Supabase Storage or S3)
- Analytics tracking
- Error monitoring (Sentry)
- CDN for static assets

---

## 📋 Environment Variables

See `.env.example` for complete list.

### Critical (Required for MVP)
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

### Marketplace (At least one required)
```
VITE_SHOPEE_APP_KEY
VITE_SHOPEE_APP_SECRET
VITE_LAZADA_APP_KEY
VITE_LAZADA_APP_SECRET
VITE_TOKOPEDIA_CLIENT_ID
VITE_TOKOPEDIA_CLIENT_SECRET
```

### Social Media (At least one required)
```
VITE_META_APP_ID
VITE_META_APP_SECRET
VITE_YOUTUBE_CLIENT_ID
VITE_YOUTUBE_CLIENT_SECRET
VITE_TIKTOK_CLIENT_KEY
VITE_TIKTOK_CLIENT_SECRET
```

### Optional
```
VITE_OPENAI_API_KEY  # For AI content generation
```

---

## 🔄 Scheduler Architecture

### Current Implementation

The scheduler service (`src/services/scheduler/scheduler.ts`) provides:
- Job creation with idempotency keys
- Timezone-aware scheduling
- Status tracking (draft → scheduled → processing → published/failed)
- Retry with exponential backoff
- Duplicate prevention

### Required External Trigger

The scheduler needs an external process to execute due jobs:

**Option 1: Supabase pg_cron + Edge Function**
```sql
SELECT cron.schedule(
  'check-due-posts',
  '* * * * *',
  $$ SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/execute-due-posts',
    headers := '{"Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
  ) $$
);
```

**Option 2: External Cron**
```bash
* * * * * curl -X POST https://your-app.com/api/scheduler/tick
```

**Option 3: Node.js Worker**
```typescript
setInterval(async () => {
  const results = await publisherService.executeDuePosts();
  console.log('Published:', results.filter(r => r.success).length);
}, 60000);
```

---

## 📊 Feature Status Summary

| Feature | Status | Notes |
|---------|--------|-------|
| UI/UX | ✅ FUNCTIONAL | All pages render correctly |
| Navigation | ✅ FUNCTIONAL | Tab-based navigation works |
| Product Filtering | ✅ FUNCTIONAL | Filter by marketplace, category, search |
| Product Selection | ✅ FUNCTIONAL | Toggle select/deselect (in-memory) |
| Content Generation | ✅ FUNCTIONAL | Template-based, platform-specific |
| Content Preview | ✅ FUNCTIONAL | Shows formatted content per platform |
| Schedule Management | ✅ FUNCTIONAL | List + Calendar view |
| Status Tracking | ✅ FUNCTIONAL | Draft → Scheduled → Posted |
| Account Management UI | ✅ FUNCTIONAL | Toggle connections |
| Database Persistence | ❌ NOT CONFIGURED | Requires Supabase setup |
| Marketplace API | ❌ NOT CONFIGURED | Requires API credentials |
| Social Media API | ❌ NOT CONFIGURED | Requires API credentials |
| OAuth Flow | ❌ NOT IMPLEMENTED | Connectors ready, flow not built |
| Scheduler Worker | ❌ NOT RUNNING | Service ready, needs external trigger |
| AI Content | ❌ NOT CONFIGURED | Requires OpenAI API key |
| Media Upload | ❌ NOT IMPLEMENTED | No upload UI or storage |
| Analytics | ❌ NOT IMPLEMENTED | Schema ready, no tracking |

---

## 🎯 Next Steps

### Immediate (To make MVP functional)
1. Set up Supabase project and run migration
2. Configure at least one marketplace connector
3. Configure at least one social media connector
4. Implement OAuth flow for configured connectors
5. Set up scheduler worker/cron

### Short-term (To improve reliability)
1. Move API secrets to server-side
2. Implement token encryption
3. Add error handling and retry logic
4. Add media upload and storage
5. Implement analytics tracking

### Long-term (To scale)
1. Add more marketplace connectors
2. Add more social media platforms
3. Implement AI content generation
4. Add A/B testing for content
5. Build advanced analytics dashboard

---

## 📝 Notes

- This is a **frontend-first architecture** with service layer abstraction
- All connectors follow the **adapter pattern** for easy extension
- **No fake/mock data** is presented as real - all status is honest
- UI uses **sample data** for demonstration only
- **Build passes** with no errors
- **Type safety** is maintained throughout
