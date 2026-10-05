/**
 * Buffer API Service
 * 
 * Buffer is the publishing provider for social media automation.
 * Documentation: https://buffer.com/developers/api
 * 
 * STATUS: CONNECTOR READY
 * Requires: VITE_BUFFER_ACCESS_TOKEN
 */

import type { SocialPlatform } from '../../types';

export interface BufferProfile {
  id: string;
  service: string;
  service_id: string;
  formatted_service: string;
  avatar_https: string;
  title: string;
  statistics?: {
    followers?: number;
  };
}

export interface BufferUpdate {
  id: string;
  text: string;
  status: string;
  sent_at?: string;
  due_at?: string;
  profile_id: string;
  media?: {
    link?: string;
    photo?: string;
    video?: string;
  };
}

export interface BufferCreatePostRequest {
  profileIds: string[];
  text: string;
  media?: {
    link?: string;
    photo?: string;
    video?: string;
  };
  scheduledAt?: string;
  shorten?: boolean;
  now?: boolean;
}

export interface BufferService {
  getStatus(): 'NOT_CONFIGURED' | 'CONNECTOR_READY' | 'CONNECTED' | 'ERROR';
  getProfiles(): Promise<BufferProfile[]>;
  createPost(request: BufferCreatePostRequest): Promise<BufferUpdate>;
  getUpdate(updateId: string): Promise<BufferUpdate>;
  deleteUpdate(updateId: string): Promise<void>;
  mapBufferServiceToPlatform(service: string): SocialPlatform | null;
}

class BufferServiceImpl implements BufferService {
  private accessToken?: string;
  private baseUrl = 'https://api.bufferapp.com/1';

  constructor() {
    this.accessToken = import.meta.env.VITE_BUFFER_ACCESS_TOKEN;
  }

  getStatus(): 'NOT_CONFIGURED' | 'CONNECTOR_READY' | 'CONNECTED' | 'ERROR' {
    if (!this.accessToken) {
      return 'NOT_CONFIGURED';
    }
    return 'CONNECTOR_READY';
  }

  mapBufferServiceToPlatform(service: string): SocialPlatform | null {
    const mapping: Record<string, SocialPlatform> = {
      'facebook': 'facebook',
      'facebook_page': 'facebook',
      'tiktok': 'tiktok',
      'youtube': 'youtube',
    };
    return mapping[service.toLowerCase()] || null;
  }

  async getProfiles(): Promise<BufferProfile[]> {
    if (!this.accessToken) {
      throw new Error('Buffer access token not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/profiles.json?access_token=${this.accessToken}`
      );
      
      if (!response.ok) {
        throw new Error(`Buffer API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('[Buffer] Failed to fetch profiles:', error);
      throw error;
    }
  }

  async createPost(request: BufferCreatePostRequest): Promise<BufferUpdate> {
    if (!this.accessToken) {
      throw new Error('Buffer access token not configured');
    }

    const params = new URLSearchParams();
    params.append('access_token', this.accessToken);
    
    request.profileIds.forEach(id => {
      params.append('profile_ids[]', id);
    });
    
    params.append('text', request.text);
    
    if (request.media?.photo) {
      params.append('media[photo]', request.media.photo);
    }
    if (request.media?.video) {
      params.append('media[video]', request.media.video);
    }
    if (request.media?.link) {
      params.append('media[link]', request.media.link);
    }
    if (request.scheduledAt) {
      params.append('scheduled_at', request.scheduledAt);
    }
    if (request.now) {
      params.append('now', 'true');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/updates/create.json`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        }
      );

      if (!response.ok) {
        throw new Error(`Buffer API error: ${response.status}`);
      }

      const data = await response.json();
      return data.success?.[0] || data;
    } catch (error) {
      console.error('[Buffer] Failed to create post:', error);
      throw error;
    }
  }

  async getUpdate(updateId: string): Promise<BufferUpdate> {
    if (!this.accessToken) {
      throw new Error('Buffer access token not configured');
    }

    const response = await fetch(
      `${this.baseUrl}/updates/${updateId}.json?access_token=${this.accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Buffer API error: ${response.status}`);
    }

    return await response.json();
  }

  async deleteUpdate(updateId: string): Promise<void> {
    if (!this.accessToken) {
      throw new Error('Buffer access token not configured');
    }

    const response = await fetch(
      `${this.baseUrl}/updates/destroy.json`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `access_token=${this.accessToken}&id=${updateId}`,
      }
    );

    if (!response.ok) {
      throw new Error(`Buffer API error: ${response.status}`);
    }
  }
}

// Singleton instance
export const bufferService = new BufferServiceImpl();
