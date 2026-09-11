import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  Check, 
  Sparkles, 
  ArrowUpRight, 
  History, 
  Plus, 
  ShieldCheck, 
  Zap, 
  RotateCcw, 
  Info 
} from 'lucide-react';
import { UserProfile, CreditTransaction } from '../types/index.js';
import { api } from '../services/api.js';

interface CreditsPageProps {
  user: UserProfile | null;
  onUserDataUpdated: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const CreditsPage: React.FC<CreditsPageProps> = ({
  user,
  onUserDataUpdated,
  onShowToast,
}) => {
  const [ledger, setLedger] = useState<CreditTransaction[]>([]);
  const [balance, setBalance] = useState<number>(user?.credits ?? 100);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLedger = async () => {
    try {
      const res = await api.getLedger();
      setBalance(res.balance);
      setLedger(res.ledger);
    } catch (err: any) {
      console.error('Failed to load ledger', err);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleTopup = async (plan: 'pro' | 'creator' | 'bonus') => {
    setIsLoading(true);
    try {
      const res = await api.topUpCredits(plan);
      onUserDataUpdated();
      fetchLedger();
      onShowToast(
        plan === 'bonus' 
          ? '+100 Demo Credits added!' 
          : `Upgraded to ${plan.toUpperCase()} Plan!`, 
        'success'
      );
    } catch (err: any) {
      onShowToast(err.message || 'Transaction failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free Starter',
      price: '$0',
      credits: '100 Credits',
      badge: 'Current Plan',
      features: [
        '100 Free Demo Credits',
        'Standard 720p/1080p Video Generation',
        'Single Shot Text to Video (10s)',
        'Standard Voice & Image Studio',
        'In-Memory Storage',
      ],
      cta: 'Active Plan',
      disabled: true,
      color: 'border-zinc-800 bg-[#11121c]'
    },
    {
      id: 'pro',
      name: 'Pro Filmmaker',
      price: '$29',
      period: '/ month',
      credits: '1,000 Credits',
      popular: true,
      features: [
        '1,000 High-Speed Monthly Credits',
        'Full 30s & 60s Long Scene Generator',
        '🔱 Complete Hindi Mythology Suite',
        '7-Angle Character Consistency Engine',
        'Multi-Track Storyboard & Timeline Editor',
        'Direct 1080p Master MP4 Exports',
      ],
      cta: 'Upgrade to Pro (+1,000 Credits)',
      color: 'border-indigo-500/50 bg-gradient-to-b from-[#15172b] to-[#0f101d] ring-1 ring-indigo-500/40'
    },
    {
      id: 'creator',
      name: 'Studio Creator',
      price: '$79',
      period: '/ month',
      credits: '3,500 Credits',
      features: [
        '3,500 Monthly Mega Credits',
        'Full 120s Multi-Shot Cinematic Pipelines',
        'Priority Concurrent Video Queue',
        'Unlimited Character Turnaround Models',
        'Dedicated Hindi & English Voiceover Cloning',
        'Custom LUTs & 4K Master Exports',
      ],
      cta: 'Upgrade to Studio (+3,500 Credits)',
      color: 'border-amber-500/40 bg-gradient-to-b from-[#1d1b15] to-[#111016]'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-cinematic">Credits & Plan Management</h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700/50">
              Server Ledger Verified
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            All AI computations strictly execute server-side. Transparent ledger prevents double deductions and guarantees automatic refunds on failed jobs.
          </p>
        </div>

        {/* Demo Fast Topup */}
        <button
          onClick={() => handleTopup('bonus')}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs transition-all shadow-md hover:scale-[1.02] disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Quick Top-Up (+100 Demo Credits)</span>
        </button>
      </div>

      {/* Current Balance Banner */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-[#1c1a14] via-[#14131e] to-[#0f0e17] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <Coins className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Available Credit Balance
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-bold text-white mt-0.5">
              {balance} <span className="text-sm font-normal text-zinc-400">Credits</span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Active Tier: <strong className="text-white uppercase">{user?.plan || 'Free'}</strong>
            </p>
          </div>
        </div>

        {/* Consumption Rule Card */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs space-y-1 sm:max-w-xs">
          <div className="font-semibold text-zinc-300 text-[11px] uppercase tracking-wider">
            Server Cost Model
          </div>
          <div className="text-[11px] text-zinc-400 space-y-0.5 font-mono">
            <div>• Video: 10 Credits / 10 Seconds</div>
            <div>• Long Scene: 30-120 Credits</div>
            <div>• Voice: 2 Credits | <span className="text-emerald-400 font-semibold">Image: 0 Credits (FREE)</span></div>
            <div>• 🔱 Mythology Suite: 25 Credits</div>
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white font-cinematic flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            Filmmaking Plans & Upgrades
          </h2>
          <span className="text-xs text-zinc-500">Test plan upgrades in demo mode</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between relative shadow-xl ${plan.color}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white">{plan.name}</h3>
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold text-white font-mono">{plan.price}</span>
                  {plan.period && <span className="text-xs text-zinc-400">{plan.period}</span>}
                </div>

                <div className="inline-block px-2.5 py-1 rounded-lg bg-white/10 text-amber-300 font-mono text-xs font-bold mb-4">
                  {plan.credits}
                </div>

                <ul className="space-y-2.5 text-xs text-zinc-300 border-t border-white/10 pt-4">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleTopup(plan.id as any)}
                  disabled={plan.disabled || isLoading}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    plan.disabled
                      ? 'bg-zinc-800/80 text-zinc-500 cursor-not-allowed'
                      : plan.popular
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-amber-500 hover:bg-amber-400 text-black shadow-md'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Credit Transactions Ledger */}
      <div className="rounded-2xl border border-zinc-800 bg-[#11121c] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white font-cinematic flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            Server Credit Ledger History
          </h2>
          <span className="text-[10px] text-zinc-500 font-mono">
            {ledger.length} Recorded Transactions
          </span>
        </div>

        {ledger.length === 0 ? (
          <p className="text-xs text-zinc-500 italic py-4 text-center">
            No transactions found on ledger yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {ledger.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                          tx.type === 'grant'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : tx.type === 'refund'
                              ? 'bg-sky-500/20 text-sky-300'
                              : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold">
                      <span className={tx.amount > 0 ? 'text-emerald-400' : 'text-zinc-300'}>
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-200">
                      {tx.description}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
