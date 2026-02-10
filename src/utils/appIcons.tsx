import { FiGlobe, FiFolder, FiTerminal } from "react-icons/fi";
import { MdCode, MdWeb } from "react-icons/md";
import { ReactNode } from "react";

/**
 * Get appropriate icon for an application based on its name and type
 */
export function getAppIcon(
  appName: string,
  appType: "desktop" | "web"
): ReactNode {
  const normalizedName = appName.toLowerCase();

  // Desktop applications
  if (appType === "desktop") {
    // Code editors and IDEs
    if (
      normalizedName.includes("cursor") ||
      normalizedName.includes("code") ||
      normalizedName.includes("vscode") ||
      normalizedName.includes("visual studio") ||
      normalizedName.includes("intellij") ||
      normalizedName.includes("webstorm") ||
      normalizedName.includes("pycharm") ||
      normalizedName.includes("android studio") ||
      normalizedName.includes("xcode") ||
      normalizedName.includes("sublime") ||
      normalizedName.includes("atom") ||
      normalizedName.includes("vim") ||
      normalizedName.includes("neovim") ||
      normalizedName.includes("emacs")
    ) {
      return <MdCode className="w-5 h-5 text-blue-600" />;
    }

    // Terminals
    if (
      normalizedName.includes("terminal") ||
      normalizedName.includes("powershell") ||
      normalizedName.includes("cmd") ||
      normalizedName.includes("iterm") ||
      normalizedName.includes("bash") ||
      normalizedName.includes("zsh")
    ) {
      return <FiTerminal className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }

    // File managers
    if (
      normalizedName.includes("explorer") ||
      normalizedName.includes("finder") ||
      normalizedName.includes("file manager")
    ) {
      return <FiFolder className="w-5 h-5 text-blue-500" />;
    }

    // Browsers
    if (
      normalizedName.includes("chrome") ||
      normalizedName.includes("firefox") ||
      normalizedName.includes("safari") ||
      normalizedName.includes("edge") ||
      normalizedName.includes("opera") ||
      normalizedName.includes("brave")
    ) {
      return <MdWeb className="w-5 h-5 text-blue-500" />;
    }

    // Database tools
    if (
      normalizedName.includes("dbeaver") ||
      normalizedName.includes("datagrip") ||
      normalizedName.includes("mysql") ||
      normalizedName.includes("postgres") ||
      normalizedName.includes("mongodb")
    ) {
      return <MdCode className="w-5 h-5 text-yellow-600" />;
    }
  }

  // Web applications - check domain
  if (appType === "web") {
    // Development platforms
    if (
      normalizedName.includes("github") ||
      normalizedName.includes("gitlab") ||
      normalizedName.includes("bitbucket") ||
      normalizedName.includes("stackoverflow") ||
      normalizedName.includes("stackexchange") ||
      normalizedName.includes("dev.to")
    ) {
      return <MdCode className="w-5 h-5 text-blue-600" />;
    }

    // Documentation sites
    if (
      normalizedName.includes("docs") ||
      normalizedName.includes("wiki") ||
      normalizedName.includes("mdn") ||
      normalizedName.includes("developer.mozilla")
    ) {
      return <MdCode className="w-5 h-5 text-blue-600" />;
    }

    // Cloud platforms
    if (
      normalizedName.includes("aws") ||
      normalizedName.includes("azure") ||
      normalizedName.includes("gcp") ||
      normalizedName.includes("cloud.google") ||
      normalizedName.includes("digitalocean") ||
      normalizedName.includes("heroku") ||
      normalizedName.includes("vercel") ||
      normalizedName.includes("netlify")
    ) {
      return <MdWeb className="w-5 h-5 text-blue-500" />;
    }

    // Package registries
    if (
      normalizedName.includes("npm") ||
      normalizedName.includes("pypi") ||
      normalizedName.includes("maven") ||
      normalizedName.includes("nuget") ||
      normalizedName.includes("docker")
    ) {
      return <MdCode className="w-5 h-5 text-blue-600" />;
    }

    // Social/Entertainment (unproductive)
    if (
      normalizedName.includes("facebook") ||
      normalizedName.includes("twitter") ||
      normalizedName.includes("instagram") ||
      normalizedName.includes("youtube") ||
      normalizedName.includes("netflix") ||
      normalizedName.includes("reddit") ||
      normalizedName.includes("tiktok")
    ) {
      return <MdWeb className="w-5 h-5 text-pink-500" />;
    }
  }

  // Default icon
  return <FiGlobe className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
}
