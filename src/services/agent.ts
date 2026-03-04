import { apiClient, fetchWithAuth } from "@/lib/apiClient";

export interface AgentInfo {
  filename: string;
  size: number;
  uploadedAt: string;
}

export interface ExtensionInfo {
  filename: string;
  size: number;
  uploadedAt: string;
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
 * Download the tracking agent executable. Uses authenticated fetch and triggers a file download.
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
  a.download = AGENT_FILENAME;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

export async function getExtensionInfo(): Promise<ExtensionInfo | null> {
  try {
    const data = await apiClient<ExtensionInfo | null>("/agent/extension/info");
    return data;
  } catch {
    return null;
  }
}

export async function uploadExtension(file: File): Promise<ExtensionInfo> {
  const formData = new FormData();
  formData.append("file", file);
  const data = await apiClient<ExtensionInfo>("/agent/extension/upload", {
    method: "POST",
    body: formData,
  });
  return data;
}

const EXTENSION_FILENAME = "browser-extension.zip";

/**
 * Download the browser extension zip. Uses authenticated fetch and triggers a file download.
 * @returns true if download started, false if extension not available (404)
 */
export async function downloadExtension(): Promise<boolean> {
  const response = await fetchWithAuth("/agent/extension/download");
  if (response.status === 404) {
    return false;
  }
  if (!response.ok) {
    throw new Error("Failed to download extension");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = EXTENSION_FILENAME;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}
