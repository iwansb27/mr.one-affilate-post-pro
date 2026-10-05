/**
 * Marketplace Connector Registry
 * 
 * Central registry for all marketplace connectors.
 * Allows dynamic registration and retrieval of connectors.
 */

import { IMarketplaceConnector, MarketplaceConnectorRegistry } from './types';
import { Marketplace, ConnectorStatus } from '../types';
import { ShopeeConnector } from './shopee';
import { LazadaConnector } from './lazada';
import { TokopediaConnector } from './tokopedia';

class MarketplaceConnectorRegistryImpl implements MarketplaceConnectorRegistry {
  private connectors: Map<Marketplace, IMarketplaceConnector> = new Map();

  constructor() {
    // Register default connectors
    this.registerConnector(new ShopeeConnector());
    this.registerConnector(new LazadaConnector());
    this.registerConnector(new TokopediaConnector());
  }

  getConnector(marketplace: Marketplace): IMarketplaceConnector | null {
    return this.connectors.get(marketplace) || null;
  }

  getAllConnectors(): IMarketplaceConnector[] {
    return Array.from(this.connectors.values());
  }

  registerConnector(connector: IMarketplaceConnector): void {
    this.connectors.set(connector.marketplace, connector);
  }

  isConfigured(marketplace: Marketplace): boolean {
    const connector = this.getConnector(marketplace);
    if (!connector) return false;
    
    const status = connector.getStatus();
    return status === 'CONNECTOR_READY' || status === 'CONNECTED';
  }

  getAllStatuses(): Record<Marketplace, ConnectorStatus> {
    const statuses: Partial<Record<Marketplace, ConnectorStatus>> = {};
    
    for (const [marketplace, connector] of this.connectors.entries()) {
      statuses[marketplace] = connector.getStatus();
    }
    
    return statuses as Record<Marketplace, ConnectorStatus>;
  }
}

// Singleton instance
export const marketplaceConnectorRegistry = new MarketplaceConnectorRegistryImpl();
