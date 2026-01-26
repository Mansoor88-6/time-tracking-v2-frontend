"use client";

import React from "react";
import {
  FiShield,
  FiKey,
  FiClock,
  FiAlertTriangle,
  FiTrendingUp,
  FiUsers,
  FiFileText,
  FiSettings,
  FiCheckCircle,
  FiXCircle,
  FiActivity,
  FiCpu,
  FiMessageCircle,
  FiTarget,
  FiSettings as FiCog,
  FiBook,
  FiLock,
  FiZap,
  FiUser as FiBot,
} from "react-icons/fi";

// Mock data for dashboard
const mockData = {
  totalCertificates: 1247,
  activeCertificates: 1189,
  expiringSoon: 23,
  revokedCertificates: 35,
  totalUsers: 89,
  recentActivity: 156,
  systemHealth: 98.5,
  lastBackup: "2 hours ago",
};

const stats = [
  {
    title: "Total Certificates",
    value: mockData.totalCertificates.toLocaleString(),
    change: "+12%",
    changeType: "positive" as const,
    icon: FiShield,
    gradient: "from-blue-500 to-blue-600",
    bgGradient:
      "from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20",
  },
  {
    title: "Active Certificates",
    value: mockData.activeCertificates.toLocaleString(),
    change: "+8%",
    changeType: "positive" as const,
    icon: FiCheckCircle,
    gradient: "from-emerald-500 to-emerald-600",
    bgGradient:
      "from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20",
  },
  {
    title: "Expiring Soon",
    value: mockData.expiringSoon.toString(),
    change: "-3%",
    changeType: "negative" as const,
    icon: FiClock,
    gradient: "from-amber-500 to-amber-600",
    bgGradient:
      "from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20",
  },
  {
    title: "Revoked Certificates",
    value: mockData.revokedCertificates.toString(),
    change: "+2%",
    changeType: "negative" as const,
    icon: FiXCircle,
    gradient: "from-rose-500 to-rose-600",
    bgGradient:
      "from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/20",
  },
  {
    title: "Total Users",
    value: mockData.totalUsers.toString(),
    change: "+5%",
    changeType: "positive" as const,
    icon: FiUsers,
    gradient: "from-violet-500 to-violet-600",
    bgGradient:
      "from-violet-50 to-violet-100 dark:from-violet-900/30 dark:to-violet-800/20",
  },
  {
    title: "Recent Activity",
    value: mockData.recentActivity.toString(),
    change: "+15%",
    changeType: "positive" as const,
    icon: FiActivity,
    gradient: "from-indigo-500 to-indigo-600",
    bgGradient:
      "from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20",
  },
];

// Advanced Security Features with optimized color scheme
const securityFeatures = [
  {
    id: 1,
    title: "AI Security Analytics",
    description:
      "Machine learning-powered threat detection and predictive certificate lifecycle management",
    icon: FiCpu,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-50 dark:bg-emerald-900/30",
    buttonText: "Access Feature",
    buttonStyle:
      "border-emerald-600 dark:border-emerald-400 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white dark:hover:text-gray-900",
    hasLabel: false,
  },
  {
    id: 2,
    title: "Natural Language Certificates",
    description:
      "Create certificates by simply describing what you need in plain English!",
    icon: FiMessageCircle,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-50 dark:bg-blue-900/30",
    buttonText: "Start Creating",
    buttonStyle:
      "bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-400",
    hasLabel: true,
    labelText: "AI-Powered Certificate Creation",
    labelColor:
      "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-b border-blue-200 dark:border-blue-700",
  },
  {
    id: 3,
    title: "AI Threat Prediction",
    description:
      "Advanced AI-powered attack prediction to forecast security threats before they occur",
    icon: FiTarget,
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-50 dark:bg-rose-900/30",
    buttonText: "Access Feature",
    buttonStyle:
      "border-rose-600 dark:border-rose-400 text-rose-600 dark:text-rose-400 hover:bg-rose-600 dark:hover:bg-rose-500 hover:text-white dark:hover:text-gray-900",
    hasLabel: true,
    labelText: "New Advanced Feature",
    labelColor:
      "bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 border-b border-rose-200 dark:border-rose-700",
  },
  {
    id: 4,
    title: "Adaptive Cryptographic Agility",
    description:
      "Automatically adjust cryptographic methods based on real-time threat intelligence",
    icon: FiCog,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-50 dark:bg-indigo-900/30",
    buttonText: "Access Feature",
    buttonStyle:
      "border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white dark:hover:text-gray-900",
    hasLabel: true,
    labelText: "New Advanced Feature",
    labelColor:
      "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 border-b border-indigo-200 dark:border-indigo-700",
  },
  {
    id: 5,
    title: "Certificate Transparency",
    description:
      "Log certificates to public, verifiable, append-only logs for enhanced trust and security",
    icon: FiFileText,
    iconColor: "text-teal-600 dark:text-teal-400",
    iconBg: "bg-teal-50 dark:bg-teal-900/30",
    buttonText: "Access Feature",
    buttonStyle:
      "border-teal-600 dark:border-teal-400 text-teal-600 dark:text-teal-400 hover:bg-teal-600 dark:hover:bg-teal-500 hover:text-white dark:hover:text-gray-900",
    hasLabel: true,
    labelText: "New Enhanced Security",
    labelColor:
      "bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 border-b border-teal-200 dark:border-teal-700",
  },
  {
    id: 6,
    title: "Hardware Security Modules",
    description:
      "Protect your most sensitive keys with tamper-resistant hardware security modules",
    icon: FiShield,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-50 dark:bg-amber-900/30",
    buttonText: "Access Feature",
    buttonStyle:
      "border-amber-600 dark:border-amber-400 text-amber-600 dark:text-amber-400 hover:bg-amber-600 dark:hover:bg-amber-500 hover:text-white dark:hover:text-gray-900",
    hasLabel: true,
    labelText: "New Hardware Security",
    labelColor:
      "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border-b border-amber-200 dark:border-amber-700",
  },
  {
    id: 7,
    title: "Zero-Trust Micro-segmentation",
    description:
      "Certificate access management with continuous verification and adaptive trust scoring",
    icon: FiLock,
    iconColor: "text-slate-600 dark:text-slate-400",
    iconBg: "bg-slate-50 dark:bg-slate-800/50",
    buttonText: "Access Feature",
    buttonStyle:
      "border-slate-600 dark:border-slate-400 text-slate-600 dark:text-slate-400 hover:bg-slate-600 dark:hover:bg-slate-500 hover:text-white dark:hover:text-gray-900",
    hasLabel: false,
  },
  {
    id: 8,
    title: "Documentation",
    description:
      "Complete guides and reference materials for using all Averox PKI features",
    icon: FiBook,
    iconColor: "text-gray-600 dark:text-gray-400",
    iconBg: "bg-gray-50 dark:bg-gray-800/50",
    buttonText: "Access Feature",
    buttonStyle:
      "border-gray-600 dark:border-gray-400 text-gray-600 dark:text-gray-400 hover:bg-gray-600 dark:hover:bg-gray-500 hover:text-white dark:hover:text-gray-900",
    hasLabel: false,
  },
  {
    id: 9,
    title: "Quantum-Safe Cryptography",
    description:
      "Future-proof your certificates with quantum-resistant cryptographic algorithms",
    icon: FiZap,
    iconColor: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-50 dark:bg-violet-900/30",
    buttonText: "Access Feature",
    buttonStyle:
      "border-violet-600 dark:border-violet-400 text-violet-600 dark:text-violet-400 hover:bg-violet-600 dark:hover:bg-violet-500 hover:text-white dark:hover:text-gray-900",
    hasLabel: true,
    labelText: "Future-Ready Security",
    labelColor:
      "bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-200 border-b border-violet-200 dark:border-violet-700",
  },
];

const recentActivities = [
  {
    id: 1,
    action: "Certificate issued",
    user: "John Doe",
    time: "2 minutes ago",
    type: "success",
  },
  {
    id: 2,
    action: "Certificate renewed",
    user: "Jane Smith",
    time: "15 minutes ago",
    type: "success",
  },
  {
    id: 3,
    action: "Certificate revoked",
    user: "Admin",
    time: "1 hour ago",
    type: "warning",
  },
  {
    id: 4,
    action: "New user registered",
    user: "Mike Johnson",
    time: "2 hours ago",
    type: "info",
  },
  {
    id: 5,
    action: "System backup completed",
    user: "System",
    time: "3 hours ago",
    type: "success",
  },
];

const StatCard = ({ stat }: { stat: (typeof stats)[0] }) => {
  const Icon = stat.icon;

  return (
    <div
      className={`group relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} rounded-lg shadow-sm border border-white/20 dark:border-gray-700/20 hover:shadow-lg transition-all duration-200`}
    >
      <div className="p-2 xs:p-3 sm:p-4 md:p-4 lg:p-5 xl:p-6">
        {/* Header with title and icon */}
        <div className="flex items-center justify-between mb-1 xs:mb-2 sm:mb-2 md:mb-3">
          <p className="text-xs xs:text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 truncate">
            {stat.title}
          </p>
          <div
            className={`p-1 xs:p-1.5 sm:p-1.5 md:p-2 rounded-md bg-gradient-to-br ${stat.gradient} shadow-sm group-hover:scale-105 transition-transform duration-200 ml-1 xs:ml-2`}
          >
            <Icon className="h-3 w-3 xs:h-3 xs:w-3 sm:h-4 sm:w-4 md:h-4 md:w-4 lg:h-5 lg:w-5 text-white" />
          </div>
        </div>

        {/* Main value */}
        <div className="mb-1 xs:mb-2 sm:mb-2 md:mb-3">
          <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
            {stat.value}
          </p>
        </div>

        {/* Change indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span
              className={`text-xs xs:text-xs sm:text-sm font-medium ${
                stat.changeType === "positive"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {stat.change}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden md:inline">
              from last month
            </span>
          </div>

          {/* Status indicator dot */}
          <div
            className={`w-1 h-1 xs:w-1.5 xs:h-1.5 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full ${
              stat.changeType === "positive" ? "bg-emerald-500" : "bg-rose-500"
            }`}
          ></div>
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({
  activity,
}: {
  activity: (typeof recentActivities)[0];
}) => {
  return (
    <div className="group relative bg-white/50 dark:bg-slate-800/50 rounded-xl p-3 sm:p-4 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all duration-200 border border-slate-200/50 dark:border-slate-700/50">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          <div
            className={`w-2 h-2 rounded-full ${
              activity.type === "success"
                ? "bg-emerald-500"
                : activity.type === "warning"
                ? "bg-amber-500"
                : "bg-blue-500"
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight">
            {activity.action}
          </p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              by {activity.user}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activity.time}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SecurityFeatureCard = ({
  feature,
}: {
  feature: (typeof securityFeatures)[0];
}) => {
  const Icon = feature.icon;

  return (
    <div className="group relative bg-white/50 dark:bg-slate-800/50 rounded-md hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all duration-300 border border-slate-200 dark:border-slate-700 overflow-hidden transform hover:-translate-y-1">
      {feature.hasLabel && (
        <div
          className={`truncate absolute top-0 left-0 right-0 ${feature.labelColor} px-4 py-5 text-md font-semibold text-center`}
        >
          {feature.labelText}
        </div>
      )}

      <div className={`p-6 ${feature.hasLabel ? "pt-20" : ""}`}>
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className={`p-4 rounded-full ${feature.iconBg} group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className={`h-8 w-8 ${feature.iconColor}`} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-3">
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
          {feature.description}
        </p>

        {/* Button */}
        <div className="flex justify-center">
          <button
            className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 border-2 ${feature.buttonStyle}`}
          >
            {feature.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Time Tracking Dashboard
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Monitor and manage your organizations, teams, and activity.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <FiActivity className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="truncate">Last updated: {mockData.lastBackup}</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="space-y-4 xs:space-y-5 sm:space-y-6 md:space-y-6 lg:space-y-8">
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-2 xs:gap-3 sm:gap-4 md:gap-4 lg:gap-5 xl:gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* System Health */}
        <div className="lg:col-span-2">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

            <div className="relative p-4 sm:p-6 lg:p-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">
                    System Health
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                    Monitor the status of your PKI infrastructure
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm sm:text-lg">
                        {mockData.systemHealth}%
                      </span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-5 sm:h-5 bg-emerald-500 rounded-full animate-pulse border-2 border-white dark:border-slate-800"></div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      System Healthy
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      All systems operational
                    </div>
                  </div>
                </div>
              </div>

              {/* Health Status Cards */}
              <div className="space-y-4">
                {/* Certificate Authority */}
                <div className="group relative bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-300 overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-emerald-600"></div>
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="p-2 sm:p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg sm:rounded-xl">
                          <FiCheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                            Certificate Authority
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                            Core PKI infrastructure
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full mr-1.5 sm:mr-2 animate-pulse"></div>
                          Operational
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Uptime: 99.9%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Database */}
                <div className="group relative bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-300 overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-emerald-600"></div>
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="p-2 sm:p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg sm:rounded-xl">
                          <FiCheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                            Database
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                            Certificate and user data storage
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full mr-1.5 sm:mr-2 animate-pulse"></div>
                          Connected
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Response: 12ms
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Backup System */}
                <div className="group relative bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-300 overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-amber-600"></div>
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="p-2 sm:p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg sm:rounded-xl">
                          <FiAlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                            Backup System
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                            Automated data backup and recovery
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full mr-1.5 sm:mr-2"></div>
                          Warning
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Last backup: 2h ago
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-slate-200 dark:border-slate-700">
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    2.1s
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Avg Response Time
                  </div>
                </div>
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-slate-200 dark:border-slate-700">
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    1,247
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Active Certificates
                  </div>
                </div>
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-slate-200 dark:border-slate-700">
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    99.9%
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Uptime
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>

            <div className="relative p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    Recent Activity
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Latest PKI operations and events
                  </p>
                </div>
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-sm">
                  <FiTrendingUp className="h-5 w-5 text-white" />
                </div>
              </div>

              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
                <button className="w-full group flex items-center justify-center space-x-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-200">
                  <span>View all activity</span>
                  <FiTrendingUp className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="relative p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
              Quick Actions
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Streamline your PKI management with these essential tools and
              shortcuts
            </p>
          </div>

          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Issue Certificate */}
            <div className="group relative">
              <button className="w-full p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FiKey className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-1">
                      Issue Certificate
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      Create new certificates
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* View Certificates */}
            <div className="group relative">
              <button className="w-full p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FiFileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      View Certificates
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Browse all certificates
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Manage Users */}
            <div className="group relative">
              <button className="w-full p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-violet-300 dark:hover:border-violet-600 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FiUsers className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      Manage Users
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      User administration
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Settings */}
            <div className="group relative">
              <button className="w-full p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FiSettings className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      Settings
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      System configuration
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Additional Actions Row */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button className="flex items-center justify-center space-x-3 p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200">
              <FiActivity className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Activity Log
              </span>
            </button>

            <button className="flex items-center justify-center space-x-3 p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200">
              <FiShield className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Security Audit
              </span>
            </button>

            <button className="flex items-center justify-center space-x-3 p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200">
              <FiTrendingUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Reports
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Security Features */}
      <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>

        <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Advanced Security Features
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Explore cutting-edge PKI security capabilities powered by AI and
              modern cryptography
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {securityFeatures.map((feature) => (
              <SecurityFeatureCard key={feature.id} feature={feature} />
            ))}
          </div>
        </div>
      </div>

      {/* Floating AI Certificate Creator Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <button className="group flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-emerald-200 dark:border-emerald-700/50">
          <div className="p-1.5 sm:p-2 bg-white/20 dark:bg-gray-900/20 rounded-full group-hover:rotate-12 transition-transform duration-300">
            <FiBot className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="font-semibold text-sm">AI Certificate Creator</div>
            <div className="text-xs opacity-90">Describe what you need!</div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Home;
