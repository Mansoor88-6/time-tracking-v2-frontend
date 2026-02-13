"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataToolbar } from "@/components/admin/DataToolbar";
import { AdminDataTable, AdminTableColumn } from "@/components/admin/AdminDataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ModalForm } from "@/components/admin/ModalForm";
import {
  productivityRulesApi,
  TeamProductivityRule,
  CreateRuleDto,
  AppType,
  AppCategory,
} from "@/lib/api/productivity-rules";
import { ruleCollectionsApi, RuleCollection } from "@/lib/api/rule-collections";
import { teamsApi, Team } from "@/lib/api/teams";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState, useMemo } from "react";
import { BiPlus, BiEdit, BiTrash, BiFilter } from "react-icons/bi";
import { useForm } from "react-hook-form";
import { FloatingInput } from "@/components/ui/Input/FloatingInput";
import { toast } from "react-toastify";
import { getColorClassesUtil, getSemanticColor, getCategoryStylesUtil, getPrimaryButtonStyle } from "@/theme/utils";

interface RuleFormData {
  teamId: string;
  appName: string;
  appType: AppType;
  category: AppCategory;
}

const ProductivityRulesPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [rules, setRules] = useState<TeamProductivityRule[]>([]);
  const [collections, setCollections] = useState<RuleCollection[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<AppCategory | "all">("all");
  const [viewMode, setViewMode] = useState<"collection" | "flat">("collection");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<TeamProductivityRule | null>(null);

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: errorsCreate, isSubmitting: isSubmittingCreate },
  } = useForm<RuleFormData>();

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
  } = useForm<RuleFormData>();

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

  const loadRules = async (teamId?: number) => {
    try {
      setLoading(true);
      if (teamId) {
        const data = await productivityRulesApi.getTeamRules(teamId);
        setRules(data);
      } else {
        // Load rules for all teams
        const allRules: TeamProductivityRule[] = [];
        for (const team of teams) {
          try {
            const teamRules = await productivityRulesApi.getTeamRules(team.id);
            allRules.push(...teamRules);
          } catch (err) {
            console.error(`Failed to load rules for team ${team.id}:`, err);
          }
        }
        setRules(allRules);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rules");
      toast.error("Failed to load rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTeams();
    void loadCollections();
  }, []);

  useEffect(() => {
    if (teams.length > 0) {
      void loadRules(selectedTeamId || undefined);
    }
  }, [selectedTeamId, teams]);

  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      const matchesSearch = rule.appName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || rule.category === categoryFilter;
      const matchesCollection = !selectedCollectionId || rule.collectionId === selectedCollectionId;
      return matchesSearch && matchesCategory && matchesCollection;
    });
  }, [rules, searchQuery, categoryFilter, selectedCollectionId]);

  const rulesByCollection = useMemo(() => {
    if (viewMode === "flat") return null;
    
    const grouped: Record<string | number, { collection: RuleCollection | null; rules: TeamProductivityRule[] }> = {};
    
    // Group by collection
    filteredRules.forEach((rule) => {
      const key = rule.collectionId || "no-collection";
      if (!grouped[key]) {
        grouped[key] = {
          collection: rule.collectionId
            ? collections.find((c) => c.id === rule.collectionId) || null
            : null,
          rules: [],
        };
      }
      grouped[key].rules.push(rule);
    });

    // Also include rules without collection
    if (!grouped["no-collection"]) {
      grouped["no-collection"] = {
        collection: null,
        rules: [],
      };
    }

    return grouped;
  }, [filteredRules, collections, viewMode]);

  const handleCreate = async (data: RuleFormData) => {
    try {
      await productivityRulesApi.create({
        teamId: parseInt(data.teamId),
        appName: data.appName,
        appType: data.appType,
        category: data.category,
      });
      toast.success("Rule created successfully");
      setIsCreateModalOpen(false);
      resetCreate();
      await loadRules(selectedTeamId || undefined);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create rule");
    }
  };

  const handleEdit = async (data: RuleFormData) => {
    if (!selectedRule) return;
    try {
      await productivityRulesApi.update(selectedRule.id, {
        category: data.category,
      });
      toast.success("Rule updated successfully");
      setIsEditModalOpen(false);
      setSelectedRule(null);
      resetEdit();
      await loadRules(selectedTeamId || undefined);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update rule");
    }
  };

  const handleDelete = async () => {
    if (!selectedRule) return;
    try {
      await productivityRulesApi.delete(selectedRule.id);
      toast.success("Rule deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedRule(null);
      await loadRules(selectedTeamId || undefined);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete rule");
    }
  };

  const columns: AdminTableColumn<TeamProductivityRule>[] = [
    {
      key: "appName",
      header: "App Name",
      render: (rule) => <span className="font-medium">{rule.appName}</span>,
    },
    {
      key: "appType",
      header: "Type",
      render: (rule) => (
        <span className="capitalize px-2 py-1 bg-gray-100 rounded text-sm">
          {rule.appType}
        </span>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (rule) => {
        const categoryStyles = getCategoryStylesUtil(rule.category);
        return (
          <span className={`capitalize px-2 py-1 rounded text-sm ${categoryStyles.badge}`}>
            {rule.category}
          </span>
        );
      },
    },
    {
      key: "collection",
      header: "Collection",
      render: (rule) => {
        if (rule.collection) {
          const purpleColors = getColorClassesUtil("purple");
          return (
            <span className={`px-2 py-1 ${purpleColors.badge} rounded text-xs`}>
              {rule.collection.name}
            </span>
          );
        }
        return <span className="text-gray-400 text-sm">No collection</span>;
      },
    },
    {
      key: "teamId",
      header: "Team",
      render: (rule) => {
        const team = teams.find((t) => t.id === rule.teamId);
        return <span>{team?.name || `Team ${rule.teamId}`}</span>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (rule) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              const team = teams.find((t) => t.id === rule.teamId);
              setSelectedRule(rule);
              resetEdit({
                teamId: rule.teamId.toString(),
                appName: rule.appName,
                appType: rule.appType,
                category: rule.category,
              });
              setIsEditModalOpen(true);
            }}
            className={`p-1 ${getSemanticColor("info").text} hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded`}
            title="Edit"
          >
            <BiEdit size={18} />
          </button>
          <button
            onClick={() => {
              setSelectedRule(rule);
              setIsDeleteDialogOpen(true);
            }}
            className={`p-1 ${getSemanticColor("error").text} hover:bg-red-50 dark:hover:bg-red-900/20 rounded`}
            title="Delete"
          >
            <BiTrash size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AuthGuard requiredRoles={["ORG_ADMIN"]}>
      <div className="space-y-6">
        <PageHeader
          title="Productivity Rules"
          description="Manage team-based productivity rules for apps and websites"
        />

        <DataToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          actions={
            <button
              onClick={() => {
                resetCreate();
                setIsCreateModalOpen(true);
              }}
              className={`flex items-center gap-2 px-4 py-2 ${getPrimaryButtonStyle()} rounded-lg`}
            >
              <BiPlus size={20} />
              Add Rule
            </button>
          }
        />

        <div className="flex gap-4 mb-4 flex-wrap">
          <select
            value={selectedTeamId || ""}
            onChange={(e) => setSelectedTeamId(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">All Teams</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCollectionId || ""}
            onChange={(e) => setSelectedCollectionId(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">All Collections</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as AppCategory | "all")}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Categories</option>
            <option value="productive">Productive</option>
            <option value="unproductive">Unproductive</option>
            <option value="neutral">Neutral</option>
          </select>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">View:</span>
            <button
              onClick={() => setViewMode("collection")}
              className={`px-3 py-2 rounded text-sm ${
                viewMode === "collection"
                  ? `${getPrimaryButtonStyle()}`
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              By Collection
            </button>
            <button
              onClick={() => setViewMode("flat")}
              className={`px-3 py-2 rounded text-sm ${
                viewMode === "flat"
                  ? `${getPrimaryButtonStyle()}`
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Flat List
            </button>
          </div>
        </div>

        {error && (
          <div className={`p-4 ${getSemanticColor("error").bg} ${getSemanticColor("error").border} rounded-lg ${getSemanticColor("error").text}`}>
            {error}
          </div>
        )}

        {viewMode === "collection" && rulesByCollection ? (
          <div className="space-y-6">
            {Object.entries(rulesByCollection).map(([key, group]) => (
              <div key={key} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {group.collection ? (
                      <span>
                        {group.collection.name}
                        {group.collection.description && (
                          <span className="text-sm font-normal text-gray-500 ml-2">
                            - {group.collection.description}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-500">Rules without Collection</span>
                    )}
                  </h3>
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {group.rules.length} rule(s)
                  </span>
                </div>
                <AdminDataTable
                  data={group.rules}
                  columns={columns}
                  loading={false}
                  emptyMessage="No rules in this collection."
                />
              </div>
            ))}
            {Object.keys(rulesByCollection).length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                No rules found. Create your first collection to get started.
              </div>
            )}
          </div>
        ) : (
          <AdminDataTable
            data={filteredRules}
            columns={columns}
            loading={loading}
            emptyMessage="No rules found. Create your first rule to get started."
          />
        )}

        {/* Create Modal */}
        <ModalForm
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            resetCreate();
          }}
          title="Create Productivity Rule"
          onSubmit={handleSubmitCreate(handleCreate)}
          isSubmitting={isSubmittingCreate}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Team</label>
              <select
                {...registerCreate("teamId", { required: "Team is required" })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select a team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              {errorsCreate.teamId && (
                <p className={`${getSemanticColor("error").text} text-sm mt-1`}>{errorsCreate.teamId.message}</p>
              )}
            </div>

            <FloatingInput
              label="App Name / Domain"
              {...registerCreate("appName", { required: "App name is required" })}
              error={errorsCreate.appName?.message}
            />

            <div>
              <label className="block text-sm font-medium mb-1">App Type</label>
              <select
                {...registerCreate("appType", { required: "App type is required" })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select type</option>
                <option value="desktop">Desktop</option>
                <option value="web">Web</option>
              </select>
              {errorsCreate.appType && (
                <p className={`${getSemanticColor("error").text} text-sm mt-1`}>{errorsCreate.appType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                {...registerCreate("category", { required: "Category is required" })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select category</option>
                <option value="productive">Productive</option>
                <option value="unproductive">Unproductive</option>
                <option value="neutral">Neutral</option>
              </select>
              {errorsCreate.category && (
                <p className={`${getSemanticColor("error").text} text-sm mt-1`}>{errorsCreate.category.message}</p>
              )}
            </div>
          </div>
        </ModalForm>

        {/* Edit Modal */}
        <ModalForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRule(null);
            resetEdit();
          }}
          title="Edit Productivity Rule"
          onSubmit={handleSubmitEdit(handleEdit)}
          isSubmitting={isSubmittingEdit}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">App Name</label>
              <input
                type="text"
                value={selectedRule?.appName || ""}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                {...registerEdit("category", { required: "Category is required" })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="productive">Productive</option>
                <option value="unproductive">Unproductive</option>
                <option value="neutral">Neutral</option>
              </select>
              {errorsEdit.category && (
                <p className={`${getSemanticColor("error").text} text-sm mt-1`}>{errorsEdit.category.message}</p>
              )}
            </div>
          </div>
        </ModalForm>

        {/* Delete Dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedRule(null);
          }}
          onConfirm={handleDelete}
          title="Delete Rule"
          message={`Are you sure you want to delete the rule for "${selectedRule?.appName}"?`}
        />
      </div>
    </AuthGuard>
  );
};

export default ProductivityRulesPage;
