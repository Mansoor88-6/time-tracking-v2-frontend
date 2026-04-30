"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  getAgentInfo,
  downloadAgent,
  getMacAgentInfo,
  downloadMacAgent,
  type AgentInfo,
} from "@/services/agent";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BiDownload } from "react-icons/bi";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function AgentDownloadPage() {
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [macAgentInfo, setMacAgentInfo] = useState<AgentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [macDownloading, setMacDownloading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [agent, mac] = await Promise.all([
        getAgentInfo(),
        getMacAgentInfo(),
      ]);
      setAgentInfo(agent);
      setMacAgentInfo(mac);
      setLoading(false);
    };
    void load();
  }, []);

  const handleDownloadWindows = async () => {
    setDownloading(true);
    try {
      const ok = await downloadAgent();
      if (!ok) {
        toast.error("Windows agent is not available yet.");
      } else {
        toast.success("Download started.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadMac = async () => {
    setMacDownloading(true);
    try {
      const ok = await downloadMacAgent();
      if (!ok) {
        toast.error("Mac agent is not available yet.");
      } else {
        toast.success("Download started.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    } finally {
      setMacDownloading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="space-y-6">
        <PageHeader
          title="Download Agent"
          description="Install the time tracking desktop agent on your machine to record activity. Download the build for your operating system, run the installer or open the disk image, and sign in with your account to start tracking."
        />

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-2">
            Windows
          </h2>
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Checking for agent...
            </p>
          ) : agentInfo ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Current build: <strong>{agentInfo.filename}</strong> (
                {formatBytes(agentInfo.size)}), uploaded{" "}
                {formatDate(agentInfo.uploadedAt)}.
              </p>
              <button
                type="button"
                onClick={() => void handleDownloadWindows()}
                disabled={downloading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BiDownload className="w-5 h-5" />
                {downloading ? "Downloading..." : "Download for Windows"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Windows agent not available yet. Your admin will make it available
              soon.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-2">
            macOS
          </h2>
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Checking for Mac agent...
            </p>
          ) : macAgentInfo ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Current build: <strong>{macAgentInfo.filename}</strong> (
                {formatBytes(macAgentInfo.size)}), uploaded{" "}
                {formatDate(macAgentInfo.uploadedAt)}.
              </p>
              <button
                type="button"
                onClick={() => void handleDownloadMac()}
                disabled={macDownloading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BiDownload className="w-5 h-5" />
                {macDownloading ? "Downloading..." : "Download for macOS"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Mac agent not available yet. Your admin will make it available
              soon.
            </p>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
