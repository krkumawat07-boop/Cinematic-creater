import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Film, 
  Video, 
  Coins, 
  AlertCircle, 
  CheckCircle2, 
  Cpu, 
  History, 
  RefreshCw,
  Loader2
} from 'lucide-react';
import { api } from '../services/api.js';

interface AdminHubPageProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminHubPage: React.FC<AdminHubPageProps> = ({ onShowToast }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminMetrics();
      setMetrics(data);
    } catch (err: any) {
      onShowToast('Failed to load metrics: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center p-12 text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-cinematic">Admin & Platform Hub</h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50">
              System Telemetry
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Global metrics, server-side credit ledger tracking, and AI provider health.
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
          title="Refresh metrics"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 5 Big KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-[#11121c] p-4 space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] uppercase font-bold">Total Users</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{metrics.totalUsers}</div>
          <span className="text-[10px] text-zinc-500">Active Filmmakers</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-[#11121c] p-4 space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] uppercase font-bold">Film Projects</span>
            <Film className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{metrics.totalProjects}</div>
          <span className="text-[10px] text-zinc-500">Productions Created</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-[#11121c] p-4 space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] uppercase font-bold">Generations</span>
            <Video className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{metrics.totalGenerations}</div>
          <span className="text-[10px] text-zinc-500">Video & Image Jobs</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-[#11121c] p-4 space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] uppercase font-bold">Credits Consumed</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">{metrics.creditsConsumed}</div>
          <span className="text-[10px] text-zinc-500">Burned Server-Side</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-[#11121c] p-4 space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] uppercase font-bold">Failed Jobs</span>
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{metrics.failedJobs}</div>
          <span className="text-[10px] text-emerald-400">100% Refunded</span>
        </div>
      </div>

      {/* Provider Status Table */}
      <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-5 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          AI Provider Engine Diagnostics
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Provider Name</th>
                <th className="py-2.5 px-3">Modality</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {metrics.providers.map((p: any, i: number) => (
                <tr key={i} className="hover:bg-zinc-900/40">
                  <td className="py-2.5 px-3 font-semibold text-white">{p.name}</td>
                  <td className="py-2.5 px-3 text-zinc-300">{p.type}</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      {p.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-400">
                    {p.isMock ? 'Mock / Demo Provider' : 'Direct API'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Generations Live Log */}
      <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-5 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-purple-400" />
          Recent Platform Generations
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Job ID</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Provider</th>
                <th className="py-2.5 px-3">Progress</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {metrics.recentJobs.map((j: any) => (
                <tr key={j.id} className="hover:bg-zinc-900/40">
                  <td className="py-2.5 px-3 font-mono text-zinc-400 text-[11px]">{j.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-white capitalize">{j.type}</td>
                  <td className="py-2.5 px-3 text-zinc-400 font-mono text-[11px]">{j.provider}</td>
                  <td className="py-2.5 px-3 font-mono text-zinc-300">{j.progress}%</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      j.status === 'COMPLETED' 
                        ? 'bg-emerald-500/20 text-emerald-300' 
                        : j.status === 'FAILED'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {j.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
