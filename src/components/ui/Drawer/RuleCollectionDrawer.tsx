"use client";

import React, { useState, useMemo, useEffect } from "react";
import Drawer from "./Drawer";
import { cn } from "@/utils/tw";
import { 
  getPrimaryButtonStyle, 
  getCategoryStylesUtil 
} from "@/theme";
import { BiX, BiCheck, BiSearch } from "react-icons/bi";
import { RuleType, SuggestedApp } from "@/lib/api/rule-collections";
import { AppType, AppCategory } from "@/lib/api/productivity-rules";
import { Team } from "@/lib/api/teams";

interface SelectedRule {
  tempId?: string; // For bulk selection tracking
  appName: string;
  appType: AppType;
  category: AppCategory;
  ruleType?: RuleType;
  pattern?: string;
  suggestedCategory?: AppCategory;
}

interface RuleCollectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  isLoading?: boolean;
  teams: Team[];
  suggestedApps: { desktop: SuggestedApp[]; web: SuggestedApp[] } | null;
  selectedRules: SelectedRule[];
  setSelectedRules: React.Dispatch<React.SetStateAction<SelectedRule[]>>;
  selectedAppType: AppType | "all";
  setSelectedAppType: React.Dispatch<React.SetStateAction<AppType | "all">>;
  bulkCategory: AppCategory;
  setBulkCategory: React.Dispatch<React.SetStateAction<AppCategory>>;
  applyBulkCategory: () => void;
  toggleRuleSelection: (rule: SuggestedApp) => void;
  updateRuleCategory: (appName: string, appType: AppType, category: AppCategory) => void;
  updateRuleType: (appName: string, appType: AppType, ruleType: RuleType) => void;
  updateRulePattern: (appName: string, appType: AppType, pattern: string) => void;
  register: ReturnType<typeof import("react-hook-form").useForm>["register"];
  errors: ReturnType<typeof import("react-hook-form").useForm>["formState"]["errors"];
  customInputRef: React.RefObject<HTMLInputElement>;
  mode?: "create" | "edit";
  initialCollection?: {
    id: number;
    name: string;
    description?: string | null;
    teamIds?: number[];
    rules?: Array<{
      id?: number;
      appName: string;
      appType: AppType;
      category: AppCategory;
      ruleType?: RuleType;
      pattern?: string | null;
    }>;
  } | null;
}

// Section Header Component
const SectionHeader: React.FC<{
  number: number;
  title: string;
  description: string;
}> = ({ number, title, description }) => {
  return (
    <div className="mb-6 animate-fade-in-up" style={{ animationDelay: `${number * 0.1}s` }}>
      <div className="flex items-center gap-4 mb-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          "bg-gradient-to-br from-primary to-primary-dark",
          "text-white font-bold text-lg shadow-lg",
          "shadow-primary/30"
        )}>
          {number}
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {title}
        </h3>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 ml-14">
        {description}
      </p>
    </div>
  );
};

// App Selection Top Bar Component
const AppSelectionTopBar: React.FC<{
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedAppType: AppType | "all";
  setSelectedAppType: React.Dispatch<React.SetStateAction<AppType | "all">>;
  customInput: string;
  setCustomInput: (value: string) => void;
  onAddCustom: () => void;
}> = ({ searchTerm, setSearchTerm, selectedAppType, setSelectedAppType, customInput, setCustomInput, onAddCustom }) => {
  const tabs = [
    { value: "all" as const, label: "All" },
    { value: "desktop" as const, label: "Desktop" },
    { value: "web" as const, label: "Web" },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filter Row */}
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <BiSearch className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            className={cn(
              "block w-full pl-10 pr-3 py-2.5 rounded-lg text-sm",
              "bg-slate-50 dark:bg-slate-800",
              "border border-slate-200 dark:border-slate-700",
              "text-slate-900 dark:text-slate-100",
              "placeholder-slate-400",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
              "transition-all"
            )}
            placeholder="Search suggested apps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSelectedAppType(tab.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all",
                selectedAppType === tab.value
                  ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Input */}
      <div>
        <input
          type="text"
          className={cn(
            "w-full px-4 py-2.5 rounded-lg text-sm",
            "bg-slate-50 dark:bg-slate-800",
            "border border-slate-200 dark:border-slate-700",
            "text-slate-900 dark:text-slate-100",
            "placeholder-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
            "transition-all"
          )}
          placeholder="Add custom URL or Domain (e.g. github.com/user/*). Press Enter to add."
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && customInput.trim()) {
              onAddCustom();
            }
          }}
        />
      </div>
    </div>
  );
};

// Simplified App List Item Component
const AppListItem: React.FC<{
  app: SuggestedApp;
  isSelected: boolean;
  onToggle: () => void;
}> = ({ app, isSelected, onToggle }) => {
  const categoryStyles = getCategoryStylesUtil(app.suggestedCategory);
  
  return (
    <div
      onClick={onToggle}
      className={cn(
        "group flex items-center gap-4 px-6 py-3 cursor-pointer transition-colors",
        isSelected
          ? "bg-primary/5 dark:bg-primary/10"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
      )}
    >
      <div className={cn(
        "w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0",
        isSelected
          ? "bg-primary border-primary"
          : "border-slate-300 dark:border-slate-700 group-hover:border-primary/50"
      )}>
        {isSelected && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <div className="flex-1 flex items-center justify-between min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-slate-400 flex-shrink-0">
            {app.appType === "desktop" ? "💻" : "🌐"}
          </span>
          <span className={cn(
            "text-sm font-medium truncate",
            isSelected
              ? "text-primary dark:text-primary-light"
              : "text-slate-700 dark:text-slate-300"
          )}>
            {app.appName}
          </span>
        </div>
        <span className={cn(
          "px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide flex-shrink-0 ml-2",
          categoryStyles.badge
        )}>
          {app.suggestedCategory}
        </span>
      </div>
    </div>
  );
};

// Bulk Actions Bar Component (Enhanced)
const BulkActionsBar: React.FC<{
  bulkSelectionCount: number;
  onClear: () => void;
  onApplyCategory: (category: AppCategory) => void;
}> = ({ bulkSelectionCount, onClear, onApplyCategory }) => {
  if (bulkSelectionCount === 0) return null;

  return (
    <div className="sticky bottom-0 bg-primary text-white px-6 py-3 flex items-center justify-between shadow-lg z-10">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="bg-white/20 px-2 py-0.5 rounded">{bulkSelectionCount}</span>
        <span>Selected for bulk action</span>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClear}
          className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors"
        >
          Clear
        </button>
        <div className="flex gap-1">
          {(["productive", "unproductive", "neutral"] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onApplyCategory(cat)}
              className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-semibold capitalize transition-colors"
            >
              Set {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Rule Configuration Card Component
const RuleConfigurationCard: React.FC<{
  rule: SelectedRule;
  isBulkSelected: boolean;
  onBulkToggle: () => void;
  onCategoryChange: (category: AppCategory) => void;
  onRuleTypeChange?: (ruleType: RuleType) => void;
  onPatternChange?: (pattern: string) => void;
  onRemove: () => void;
}> = ({
  rule,
  isBulkSelected,
  onBulkToggle,
  onCategoryChange,
  onRuleTypeChange,
  onPatternChange,
  onRemove,
}) => {
  return (
    <div className={cn(
      "p-4 rounded-lg border-2 transition-all",
      isBulkSelected
        ? "ring-2 ring-primary border-primary"
        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
    )}>
      <div className="flex flex-col gap-4">
        {/* Top Row: Bulk Checkbox, App Info, Category, Remove */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={isBulkSelected}
              onChange={onBulkToggle}
              className={cn(
                "w-4 h-4 rounded border-slate-300 text-primary",
                "focus:ring-primary focus:ring-2"
              )}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">
                  {rule.appType === "desktop" ? "💻" : "🌐"}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {rule.appName}
                </span>
              </div>
              {rule.suggestedCategory && (
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">
                  Suggested: {rule.suggestedCategory}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={rule.category}
              onChange={(e) => onCategoryChange(e.target.value as AppCategory)}
              className={cn(
                "bg-slate-50 dark:bg-slate-800",
                "border border-slate-200 dark:border-slate-700",
                "text-sm rounded-lg px-3 py-1.5",
                "focus:ring-2 focus:ring-primary outline-none",
                "text-slate-900 dark:text-slate-100"
              )}
            >
              <option value="productive">Productive</option>
              <option value="unproductive">Unproductive</option>
              <option value="neutral">Neutral</option>
            </select>
            <button
              type="button"
              onClick={onRemove}
              className={cn(
                "p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20",
                "text-red-600 dark:text-red-400",
                "transition-colors"
              )}
            >
              <BiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Rule Specifics for Web */}
        {rule.appType === "web" && onRuleTypeChange && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Rule Logic
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: RuleType.DOMAIN, label: "Domain" },
                  { value: RuleType.URL_EXACT, label: "Exact URL" },
                  { value: RuleType.URL_PATTERN, label: "URL Pattern" },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onRuleTypeChange(value)}
                    className={cn(
                      "px-2 py-1 text-[11px] font-medium rounded border transition-all",
                      rule.ruleType === value
                        ? "bg-primary border-primary text-white"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary/50"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {rule.ruleType === RuleType.URL_PATTERN && onPatternChange && (
              <div className="animate-fade-in-up">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Pattern (supports *)
                </label>
                <input
                  type="text"
                  placeholder="domain.com/*/dashboard"
                  value={rule.pattern || ""}
                  onChange={(e) => onPatternChange(e.target.value)}
                  className={cn(
                    "w-full px-3 py-1.5 text-sm rounded-lg",
                    "bg-white dark:bg-slate-800",
                    "border border-slate-200 dark:border-slate-700",
                    "text-slate-900 dark:text-slate-100",
                    "focus:outline-none focus:ring-2 focus:ring-primary",
                    "transition-all"
                  )}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Configure Rules Section Component
const ConfigureRulesSection: React.FC<{
  selectedRules: SelectedRule[];
  bulkSelection: string[];
  onBulkToggle: (tempId: string) => void;
  onCategoryChange: (tempId: string, category: AppCategory) => void;
  onRuleTypeChange: (tempId: string, ruleType: RuleType) => void;
  onPatternChange: (tempId: string, pattern: string) => void;
  onRemove: (tempId: string) => void;
}> = ({
  selectedRules,
  bulkSelection,
  onBulkToggle,
  onCategoryChange,
  onRuleTypeChange,
  onPatternChange,
  onRemove,
}) => {
  if (selectedRules.length === 0) return null;

  return (
    <div className="space-y-3 mt-6">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          Configure Rules ({selectedRules.length})
        </h4>
      </div>
      {selectedRules.map((rule) => {
        const tempId = rule.tempId || `${rule.appName}-${rule.appType}`;
        return (
          <RuleConfigurationCard
            key={tempId}
            rule={rule}
            isBulkSelected={bulkSelection.includes(tempId)}
            onBulkToggle={() => onBulkToggle(tempId)}
            onCategoryChange={(category) => onCategoryChange(tempId, category)}
            onRuleTypeChange={rule.appType === "web" ? (ruleType) => onRuleTypeChange(tempId, ruleType) : undefined}
            onPatternChange={rule.appType === "web" ? (pattern) => onPatternChange(tempId, pattern) : undefined}
            onRemove={() => onRemove(tempId)}
          />
        );
      })}
    </div>
  );
};

// Team Checkbox Component
const TeamCheckbox: React.FC<{
  team: Team;
  teamId: string;
  register: ReturnType<typeof import("react-hook-form").useForm>["register"];
}> = ({ team, teamId, register }) => {
  return (
    <label
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all",
        "bg-white dark:bg-slate-800",
        "border-2 border-slate-200 dark:border-slate-700",
        "hover:border-primary/50 hover:translate-y-[-2px]",
        "[&:has(input:checked)]:border-primary [&:has(input:checked)]:bg-primary/5",
        "dark:[&:has(input:checked)]:bg-primary/10"
      )}
    >
      <input
        type="checkbox"
        value={teamId}
        {...register("teamIds", { required: "Select at least one team" })}
        className="sr-only peer"
      />
      <div className={cn(
        "w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-all",
        "border-2 border-slate-300 dark:border-slate-600",
        "peer-checked:bg-primary peer-checked:border-primary"
      )}>
        <BiCheck className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
      </div>
      <span className="font-semibold text-slate-900 dark:text-slate-100">
        {team.name}
      </span>
    </label>
  );
};

// Selected Summary Card Component
const SelectedSummaryCard: React.FC<{
  selectedRules: SelectedRule[];
}> = ({ selectedRules }) => {
  const total = selectedRules.length;
  const productive = selectedRules.filter((r) => r.category === "productive").length;
  const unproductive = selectedRules.filter((r) => r.category === "unproductive").length;
  const neutral = selectedRules.filter((r) => r.category === "neutral").length;

  if (total === 0) return null;


  return (
    <div className={cn(
      "p-6 rounded-2xl mb-6",
      "bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10",
      "border-2 border-primary/20 dark:border-primary/30",
      "animate-fade-in-up"
    )}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Selected Rules Summary
        </h4>
        <div className={cn(
          "text-3xl font-extrabold",
          "bg-gradient-to-r from-primary-light to-secondary",
          "bg-clip-text text-transparent"
        )}>
          {total}
        </div>
      </div>
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-600 dark:text-slate-400">Productive:</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">{productive}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-xs text-slate-600 dark:text-slate-400">Unproductive:</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">{unproductive}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-violet-500" />
          <span className="text-xs text-slate-600 dark:text-slate-400">Neutral:</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">{neutral}</span>
        </div>
      </div>
    </div>
  );
};

export const RuleCollectionDrawer: React.FC<RuleCollectionDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  teams,
  suggestedApps,
  selectedRules,
  setSelectedRules,
  selectedAppType,
  setSelectedAppType,
  bulkCategory: _bulkCategory,
  setBulkCategory: _setBulkCategory,
  applyBulkCategory: _applyBulkCategory,
  toggleRuleSelection: _toggleRuleSelection,
  updateRuleCategory: _updateRuleCategory,
  updateRuleType: _updateRuleType,
  updateRulePattern: _updateRulePattern,
  register,
  errors,
  customInputRef: _customInputRef,
  mode = "create",
  initialCollection,
}) => {
  // Local state for search and bulk selection
  const [searchTerm, setSearchTerm] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [bulkSelection, setBulkSelection] = useState<string[]>([]);

  // Pre-populate form when in edit mode
  useEffect(() => {
    if (mode === "edit" && initialCollection && isOpen && initialCollection.rules) {
      // Convert initialCollection rules to SelectedRule format if not already done
      const rulesToSet = initialCollection.rules.map((rule) => ({
        tempId: crypto.randomUUID(),
        appName: rule.appName,
        appType: rule.appType,
        category: rule.category,
        ruleType: rule.ruleType,
        pattern: rule.pattern || undefined,
      }));
      if (selectedRules.length === 0) {
        setSelectedRules(rulesToSet);
      }
    }
  }, [mode, initialCollection, isOpen, selectedRules.length, setSelectedRules]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(e);
  };

  // Detect rule type from input
  const detectRuleType = (input: string): RuleType => {
    if (input.includes("*")) return RuleType.URL_PATTERN;
    if (input.startsWith("http://") || input.startsWith("https://")) return RuleType.URL_EXACT;
    return RuleType.DOMAIN;
  };

  // Filtered suggestions based on search and app type
  const filteredSuggestions = useMemo(() => {
    if (!suggestedApps) return [];
    
    let all: SuggestedApp[] = [];
    if (selectedAppType === "all") {
      all = [...suggestedApps.desktop, ...suggestedApps.web];
    } else if (selectedAppType === "desktop") {
      all = suggestedApps.desktop;
    } else {
      all = suggestedApps.web;
    }

    if (!searchTerm.trim()) return all;

    const searchLower = searchTerm.toLowerCase();
    return all.filter((app) =>
      app.appName.toLowerCase().includes(searchLower)
    );
  }, [suggestedApps, selectedAppType, searchTerm]);

  // Handle custom input
  const handleAddCustom = () => {
    if (customInput.trim()) {
      const value = customInput.trim();
      const ruleType = detectRuleType(value);
      const newRule: SelectedRule = {
        tempId: crypto.randomUUID(),
        appName: value,
        appType: "web",
        category: "neutral",
        ruleType,
        pattern: ruleType === RuleType.URL_PATTERN ? value : undefined,
      };
      setSelectedRules((prev) => [...prev, newRule]);
      setCustomInput("");
    }
  };

  // Enhanced toggle with tempId generation
  const handleToggleRule = (app: SuggestedApp) => {
    const existing = selectedRules.find(
      (r) => r.appName === app.appName && r.appType === app.appType
    );
    
    if (existing) {
      setSelectedRules((prev) =>
        prev.filter((r) => !(r.appName === app.appName && r.appType === app.appType))
      );
      // Remove from bulk selection if present
      if (existing.tempId) {
        setBulkSelection((prev) => prev.filter((id) => id !== existing.tempId));
      }
    } else {
      const newRule: SelectedRule = {
        tempId: crypto.randomUUID(),
        appName: app.appName,
        appType: app.appType,
        category: app.suggestedCategory,
        suggestedCategory: app.suggestedCategory,
        ruleType: app.appType === "web" ? RuleType.DOMAIN : undefined,
      };
      setSelectedRules((prev) => [...prev, newRule]);
    }
  };

  // Bulk selection handlers
  const handleBulkToggle = (tempId: string) => {
    setBulkSelection((prev) =>
      prev.includes(tempId)
        ? prev.filter((id) => id !== tempId)
        : [...prev, tempId]
    );
  };

  const handleBulkApplyCategory = (category: AppCategory) => {
    setSelectedRules((prev) =>
      prev.map((r) =>
        bulkSelection.includes(r.tempId || `${r.appName}-${r.appType}`)
          ? { ...r, category }
          : r
      )
    );
    setBulkSelection([]);
  };

  const handleBulkClear = () => {
    setBulkSelection([]);
  };

  // Rule update handlers using tempId
  const handleRuleCategoryChange = (tempId: string, category: AppCategory) => {
    setSelectedRules((prev) =>
      prev.map((r) =>
        (r.tempId || `${r.appName}-${r.appType}`) === tempId
          ? { ...r, category }
          : r
      )
    );
  };

  const handleRuleTypeChange = (tempId: string, ruleType: RuleType) => {
    setSelectedRules((prev) =>
      prev.map((r) =>
        (r.tempId || `${r.appName}-${r.appType}`) === tempId
          ? { ...r, ruleType, pattern: ruleType === RuleType.DOMAIN ? undefined : r.pattern }
          : r
      )
    );
  };

  const handleRulePatternChange = (tempId: string, pattern: string) => {
    setSelectedRules((prev) =>
      prev.map((r) =>
        (r.tempId || `${r.appName}-${r.appType}`) === tempId
          ? { ...r, pattern: pattern || undefined }
          : r
      )
    );
  };

  const handleRuleRemove = (tempId: string) => {
    setSelectedRules((prev) =>
      prev.filter((r) => (r.tempId || `${r.appName}-${r.appType}`) !== tempId)
    );
    setBulkSelection((prev) => prev.filter((id) => id !== tempId));
  };

  // Custom header with gradient title
  const customHeader = (
    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
      <h2 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-primary-light to-secondary bg-clip-text text-transparent">
        {mode === "edit" ? "Edit Rule Collection" : "Create Rule Collection"}
      </h2>
      <p className="text-slate-600 dark:text-slate-400">
        {mode === "edit"
          ? "Update productivity rules and team assignments"
          : "Define productivity rules and assign them to your teams"}
      </p>
    </div>
  );

  // Footer with action buttons
  const footer = (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        disabled={isLoading}
        className={cn(
          "px-6 py-3 rounded-lg text-sm font-semibold",
          "text-slate-700 dark:text-slate-300",
          "bg-white dark:bg-slate-800",
          "border-2 border-slate-300 dark:border-slate-600",
          "hover:bg-slate-50 dark:hover:bg-slate-700",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-all"
        )}
      >
        Cancel
      </button>
      <button
        type="submit"
        form="rule-collection-form"
        disabled={isLoading}
        className={cn(
          "px-6 py-3 rounded-lg text-sm font-semibold",
          getPrimaryButtonStyle(),
          "shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/40",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-all hover:-translate-y-0.5"
        )}
      >
        {isLoading
          ? mode === "edit"
            ? "Updating..."
            : "Creating..."
          : mode === "edit"
          ? "Update Collection →"
          : "Create Rule Collection →"}
      </button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      header={customHeader}
      footer={footer}
      size="xl"
      side="right"
      className="overflow-hidden"
    >
      <form id="rule-collection-form" onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="section">
          <SectionHeader
            number={1}
            title="Basic Information"
            description="Give your rule collection a name and description to help identify its purpose"
          />
          <div className="space-y-4 ml-14">
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Collection Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name", { required: "Name is required" })}
                type="text"
                placeholder="e.g., Development Team Rules"
                className={cn(
                  "w-full px-4 py-3 rounded-xl text-sm",
                  "bg-slate-50 dark:bg-slate-900",
                  "border-2 border-slate-200 dark:border-slate-700",
                  "text-slate-900 dark:text-slate-100",
                  "focus:outline-none focus:border-primary",
                  "focus:bg-white dark:focus:bg-slate-800",
                  "focus:shadow-lg focus:shadow-primary/10",
                  "transition-all",
                  errors.name && "border-red-500"
                )}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {typeof errors.name.message === "string" ? errors.name.message : "Name is required"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Description
              </label>
              <textarea
                {...register("description")}
                placeholder="Optional: Describe the purpose of this rule collection..."
                rows={3}
                className={cn(
                  "w-full px-4 py-3 rounded-xl text-sm resize-y",
                  "bg-slate-50 dark:bg-slate-900",
                  "border-2 border-slate-200 dark:border-slate-700",
                  "text-slate-900 dark:text-slate-100",
                  "focus:outline-none focus:border-primary",
                  "focus:bg-white dark:focus:bg-slate-800",
                  "focus:shadow-lg focus:shadow-primary/10",
                  "transition-all"
                )}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Assign to Teams */}
        <div className="section">
          <SectionHeader
            number={2}
            title="Assign to Teams"
            description="Select one or more teams that will use this rule collection"
          />
          <div className="ml-14">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teams.map((team) => {
                const teamId = team.id.toString();
                return (
                  <TeamCheckbox
                    key={team.id}
                    team={team}
                    teamId={teamId}
                    register={register}
                  />
                );
              })}
            </div>
            {errors.teamIds && (
              <p className="mt-2 text-sm text-red-500">
                {typeof errors.teamIds.message === "string" ? errors.teamIds.message : "Select at least one team"}
              </p>
            )}
          </div>
        </div>

        {/* Section 3: App & Domain Rules */}
        {suggestedApps && (
          <div className="section">
            <SectionHeader
              number={3}
              title="App & Domain Rules"
              description="Select from suggestions or add custom ones"
            />
            <div className="ml-14">
              {/* Top Bar: Search, Filters, Custom Input */}
              <div className="mb-6">
                <AppSelectionTopBar
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  selectedAppType={selectedAppType}
                  setSelectedAppType={setSelectedAppType}
                  customInput={customInput}
                  setCustomInput={setCustomInput}
                  onAddCustom={handleAddCustom}
                />
              </div>

              {/* App List */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-6">
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((app) => {
                      const isSelected = selectedRules.some(
                        (r) => r.appName === app.appName && r.appType === app.appType
                      );
                      return (
                        <AppListItem
                          key={`${app.appType}-${app.appName}`}
                          app={app}
                          isSelected={isSelected}
                          onToggle={() => handleToggleRule(app)}
                        />
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                      No suggested apps found for your search.
                    </div>
                  )}
                </div>

                {/* Bulk Actions Bar (Floating) */}
                <BulkActionsBar
                  bulkSelectionCount={bulkSelection.length}
                  onClear={handleBulkClear}
                  onApplyCategory={handleBulkApplyCategory}
                />
              </div>

              {/* Configure Rules Section */}
              <ConfigureRulesSection
                selectedRules={selectedRules}
                bulkSelection={bulkSelection}
                onBulkToggle={handleBulkToggle}
                onCategoryChange={handleRuleCategoryChange}
                onRuleTypeChange={handleRuleTypeChange}
                onPatternChange={handleRulePatternChange}
                onRemove={handleRuleRemove}
              />
            </div>
          </div>
        )}

        {/* Selected Summary */}
        <SelectedSummaryCard selectedRules={selectedRules} />
      </form>
    </Drawer>
  );
};
