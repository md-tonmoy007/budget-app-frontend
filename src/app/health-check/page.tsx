"use client";
import React, { useCallback, useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import api from '../../lib/api';
import { Activity, RefreshCw } from 'lucide-react';

interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
  checks: Record<string, string>;
}

type HealthState =
  | { kind: 'loading' }
  | { kind: 'ok'; data: HealthResponse; latencyMs: number }
  | { kind: 'degraded'; data: HealthResponse; latencyMs: number }
  | { kind: 'unreachable'; message: string };

function statusColor(value: string) {
  if (value === 'ok') return 'text-green-400';
  if (value === 'degraded') return 'text-yellow-400';
  return 'text-red-400';
}

export default function HealthCheckPage() {
  const [state, setState] = useState<HealthState>({ kind: 'loading' });
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const runCheck = useCallback(async () => {
    setState({ kind: 'loading' });
    const start = performance.now();
    try {
      const res = await api.get<HealthResponse>('/health');
      setState({ kind: 'ok', data: res.data, latencyMs: performance.now() - start });
    } catch (err: unknown) {
      const latencyMs = performance.now() - start;
      const response = (err as { response?: { data?: HealthResponse } }).response;
      if (response?.data?.status) {
        setState({ kind: 'degraded', data: response.data, latencyMs });
      } else {
        setState({
          kind: 'unreachable',
          message: err instanceof Error ? err.message : 'Request failed',
        });
      }
    } finally {
      setCheckedAt(new Date());
    }
  }, []);

  useEffect(() => {
    runCheck();
  }, [runCheck]);

  const overallStatus =
    state.kind === 'loading' ? 'checking…'
    : state.kind === 'unreachable' ? 'unreachable'
    : state.data.status;

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Activity size={28} />
            Backend Health
          </h1>
          <button
            onClick={runCheck}
            disabled={state.kind === 'loading'}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/20"
          >
            <RefreshCw size={18} className={state.kind === 'loading' ? 'animate-spin' : ''} />
            Re-check
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Status</span>
            <span className={`font-bold text-lg uppercase ${statusColor(overallStatus)}`}>
              {overallStatus}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">API URL</span>
            <span className="font-mono text-sm">{api.defaults.baseURL || '(not set)'}</span>
          </div>

          {(state.kind === 'ok' || state.kind === 'degraded') && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Service</span>
                <span className="font-mono text-sm">{state.data.service}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Latency</span>
                <span className="font-mono text-sm">{Math.round(state.latencyMs)} ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Server time</span>
                <span className="font-mono text-sm">{state.data.timestamp}</span>
              </div>
              <div className="border-t border-gray-800 pt-4 space-y-2">
                {Object.entries(state.data.checks).map(([name, value]) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="text-gray-400 capitalize">{name}</span>
                    <span className={`font-semibold uppercase ${statusColor(value)}`}>{value}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {state.kind === 'unreachable' && (
            <div className="border-t border-gray-800 pt-4 text-red-400 text-sm">
              Could not reach the backend: {state.message}
            </div>
          )}

          {checkedAt && (
            <p className="text-gray-500 text-xs pt-2">
              Last checked at {checkedAt.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
