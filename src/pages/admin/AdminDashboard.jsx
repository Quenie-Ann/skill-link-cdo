import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../../components/common/NotificationBell';
import {
  Users, ClipboardList, AlertCircle, CheckCircle2,
  Sun, Moon, ArrowUpRight, TrendingUp, Zap, ChevronRight,
  Activity, Briefcase,
} from 'lucide-react';

// ── Inline bar chart component ──
function BarChart({ data }) {
  const [hovered, setHovered] = useState(null);
  const maxReq = Math.max(...data.map((d) => d.requests));

  return (
    <div className="h-48 flex items-end gap-3">
      {data.map((d, i) => (
        <div
          key={d.day}
          className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Tooltip */}
          {hovered === i && (
            <div className="absolute -translate-y-2 bg-skill-dark dark:bg-dark-bg text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl shadow-xl whitespace-nowrap z-10 pointer-events-none">
              {d.requests} requests · {d.completed} done
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-skill-dark dark:border-t-dark-bg" />
            </div>
          )}

          <div
            className="w-full relative flex flex-col justify-end rounded-t-xl overflow-hidden"
            style={{ height: '160px' }}
          >
            {/* Background track */}
            <div className="absolute inset-0 bg-skill-light dark:bg-dark-bg rounded-t-xl" />

            {/* Requests bar */}
            <div
              className="absolute bottom-0 w-full bg-skill-primary/20 dark:bg-skill-primary/10 rounded-t-xl transition-all duration-500"
              style={{ height: `${(d.requests / maxReq) * 100}%` }}
            />

            {/* Completed bar */}
            <div
              className={`absolute bottom-0 w-full rounded-t-xl transition-all duration-500 ${
                hovered === i ? 'bg-skill-dark dark:bg-skill-primary' : 'bg-skill-primary'
              } shadow-lg shadow-skill-primary/20`}
              style={{ height: `${(d.completed / maxReq) * 100}%` }}
            />
          </div>

          <span className="text-[10px] font-bold text-gray-400 uppercase">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [counts,         setCounts]         = useState({ workers: 0, pending: 0, requests: 0, completed: 0 });
  const [weeklyData,     setWeeklyData]     = useState([]);
  const [skillBreakdown, setSkillBreakdown] = useState([]);
  const [matchLogs,      setMatchLogs]      = useState([]);
  const [activityFeed,   setActivityFeed]   = useState([]);
  const [error,          setError]          = useState(null);
  const [expandedLog,    setExpandedLog]    = useState(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [stats, weekly, skills, logs, feed] = await Promise.all([
          api.getStats(),
          api.getWeeklyStats(),
          api.getSkillBreakdown(),
          api.getMatchLogs(),
          api.getActivityFeed(),
        ]);
        setCounts(stats);
        setWeeklyData(weekly);
        setSkillBreakdown(skills);
        setMatchLogs(logs);
        setActivityFeed(feed);
      } catch (err) {
        setError('Could not load dashboard data.');
      }
    }
    fetchAll();
  }, []);

  const completionRate = counts.requests > 0
    ? Math.round((counts.completed / counts.requests) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-skill-light dark:bg-dark-bg transition-colors duration-300">

      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-30 w-full bg-white dark:bg-dark-card border-b border-skill-primary/10 dark:border-white/5 shadow-sm px-8 py-4">
        <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-xl font-bold text-skill-dark dark:text-skill-primary">
              Admin Dashboard
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-skill-primary font-bold opacity-70">
              Barangay Overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={toggleDarkMode}
              className="p-2.5 bg-skill-light dark:bg-dark-bg rounded-xl text-skill-dark dark:text-skill-primary border border-skill-primary/10 hover:border-skill-primary transition-all"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto space-y-8">

        {/* ── Error Banner ── */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* ── ROW 1: KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

          {/* Hero — Total Workers */}
          <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-skill-dark to-[#064e3b] rounded-xl p-7 text-white relative overflow-hidden shadow-xl shadow-skill-dark/25">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <div className="p-2.5 bg-white/10 rounded-xl">
                  <Users size={20} className="text-skill-primary" />
                </div>
                <ArrowUpRight size={18} className="text-skill-primary opacity-60" />
              </div>
              <p className="text-skill-light/50 text-[10px] font-bold uppercase tracking-widest mb-1">
                Total Workers
              </p>
              <h2 className="text-4xl font-black mb-3">{counts.workers}</h2>
              <div className="flex items-center gap-2 text-[10px] font-bold text-skill-primary">
                <CheckCircle2 size={11} />
                {counts.workers - counts.pending} verified active
              </div>
            </div>
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-skill-primary/10 rounded-full blur-2xl" />
          </div>

          {/* Pending Verification */}
          <div className="bg-white dark:bg-dark-card rounded-xl p-7 shadow-sm border border-skill-primary/5 dark:border-white/5">
            <div className="flex items-center justify-between mb-5">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <AlertCircle size={20} className="text-amber-500" />
              </div>
              {counts.pending > 0 && (
                <span className="text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full font-black uppercase tracking-widest">
                  Needs Review
                </span>
              )}
            </div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">
              Pending
            </p>
            <h3 className="text-4xl font-black text-skill-dark dark:text-white">{counts.pending}</h3>
          </div>

          {/* Total Requests */}
          <div className="bg-white dark:bg-dark-card rounded-xl p-7 shadow-sm border border-skill-primary/5 dark:border-white/5">
            <div className="flex items-center justify-between mb-5">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <ClipboardList size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">
              Total Requests
            </p>
            <h3 className="text-4xl font-black text-skill-dark dark:text-white">{counts.requests}</h3>
          </div>

          {/* Completion Rate */}
          <div className="bg-white dark:bg-dark-card rounded-xl p-7 shadow-sm border border-skill-primary/5 dark:border-white/5">
            <div className="flex items-center justify-between mb-5">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <TrendingUp size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-[9px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full font-black">
                This week
              </span>
            </div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">
              Completion Rate
            </p>
            <h3 className="text-4xl font-black text-skill-dark dark:text-white">
              {completionRate}<span className="text-xl font-bold text-gray-300">%</span>
            </h3>
          </div>

        </div>

        {/* ── ROW 2: Chart + Skill Breakdown ── */}
        <div className="grid grid-cols-12 gap-5">

          {/* Weekly Volume Chart */}
          <div className="col-span-12 lg:col-span-8 bg-white dark:bg-dark-card rounded-xl p-8 shadow-sm border border-skill-primary/5 dark:border-white/5 relative">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="font-bold text-skill-dark dark:text-white text-lg">
                  Weekly Service Volume
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Requests vs. completed jobs this week
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <span className="w-3 h-3 rounded-sm bg-skill-primary/20 inline-block" />
                  Requests
                </span>
                <span className="flex items-center gap-1.5 text-skill-primary">
                  <span className="w-3 h-3 rounded-sm bg-skill-primary inline-block" />
                  Completed
                </span>
              </div>
            </div>
            <BarChart data={weeklyData} />
          </div>

          {/* Skill Category Breakdown */}
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-dark-card rounded-xl p-8 shadow-sm border border-skill-primary/5 dark:border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-skill-dark dark:text-white text-lg">
                  Service Mix
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">By category this month</p>
              </div>
              <Briefcase size={18} className="text-skill-primary opacity-50" />
            </div>
            <div className="space-y-4">
              {skillBreakdown.map(({ label, count, pct, color }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-skill-dark dark:text-white">{label}</span>
                    <span className="text-[10px] font-black text-gray-400">{count}</span>
                  </div>
                  <div className="h-2 bg-skill-light dark:bg-dark-bg rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── ROW 3: ML Match Log + Live Activity ── */}
        <div className="grid grid-cols-12 gap-5">

          {/* ML Match Reasoning Log — FR-ML-06 */}
          <div className="col-span-12 lg:col-span-8 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-skill-primary/5 dark:border-white/5 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-skill-dark dark:text-white flex items-center gap-2">
                  <Zap size={16} className="text-skill-primary" />
                  ML Match Log
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest font-bold">
                  Top-3 candidates per request
                </p>
              </div>
              <button className="flex items-center gap-1.5 text-xs font-bold text-skill-primary hover:text-emerald-600 transition-colors">
                View All <ChevronRight size={13} />
              </button>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {matchLogs.map((log) => (
                <div key={log.id} className="px-8 py-5">

                  {/* Log header */}
                  <div
                    className="flex items-center justify-between cursor-pointer group"
                    onClick={() =>
                      setExpandedLog(expandedLog === log.id ? null : log.id)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-skill-primary/10 rounded-xl">
                        <Zap size={14} className="text-skill-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-gray-400 uppercase">
                            {log.requestId}
                          </span>
                          <span className="text-[9px] bg-skill-light dark:bg-dark-bg text-skill-primary px-2 py-0.5 rounded-full font-bold">
                            {log.service}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-skill-dark dark:text-white mt-0.5">
                          {log.resident}
                          <span className="text-gray-400 font-normal"> → </span>
                          <span className="text-skill-primary">{log.topMatch.name}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-400">{log.assignedAt}</span>
                      <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-xl">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {log.topMatch.score}%
                        </span>
                      </div>
                      <ChevronRight
                        size={14}
                        className={`text-gray-300 transition-transform ${
                          expandedLog === log.id ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded: top-3 candidates */}
                  {expandedLog === log.id && (
                    <div className="mt-4 space-y-2 pl-11">
                      {log.candidates.map((c, idx) => (
                        <div
                          key={c.name}
                          className="flex items-center gap-3"
                        >
                          <span className={`text-[10px] font-black w-5 text-center ${
                            idx === 0 ? 'text-skill-primary' : 'text-gray-300'
                          }`}>
                            #{idx + 1}
                          </span>
                          <div className="flex-1 flex items-center gap-3">
                            <span className={`text-xs font-bold ${
                              idx === 0
                                ? 'text-skill-dark dark:text-white'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {c.name}
                            </span>
                            <div className="flex-1 h-1.5 bg-skill-light dark:bg-dark-bg rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  idx === 0 ? 'bg-skill-primary' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                                style={{ width: `${c.score}%` }}
                              />
                            </div>
                            <span className={`text-[10px] font-black min-w-[32px] text-right ${
                              idx === 0 ? 'text-skill-primary' : 'text-gray-400'
                            }`}>
                              {c.score}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-dark-card rounded-xl p-6 shadow-sm border border-skill-primary/5 dark:border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-skill-dark dark:text-white flex items-center gap-2">
                  <Activity size={16} className="text-skill-primary" />
                  Live Feed
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Recent system events</p>
              </div>
              {/* Pulsing live dot */}
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75" />
                <span className="text-[10px] font-bold text-emerald-500">Live</span>
              </div>
            </div>

            <div className="space-y-1">
              {activityFeed.map(({ id, icon: Icon, bg, color, title, sub, time }) => (
                <div
                  key={id}
                  className="flex items-center gap-3 p-3 hover:bg-skill-light dark:hover:bg-dark-bg rounded-lg transition-colors group cursor-pointer"
                >
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${bg} transition-transform group-hover:scale-105`}>
                    <Icon size={14} className={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-skill-dark dark:text-white truncate">{title}</p>
                    <p className="text-[10px] text-gray-400 truncate">{sub}</p>
                  </div>
                  <p className="text-[9px] text-gray-300 dark:text-gray-600 font-bold flex-shrink-0">{time}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
