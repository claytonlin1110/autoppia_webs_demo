"use client";

import { useMemo, useState } from "react";
import { Copy, GitCompare, Save, Trash2 } from "lucide-react";

export type DiscordViewMode = "servers" | "dms";

export interface SavedView {
  id: string;
  name: string;
  createdAt: string;
  viewMode: DiscordViewMode;
  serverId: string | null;
  channelId: string | null;
  userId: string | null;
}

interface SavedViewsPanelProps {
  currentView: Omit<SavedView, "id" | "name" | "createdAt">;
  views: SavedView[];
  onSaveView: (name: string) => void;
  onApplyView: (view: SavedView) => void;
  onDeleteView: (id: string) => void;
  resolveServerName: (id: string | null) => string;
  resolveChannelName: (id: string | null) => string;
  resolveUserName: (id: string | null) => string;
}

function compareLine(label: string, left: string, right: string) {
  const isDifferent = left !== right;
  return (
    <div
      key={label}
      className={`grid grid-cols-[100px_1fr_1fr] gap-2 text-xs ${
        isDifferent ? "text-amber-300" : "text-zinc-400"
      }`}
    >
      <span className="font-medium">{label}</span>
      <span className="truncate">{left}</span>
      <span className="truncate">{right}</span>
    </div>
  );
}

export function SavedViewsPanel({
  currentView,
  views,
  onSaveView,
  onApplyView,
  onDeleteView,
  resolveServerName,
  resolveChannelName,
  resolveUserName,
}: SavedViewsPanelProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const compareViews = useMemo(
    () => views.filter((v) => compareIds.includes(v.id)).slice(0, 2),
    [views, compareIds],
  );

  const summary = useMemo(() => {
    if (currentView.viewMode === "dms") {
      return `DM: ${resolveUserName(currentView.userId)}`;
    }
    return `${resolveServerName(currentView.serverId)} / ${resolveChannelName(currentView.channelId)}`;
  }, [currentView, resolveServerName, resolveChannelName, resolveUserName]);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  return (
    <div className="absolute top-4 right-4 z-50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-2 rounded-md bg-zinc-900/90 text-zinc-200 border border-zinc-700 hover:bg-zinc-800 text-xs"
      >
        Saved Views
      </button>

      {open && (
        <div className="mt-2 w-[440px] max-h-[70vh] overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900/95 shadow-xl p-3 space-y-3">
          <div className="text-xs text-zinc-400">
            Current view: <span className="text-zinc-200">{summary}</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="View name (e.g. Moderation channel)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500"
            />
            <button
              type="button"
              onClick={() => {
                const finalName = name.trim() || "Saved view";
                onSaveView(finalName);
                setName("");
              }}
              className="px-3 py-2 rounded-md bg-indigo-600 text-white text-xs hover:bg-indigo-500 flex items-center gap-1"
            >
              <Save className="w-3 h-3" />
              Save
            </button>
          </div>

          <div className="space-y-2">
            {views.length === 0 ? (
              <p className="text-xs text-zinc-500">No saved views yet.</p>
            ) : (
              views.map((view) => {
                const description =
                  view.viewMode === "dms"
                    ? `DM: ${resolveUserName(view.userId)}`
                    : `${resolveServerName(view.serverId)} / ${resolveChannelName(view.channelId)}`;
                return (
                  <div
                    key={view.id}
                    className="rounded-md border border-zinc-700 bg-zinc-800/70 p-2 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs text-zinc-100 truncate">{view.name}</div>
                        <div className="text-[11px] text-zinc-400 truncate">
                          {description}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleCompare(view.id)}
                          className={`px-2 py-1 rounded text-[11px] border ${
                            compareIds.includes(view.id)
                              ? "border-amber-400 text-amber-300"
                              : "border-zinc-600 text-zinc-300"
                          }`}
                        >
                          <GitCompare className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onApplyView(view)}
                          className="px-2 py-1 rounded text-[11px] border border-zinc-600 text-zinc-100"
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteView(view.id)}
                          className="px-2 py-1 rounded text-[11px] border border-red-600 text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {compareViews.length === 2 && (
            <div className="rounded-md border border-zinc-700 bg-zinc-800/40 p-2 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-200">Compare Mode</p>
                <button
                  type="button"
                  className="text-xs text-zinc-300 flex items-center gap-1"
                  onClick={async () => {
                    const text = `Compare: ${compareViews[0].name} vs ${compareViews[1].name}`;
                    await navigator.clipboard.writeText(text);
                  }}
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>
              <div className="grid grid-cols-[100px_1fr_1fr] gap-2 text-[11px] text-zinc-500">
                <span />
                <span>{compareViews[0].name}</span>
                <span>{compareViews[1].name}</span>
              </div>
              {compareLine("Mode", compareViews[0].viewMode, compareViews[1].viewMode)}
              {compareLine(
                "Server",
                resolveServerName(compareViews[0].serverId),
                resolveServerName(compareViews[1].serverId),
              )}
              {compareLine(
                "Channel",
                resolveChannelName(compareViews[0].channelId),
                resolveChannelName(compareViews[1].channelId),
              )}
              {compareLine(
                "DM user",
                resolveUserName(compareViews[0].userId),
                resolveUserName(compareViews[1].userId),
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

