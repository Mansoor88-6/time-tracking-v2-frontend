import { apiClient, fetchWithAuth } from "@/lib/apiClient";

export interface AgentInfo {
  filename: string;
  size: number;
  uploadedAt: string;
}

function parseDownloadFilename(
  contentDisposition: string | null,
  fallback: string
): string {
  if (!contentDisposition) return fallback;
  const quoted = /filename="([^"]+)"/i.exec(contentDisposition);
  if (quoted?.[1]) return quoted[1];
  const unquoted = /filename=([^;\s]+)/i.exec(contentDisposition);
  if (unquoted?.[1]) return unquoted[1].replace(/^["']|["']$/g, "");
  return fallback;
}

export async function getAgentInfo(): Promise<AgentInfo | null> {
  try {
    const data = await apiClient<AgentInfo | null>("/agent/info");
    return data;
  } catch {
    return null;
  }
}

export async function uploadAgent(file: File): Promise<AgentInfo> {
  const formData = new FormData();
  formData.append("file", file);
  const data = await apiClient<AgentInfo>("/agent/upload", {
    method: "POST",
    body: formData,
  });
  return data;
}

const AGENT_FILENAME = "tracking-agent.exe";

/**
 * Download the Windows tracking agent executable. Uses authenticated fetch and triggers a file download.
 * @returns true if download started, false if agent not available (404)
 */
export async function downloadAgent(): Promise<boolean> {
  const response = await fetchWithAuth("/agent/download");
  if (response.status === 404) {
    return false;
  }
  if (!response.ok) {
    throw new Error("Failed to download agent");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = parseDownloadFilename(
    response.headers.get("Content-Disposition"),
    AGENT_FILENAME
  );
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

export async function getMacAgentInfo(): Promise<AgentInfo | null> {
  try {
    const data = await apiClient<AgentInfo | null>("/agent/mac/info");
    return data;
  } catch {
    return null;
  }
}

export async function uploadMacAgent(file: File): Promise<AgentInfo> {
  const formData = new FormData();
  formData.append("file", file);
  const data = await apiClient<AgentInfo>("/agent/mac/upload", {
    method: "POST",
    body: formData,
  });
  return data;
}

const MAC_FALLBACK_FILENAME = "tracking-agent-macos.zip";

/**
 * Download the Mac tracking agent (.dmg or .zip, depending on what was uploaded).
 * @returns true if download started, false if not available (404)
 */
export async function downloadMacAgent(): Promise<boolean> {
  const response = await fetchWithAuth("/agent/mac/download");
  if (response.status === 404) {
    return false;
  }
  if (!response.ok) {
    throw new Error("Failed to download Mac agent");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = parseDownloadFilename(
    response.headers.get("Content-Disposition"),
    MAC_FALLBACK_FILENAME
  );
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}
