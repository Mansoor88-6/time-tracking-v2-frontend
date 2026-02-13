"use client";

import React, { useEffect } from "react";
import Drawer from "./Drawer";
import { cn } from "@/utils/tw";
import { getCategoryStylesUtil } from "@/theme";
import { RuleCollection } from "@/lib/api/rule-collections";
import { TeamProductivityRule } from "@/lib/api/productivity-rules";
import { Team } from "@/lib/api/teams";
import { RuleType } from "@/lib/api/rule-collections";

interface ViewCollectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  collection: RuleCollection | null;
  rules: TeamProductivityRule[];
  teams: Team[];
  isLoading?: boolean;
}

const ViewCollectionDrawer: React.FC<ViewCollectionDrawerProps> = ({
  isOpen,
  onClose,
  collection,
  rules,
  teams,
  isLoading = false,
}) => {
  // Debug: Log rules to see if they're being passed
  useEffect(() => {
    if (isOpen && collection) {
      console.log("ViewCollectionDrawer - Collection:", collection);
      console.log("ViewCollectionDrawer - Rules:", rules);
      console.log("ViewCollectionDrawer - Rules count:", rules.length);
    }
  }, [isOpen, collection, rules]);

  if (!collection) return null;

  // Group rules by app type
  const desktopRules = rules.filter((r) => r.appType === "desktop");
  const webRules = rules.filter((r) => r.appType === "web");

  // Calculate statistics
  const total = rules.length;
  const productive = rules.filter((r) => r.category === "productive").length;
  const unproductive = rules.filter((r) => r.category === "unproductive").length;
  const neutral = rules.filter((r) => r.category === "neutral").length;

  // Get team names
  const assignedTeamIds = collection.teamAssignments?.map((ta) => ta.teamId) || [];
  const assignedTeams = teams.filter((t) => assignedTeamIds.includes(t.id));

  const header = (
    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
      <h2 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-primary-light to-secondary bg-clip-text text-transparent">
        {collection.name}
      </h2>
      {collection.description && (
        <p className="text-slate-600 dark:text-slate-400">{collection.description}</p>
      )}
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      header={header}
      size="xl"
      side="right"
    >
      <div className="space-y-8 p-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
            Basic Information
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Created by:
              </span>{" "}
              <span className="text-slate-900 dark:text-slate-100">
                {collection.creator?.name || collection.creator?.email || "Unknown"}
              </span>
            </div>
            {collection.createdAt && (
              <div>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Created:
                </span>{" "}
                <span className="text-slate-900 dark:text-slate-100">
                  {new Date(collection.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
            {collection.updatedAt && (
              <div>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Last updated:
                </span>{" "}
                <span className="text-slate-900 dark:text-slate-100">
                  {new Date(collection.updatedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Team Assignments */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
            Team Assignments
          </h3>
          {assignedTeams.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {assignedTeams.map((team) => (
                <span
                  key={team.id}
                  className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-semibold"
                >
                  {team.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">No teams assigned</p>
          )}
        </div>

        {/* Rules Summary */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
            Rules Summary
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {total}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Rules</div>
            </div>
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {productive}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Productive</div>
            </div>
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {unproductive}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Unproductive</div>
            </div>
            <div className="p-4 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-center">
              <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                {neutral}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Neutral</div>
            </div>
          </div>
        </div>

        {/* Rules List */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
            Rules ({total})
          </h3>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">Loading rules...</p>
            </div>
          ) : rules.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">No rules in this collection</p>
          ) : (
            <div className="space-y-6">
              {/* Desktop Apps */}
              {desktopRules.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">💻</span>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                      Desktop Applications ({desktopRules.length})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {desktopRules.map((rule) => {
                      const categoryStyles = getCategoryStylesUtil(rule.category);
                      return (
                        <div
                          key={rule.id}
                          className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-slate-900 dark:text-slate-100">
                                {rule.appName}
                              </div>
                            </div>
                            <span
                              className={cn(
                                "px-2 py-1 rounded-full text-xs font-semibold uppercase",
                                categoryStyles.badge
                              )}
                            >
                              {rule.category}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Web Domains */}
              {webRules.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🌐</span>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                      Web Domains ({webRules.length})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {webRules.map((rule) => {
                      const categoryStyles = getCategoryStylesUtil(rule.category);
                      const ruleTypeLabel =
                        rule.ruleType === RuleType.DOMAIN
                          ? "Domain"
                          : rule.ruleType === RuleType.URL_EXACT
                          ? "Exact URL"
                          : rule.ruleType === RuleType.URL_PATTERN
                          ? "URL Pattern"
                          : "App Name";
                      return (
                        <div
                          key={rule.id}
                          className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                              <div className="font-semibold text-slate-900 dark:text-slate-100">
                                {rule.appName}
                              </div>
                              {rule.pattern && (
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  Pattern: {rule.pattern}
                                </div>
                              )}
                            </div>
                            <span
                              className={cn(
                                "px-2 py-1 rounded-full text-xs font-semibold uppercase",
                                categoryStyles.badge
                              )}
                            >
                              {rule.category}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Type: {ruleTypeLabel}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default ViewCollectionDrawer;
