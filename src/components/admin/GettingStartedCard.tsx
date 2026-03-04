"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BiCheck, BiRightArrowAlt, BiX } from "react-icons/bi";

const STORAGE_KEY = "onboarding_dismissed";

interface Step {
  title: string;
  description: string;
  completeText: (count: number) => string;
  href: string;
  linkLabel: string;
  complete: boolean;
  count: number;
}

interface GettingStartedCardProps {
  teamCount: number;
  userCount: number;
  collectionCount: number;
}

export const GettingStartedCard: React.FC<GettingStartedCardProps> = ({
  teamCount,
  userCount,
  collectionCount,
}) => {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  const steps: Step[] = [
    {
      title: "Create your first team",
      description:
        "Teams organize your employees into groups so you can track and manage productivity per team.",
      completeText: (n) => `You have ${n} team${n === 1 ? "" : "s"}.`,
      href: "/teams",
      linkLabel: "Go to Teams",
      complete: teamCount > 0,
      count: teamCount,
    },
    {
      title: "Add users to your organization",
      description:
        "Invite or create user accounts and assign them to teams. Users need the desktop agent to start tracking.",
      completeText: (n) => `${n} user${n === 1 ? "" : "s"} added.`,
      href: "/users",
      linkLabel: "Go to Users",
      complete: userCount > 0,
      count: userCount,
    },
    {
      title: "Set up productivity rules",
      description:
        "Create rule collections that classify apps and websites as productive, unproductive, or neutral, then assign them to teams.",
      completeText: (n) =>
        `${n} collection${n === 1 ? "" : "s"} created.`,
      href: "/productivity-rules/collections",
      linkLabel: "Go to Collections",
      complete: collectionCount > 0,
      count: collectionCount,
    },
  ];

  const completedCount = steps.filter((s) => s.complete).length;
  const allDone = completedCount === steps.length;

  if (dismissed || allDone) return null;

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  };

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Getting Started
          </h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Set up your organization in 3 simple steps.{" "}
            <span className="font-medium text-primary">
              {completedCount} of {steps.length} complete
            </span>
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="mt-0.5 rounded-md p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title="Dismiss"
        >
          <BiX className="w-5 h-5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mx-5 mb-4 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${(completedCount / steps.length) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-4 px-5 py-4 ${
              step.complete
                ? "bg-slate-50/50 dark:bg-slate-800/50"
                : ""
            }`}
          >
            {/* Step indicator */}
            <div
              className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                step.complete
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
              }`}
            >
              {step.complete ? (
                <BiCheck className="w-5 h-5" />
              ) : (
                idx + 1
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${
                  step.complete
                    ? "text-slate-500 dark:text-slate-400"
                    : "text-slate-900 dark:text-slate-100"
                }`}
              >
                {step.title}
              </p>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                {step.complete
                  ? step.completeText(step.count)
                  : step.description}
              </p>
            </div>

            {/* Action link */}
            <Link
              href={step.href}
              className={`mt-0.5 flex-shrink-0 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                step.complete
                  ? "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  : "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30"
              }`}
            >
              {step.complete ? "View" : step.linkLabel}
              <BiRightArrowAlt className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
