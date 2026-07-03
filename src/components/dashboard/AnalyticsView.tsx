"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChefHat,
  Code,
  Code2,
  LineChart as LucideLineChart,
  Star,
  Terminal,
  TrendingDown,
  TrendingUp,
  Trophy,
  Loader2,
  AlertTriangle,
  Award,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { apiClient } from "../../shared/services/apiClient";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface HRBadge {
  name: string;
  rank: number;
  type: string;
  level: number;
  stars: number;
  points: number;
  solved: number;
  category: string | null;
  max_stars: number;
  max_points: number;
  total_challenges: number;
}

interface HackerRankData {
  badges: HRBadge[];
  best_rank: number;
  stars_earned: number;
  domains_count: number;
  points_earned: number;
  possible_stars: number;
  questions_solved: number;
  total_challenges: number;
  total_available_points: number;
  star_completion_percentage: number;
  points_completion_percentage: number;
}

interface CodeChefHistory {
  code: string;
  name: string;
  rank: string;
  color: string;
  getday: string;
  rating: string;
  reason: string | null;
  getyear: string;
  end_date: string;
  getmonth: string;
  penalised_in: string | null;
}

interface CodeChefData {
  name: string;
  stars: string;
  country: string;
  username: string;
  globalRank: string;
  countryRank: string;
  totalSolved: number;
  currentRating: number;
  ratingHistory: CodeChefHistory[];
}

interface LCContest {
  id: string;
  rating: number;
  contest: { title: string; start_time: number };
  ranking: number;
  attended: boolean;
  total_problems: number;
  problems_solved: number;
  trend_direction: "UP" | "DOWN";
  finish_time_seconds: number;
}

interface LCContestRanking {
  badge: null | string;
  rating: number;
  globalRanking: number;
  topPercentage: number;
  totalParticipants: number;
  attendedContestsCount: number;
}

interface LeetCodeBadge {
  id: string;
  icon: string;
  display_name: string;
  creation_date: string;
}

interface LeetCodeData {
  name: string;
  avatar: string;
  badges: LeetCodeBadge[];
  contest: { history: LCContest[]; ranking: LCContestRanking };
  username: string;
  star_rating: number;
  submit_stats: {
    All: { total: number; accepted: number };
    Easy: { total: number; accepted: number };
    Hard: { total: number; accepted: number };
    Medium: { total: number; accepted: number };
  };
  contributions: { points: number; questionCount: number; testcaseCount: number };
}

interface PlatformsMetadata {
  platforms: {
    github: Record<string, unknown>;
    codeforces: Record<string, unknown>;
    hackerrank: HackerRankData;
    codechef: CodeChefData;
    leetcode: LeetCodeData;
  };
}

// ─── API FETCH ────────────────────────────────────────────────────────────────

async function fetchPlatformsMetadata(): Promise<PlatformsMetadata> {
  const { data } = await apiClient.get<PlatformsMetadata>("/platforms-metadata/");
  return data;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function fmtDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Terminal-style glass card. */
const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`relative bg-[#1a1a1a]/50 border border-white/5 font-mono overflow-hidden ${className}`}
    style={{ animation: "fadeUp 0.4s ease both" }}
  >
    <span className="absolute top-2 left-2  text-white/20 text-[10px] leading-none select-none">+</span>
    <span className="absolute top-2 right-2 text-white/20 text-[10px] leading-none select-none">+</span>
    <span className="absolute bottom-2 left-2  text-white/20 text-[10px] leading-none select-none">+</span>
    <span className="absolute bottom-2 right-2 text-white/20 text-[10px] leading-none select-none">+</span>
    {children}
  </div>
);

/** Card terminal title bar. */
const TitleBar = ({ title }: { title: string }) => (
  <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-black/40">
    <span className="w-2 h-2 bg-white/20" />
    <span className="w-2 h-2 bg-white/20" />
    <span className="w-2 h-2 bg-white/20" />
    <span className="ml-2 text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold">
      {title}
    </span>
  </div>
);

/** Circular SVG progress ring (B&W). */
const Ring = ({ pct, label }: { pct: number; label: string }) => {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width="68" height="68" viewBox="0 0 68 68">
        <circle cx="34" cy="34" r={r} fill="none" stroke="#333" strokeWidth="5" />
        <circle
          cx="34" cy="34" r={r}
          fill="none"
          stroke="#fff"
          strokeWidth="5"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="square"
          transform="rotate(-90 34 34)"
          style={{ transition: "stroke-dashoffset 1s ease", filter: "drop-shadow(0 0 4px rgba(255,255,255,0.4))" }}
        />
        <text x="34" y="38" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#fff" fontFamily="monospace">
          {pct}%
        </text>
      </svg>
      <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 text-center">{label}</span>
    </div>
  );
};

/** Recharts shared tooltip. */
const ChartTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black border border-white/20 px-3 py-2 text-[10px] font-mono shadow-[0_0_12px_rgba(255,255,255,0.1)]">
      <div className="text-white/30 uppercase tracking-widest mb-1.5">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-6">
          <span className="text-white/50 uppercase tracking-wider">{p.name}</span>
          <span className="text-white font-bold">{typeof p.value === "number" ? Math.round(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── LOADING / ERROR STATES ───────────────────────────────────────────────────

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`bg-white/5 animate-pulse ${className}`} />
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export const AnalyticsView: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["platforms-metadata"],
    queryFn: fetchPlatformsMetadata,
    staleTime: 5 * 60 * 1000,
  });

  // Derived platform data
  const lc  = data?.platforms?.leetcode;
  const cc  = data?.platforms?.codechef;
  const hr  = data?.platforms?.hackerrank;

  // Build combined rating chart data (chronological, from real API data)
  const lcHistory = (lc?.contest?.history ?? [])
    .slice()
    .sort((a, b) => a.contest.start_time - b.contest.start_time);

  const ccHistory = (cc?.ratingHistory ?? [])
    .slice()
    .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());

  // Align to shorter series length for side-by-side chart
  const chartLen = Math.max(lcHistory.length, ccHistory.length);
  const chartData = Array.from({ length: chartLen }, (_, i) => ({
    idx: i + 1,
    leetcode: lcHistory[i] ? Math.round(lcHistory[i].rating) : undefined,
    codechef: ccHistory[i] ? parseInt(ccHistory[i].rating, 10) : undefined,
    lcLabel: lcHistory[i] ? fmtDate(lcHistory[i].contest.start_time) : "",
    ccLabel: ccHistory[i] ? ccHistory[i].name.replace("Starters ", "S") : "",
  }));

  // LeetCode submit stats rows
  const submitRows = lc
    ? [
        { label: "EASY",   ...lc.submit_stats.Easy   },
        { label: "MEDIUM", ...lc.submit_stats.Medium  },
        { label: "HARD",   ...lc.submit_stats.Hard    },
        { label: "TOTAL",  ...lc.submit_stats.All     },
      ]
    : [];

  return (
    <>
      {/* Global keyframes */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes barGrow {
          from { transform: scaleY(0); transform-origin: bottom; }
          to   { transform: scaleY(1); transform-origin: bottom; }
        }
        @keyframes scanline {
          0%   { background-position: 0 0;    }
          100% { background-position: 0 100%; }
        }
      `}</style>

      <div className="space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end pb-2 border-b border-[#2a2a2a]" style={{ animation: "fadeUp 0.3s ease both" }}>
          <div>
            <h1 className="font-bold text-4xl md:text-5xl tracking-tighter uppercase text-white mb-1">
              ANALYTICS
            </h1>
            <p className="text-[10px] tracking-[0.3em] text-zinc-400 uppercase font-bold">
              PLATFORM_METRICS // RATING_TRENDS // ACHIEVEMENTS
            </p>
          </div>
          <div className="mt-3 md:mt-0 text-[10px] tracking-[0.3em] text-zinc-500 uppercase">
            SYS_TIME: {new Date().toISOString().split('T')[1].slice(0, 8)} UTC
          </div>
        </header>

        {isLoading && (
          <div className="flex flex-col gap-4" style={{ animation: "fadeUp 0.3s ease both" }}>
            <div className="grid grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-[#1a1a1a]/50 border border-white/5 p-6 flex flex-col gap-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-32 w-full mt-2" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/30 mt-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading platform data...
            </div>
          </div>
        )}

        {isError && (
          <div className="border border-white/10 bg-white/5 p-6 flex items-center gap-3" style={{ animation: "fadeUp 0.3s ease both" }}>
            <AlertTriangle className="w-5 h-5 text-white/40" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">Connection Error</p>
              <p className="text-[10px] uppercase tracking-widest text-white/30 mt-0.5">
                Could not reach localhost:8000/platforms-metadata/
              </p>
            </div>
          </div>
        )}

        {data && (
          <>
            {/* ─────────────────────────────────────────────────────────────
                ROW 1: Rating Chart (left) + LeetCode Stats (right)
            ───────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-5 gap-6" style={{ animationDelay: "0.1s", animation: "fadeUp 0.4s ease both" }}>

              {/* Rating History — 3 cols wide */}
              <Card className="col-span-3">
                <TitleBar title="rating_history.chart" />
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white flex items-center gap-2">
                        <LucideLineChart className="w-4 h-4" /> Contest Rating Trend
                      </p>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 mt-0.5">
                        LeetCode ({lcHistory.length} contests) &amp; CodeChef ({ccHistory.length} contests)
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-[9px] uppercase tracking-[0.15em] text-white/40">
                      <span className="flex items-center gap-1.5">
                        <span className="inline-block w-5 h-px bg-white shadow-[0_0_4px_#fff]" />LC
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="inline-block w-5 h-px bg-white/35" style={{ borderTop: "2px dashed rgba(255,255,255,0.35)" }} />CC
                      </span>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                      <XAxis
                        dataKey="idx"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "rgba(255,255,255,0.25)", fontFamily: "monospace", fontSize: 9 }}
                        tickFormatter={(v) => `#${v}`}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "rgba(255,255,255,0.25)", fontFamily: "monospace", fontSize: 9 }}
                        domain={["auto", "auto"]}
                        width={50}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <ReferenceLine y={lc?.contest?.ranking?.rating} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="leetcode" name="leetcode" stroke="#fff"
                        strokeWidth={1.5}
                        connectNulls
                        dot={{ r: 2.5, fill: "#fff", stroke: "#000", strokeWidth: 1.5 }}
                        activeDot={{ r: 4, fill: "#fff", style: { filter: "drop-shadow(0 0 6px #fff)" } }}
                      />
                      <Line type="monotone" dataKey="codechef" name="codechef" stroke="rgba(255,255,255,0.35)"
                        strokeWidth={1.5}
                        strokeDasharray="4 3"
                        connectNulls
                        dot={{ r: 2.5, fill: "rgba(255,255,255,0.4)", stroke: "#000", strokeWidth: 1.5 }}
                        activeDot={{ r: 4, fill: "#fff" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  {/* Unified platform rankings */}
                  <div className="grid grid-cols-4 gap-2 border-t border-white/5 pt-4">
                    {/* LeetCode */}
                    <div className="bg-white/5 border border-white/5 p-2.5 flex flex-col gap-0.5">
                      <span className="text-[8px] uppercase tracking-[0.15em] text-white/25">LC Rating</span>
                      <span className="text-base font-bold text-white tracking-tighter">
                        {lc?.contest?.ranking?.rating ? Math.round(lc.contest.ranking.rating) : "—"}
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-2.5 flex flex-col gap-0.5">
                      <span className="text-[8px] uppercase tracking-[0.15em] text-white/25">LC Global</span>
                      <span className="text-base font-bold text-white tracking-tighter">
                        #{lc?.contest?.ranking?.globalRanking?.toLocaleString() ?? "—"}
                      </span>
                    </div>
                    {/* CodeChef */}
                    <div className="bg-white/5 border border-white/5 p-2.5 flex flex-col gap-0.5">
                      <span className="text-[8px] uppercase tracking-[0.15em] text-white/25">CC Rating</span>
                      <span className="text-base font-bold text-white tracking-tighter">
                        {cc?.currentRating ?? "—"}
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-2.5 flex flex-col gap-0.5">
                      <span className="text-[8px] uppercase tracking-[0.15em] text-white/25">CC Global</span>
                      <span className="text-base font-bold text-white tracking-tighter">
                        #{parseInt(cc?.globalRank ?? "0").toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-2.5 flex flex-col gap-0.5">
                      <span className="text-[8px] uppercase tracking-[0.15em] text-white/25">LC Top%</span>
                      <span className="text-base font-bold text-white tracking-tighter">
                        {lc?.contest?.ranking?.topPercentage?.toFixed(1) ?? "—"}%
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-2.5 flex flex-col gap-0.5">
                      <span className="text-[8px] uppercase tracking-[0.15em] text-white/25">LC Contests</span>
                      <span className="text-base font-bold text-white tracking-tighter">
                        {lc?.contest?.ranking?.attendedContestsCount ?? "—"}
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-2.5 flex flex-col gap-0.5">
                      <span className="text-[8px] uppercase tracking-[0.15em] text-white/25">CC Country</span>
                      <span className="text-base font-bold text-white tracking-tighter">
                        #{parseInt(cc?.countryRank ?? "0").toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-2.5 flex flex-col gap-0.5">
                      <span className="text-[8px] uppercase tracking-[0.15em] text-white/25">CC Stars</span>
                      <span className="text-base font-bold text-white tracking-tighter">
                        {cc?.stars ?? "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* LeetCode Submit Stats — 2 cols wide */}
              <Card className="col-span-2">
                <TitleBar title="leetcode.submit_stats" />
                <div className="p-5 flex flex-col gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4" /> Submit Breakdown
                    </p>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 mt-0.5">
                      Acceptance rate by difficulty
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {submitRows.map(({ label, total, accepted }) => {
                      const pct = total > 0 ? Math.round((accepted / total) * 100) : 0;
                      const opacity = label === "EASY" ? "0.9" : label === "MEDIUM" ? "0.6" : label === "HARD" ? "0.35" : "1";
                      return (
                        <div key={label} className="flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">{label}</span>
                            <span className="text-[9px] tracking-widest text-white/30">
                              {accepted}/{total}
                              <span className="ml-2 text-white font-bold">{pct}%</span>
                            </span>
                          </div>
                          <div className="w-full h-1 bg-white/5 border border-white/5">
                            <div
                              className="h-full transition-all duration-700"
                              style={{
                                width: `${pct}%`,
                                background: `rgba(255,255,255,${opacity})`,
                                boxShadow: `0 0 5px rgba(255,255,255,${opacity})`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                ROW 2: HackerRank (left) + CodeChef overview (right)
            ───────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-5 gap-6" style={{ animationDelay: "0.2s", animation: "fadeUp 0.4s ease both" }}>

              {/* HackerRank — 2 cols */}
              <Card className="col-span-2">
                <TitleBar title="hackerrank.proficiency" />
                <div className="p-5 flex flex-col gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white flex items-center gap-2">
                      <Terminal className="w-4 h-4" /> HackerRank
                    </p>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 mt-0.5">
                      {hr?.questions_solved ?? 0} solved · {hr?.domains_count ?? 0} domains · {hr?.stars_earned ?? 0}/{hr?.possible_stars ?? 0} stars
                    </p>
                  </div>

                  {/* Rings */}
                  <div className="flex justify-around py-2">
                    <Ring pct={Math.round(hr?.points_completion_percentage ?? 0)} label="Points" />
                    <Ring pct={Math.round(hr?.star_completion_percentage ?? 0)} label="Stars" />
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
                    {(hr?.badges ?? []).map((badge) => {
                      const starsFilled = badge.stars;
                      const starsMax = badge.max_stars;
                      return (
                        <div key={badge.name} className="bg-white/5 border border-white/5 p-3 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white">{badge.name}</span>
                            <span className="text-[8px] uppercase tracking-widest text-white/30">
                              Lvl {badge.level}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-white/40 tracking-widest">
                              {Array.from({ length: starsMax }, (_, i) => (
                                <span key={i} className={i < starsFilled ? "text-white" : "text-white/15"}>★</span>
                              ))}
                            </span>
                          </div>
                          <div className="flex justify-between text-[8px] uppercase tracking-widest text-white/30">
                            <span>{badge.solved}/{badge.total_challenges} solved</span>
                            <span>{badge.points}/{badge.max_points} pts</span>
                          </div>
                          {/* mini bar */}
                          <div className="w-full h-px bg-white/10">
                            <div className="h-full bg-white/60" style={{ width: `${(badge.points / badge.max_points) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>

              {/* CodeChef — 3 cols */}
              <Card className="col-span-3">
                <TitleBar title="codechef.overview" />
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white flex items-center gap-2">
                        <ChefHat className="w-4 h-4" /> CodeChef
                      </p>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 mt-0.5">
                        @{cc?.username} · {cc?.country} · {cc?.stars}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-white tracking-tighter">{cc?.currentRating}</span>
                      <p className="text-[8px] uppercase tracking-[0.2em] text-white/30">Rating</p>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Global Rank", value: parseInt(cc?.globalRank ?? "0").toLocaleString() },
                      { label: "Country Rank", value: parseInt(cc?.countryRank ?? "0").toLocaleString() },
                      { label: "Total Solved", value: cc?.totalSolved ?? 0 },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white/5 border border-white/5 p-3 flex flex-col gap-0.5">
                        <span className="text-[8px] uppercase tracking-[0.2em] text-white/30">{label}</span>
                        <span className="text-sm font-bold text-white tracking-tighter">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                ROW 3: Unified Badges — LeetCode + HackerRank
            ───────────────────────────────────────────────────────────── */}
            <div style={{ animationDelay: "0.3s", animation: "fadeUp 0.4s ease both" }}>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white flex items-center gap-2 mb-4">
                <Award className="w-4 h-4" /> Badges &amp; Achievements
              </h2>
              <div className="grid grid-cols-4 gap-4">

                {/* LeetCode badges */}
                {lc?.badges?.map((badge) => (
                  <Card key={badge.id}>
                    <div className="p-5 flex flex-col items-center gap-3 text-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={badge.icon}
                        alt={badge.display_name}
                        className="w-16 h-16 object-contain grayscale hover:grayscale-0 transition-all duration-500"
                        style={{ filter: "grayscale(1) brightness(1.2)", transition: "filter 0.4s ease" }}
                        onMouseEnter={(e) => (e.currentTarget.style.filter = "grayscale(0) brightness(1)")}
                        onMouseLeave={(e) => (e.currentTarget.style.filter = "grayscale(1) brightness(1.2)")}
                      />
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                          {badge.display_name}
                        </span>
                        <span className="text-[8px] uppercase tracking-widest text-white/30">
                          LeetCode · {badge.creation_date}
                        </span>
                      </div>
                      <div className="w-full h-px bg-white/10" />
                      <span className="text-[8px] uppercase tracking-widest text-white/20">Earned</span>
                    </div>
                  </Card>
                ))}

                {/* HackerRank badges */}
                {hr?.badges?.map((badge) => {
                  const ptsPct = Math.round((badge.points / badge.max_points) * 100);
                  return (
                    <Card key={badge.name}>
                      <div className="p-5 flex flex-col items-center gap-3 text-center">
                        {/* Icon placeholder — HackerRank has no hosted icon URL in API */}
                        <div className="w-16 h-16 border border-white/10 bg-white/5 flex items-center justify-center">
                          <Terminal className="w-7 h-7 text-white/60" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                            {badge.name}
                          </span>
                          <span className="text-[8px] uppercase tracking-widest text-white/30">
                            HackerRank · Lvl {badge.level}
                          </span>
                        </div>
                        {/* Stars */}
                        <div className="flex gap-0.5 text-sm">
                          {Array.from({ length: badge.max_stars }, (_, i) => (
                            <span
                              key={i}
                              className={i < badge.stars ? "text-white" : "text-white/15"}
                              style={i < badge.stars ? { textShadow: "0 0 6px rgba(255,255,255,0.6)" } : {}}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        {/* Points bar */}
                        <div className="w-full flex flex-col gap-1">
                          <div className="flex justify-between text-[8px] uppercase tracking-widest text-white/30">
                            <span>{badge.points} pts</span>
                            <span>{badge.max_points} max</span>
                          </div>
                          <div className="w-full h-1 bg-white/5 border border-white/5">
                            <div
                              className="h-full bg-white/70 transition-all duration-700"
                              style={{ width: `${ptsPct}%`, boxShadow: "0 0 4px rgba(255,255,255,0.4)" }}
                            />
                          </div>
                        </div>
                        <div className="w-full flex justify-between text-[8px] uppercase tracking-widest text-white/25">
                          <span>{badge.solved} solved</span>
                          <span>/{badge.total_challenges} total</span>
                        </div>
                      </div>
                    </Card>
                  );
                })}

              </div>
            </div>

          </>
        )}
      </div>
    </>
  );
};
