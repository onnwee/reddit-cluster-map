import { useEffect, useMemo, useState } from "react";

import type { TypeFilters } from "../types/ui";

type Physics = {
  chargeStrength: number;
  linkDistance: number;
  velocityDecay: number;
  cooldownTicks: number;
  collisionRadius: number;
};

type SubredditSize =
  | "subscribers"
  | "activeUsers"
  | "contentActivity"
  | "interSubLinks";

interface Props {
  filters: TypeFilters;
  onFiltersChange: (f: TypeFilters) => void;
  linkOpacity: number;
  onLinkOpacityChange: (v: number) => void;
  nodeRelSize: number;
  onNodeRelSizeChange: (v: number) => void;
  physics: Physics;
  onPhysicsChange: (p: Physics) => void;
  subredditSize: SubredditSize;
  onSubredditSizeChange: (m: SubredditSize) => void;
  onFocusNode: (id?: string) => void;
  showLabels?: boolean;
  onShowLabelsChange?: (v: boolean) => void;
  graphMode?: "3d" | "2d";
  onGraphModeChange?: (m: "3d" | "2d") => void;
  onShowDashboard?: () => void;
  onShowCommunities?: () => void;
  useCommunityColors?: boolean;
  onToggleCommunityColors?: (enabled: boolean) => void;
  usePrecomputedLayout?: boolean;
  onTogglePrecomputedLayout?: (enabled: boolean) => void;
}

export default function Controls(props: Props) {
  const {
    filters,
    onFiltersChange,
    linkOpacity,
    onLinkOpacityChange,
    nodeRelSize,
    onNodeRelSizeChange,
    physics,
    onPhysicsChange,
    subredditSize,
    onSubredditSizeChange,
    onFocusNode,
    showLabels,
    onShowLabelsChange,
    graphMode,
    onGraphModeChange,
    onShowDashboard,
    onShowCommunities,
    useCommunityColors,
    onToggleCommunityColors,
    usePrecomputedLayout,
    onTogglePrecomputedLayout,
  } = props;
  const [search, setSearch] = useState("");
  const [srv, setSrv] = useState<{
    crawler_enabled: boolean;
    precalc_enabled: boolean;
  } | null>(null);
  const [srvErr, setSrvErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  console.log(saving);
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = () => {
    const base = (import.meta.env?.VITE_API_URL || "/api").replace(/\/$/, "");
    fetch(`${base}/admin/services`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        setSrv(await r.json());
      })
      .catch((e) => setSrvErr(String(e)));
  };

  const updateSrv = async (
    patch: Partial<{ crawler_enabled: boolean; precalc_enabled: boolean }>
  ) => {
    try {
      setSaving(true);
      const base = (import.meta.env?.VITE_API_URL || "/api").replace(/\/$/, "");
      const r = await fetch(`${base}/admin/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setSrv(await r.json());
      setSrvErr(null);
    } catch (e) {
      setSrvErr(String(e));
    } finally {
      setSaving(false);
    }
  };

  // runPrecalcNow removed; precalc runs as its own service

  const onToggle = (key: keyof TypeFilters) =>
    onFiltersChange({ ...filters, [key]: !filters[key] });

  const info = useMemo(
    () =>
      [
        { key: "subreddit", color: "#4ade80" },
        { key: "user", color: "#60a5fa" },
        { key: "post", color: "#f59e0b" },
        { key: "comment", color: "#f43f5e" },
      ] as const,
    []
  );

  return (
    <div className="absolute z-20 top-2 right-2 bg-black/60 text-white p-3 rounded shadow flex flex-col gap-3">
      <div className="flex gap-2 items-center">
        <label className="text-xs">View:</label>
        <button
          className={`px-2 py-1 rounded border ${
            graphMode === "3d"
              ? "bg-blue-600 border-blue-400"
              : "bg-gray-700 border-gray-500"
          } text-white text-sm`}
          onClick={() => onGraphModeChange?.("3d")}
        >
          3D
        </button>
        <button
          className={`px-2 py-1 rounded border ${
            graphMode === "2d"
              ? "bg-blue-600 border-blue-400"
              : "bg-gray-700 border-gray-500"
          } text-white text-sm`}
          onClick={() => onGraphModeChange?.("2d")}
        >
          2D
        </button>
        <button
          className="px-2 py-1 rounded border bg-purple-600 border-purple-400 hover:bg-purple-700 text-white text-sm"
          onClick={() => onShowDashboard?.()}
        >
          Dashboard
        </button>
        <button
          className="px-2 py-1 rounded border bg-green-600 border-green-400 hover:bg-green-700 text-white text-sm"
          onClick={() => onShowCommunities?.()}
        >
          Communities
        </button>
      </div>
      {onToggleCommunityColors && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!useCommunityColors}
            onChange={(e) => onToggleCommunityColors?.(e.target.checked)}
          />
          Use community colors
        </label>
      )}
      {onTogglePrecomputedLayout && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!usePrecomputedLayout}
            onChange={(e) => onTogglePrecomputedLayout?.(e.target.checked)}
          />
          Use precomputed layout
        </label>
      )}
      <div className="text-xs text-white/70">Admin</div>
      <div className="flex items-center gap-3 text-sm">
        <button
          className={`px-3 py-1 rounded border ${
            srv?.crawler_enabled
              ? "bg-green-600 border-green-400"
              : "bg-gray-700 border-gray-500"
          } text-white font-semibold`}
          //disabled={!srv || saving}
          disabled={true}
          onClick={() => updateSrv({ crawler_enabled: !srv?.crawler_enabled })}
        >
          {srv?.crawler_enabled ? "Crawler ON" : "Crawler OFF"}
        </button>
        <button
          className={`px-3 py-1 rounded border ${
            srv?.precalc_enabled
              ? "bg-green-600 border-green-400"
              : "bg-gray-700 border-gray-500"
          } text-white font-semibold`}
          //   disabled={!srv || saving}
          disabled={true}
          onClick={() => updateSrv({ precalc_enabled: !srv?.precalc_enabled })}
        >
          {srv?.precalc_enabled ? "Precalc ON" : "Precalc OFF"}
        </button>
        {/* Precalc runs in its own service; run-now removed */}
        {srvErr && <span className="text-red-400 text-xs">{srvErr}</span>}
      </div>
      <div className="flex gap-2 items-center">
        <input
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          placeholder="Focus node by id/name"
          className="bg-black/40 border border-white/20 rounded px-2 py-1 text-sm outline-none"
        />
        <button
          className="border border-white/30 rounded px-2 py-1 hover:bg-white/10"
          onClick={() => onFocusNode(search || undefined)}
        >
          Focus
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!!showLabels}
          onChange={(e) => onShowLabelsChange?.(e.target.checked)}
        />
        Show labels
      </label>

      <div className="flex gap-3 items-center">
        <label className="text-sm">Link opacity</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={linkOpacity}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onLinkOpacityChange(parseFloat(e.target.value))
          }
        />
      </div>

      <div className="flex gap-3 items-center">
        <label className="text-sm">Node size</label>
        <input
          type="range"
          min={2}
          max={12}
          step={1}
          value={nodeRelSize}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onNodeRelSizeChange(parseInt(e.target.value))
          }
        />
      </div>

      {/* Subreddit sizing metric */}
      <div className="flex gap-3 items-center">
        <label className="text-sm whitespace-nowrap">Subreddit size</label>
        <select
          className="bg-black/40 border border-white/20 rounded px-2 py-1 text-sm outline-none"
          value={subredditSize}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onSubredditSizeChange(e.target.value as Props["subredditSize"])
          }
        >
          <option value="subscribers">Subscribers</option>
          <option value="activeUsers">Active users</option>
          <option value="contentActivity">Posts + comments</option>
          <option value="interSubLinks">Inter-sub links</option>
        </select>
      </div>

      {/* Physics: Repulsion (charge strength) */}
      <div className="flex gap-3 items-center">
        <label className="text-sm">Repulsion</label>
        <input
          type="range"
          min={-400}
          max={0}
          step={5}
          value={physics.chargeStrength}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onPhysicsChange({
              ...physics,
              chargeStrength: parseInt(e.target.value),
            })
          }
        />
        <span className="text-xs opacity-70 w-12 text-right">
          {physics.chargeStrength}
        </span>
      </div>

      {/* Physics: Link distance */}
      <div className="flex gap-3 items-center">
        <label className="text-sm">Link dist</label>
        <input
          type="range"
          min={10}
          max={200}
          step={5}
          value={physics.linkDistance}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onPhysicsChange({
              ...physics,
              linkDistance: parseInt(e.target.value),
            })
          }
        />
        <span className="text-xs opacity-70 w-12 text-right">
          {physics.linkDistance}
        </span>
      </div>

      {/* Physics: Velocity decay */}
      <div className="flex gap-3 items-center">
        <label className="text-sm">Damping</label>
        <input
          type="range"
          min={0.7}
          max={0.99}
          step={0.01}
          value={physics.velocityDecay}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onPhysicsChange({
              ...physics,
              velocityDecay: parseFloat(e.target.value),
            })
          }
        />
        <span className="text-xs opacity-70 w-12 text-right">
          {physics.velocityDecay.toFixed(2)}
        </span>
      </div>

      {/* Physics: Cooldown ticks */}
      <div className="flex gap-3 items-center">
        <label className="text-sm">Cooldown</label>
        <input
          type="range"
          min={0}
          max={400}
          step={10}
          value={physics.cooldownTicks}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onPhysicsChange({
              ...physics,
              cooldownTicks: parseInt(e.target.value),
            })
          }
        />
        <span className="text-xs opacity-70 w-12 text-right">
          {physics.cooldownTicks}
        </span>
      </div>

      {/* Physics: Collision radius (0 disables) */}
      <div className="flex gap-3 items-center">
        <label className="text-sm">Collision</label>
        <input
          type="range"
          min={0}
          max={20}
          step={0.5}
          value={physics.collisionRadius}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onPhysicsChange({
              ...physics,
              collisionRadius: parseFloat(e.target.value),
            })
          }
        />
        <span className="text-xs opacity-70 w-12 text-right">
          {physics.collisionRadius.toFixed(1)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        {info.map((i) => (
          <label key={i.key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters[i.key]}
              onChange={() => onToggle(i.key)}
            />
            <span className="inline-flex items-center gap-1">
              <span
                className="w-3 h-3 inline-block rounded"
                style={{ background: i.color }}
              />
              {i.key}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
