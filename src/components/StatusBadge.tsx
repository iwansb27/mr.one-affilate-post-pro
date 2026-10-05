/**
 * Status Badge Component
 * 
 * Displays connector/service status with appropriate colors and labels.
 * Shows honest status: NOT CONFIGURED, CONNECTOR READY, CONNECTED, ERROR
 */

import { ConnectorStatus } from '../services/types';

interface StatusBadgeProps {
  status: ConnectorStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<ConnectorStatus, { label: string; color: string; bgColor: string; icon: string }> = {
  NOT_CONFIGURED: {
    label: 'Not Configured',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: '⚙️',
  },
  CONNECTOR_READY: {
    label: 'Connector Ready',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    icon: '🔌',
  },
  CONNECTED: {
    label: 'Connected',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: '✅',
  },
  ERROR: {
    label: 'Error',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: '❌',
  },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bgColor} ${config.color} ${sizeClasses[size]}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
