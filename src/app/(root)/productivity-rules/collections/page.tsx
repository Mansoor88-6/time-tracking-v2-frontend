"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataToolbar } from "@/components/admin/DataToolbar";
import { AdminDataTable, AdminTableColumn } from "@/components/admin/AdminDataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ModalForm } from "@/components/admin/ModalForm";
import {
  ruleCollectionsApi,
  RuleCollection,
  CreateCollectionDto,
  SuggestedApp,
  AppType,
  AppCategory,
  RuleType,
} from "@/lib/api/rule-collections";
import { teamsApi, Team } from "@/lib/api/teams";
import { productivityRulesApi, TeamProductivityRule } from "@/lib/api/productivity-rules";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";
import { BiPlus, BiEdit, BiTrash, BiX, BiCheck } from "react-icons/bi";
import { useForm } from "react-hook-form";
import { FloatingInput } from "@/components/ui/Input/FloatingInput";
import { toast } from "react-toastify";

interface CollectionFormData {
  name: string;
  description?: string;
  teamIds: string[];
}

interface SelectedRule {
  appName: string;
  appType: AppType;
  category: AppCategory;
  ruleType?: RuleType;
  pattern?: string;
  suggestedCategory?: AppCategory; // Only for UI, will be filtered out before sending
}

const CollectionsPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [collections, setCollections] = useState<RuleCollection[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [suggestedApps, setSuggestedApps] = useState<{ desktop: SuggestedApp[]; web: SuggestedApp[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<RuleCollection | null>(null);
  const [selectedRules, setSelectedRules] = useState<SelectedRule[]>([]);
  const [selectedAppType, setSelectedAppType] = useState<AppType | "all">("all");
  const [bulkCategory, setBulkCategory] = useState<AppCategory>("productive");

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    watch: watchCreate,
    formState: { errors: errorsCreate, isSubmitting: isSubmittingCreate },
  } = useForm<CollectionFormData>();

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
  } = useForm<CollectionFormData>();

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
      setLoading(true);
      const data = await ruleCollectionsApi.list();
      setCollections(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load collections");
      toast.error("Failed to load collections");
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestedApps = async () => {
    try {
      const data = await ruleCollectionsApi.getSuggestions();
      setSuggestedApps(data);
    } catch (err) {
      console.error("Failed to load suggested apps:", err);
    }
  };

  useEffect(() => {
    void loadTeams();
    void loadCollections();
    void loadSuggestedApps();
  }, []);

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async (data: CollectionFormData) => {
    if (selectedRules.length === 0) {
      toast.error("Please select at least one app/domain");
      return;
    }

    try {
      // Remove suggestedCategory from rules before sending to backend
      const rulesToSend = selectedRules.map(({ suggestedCategory, ...rule }) => rule);
      
      await ruleCollectionsApi.create({
        name: data.name,
        description: data.description,
        teamIds: data.teamIds.map((id) => parseInt(id)),
        rules: rulesToSend,
      });
      toast.success("Collection created successfully");
      setIsCreateModalOpen(false);
      resetCreate();
      setSelectedRules([]);
      await loadCollections();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create collection");
    }
  };

  const handleEdit = async (data: CollectionFormData) => {
    if (!selectedCollection) return;
    try {
      await ruleCollectionsApi.update(selectedCollection.id, {
        name: data.name,
        description: data.description,
      });
      toast.success("Collection updated successfully");
      setIsEditModalOpen(false);
      setSelectedCollection(null);
      resetEdit();
      await loadCollections();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update collection");
    }
  };

  const handleDelete = async () => {
    if (!selectedCollection) return;
    try {
      await ruleCollectionsApi.delete(selectedCollection.id);
      toast.success("Collection deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedCollection(null);
      await loadCollections();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete collection");
    }
  };

  const toggleRuleSelection = (rule: SuggestedApp) => {
    setSelectedRules((prev) => {
      const exists = prev.find(
        (r) => r.appName === rule.appName && r.appType === rule.appType
      );
      if (exists) {
        return prev.filter(
          (r) => !(r.appName === rule.appName && r.appType === rule.appType)
        );
      } else {
        return [...prev, { ...rule, category: rule.suggestedCategory }];
      }
    });
  };

  const updateRuleCategory = (appName: string, appType: AppType, category: AppCategory) => {
    setSelectedRules((prev) =>
      prev.map((r) =>
        r.appName === appName && r.appType === appType
          ? { ...r, category }
          : r
      )
    );
  };

  const updateRuleType = (appName: string, appType: AppType, ruleType: RuleType) => {
    setSelectedRules((prev) =>
      prev.map((r) =>
        r.appName === appName && r.appType === appType
          ? { ...r, ruleType, pattern: ruleType === RuleType.DOMAIN ? undefined : r.pattern }
          : r
      )
    );
  };

  const updateRulePattern = (appName: string, appType: AppType, pattern: string) => {
    setSelectedRules((prev) =>
      prev.map((r) =>
        r.appName === appName && r.appType === appType
          ? { ...r, pattern: pattern || undefined }
          : r
      )
    );
  };

  const applyBulkCategory = () => {
    setSelectedRules((prev) =>
      prev.map((r) => ({ ...r, category: bulkCategory }))
    );
  };

  const getDisplayedSuggestions = () => {
    if (!suggestedApps) return { desktop: [], web: [] };
    if (selectedAppType === "all") return suggestedApps;
    return {
      desktop: selectedAppType === "desktop" ? suggestedApps.desktop : [],
      web: selectedAppType === "web" ? suggestedApps.web : [],
    };
  };

  const columns: AdminTableColumn<RuleCollection>[] = [
    {
      key: "name",
      header: "Collection Name",
      render: (collection) => (
        <div>
          <span className="font-medium">{collection.name}</span>
          {collection.description && (
            <p className="text-sm text-gray-500 mt-1">{collection.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "teams",
      header: "Teams",
      render: (collection) => (
        <div className="flex flex-wrap gap-1">
          {collection.teamAssignments?.map((assignment) => (
            <span
              key={assignment.id}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
            >
              {assignment.team.name}
            </span>
          )) || <span className="text-gray-400 text-sm">No teams</span>}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (collection) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedCollection(collection);
              setIsDetailsModalOpen(true);
            }}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="View Details"
          >
            <BiEdit size={18} />
          </button>
          <button
            onClick={() => {
              setSelectedCollection(collection);
              resetEdit({
                name: collection.name,
                description: collection.description || "",
                teamIds: collection.teamAssignments?.map((ta) => ta.teamId.toString()) || [],
              });
              setIsEditModalOpen(true);
            }}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="Edit"
          >
            <BiEdit size={18} />
          </button>
          <button
            onClick={() => {
              setSelectedCollection(collection);
              setIsDeleteDialogOpen(true);
            }}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
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
          title="Rule Collections"
          description="Create and manage rule collections that can be shared across teams"
        />

        <DataToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          actions={
            <button
              onClick={() => {
                resetCreate();
                setSelectedRules([]);
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <BiPlus size={20} />
              Create Collection
            </button>
          }
        />

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        <AdminDataTable
          data={filteredCollections}
          columns={columns}
          loading={loading}
          emptyMessage="No collections found. Create your first collection to get started."
        />

        {/* Create Collection Modal */}
        <ModalForm
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            resetCreate();
            setSelectedRules([]);
          }}
          title="Create Rule Collection"
          onSubmit={handleSubmitCreate(handleCreate)}
          isSubmitting={isSubmittingCreate}
          size="large"
        >
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg dark:text-white">Basic Information</h3>
              <FloatingInput
                label="Collection Name"
                {...registerCreate("name", { required: "Name is required" })}
                error={errorsCreate.name?.message}
              />
              <FloatingInput
                label="Description (optional)"
                {...registerCreate("description")}
                error={errorsCreate.description?.message}
              />
            </div>

            {/* Team Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg dark:text-white">Assign to Teams</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-800">
                {teams.map((team) => (
                  <label key={team.id} className="flex items-center gap-2 cursor-pointer text-slate-900 dark:text-slate-100">
                    <input
                      type="checkbox"
                      value={team.id}
                      {...registerCreate("teamIds", { required: "Select at least one team" })}
                      className="rounded"
                    />
                    <span>{team.name}</span>
                  </label>
                ))}
              </div>
              {errorsCreate.teamIds && (
                <p className="text-red-600 dark:text-red-400 text-sm">{errorsCreate.teamIds.message}</p>
              )}
            </div>

            {/* Suggested Apps */}
            {suggestedApps && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg dark:text-white">Select Apps/Domains</h3>
                  <div className="flex gap-2">
                    <select
                      value={selectedAppType}
                      onChange={(e) => setSelectedAppType(e.target.value as AppType | "all")}
                      className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      <option value="all">All Types</option>
                      <option value="desktop">Desktop</option>
                      <option value="web">Web</option>
                    </select>
                    {selectedRules.length > 0 && (
                      <div className="flex gap-2">
                        <select
                          value={bulkCategory}
                          onChange={(e) => setBulkCategory(e.target.value as AppCategory)}
                          className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        >
                          <option value="productive">Productive</option>
                          <option value="unproductive">Unproductive</option>
                          <option value="neutral">Neutral</option>
                        </select>
                        <button
                          type="button"
                          onClick={applyBulkCategory}
                          className="px-3 py-1 bg-gray-600 dark:bg-gray-500 text-white rounded text-sm hover:bg-gray-700 dark:hover:bg-gray-600"
                        >
                          Apply to Selected
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Desktop Apps */}
                  {(selectedAppType === "all" || selectedAppType === "desktop") && (
                    <div>
                      <h4 className="font-medium mb-2 dark:text-white">Desktop Applications</h4>
                      <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2 bg-white dark:bg-slate-800">
                        {getDisplayedSuggestions().desktop.map((app) => {
                          const isSelected = selectedRules.some(
                            (r) => r.appName === app.appName && r.appType === app.appType
                          );
                          const selectedRule = selectedRules.find(
                            (r) => r.appName === app.appName && r.appType === app.appType
                          );
                          return (
                            <div
                              key={`${app.appType}-${app.appName}`}
                              className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded text-slate-900 dark:text-slate-100"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleRuleSelection(app)}
                                className="rounded"
                              />
                              <span className="flex-1">{app.appName}</span>
                              {isSelected && (
                                <select
                                  value={selectedRule?.category || app.suggestedCategory}
                                  onChange={(e) =>
                                    updateRuleCategory(
                                      app.appName,
                                      app.appType,
                                      e.target.value as AppCategory
                                    )
                                  }
                                  className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                >
                                  <option value="productive">Productive</option>
                                  <option value="unproductive">Unproductive</option>
                                  <option value="neutral">Neutral</option>
                                </select>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Web Domains */}
                  {(selectedAppType === "all" || selectedAppType === "web") && (
                    <div>
                      <h4 className="font-medium mb-2 dark:text-white">Web Domains</h4>
                      <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2 bg-white dark:bg-slate-800">
                        {getDisplayedSuggestions().web.map((app) => {
                          const isSelected = selectedRules.some(
                            (r) => r.appName === app.appName && r.appType === app.appType
                          );
                          const selectedRule = selectedRules.find(
                            (r) => r.appName === app.appName && r.appType === app.appType
                          );
                          return (
                            <div
                              key={`${app.appType}-${app.appName}`}
                              className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded text-slate-900 dark:text-slate-100"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleRuleSelection(app)}
                                className="rounded"
                              />
                              <span className="flex-1">{app.appName}</span>
                              {isSelected && (
                                <select
                                  value={selectedRule?.category || app.suggestedCategory}
                                  onChange={(e) =>
                                    updateRuleCategory(
                                      app.appName,
                                      app.appType,
                                      e.target.value as AppCategory
                                    )
                                  }
                                  className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                >
                                  <option value="productive">Productive</option>
                                  <option value="unproductive">Unproductive</option>
                                  <option value="neutral">Neutral</option>
                                </select>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom URL/Domain Input */}
                <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 className="font-medium dark:text-white">Add Custom URL or Domain</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., github.com or https://github.com/login"
                      className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.currentTarget.value.trim()) {
                          const value = e.currentTarget.value.trim();
                          const newRule: SelectedRule = {
                            appName: value,
                            appType: "web",
                            category: "neutral",
                            ruleType: value.includes("://") || value.includes("/") ? RuleType.URL_EXACT : RuleType.DOMAIN,
                          };
                          setSelectedRules((prev) => [...prev, newRule]);
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        if (input?.value.trim()) {
                          const value = input.value.trim();
                          const newRule: SelectedRule = {
                            appName: value,
                            appType: "web",
                            category: "neutral",
                            ruleType: value.includes("://") || value.includes("/") ? RuleType.URL_EXACT : RuleType.DOMAIN,
                          };
                          setSelectedRules((prev) => [...prev, newRule]);
                          input.value = "";
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded text-sm hover:bg-blue-700 dark:hover:bg-blue-600"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Selected Rules Summary */}
                {selectedRules.length > 0 && (
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <h4 className="font-medium mb-2 dark:text-white">
                      Selected: {selectedRules.length} app(s)
                    </h4>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {selectedRules.map((rule, idx) => (
                        <div
                          key={idx}
                          className="p-2 bg-gray-50 dark:bg-slate-700 rounded text-sm text-slate-900 dark:text-slate-100"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">
                              {rule.appName} ({rule.appType})
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedRules((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                )
                              }
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            >
                              <BiX size={16} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {rule.appType === "web" && (
                              <>
                                <select
                                  value={rule.ruleType || RuleType.DOMAIN}
                                  onChange={(e) =>
                                    updateRuleType(rule.appName, rule.appType, e.target.value as RuleType)
                                  }
                                  className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                >
                                  <option value={RuleType.DOMAIN}>Domain</option>
                                  <option value={RuleType.URL_EXACT}>Exact URL</option>
                                  <option value={RuleType.URL_PATTERN}>Pattern</option>
                                </select>
                                {(rule.ruleType === RuleType.URL_EXACT || rule.ruleType === RuleType.URL_PATTERN) && (
                                  <input
                                    type="text"
                                    placeholder="Pattern (e.g., github.com/*/issues)"
                                    value={rule.pattern || ""}
                                    onChange={(e) =>
                                      updateRulePattern(rule.appName, rule.appType, e.target.value)
                                    }
                                    className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex-1 min-w-[200px]"
                                  />
                                )}
                              </>
                            )}
                            <select
                              value={rule.category}
                              onChange={(e) =>
                                updateRuleCategory(rule.appName, rule.appType, e.target.value as AppCategory)
                              }
                              className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                            >
                              <option value="productive">Productive</option>
                              <option value="unproductive">Unproductive</option>
                              <option value="neutral">Neutral</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ModalForm>

        {/* Edit Modal */}
        <ModalForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCollection(null);
            resetEdit();
          }}
          title="Edit Collection"
          onSubmit={handleSubmitEdit(handleEdit)}
          isSubmitting={isSubmittingEdit}
        >
          <div className="space-y-4">
            <FloatingInput
              label="Collection Name"
              {...registerEdit("name", { required: "Name is required" })}
              error={errorsEdit.name?.message}
            />
            <FloatingInput
              label="Description"
              {...registerEdit("description")}
              error={errorsEdit.description?.message}
            />
          </div>
        </ModalForm>

        {/* Delete Dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedCollection(null);
          }}
          onConfirm={handleDelete}
          title="Delete Collection"
          message={`Are you sure you want to delete the collection "${selectedCollection?.name}"? This will also delete all rules in this collection.`}
        />
      </div>
    </AuthGuard>
  );
};

export default CollectionsPage;
