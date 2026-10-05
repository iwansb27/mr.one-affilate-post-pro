/**
 * Content Engine
 * 
 * Generates platform-specific content based on product data,
 * promotion style, and platform requirements.
 * 
 * STATUS: FUNCTIONAL (template-based)
 * AI Generation: NOT CONFIGURED (requires OpenAI/Gemini API key)
 */

import { ContentItem, SocialPlatform, AffiliateProduct, PromotionStyle, ContentType } from '../types';
import { socialConnectorRegistry } from '../social/registry';

// ============================================
// AI PROVIDER INTERFACE
// ============================================

export interface AIProvider {
  readonly name: string;
  isConfigured(): boolean;
  generateCaption(params: CaptionGenerationParams): Promise<string>;
  generateHashtags(params: HashtagGenerationParams): Promise<string[]>;
}

export interface CaptionGenerationParams {
  product: AffiliateProduct;
  platform: SocialPlatform;
  style: PromotionStyle;
  tone?: string;
  maxLength?: number;
}

export interface HashtagGenerationParams {
  product: AffiliateProduct;
  platform: SocialPlatform;
  count?: number;
}

// ============================================
// TEMPLATE ENGINE (Fallback when AI not configured)
// ============================================

class TemplateContentEngine {
  generateCaption(product: AffiliateProduct, platform: SocialPlatform, style: PromotionStyle): string {
    const discount = product.originalPrice 
      ? Math.round((1 - product.price / product.originalPrice) * 100) 
      : 0;
    
    const priceFormatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: product.currency || 'IDR',
      minimumFractionDigits: 0,
    }).format(product.price);

    switch (style) {
      case 'review':
        return this.generateReviewCaption(product, platform, priceFormatted, discount);
      case 'haul':
        return this.generateHaulCaption(product, platform, priceFormatted, discount);
      case 'comparison':
        return this.generateComparisonCaption(product, platform, priceFormatted, discount);
      case 'tutorial':
        return this.generateTutorialCaption(product, platform, priceFormatted, discount);
      case 'unboxing':
        return this.generateUnboxingCaption(product, platform, priceFormatted, discount);
      default:
        return this.generateReviewCaption(product, platform, priceFormatted, discount);
    }
  }

  private generateReviewCaption(product: AffiliateProduct, platform: SocialPlatform, price: string, discount: number): string {
    const platformCaps = socialConnectorRegistry.getConnector(platform)?.getCapabilities();
    const maxLength = platformCaps?.maxCaptionLength || 2200;

    const templates: Record<SocialPlatform, string> = {
      facebook: `🔥 REVIEW JUJUR: ${product.title}\n\nSetelah coba produk ini, jujur aja ini worth it banget!\n\n💰 Harga: ${price}${discount > 0 ? ` (Diskon ${discount}%)` : ''}\n⭐ Rating: ${product.rating || 'N/A'}/5\n📦 Terjual: ${(product.soldCount || 0).toLocaleString('id-ID')}+\n\n✅ Kualitas premium\n✅ Harga terjangkau\n✅ Banyak yang sudah buktiin\n\n🔗 Link pembelian ada di komentar!\n\n#ReviewJujur #Rekomendasi #${product.marketplace}Finds`,

      instagram: `✨ ${product.title}\n\nProduk yang lagi VIRAL dan worth every penny! 🤩\n\n💰 ${price}${discount > 0 ? `\n🔥 Hemat ${discount}%!` : ''}\n⭐ ${product.rating || 'N/A'}/5 dari ${(product.soldCount || 0).toLocaleString('id-ID')}+ pembeli\n\nJangan sampai kehabisan! 🏃‍♂️💨\n🔗 Link di bio!`,

      youtube: `Review lengkap ${product.title}!\n\nDi video ini aku bahas:\n- Unboxing & first impression\n- Kualitas & build quality\n- Apakah worth it?\n- Link pembelian di deskripsi\n\n💰 Harga: ${price}${discount > 0 ? ` (Hemat ${discount}%)` : ''}\n\n🔗 Link pembelian: [AFFILIATE_LINK]\n\nJangan lupa like, comment, dan subscribe!`,

      tiktok: `${product.title} ${price}!\n\nWorth it gak? Tonton sampai habis! 🔥\n\nLink di bio 👆`,
    };

    return templates[platform].substring(0, maxLength);
  }

  private generateHaulCaption(product: AffiliateProduct, platform: SocialPlatform, price: string, discount: number): string {
    const templates: Record<SocialPlatform, string> = {
      facebook: `🛒 HAUL BELANJA ${product.marketplace.charAt(0).toUpperCase() + product.marketplace.slice(1)}!\n\nHari ini mau share produk baru:\n\n📌 ${product.title}\n💰 ${price}${discount > 0 ? ` (Hemat ${discount}%!)` : ''}\n\nJujur ini worth every penny! Kualitasnya bagus banget.\n\n🔗 Link di komentar ya!`,

      instagram: `🛒 ${product.marketplace.charAt(0).toUpperCase() + product.marketplace.slice(1)} HAUL!\n\n📌 ${product.title}\n💰 ${price}${discount > 0 ? `\n🏷️ Save ${discount}%!` : ''}\n\nMust have item! Link di bio 👆`,

      youtube: `HAUL ${product.marketplace.charAt(0).toUpperCase() + product.marketplace.slice(1)} - ${product.title}\n\nBelanja apa aja hari ini? Tonton sampai habis!\n\n💰 ${price}\n🔗 Link: [AFFILIATE_LINK]`,

      tiktok: `HAUL ${product.marketplace}! 🛒\n${product.title}\n${price}\n\nLink di bio 🔗`,
    };

    return templates[platform];
  }

  private generateComparisonCaption(product: AffiliateProduct, platform: SocialPlatform, price: string, discount: number): string {
    return `📊 COMPARISON: ${product.title}\n\nHarga: ${price}\nRating: ${product.rating || 'N/A'}/5\n\nBagaimana dibandingkan produk lain di kelasnya? Simak review lengkapnya!\n\n🔗 Link di bio/komentar`;
  }

  private generateTutorialCaption(product: AffiliateProduct, platform: SocialPlatform, price: string, discount: number): string {
    return `📖 TUTORIAL: Cara Pakai ${product.title}\n\nProduk: ${product.title}\nHarga: ${price}\n\nStep by step cara menggunakan produk ini dengan benar. Tonton sampai habis!\n\n🔗 Link pembelian di bio/komentar`;
  }

  private generateUnboxingCaption(product: AffiliateProduct, platform: SocialPlatform, price: string, discount: number): string {
    return `📦 UNBOXING: ${product.title}\n\nHarga: ${price}${discount > 0 ? ` (Diskon ${discount}%)` : ''}\n\nYuk lihat isi packagingnya! First impression setelah unboxing...\n\n🔗 Link di bio/komentar`;
  }

  generateHashtags(product: AffiliateProduct, platform: SocialPlatform, count: number = 10): string[] {
    const baseHashtags = [
      `#${product.marketplace}finds`,
      `#${product.marketplace}haul`,
      '#rekomendasi',
      '#murah',
      '#diskon',
      '#review',
      '#racun',
      '#worthit',
    ];

    const categoryHashtags: Record<string, string[]> = {
      'Elektronik': ['#tech', '#gadget', '#elektronik'],
      'Kecantikan': ['#beauty', '#skincare', '#makeup'],
      'Fashion': ['#fashion', '#ootd', '#style'],
      'Rumah Tangga': ['#homedecor', '#rumahtangga', '#home'],
      'Kesehatan': ['#health', '#sehat', '#vitamin'],
      'Komputer': ['#pc', '#setup', '#gaming'],
    };

    const categoryTags = product.category ? (categoryHashtags[product.category] || []) : [];
    const allTags = [...baseHashtags, ...categoryTags];

    const platformLimits: Record<SocialPlatform, number> = {
      facebook: 10,
      instagram: 30,
      youtube: 15,
      tiktok: 100,
    };

    const maxTags = Math.min(count, platformLimits[platform]);
    return allTags.slice(0, maxTags);
  }

  generateTitle(product: AffiliateProduct, platform: SocialPlatform): string {
    if (platform !== 'youtube') return '';

    const templates = [
      `Review ${product.title} - Worth It?`,
      `${product.title} | Review Jujur & Unboxing`,
      `Haul ${product.marketplace}: ${product.title}`,
    ];

    return templates[Math.floor(Math.random() * templates.length)].substring(0, 100);
  }
}

// ============================================
// CONTENT ENGINE
// ============================================

export class ContentEngine {
  private templateEngine: TemplateContentEngine;
  private aiProvider: AIProvider | null = null;

  constructor() {
    this.templateEngine = new TemplateContentEngine();
  }

  setAIProvider(provider: AIProvider): void {
    this.aiProvider = provider;
  }

  isAIConfigured(): boolean {
    return this.aiProvider !== null && this.aiProvider.isConfigured();
  }

  getAIStatus(): 'CONFIGURED' | 'NOT_CONFIGURED' {
    return this.isAIConfigured() ? 'CONFIGURED' : 'NOT_CONFIGURED';
  }

  async generateContent(
    product: AffiliateProduct,
    platform: SocialPlatform,
    style: PromotionStyle = 'review',
    contentType: ContentType = 'post'
  ): Promise<Partial<ContentItem>> {
    const connector = socialConnectorRegistry.getConnector(platform);
    if (!connector) {
      throw new Error(`No connector found for platform: ${platform}`);
    }

    let caption: string;
    let hashtags: string[];
    let title: string | undefined;
    let aiGenerated = false;

    if (this.isAIConfigured() && this.aiProvider) {
      // Use AI generation
      const caps = connector.getCapabilities();
      caption = await this.aiProvider.generateCaption({
        product,
        platform,
        style,
        maxLength: caps.maxCaptionLength,
      });
      hashtags = await this.aiProvider.generateHashtags({
        product,
        platform,
        count: Math.min(30, caps.maxHashtags),
      });
      aiGenerated = true;
    } else {
      // Use template engine
      caption = this.templateEngine.generateCaption(product, platform, style);
      hashtags = this.templateEngine.generateHashtags(product, platform);
    }

    if (platform === 'youtube') {
      title = this.templateEngine.generateTitle(product, platform);
    }

    const formattedContent = connector.formatContent({
      id: '',
      userId: product.userId,
      productId: product.id,
      platform,
      contentType,
      title,
      caption,
      hashtags,
      ctaText: 'Beli Sekarang',
      ctaUrl: product.affiliateUrl,
      mediaUrls: product.imageUrls,
      promotionStyle: style,
      aiGenerated,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return {
      title,
      caption: formattedContent.caption,
      hashtags: formattedContent.hashtags,
      ctaText: 'Beli Sekarang',
      ctaUrl: product.affiliateUrl,
      mediaUrls: product.imageUrls,
      aiGenerated,
      aiProvider: aiGenerated ? this.aiProvider?.name : undefined,
    };
  }

  generateContentSync(
    product: AffiliateProduct,
    platform: SocialPlatform,
    style: PromotionStyle = 'review',
    contentType: ContentType = 'post'
  ): Partial<ContentItem> {
    const connector = socialConnectorRegistry.getConnector(platform);
    if (!connector) {
      throw new Error(`No connector found for platform: ${platform}`);
    }

    const caption = this.templateEngine.generateCaption(product, platform, style);
    const hashtags = this.templateEngine.generateHashtags(product, platform);
    let title: string | undefined;

    if (platform === 'youtube') {
      title = this.templateEngine.generateTitle(product, platform);
    }

    const formattedContent = connector.formatContent({
      id: '',
      userId: product.userId,
      productId: product.id,
      platform,
      contentType,
      title,
      caption,
      hashtags,
      ctaText: 'Beli Sekarang',
      ctaUrl: product.affiliateUrl,
      mediaUrls: product.imageUrls,
      promotionStyle: style,
      aiGenerated: false,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return {
      title,
      caption: formattedContent.caption,
      hashtags: formattedContent.hashtags,
      ctaText: 'Beli Sekarang',
      ctaUrl: product.affiliateUrl,
      mediaUrls: product.imageUrls,
      aiGenerated: false,
    };
  }
}

// Singleton instance
export const contentEngine = new ContentEngine();
