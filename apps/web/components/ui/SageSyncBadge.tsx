'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { RefreshCw, Terminal, Circle, CheckCircle2, XCircle, Clock, Database, Layers } from 'lucide-react';

/**
 * Sync status types for the Sage ERP connection
 */
type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline';

type RequestStatus = 'pending' | 'success' | 'error';

interface RequestLog {
  id: string;
  endpoint: string;
  method: string;
  status: RequestStatus;
  timestamp: Date;
  duration?: number;
  responseSize?: number;
  error?: string;
}

interface SyncStats {
  productsCount: number;
  categoriesCount: number;
  lastSync: Date;
}

interface SageSyncBadgeProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Format timestamp for log display
 */
function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/**
 * Format relative time for last sync display
 */
function formatLastSync(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffSecs < 30) return "À l'instant";
  if (diffMins < 1) return `Il y a ${diffSecs}s`;
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/**
 * Generate unique ID for request logs
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * SageSyncBadge - Real-time synchronization status indicator with Sage ERP
 *
 * Features:
 * - Displays Sage logo
 * - Shows real-time sync stats (products, categories count)
 * - Live request log showing API calls
 * - Expandable panel on hover with detailed information
 * - Auto-refreshes data every 30 seconds
 */
function SageSyncBadge({ className }: SageSyncBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState<SyncStatus>('syncing');
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [requestLogs, setRequestLogs] = useState<RequestLog[]>([]);
  const [syncCount, setSyncCount] = useState(0);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [requestLogs]);

  const addLog = (log: Omit<RequestLog, 'id' | 'timestamp'>) => {
    const newLog: RequestLog = {
      ...log,
      id: generateId(),
      timestamp: new Date(),
    };
    setRequestLogs((prev) => [...prev.slice(-19), newLog]); // Keep last 20 logs
    return newLog.id;
  };

  const updateLog = (id: string, updates: Partial<RequestLog>) => {
    setRequestLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, ...updates } : log))
    );
  };

  const fetchWithLog = async (endpoint: string, url: string): Promise<Response | null> => {
    const logId = addLog({
      endpoint,
      method: 'GET',
      status: 'pending',
    });
    const startTime = Date.now();

    try {
      const response = await fetch(url, { cache: 'no-store' });
      const duration = Date.now() - startTime;

      if (response.ok) {
        updateLog(logId, {
          status: 'success',
          duration,
          responseSize: parseInt(response.headers.get('content-length') || '0') || undefined,
        });
      } else {
        updateLog(logId, {
          status: 'error',
          duration,
          error: `HTTP ${response.status}`,
        });
      }
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      updateLog(logId, {
        status: 'error',
        duration,
        error: 'Network error',
      });
      return null;
    }
  };

  const fetchSyncStats = async () => {
    try {
      setIsRefreshing(true);
      setStatus('syncing');
      setSyncCount((prev) => prev + 1);

      // Add sync start log
      addLog({
        endpoint: 'SYNC_START',
        method: 'SYS',
        status: 'pending',
      });

      const apiBase = process.env.NEXT_PUBLIC_SAGE_API_URL || 'https://sage-portal.webexpr.dev/api';

      // Fetch with logging
      const [articlesRes, familiesRes] = await Promise.all([
        fetchWithLog('/sage/articles', `${apiBase}/sage/articles`),
        fetchWithLog('/sage/families', `${apiBase}/sage/families`),
      ]);

      if (articlesRes?.ok && familiesRes?.ok) {
        const articles = await articlesRes.json();
        const families = await familiesRes.json();

        // Filter active products and leaf categories
        const activeProducts = articles.filter((a: { EstEnSommeil: boolean; Fictif: boolean }) =>
          !a.EstEnSommeil && !a.Fictif
        );
        const leafCategories = families.filter((f: { TypeFamille: number }) =>
          f.TypeFamille === 0
        );

        setStats({
          productsCount: activeProducts.length,
          categoriesCount: leafCategories.length,
          lastSync: new Date(),
        });
        setStatus('synced');

        // Add success log
        addLog({
          endpoint: 'SYNC_COMPLETE',
          method: 'SYS',
          status: 'success',
        });
      } else {
        setStatus('error');
        addLog({
          endpoint: 'SYNC_FAILED',
          method: 'SYS',
          status: 'error',
          error: 'API unavailable',
        });
      }
    } catch (error) {
      console.error('Failed to fetch sync stats:', error);
      setStatus('error');
      addLog({
        endpoint: 'SYNC_ERROR',
        method: 'SYS',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial fetch and auto-refresh every 30 seconds
  useEffect(() => {
    fetchSyncStats();
    const interval = setInterval(fetchSyncStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    synced: {
      dotColor: 'bg-green-500',
      ringColor: 'bg-green-400',
      showPulse: true,
      label: 'Connecté',
    },
    syncing: {
      dotColor: 'bg-hermes-500',
      ringColor: 'bg-hermes-400',
      showPulse: true,
      label: 'Synchronisation...',
    },
    error: {
      dotColor: 'bg-red-500',
      ringColor: 'bg-red-400',
      showPulse: false,
      label: 'Erreur de connexion',
    },
    offline: {
      dotColor: 'bg-gray-400',
      ringColor: 'bg-gray-300',
      showPulse: false,
      label: 'Hors ligne',
    },
  };

  const config = statusConfig[status];

  // Get status icon for logs
  const getStatusIcon = (logStatus: RequestStatus) => {
    switch (logStatus) {
      case 'pending':
        return <Circle className="h-2.5 w-2.5 text-yellow-500 animate-pulse" />;
      case 'success':
        return <CheckCircle2 className="h-2.5 w-2.5 text-green-500" />;
      case 'error':
        return <XCircle className="h-2.5 w-2.5 text-red-500" />;
    }
  };

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 z-50',
        className
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          'relative overflow-hidden',
          'bg-slate-900/95 backdrop-blur-md',
          'border border-slate-700',
          'rounded-soft',
          'shadow-xl',
          'transition-all duration-300 ease-out',
          'font-mono',
          isExpanded ? 'w-[380px]' : 'w-auto',
        )}
      >
        {/* Main row - always visible */}
        <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-800/50">
          {/* Terminal icon */}
          <Terminal className="h-4 w-4 text-green-400 flex-shrink-0" />

          {/* Sage Logo */}
          <div className="relative h-4 w-10 flex-shrink-0">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/9/94/Sage-logo_svg.svg"
              alt="Sage"
              fill
              className="object-contain brightness-0 invert"
              unoptimized
            />
          </div>

          {/* Divider */}
          <div className="h-3 w-px bg-slate-600" />

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              {config.showPulse && (
                <span
                  className={cn(
                    'absolute inline-flex h-full w-full rounded-full opacity-60',
                    config.ringColor,
                    status === 'syncing' ? 'animate-ping' : 'animate-pulse'
                  )}
                  style={{ animationDuration: status === 'syncing' ? '1s' : '2s' }}
                />
              )}
              <span className={cn('relative inline-flex h-2 w-2 rounded-full', config.dotColor)} />
            </span>

            {/* Compact stats or status */}
            {!isExpanded && stats && status === 'synced' ? (
              <span className="text-[10px] font-medium text-green-400 whitespace-nowrap">
                {stats.productsCount} items
              </span>
            ) : (
              <span className={cn(
                'text-[10px] font-medium whitespace-nowrap',
                status === 'syncing' ? 'text-yellow-400' : status === 'error' ? 'text-red-400' : 'text-green-400'
              )}>
                {isExpanded ? config.label : status === 'syncing' ? 'SYNC...' : 'LIVE'}
              </span>
            )}
          </div>

          {/* Sync count badge */}
          <span className="ml-auto text-[9px] text-slate-500 tabular-nums">
            #{syncCount}
          </span>

          {/* Refresh button - visible on hover */}
          {isExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                fetchSyncStats();
              }}
              disabled={isRefreshing}
              className={cn(
                'p-1 rounded',
                'text-slate-400 hover:text-green-400 hover:bg-slate-700/50',
                'transition-colors duration-200',
                isRefreshing && 'animate-spin'
              )}
              aria-label="Rafraîchir"
            >
              <RefreshCw className="h-3 w-3" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="border-t border-slate-700">
            {/* Stats bar */}
            <div className="flex items-center gap-4 px-3 py-2 bg-slate-800/30 border-b border-slate-700/50">
              {stats ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <Database className="h-3 w-3 text-blue-400" />
                    <span className="text-[10px] text-slate-400">Products:</span>
                    <span className="text-[10px] font-bold text-white tabular-nums">{stats.productsCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-3 w-3 text-purple-400" />
                    <span className="text-[10px] text-slate-400">Collections:</span>
                    <span className="text-[10px] font-bold text-white tabular-nums">{stats.categoriesCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <Clock className="h-3 w-3 text-slate-500" />
                    <span className="text-[9px] text-slate-500">{formatLastSync(stats.lastSync)}</span>
                  </div>
                </>
              ) : (
                <span className="text-[10px] text-slate-500">Waiting for data...</span>
              )}
            </div>

            {/* Request logs */}
            <div className="px-2 py-1.5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[9px] uppercase tracking-wider text-slate-500">Request Log</span>
                <span className="text-[9px] text-slate-600">({requestLogs.length})</span>
              </div>

              <div
                ref={logContainerRef}
                className="h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
              >
                {requestLogs.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-[10px] text-slate-600">No requests yet...</span>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {requestLogs.map((log) => (
                      <div
                        key={log.id}
                        className={cn(
                          'flex items-center gap-2 px-1.5 py-1 rounded text-[9px]',
                          log.status === 'pending' && 'bg-yellow-500/5',
                          log.status === 'success' && 'bg-green-500/5',
                          log.status === 'error' && 'bg-red-500/5',
                        )}
                      >
                        {/* Status icon */}
                        {getStatusIcon(log.status)}

                        {/* Timestamp */}
                        <span className="text-slate-600 tabular-nums w-[52px] flex-shrink-0">
                          {formatTimestamp(log.timestamp)}
                        </span>

                        {/* Method badge */}
                        <span className={cn(
                          'px-1 py-0.5 rounded text-[8px] font-bold flex-shrink-0',
                          log.method === 'GET' && 'bg-blue-500/20 text-blue-400',
                          log.method === 'SYS' && 'bg-purple-500/20 text-purple-400',
                        )}>
                          {log.method}
                        </span>

                        {/* Endpoint */}
                        <span className={cn(
                          'truncate flex-1',
                          log.status === 'error' ? 'text-red-400' : 'text-slate-300'
                        )}>
                          {log.endpoint}
                        </span>

                        {/* Duration */}
                        {log.duration !== undefined && (
                          <span className={cn(
                            'text-[8px] tabular-nums flex-shrink-0',
                            log.duration < 200 ? 'text-green-500' : log.duration < 500 ? 'text-yellow-500' : 'text-red-500'
                          )}>
                            {log.duration}ms
                          </span>
                        )}

                        {/* Error message */}
                        {log.error && (
                          <span className="text-[8px] text-red-400 truncate max-w-[60px]">
                            {log.error}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer with API info */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/50 border-t border-slate-700/50">
              <span className="text-[8px] text-slate-600">
                sage-portal.webexpr.dev/api
              </span>
              <span className="text-[8px] text-slate-600">
                Auto-refresh: 30s
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { SageSyncBadge };
export type { SageSyncBadgeProps, SyncStatus };
