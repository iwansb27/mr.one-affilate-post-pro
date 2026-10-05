/**
 * Social Media Connector Registry
 * 
 * Central registry for all social media connectors.
 * Allows dynamic registration and retrieval of connectors.
 */

import { ISocialConnector, SocialConnectorRegistry } from './types';
import { SocialPlatform, ConnectorStatus } from '../types';
import { FacebookConnector } from './facebook';
import { InstagramConnector } from './instagram';
import { YouTubeConnector } from './youtube';
import { TikTokConnector } from './tiktok';

class SocialConnectorRegistryImpl implements SocialConnectorRegistry {
  private connectors: Map<SocialPlatform, ISocialConnector> = new Map();

  constructor() {
    // Register default connectors
    this.registerConnector(new FacebookConnector());
    this.registerConnector(new InstagramConnector());
    this.registerConnector(new YouTubeConnector());
    this.registerConnector(new TikTokConnector());
  }

  getConnector(platform: SocialPlatform): ISocialConnector | null {
    return this.connectors.get(platform) || null;
  }

  getAllConnectors(): ISocialConnector[] {
    return Array.from(this.connectors.values());
  }

  registerConnector(connector: ISocialConnector): void {
    this.connectors.set(connector.platform, connector);
  }

  isConfigured(platform: SocialPlatform): boolean {
    const connector = this.getConnector(platform);
    if (!connector) return false;
    
    const status = connector.getStatus();
    return status === 'CONNECTOR_READY' || status === 'CONNECTED';
  }

  getAllStatuses(): Record<SocialPlatform, ConnectorStatus> {
    const statuses: Partial<Record<SocialPlatform, ConnectorStatus>> = {};
    
    for (const [platform, connector] of this.connectors.entries()) {
      statuses[platform] = connector.getStatus();
    }
    
    return statuses as Record<SocialPlatform, ConnectorStatus>;
  }
}

// Singleton instance
export const socialConnectorRegistry = new SocialConnectorRegistryImpl();
