"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataToolbar } from "@/components/admin/DataToolbar";
import { AdminDataTable, AdminTableColumn } from "@/components/admin/AdminDataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ModalForm } from "@/components/admin/ModalForm";
import {
  productivityRulesApi,
  UnclassifiedApp,
  AppType,
  AppCategory,
  UnclassifiedAppStatus,
} from "@/lib/api/productivity-rules";
import { ruleCollectionsApi, RuleCollection, RuleType } from "@/lib/api/rule-collections";
import { teamsApi, Team } from "@/lib/api/teams";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState, useMemo } from "react";
import { BiCheck, BiX, BiMinus, BiFilter, BiPlus } from "react-icons/bi";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { getColorClassesUtil, getSemanticColor, getCategoryStylesUtil, getPrimaryButtonStyle } from "@/theme/utils";

interface ClassifyFormData {
  category: AppCategory;
  applyToTeamId?: string;
  collectionId?: string;
}

interface BulkAddToCollectionFormData {
  collectionId: string;
  category: AppCategory;
  teamId?: string;
}

const UnclassifiedAppsPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [unclassifiedApps, setUnclassifiedApps] = useState<UnclassifiedApp[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [collections, setCollections] = useState<RuleCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState<number | "all">("all");
  const [appTypeFilter, setAppTypeFilter] = useState<AppType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UnclassifiedAppStatus | "all">("pending");
  const [isClassifyModalOpen, setIsClassifyModalOpen] = useState(false);
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<UnclassifiedApp | null>(null);
  const [selectedApps, setSelectedApps] = useState<number[]>([]);

  const {
    register: registerClassify,
    handleSubmit: handleSubmitClassify,
    reset: resetClassify,
    formState: { errors: errorsClassify, isSubmitting: isSubmittingClassify },
  } = useForm<ClassifyFormData>();

  const {
    register: registerBulkAdd,
    handleSubmit: handleSubmitBulkAdd,
    reset: resetBulkAdd,
    formState: { errors: errorsBulkAdd, isSubmitting: isSubmittingBulkAdd },
  } = useForm<BulkAddToCollectionFormData>();

  const loadTeams = async () => {
    try {
      const data = await teamsApi.list();
      setTeams(data);
    } catch (err) {
      console.error("Failed to load teams:", err);
    }
  };

  const loadCollections = async () => {
    try {
      const data = await ruleCollectionsApi.list();
      setCollections(data);
    } catch (err) {
      console.error("Failed to load collections:", err);
    }
  };

  const loadUnclassifiedApps = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (teamFilter !== "all") {
        filters.teamId = teamFilter;
      }
      if (appTypeFilter !== "all") {
        filters.appType = appTypeFilter;
      }
      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }

      const data = await productivityRulesApi.getUnclassified(filters);
      setUnclassifiedApps(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load unclassified apps");
      toast.error("Failed to load unclassified apps");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTeams();
    void loadCollections();
    void loadUnclassifiedApps();
  }, []);

  useEffect(() => {
    void loadUnclassifiedApps();
  }, [teamFilter, appTypeFilter, statusFilter]);

  const filteredApps = unclassifiedApps.filter((app) =>
    app.appName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = useMemo(() => {
    const total = unclassifiedApps.length;
    const byCategory = {
      productive: unclassifiedApps.filter((a) => a.status === "classified").length,
      unproductive: 0,
      neutral: 0,
    };
    const byTeam = teams.reduce((acc, team) => {
      acc[team.id] = unclassifiedApps.filter((a) => a.teamId === team.id).length;
      return acc;
    }, {} as Record<number, number>);

    return { total, byCategory, byTeam };
  }, [unclassifiedApps, teams]);

  const handleClassify = async (data: ClassifyFormData) => {
    if (!selectedApp) return;
    try {
      await productivityRulesApi.classifyUnclassified({
        appName: selectedApp.appName,
        appType: selectedApp.appType,
        category: data.category,
        applyToTeamId: data.applyToTeamId ? parseInt(data.applyToTeamId) : undefined,
      });
      toast.success("App classified successfully");
      setIsClassifyModalOpen(false);
      setSelectedApp(null);
      resetClassify();
      await loadUnclassifiedApps();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to classify app");
    }
  };

  const handleBulkClassify = async (category: AppCategory, teamId?: number) => {
    if (selectedApps.length === 0) {
      toast.warning("Please select apps to classify");
      return;
    }

    try {
      const appsToClassify = unclassifiedApps.filter((app) =>
        selectedApps.includes(app.id)
      );

      for (const app of appsToClassify) {
        try {
          await productivityRulesApi.classifyUnclassified({
            appName: app.appName,
            appType: app.appType,
            category,
            applyToTeamId: teamId,
          });
        } catch (err) {
          console.error(`Failed to classify ${app.appName}:`, err);
        }
      }

      toast.success(`Classified ${appsToClassify.length} app(s) successfully`);
      setSelectedApps([]);
      await loadUnclassifiedApps();
    } catch (err) {
      toast.error("Failed to classify apps");
    }
  };

  const handleBulkAddToCollection = async (data: BulkAddToCollectionFormData) => {
    if (selectedApps.length === 0) {
      toast.warning("Please select apps to add");
      return;
    }

    try {
      const appsToAdd = unclassifiedApps.filter((app) =>
        selectedApps.includes(app.id)
      );

      const rules = appsToAdd.map((app) => ({
        appName: app.appName,
        appType: app.appType,
        category: data.category,
      }));

      // Add rules to collection
      await ruleCollectionsApi.addRules(parseInt(data.collectionId), { rules });

      // If teamId is specified, ensure collection is assigned to that team
      if (data.teamId) {
        try {
          await ruleCollectionsApi.assignToTeams(parseInt(data.collectionId), {
            teamIds: [parseInt(data.teamId)],
          });
        } catch (err) {
          // Team might already be assigned, ignore error
          console.error("Failed to assign collection to team:", err);
        }
      }

      // Classify all apps
      for (const app of appsToAdd) {
        try {
          await productivityRulesApi.classifyUnclassified({
            appName: app.appName,
            appType: app.appType,
            category: data.category,
            applyToTeamId: data.teamId ? parseInt(data.teamId) : undefined,
          });
        } catch (err) {
          console.error(`Failed to classify ${app.appName}:`, err);
        }
      }

      toast.success(
        `Added ${appsToAdd.length} app(s) to collection and classified successfully`
      );
      setSelectedApps([]);
      setIsBulkAddModalOpen(false);
      resetBulkAdd();
      await loadUnclassifiedApps();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add apps to collection");
    }
  };

  const toggleSelectApp = (appId: number) => {
    setSelectedApps((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedApps.length === filteredApps.length) {
      setSelectedApps([]);
    } else {
      setSelectedApps(filteredApps.map((app) => app.id));
    }
  };

  // Extract domain from appName (if it's a URL)
  const extractDomain = (appName: string): string => {
    try {
      let url = appName.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      const urlObj = new URL(url);
      let domain = urlObj.hostname.toLowerCase();
      if (domain.startsWith('www.')) {
        domain = domain.substring(4);
      }
      return domain;
    } catch {
      // If not a URL, return as-is
      return appName;
    }
  };

  const isURL = (str: string): boolean => {
    return str.includes('://') || str.includes('/');
  };

  const handleQuickCreateDomainRule = async (app: UnclassifiedApp, category: AppCategory) => {
    try {
      const domain = extractDomain(app.appName);
      // Find a collection or create a quick rule
      if (collections.length > 0 && app.teamId) {
        const collection = collections[0]; // Use first collection or let user choose
        await ruleCollectionsApi.addRules(collection.id, {
          rules: [{
            appName: domain,
            appType: "web",
            category,
            ruleType: RuleType.DOMAIN,
          }],
        });
        toast.success(`Domain rule created for ${domain}`);
      } else {
        // Classify directly
        await productivityRulesApi.classifyUnclassified({
          appName: domain,
          appType: "web",
          category,
          applyToTeamId: app.teamId || undefined,
        });
        toast.success(`Classified ${domain} as ${category}`);
      }
      await loadUnclassifiedApps();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create rule");
    }
  };

  const columns: AdminTableColumn<UnclassifiedApp>[] = [
    {
      key: "select",
      header: (
        <input
          type="checkbox"
          checked={selectedApps.length === filteredApps.length && filteredApps.length > 0}
          onChange={toggleSelectAll}
          className="rounded"
        />
      ),
      render: (app) => (
        <input
          type="checkbox"
          checked={selectedApps.includes(app.id)}
          onChange={() => toggleSelectApp(app.id)}
          className="rounded"
        />
      ),
    },
    {
      key: "appName",
      header: "App Name / Domain",
      render: (app) => {
        const domain = app.appType === "web" ? extractDomain(app.appName) : app.appName;
        const isUrl = app.appType === "web" && isURL(app.appName);
        return (
          <div className="space-y-1">
            <span className="font-medium">{app.appName}</span>
            {isUrl && domain !== app.appName && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Domain: {domain}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "appType",
      header: "Type",
      render: (app) => (
        <span className="capitalize px-2 py-1 bg-gray-100 rounded text-sm">
          {app.appType}
        </span>
      ),
    },
    {
      key: "team",
      header: "Team",
      render: (app) => (
        <span>{app.team ? app.team.name : app.teamId ? `Team ${app.teamId}` : "Org-wide"}</span>
      ),
    },
    {
      key: "eventCount",
      header: "Events",
      render: (app) => <span>{app.eventCount}</span>,
    },
    {
      key: "firstSeen",
      header: "First Seen",
      render: (app) => (
        <span>{new Date(app.firstSeen).toLocaleDateString()}</span>
      ),
    },
    {
      key: "lastSeen",
      header: "Last Seen",
      render: (app) => (
        <span>{new Date(app.lastSeen).toLocaleDateString()}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (app) => {
        const statusColors = {
          pending: getSemanticColor("warning").badge,
          reviewed: getSemanticColor("info").badge,
          classified: getSemanticColor("success").badge,
        };
        return (
          <span className={`capitalize px-2 py-1 rounded text-sm ${statusColors[app.status]}`}>
            {app.status}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (app) => {
        const domain = app.appType === "web" ? extractDomain(app.appName) : null;
        const isUrl = app.appType === "web" && isURL(app.appName);
        
        return (
          <div className="flex items-center gap-2">
            {app.appType === "web" && domain && (
              <>
                <button
                  onClick={() => handleQuickCreateDomainRule(app, "productive")}
                  className={`px-2 py-1 ${getCategoryStylesUtil("productive").badge} rounded text-xs hover:bg-green-200 dark:hover:bg-green-800`}
                  title="Create domain rule (productive)"
                >
                  Domain: Prod
                </button>
                <button
                  onClick={() => handleQuickCreateDomainRule(app, "unproductive")}
                  className={`px-2 py-1 ${getCategoryStylesUtil("unproductive").badge} rounded text-xs hover:bg-red-200 dark:hover:bg-red-800`}
                  title="Create domain rule (unproductive)"
                >
                  Domain: Unprod
                </button>
                {isUrl && (
                  <button
                    onClick={() => {
                      setSelectedApp(app);
                      setIsClassifyModalOpen(true);
                    }}
                    className={`px-2 py-1 ${getSemanticColor("info").badge} rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-800`}
                    title="Create URL rule"
                  >
                    URL Rule
                  </button>
                )}
              </>
            )}
            <button
              onClick={() => {
                setSelectedApp(app);
                setIsClassifyModalOpen(true);
              }}
                  className={`px-2 py-1 ${getCategoryStylesUtil("neutral").badge} rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600`}
              title="Classify"
            >
              Classify
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <AuthGuard requiredRoles={["ORG_ADMIN"]}>
      <div className="space-y-6">
        <PageHeader
          title="Unclassified Apps"
          description="Review and classify apps/domains that haven't been categorized"
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Unclassified</div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">By Team</div>
            <div className="text-2xl font-bold mt-1">
              {Object.keys(stats.byTeam).length} teams
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Pending Review</div>
            <div className="text-2xl font-bold mt-1">
              {unclassifiedApps.filter((a) => a.status === "pending").length}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Selected</div>
            <div className="text-2xl font-bold mt-1">{selectedApps.length}</div>
          </div>
        </div>

        <DataToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          actions={
            selectedApps.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    resetBulkAdd();
                    setIsBulkAddModalOpen(true);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 ${getPrimaryButtonStyle()} rounded-lg`}
                >
                  <BiPlus size={20} />
                  Add to Collection ({selectedApps.length})
                </button>
                <button
                  onClick={() => handleBulkClassify("productive")}
                  className={`flex items-center gap-2 px-4 py-2 ${getSemanticColor("success").button} text-white rounded-lg`}
                >
                  <BiCheck size={20} />
                  Mark as Productive ({selectedApps.length})
                </button>
                <button
                  onClick={() => handleBulkClassify("unproductive")}
                  className={`flex items-center gap-2 px-4 py-2 ${getSemanticColor("error").button} text-white rounded-lg`}
                >
                  <BiX size={20} />
                  Mark as Unproductive ({selectedApps.length})
                </button>
                <button
                  onClick={() => handleBulkClassify("neutral")}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <BiMinus size={20} />
                  Mark as Neutral ({selectedApps.length})
                </button>
              </div>
            )
          }
        />

        <div className="flex gap-4 mb-4">
          <select
            value={teamFilter}
            onChange={(e) =>
              setTeamFilter(e.target.value === "all" ? "all" : parseInt(e.target.value))
            }
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Teams</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>

          <select
            value={appTypeFilter}
            onChange={(e) => setAppTypeFilter(e.target.value as AppType | "all")}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Types</option>
            <option value="desktop">Desktop</option>
            <option value="web">Web</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as UnclassifiedAppStatus | "all")}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="classified">Classified</option>
          </select>
        </div>

        {error && (
          <div className={`p-4 ${getSemanticColor("error").bg} ${getSemanticColor("error").border} rounded-lg ${getSemanticColor("error").text}`}>
            {error}
          </div>
        )}

        <AdminDataTable
          data={filteredApps}
          columns={columns}
          loading={loading}
          emptyMessage="No unclassified apps found."
        />

        {/* Classify Modal */}
        <ModalForm
          isOpen={isClassifyModalOpen}
          onClose={() => {
            setIsClassifyModalOpen(false);
            setSelectedApp(null);
            resetClassify();
          }}
          title="Classify App"
          onSubmit={handleSubmitClassify(handleClassify)}
          isSubmitting={isSubmittingClassify}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">App Name</label>
              <input
                type="text"
                value={selectedApp?.appName || ""}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                {...registerClassify("category", { required: "Category is required" })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="productive">Productive</option>
                <option value="unproductive">Unproductive</option>
                <option value="neutral">Neutral</option>
              </select>
              {errorsClassify.category && (
                <p className={`${getSemanticColor("error").text} text-sm mt-1`}>{errorsClassify.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Apply to Team (optional)
              </label>
              <select
                {...registerClassify("applyToTeamId")}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Use app's team or org-wide</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </ModalForm>

        {/* Bulk Add to Collection Modal */}
        <ModalForm
          isOpen={isBulkAddModalOpen}
          onClose={() => {
            setIsBulkAddModalOpen(false);
            resetBulkAdd();
          }}
          title={`Add ${selectedApps.length} App(s) to Collection`}
          onSubmit={handleSubmitBulkAdd(handleBulkAddToCollection)}
          isSubmitting={isSubmittingBulkAdd}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Collection</label>
              <select
                {...registerBulkAdd("collectionId", { required: "Collection is required" })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select a collection</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                    {collection.description && ` - ${collection.description}`}
                  </option>
                ))}
              </select>
              {errorsBulkAdd.collectionId && (
                <p className={`${getSemanticColor("error").text} text-sm mt-1`}>{errorsBulkAdd.collectionId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                {...registerBulkAdd("category", { required: "Category is required" })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="productive">Productive</option>
                <option value="unproductive">Unproductive</option>
                <option value="neutral">Neutral</option>
              </select>
              {errorsBulkAdd.category && (
                <p className={`${getSemanticColor("error").text} text-sm mt-1`}>{errorsBulkAdd.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Team (optional - will assign collection to this team if not already assigned)
              </label>
              <select
                {...registerBulkAdd("teamId")}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">No specific team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                This will add {selectedApps.length} app(s) to the selected collection with the
                chosen category, and classify them as reviewed.
              </p>
            </div>
          </div>
        </ModalForm>
      </div>
    </AuthGuard>
  );
};

export default UnclassifiedAppsPage;
