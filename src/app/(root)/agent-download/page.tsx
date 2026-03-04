"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  getAgentInfo,
  downloadAgent,
  getExtensionInfo,
  downloadExtension,
  type AgentInfo,
  type ExtensionInfo,
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
  const [extensionInfo, setExtensionInfo] = useState<ExtensionInfo | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [extensionDownloading, setExtensionDownloading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [agent, extension] = await Promise.all([
        getAgentInfo(),
        getExtensionInfo(),
      ]);
      setAgentInfo(agent);
      setExtensionInfo(extension);
      setLoading(false);
    };
    void load();
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const ok = await downloadAgent();
      if (!ok) {
        toast.error("Tracking agent is not available yet.");
      } else {
        toast.success("Download started.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const handleExtensionDownload = async () => {
    setExtensionDownloading(true);
    try {
      const ok = await downloadExtension();
      if (!ok) {
        toast.error("Browser extension is not available yet.");
      } else {
        toast.success("Download started.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    } finally {
      setExtensionDownloading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="space-y-6">
        <PageHeader
          title="Download Agent"
          description="Install the time tracking agent on your machine to record activity. Run the installer and sign in with your account to start tracking."
        />

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
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
                onClick={() => void handleDownload()}
                disabled={downloading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BiDownload className="w-5 h-5" />
                {downloading ? "Downloading..." : "Download"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Agent not available yet. Your admin will make it available soon.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-2">
            Browser Extension
          </h2>
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Checking for extension...
            </p>
          ) : extensionInfo ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Current build: <strong>{extensionInfo.filename}</strong> (
                {formatBytes(extensionInfo.size)}), uploaded{" "}
                {formatDate(extensionInfo.uploadedAt)}.
              </p>
              <button
                type="button"
                onClick={() => void handleExtensionDownload()}
                disabled={extensionDownloading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BiDownload className="w-5 h-5" />
                {extensionDownloading ? "Downloading..." : "Download"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Extension not available yet. Your admin will make it available
              soon.
            </p>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
