# AffiliatePost Pro — MVP Content + Buffer Automation

## 📊 Status: MVP FUNCTIONAL

**Build:** ✅ PASSING  
**Typecheck:** ✅ PASSING  
**Workflow:** ✅ FUNCTIONAL (template mode)

---

## 🔄 Workflow yang Dibangun

```
MANUAL AFFILIATE PRODUCT INPUT
        ↓
PRODUCT PROCESSING (Draft → Ready → Archived)
        ↓
CONTENT GENERATION (6 styles × 3 platforms)
        ↓
CONTENT REVIEW (Edit → Approve/Reject)
        ↓
GENERATE 7-DAY CONTENT QUEUE
        ↓
BUFFER CHANNEL DISCOVERY
        ↓
SCHEDULE POSTS (with timezone)
        ↓
BUFFER → FACEBOOK / TIKTOK / YOUTUBE
        ↓
PUBLISH → TRACK STATUS
```

---

## 📁 Struktur Folder Final

```
src/
├── App.tsx                          # Main app with new workflow
├── main.tsx                         # Entry point
├── index.css                        # Tailwind CSS
├── vite-env.d.ts                    # Vite env types
├── types.ts                         # Updated domain types
│
├── components/
│   ├── Sidebar.tsx                  # Navigation (updated)
│   ├── Dashboard.tsx                # Stats + workflow status
│   ├── ProductInput.tsx             # NEW: Manual product input
│   ├── ContentCreator.tsx           # UPDATED: Platform-specific generation
│   ├── ContentReview.tsx            # NEW: Review + 7-day queue generator
│   ├── QueueManager.tsx             # NEW: Schedule management
│   └── AccountManager.tsx           # UPDATED: Buffer integration
│
├── data/
│   └── sampleData.ts                # Updated sample data
│
└── services/
    ├── index.ts                     # Service exports
    ├── types.ts                     # Core domain types
    ├── database/
    │   └── supabaseClient.ts        # Supabase (optional)
    ├── marketplace/
    │   ├── types.ts                 # Connector interfaces
    │   ├── baseConnector.ts         # Abstract base
    │   ├── shopee.ts               # Shopee (CONNECTOR READY)
    │   ├── lazada.ts               # Lazada (CONNECTOR READY)
    │   ├── tokopedia.ts            # Tokopedia (CONNECTOR READY)
    │   └── registry.ts             # Registry
    ├── social/
    │   ├── types.ts                 # Connector interfaces
    │   ├── baseConnector.ts         # Abstract base
    │   ├── buffer.ts               # NEW: Buffer (PRIMARY)
    │   ├── facebook.ts             # Facebook (via Buffer)
    │   ├── instagram.ts            # Instagram (not in MVP)
    │   ├── youtube.ts              # YouTube (via Buffer)
    │   ├── tiktok.ts               # TikTok (via Buffer)
    │   └── registry.ts             # Registry
    ├── content/
    │   └── contentEngine.ts         # Template + AI engine
    └── scheduler/
        ├── scheduler.ts             # Job scheduling
        └── publisher.ts             # Publish execution

supabase/
└── migrations/
    └── 001_initial_schema.sql       # Database schema

.env.example                         # Environment template
ARCHITECTURE.md                      # Architecture docs
```

---

## ✅ Fitur yang Berfungsi

| Fitur | Status | Keterangan |
|-------|--------|------------|
| Manual Product Input | ✅ FUNCTIONAL | Input produk dari 3 marketplace tanpa API |
| Product Status Management | ✅ FUNCTIONAL | Draft → Ready → Archived |
| Content Generation (Template) | ✅ FUNCTIONAL | 6 styles × 3 platforms = 18 templates |
| Platform-Specific Content | ✅ FUNCTIONAL | FB/TikTok/YT format berbeda |
| Content Review | ✅ FUNCTIONAL | Edit, Approve, Reject |
| 7-Day Queue Generator | ✅ FUNCTIONAL | Auto-schedule dengan timezone |
| Schedule Management | ✅ FUNCTIONAL | List + Calendar view |
| Buffer Integration | 🔌 CONNECTOR READY | API service siap, butuh token |
| Timezone Support | ✅ FUNCTIONAL | WIB/WITA/WIT |
| Idempotency Keys | ✅ FUNCTIONAL | Duplicate prevention |
| Retry Logic | ✅ FUNCTIONAL | Exponential backoff |

---

## 🎨 Content Styles (6)

| Style | Description | Best For |
|-------|-------------|----------|
| Product Review | Detailed review | Facebook, YouTube |
| Soft Selling | Story-based | TikTok, Facebook |
| Problem/Solution | Pain point focus | All platforms |
| Promotional | Flash sale / discount | TikTok, Facebook |
| Educational | Tips & info | YouTube, Facebook |
| Short Hook | Quick attention grab | TikTok |

---

## 🔗 Publishing Pipeline

```
AffiliatePost Pro → Buffer API → Social Platforms
                                      ├── Facebook
                                      ├── TikTok
                                      └── YouTube
```

Buffer bertindak sebagai middleware:
1. AffiliatePost Pro mengirim konten ke Buffer
2. Buffer handles scheduling & publishing
3. Status tracking kembali ke AffiliatePost Pro

---

## 🔐 Environment Variables

```bash
# PRIMARY (for Buffer publishing)
VITE_BUFFER_ACCESS_TOKEN=your-buffer-token

# OPTIONAL
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENAI_API_KEY=your-openai-key
```

---

## 🚀 Quick Start

1. Copy `.env.example` ke `.env`
2. Set `VITE_BUFFER_ACCESS_TOKEN` (dapatkan dari buffer.com/developers)
3. Run `npm run dev`
4. Input produk affiliate secara manual
5. Generate konten untuk setiap platform
6. Review & approve konten
7. Generate 7-day queue
8. Posts akan dikirim ke Buffer → published ke social media

---

## 📋 MVP Blockers

| Blocker | Status | Solution |
|---------|--------|----------|
| Buffer Access Token | ⚠️ Required | Daftar di buffer.com, dapatkan API token |
| Database Persistence | Optional | Supabase setup (atau gunakan localStorage) |
| AI Content Generation | Optional | Set OpenAI API key (template mode works without it) |

---

## 📊 Perbedaan dari Versi Sebelumnya

| Aspek | Sebelumnya | Sekarang |
|-------|-----------|----------|
| Product Input | API scraping (not working) | Manual input (functional) |
| Content Generation | 1 template for all | 6 styles × 3 platforms |
| Publishing | Direct to social (not working) | Via Buffer (connector ready) |
| Instagram | Included | Removed from MVP |
| Content Review | None | Full review workflow |
| 7-Day Queue | None | Auto-generator with timezone |
| Status Tracking | Mock | Real status lifecycle |

---

## 🎯 Next Steps (Setelah MVP Live)

1. **Setup Buffer** — Dapatkan access token dan connect channels
2. **Test Publishing** — Kirim test post ke Buffer
3. **Add Media Upload** — Upload gambar/video untuk konten
4. **AI Content** — Integrasikan OpenAI untuk auto-generation
5. **Analytics** — Track clicks, conversions, revenue
6. **Marketplace API** — Aktifkan auto-fetch saat API tersedia

---

**Build: ✅ PASSING | Typecheck: ✅ PASSING | Workflow: ✅ FUNCTIONAL**
