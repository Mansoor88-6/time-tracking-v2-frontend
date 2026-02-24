"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataToolbar } from "@/components/admin/DataToolbar";
import { AdminDataTable, AdminTableColumn } from "@/components/admin/AdminDataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ModalForm } from "@/components/admin/ModalForm";
import { RuleCollectionDrawer } from "@/components/ui/Drawer/RuleCollectionDrawer";
import { ViewCollectionDrawer } from "@/components/ui/Drawer";
import {
  useListCollectionsQuery,
  useGetCollectionQuery,
  useGetCollectionRulesQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
  ruleCollectionsApi as rtkRuleCollectionsApi,
} from "@/redux/services/ruleCollectionsApi";
import {
  ruleCollectionsApi,
  RuleCollection,
  CreateCollectionDto,
  SuggestedApp,
  RuleType,
} from "@/lib/api/rule-collections";
import { AppType, AppCategory } from "@/lib/api/productivity-rules";
import { teamsApi, Team } from "@/lib/api/teams";
import { productivityRulesApi, TeamProductivityRule } from "@/lib/api/productivity-rules";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { useEffect, useState, useRef } from "react";
import { BiPlus, BiEdit, BiTrash, BiX, BiCheck, BiShow } from "react-icons/bi";
import { useForm } from "react-hook-form";
import { FloatingInput } from "@/components/ui/Input/FloatingInput";
import { toast } from "react-toastify";
import { getColorClassesUtil, getSemanticColor, getPrimaryButtonStyle } from "@/theme/utils";

// Stable empty array to avoid infinite useEffect loops when RTK Query returns undefined (default [] is a new ref every render)
const EMPTY_COLLECTION_RULES: TeamProductivityRule[] = [];

interface CollectionFormData {
  name: string;
  description?: string;
  teamIds: string[];
}

interface SelectedRule {
  tempId?: string; // Frontend-only, for bulk selection tracking
  appName: string;
  appType: AppType;
  category: AppCategory;
  ruleType?: RuleType;
  pattern?: string;
  suggestedCategory?: AppCategory; // Only for UI, will be filtered out before sending
}

const CollectionsPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [teams, setTeams] = useState<Team[]>([]);
  const [suggestedApps, setSuggestedApps] = useState<{ desktop: SuggestedApp[]; web: SuggestedApp[] } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<RuleCollection | null>(null);
  const [selectedRules, setSelectedRules] = useState<SelectedRule[]>([]);
  const [selectedAppType, setSelectedAppType] = useState<AppType | "all">("all");
  const [bulkCategory, setBulkCategory] = useState<AppCategory>("productive");
  const [viewCollectionRules, setViewCollectionRules] = useState<TeamProductivityRule[]>([]);
  const [isLoadingViewRules, setIsLoadingViewRules] = useState(false);
  const customInputRef = useRef<HTMLInputElement>(null);

  // RTK Query hooks
  const {
    data: collections = [],
    isLoading: loading,
    error: collectionsError,
  } = useListCollectionsQuery();

  const {
    data: viewCollection,
    isLoading: isLoadingCollection,
  } = useGetCollectionQuery(selectedCollection?.id ?? 0, {
    skip: !selectedCollection || !isViewDrawerOpen,
  });

  const {
    data: collectionRulesData,
    isLoading: isLoadingRules,
    refetch: refetchCollectionRules,
  } = useGetCollectionRulesQuery(selectedCollection?.id ?? 0, {
    skip: !selectedCollection?.id || !isViewDrawerOpen,
  });
  const collectionRules = collectionRulesData ?? EMPTY_COLLECTION_RULES;

  // Fallback: Load rules directly if RTK Query doesn't return data
  useEffect(() => {
    if (isViewDrawerOpen && selectedCollection?.id) {
      if (collectionRules.length === 0 && !isLoadingRules) {
        // Try direct API call as fallback
        ruleCollectionsApi
          .getCollectionRules(selectedCollection.id)
          .then((rules) => {
            setViewCollectionRules(rules);
          })
          .catch((err) => {
            console.error("Failed to fetch collection rules:", err);
            setViewCollectionRules([]);
          });
      } else if (collectionRules.length > 0) {
        setViewCollectionRules(collectionRules);
      }
    } else {
      setViewCollectionRules([]);
    }
  }, [isViewDrawerOpen, selectedCollection?.id, collectionRules, isLoadingRules]);

  const dispatch = useAppDispatch();
  const [createCollection] = useCreateCollectionMutation();
  const [updateCollection] = useUpdateCollectionMutation();
  const [deleteCollection] = useDeleteCollectionMutation();

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
    void loadSuggestedApps();
  }, []);

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const error = collectionsError
    ? "message" in collectionsError
      ? collectionsError.message
      : "Failed to load collections"
    : null;

  const handleCreate = async (data: CollectionFormData) => {
    if (selectedRules.length === 0) {
      toast.error("Please select at least one app/domain");
      return;
    }

    try {
      // Remove frontend-only properties (tempId, suggestedCategory) from rules before sending to backend
      const rulesToSend = selectedRules.map(({ tempId, suggestedCategory, ...rule }) => rule);
      
      await createCollection({
        name: data.name,
        description: data.description,
        teamIds: data.teamIds.map((id) => parseInt(id)),
        rules: rulesToSend,
      }).unwrap();
      toast.success("Collection created successfully");
      setIsCreateModalOpen(false);
      resetCreate();
      setSelectedRules([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create collection");
    }
  };

  const handleEdit = async (data: CollectionFormData) => {
    if (!selectedCollection) return;
    const collectionId = selectedCollection.id;
    try {
      const rulesToSend = selectedRules.map(({ tempId, suggestedCategory, ...rule }) => rule);

      await updateCollection({
        id: collectionId,
        data: {
          name: data.name,
          description: data.description,
          teamIds: data.teamIds.map((id) => parseInt(id, 10)),
          rules: rulesToSend,
        },
      }).unwrap();

      dispatch(
        rtkRuleCollectionsApi.util.invalidateTags([
          { type: "CollectionRules", id: collectionId },
          { type: "Collection", id: collectionId },
          { type: "Collection", id: "LIST" },
        ])
      );

      toast.success("Collection updated successfully");
      setIsEditModalOpen(false);
      setSelectedCollection(null);
      resetEdit();
      setSelectedRules([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update collection");
    }
  };

  const handleDelete = async () => {
    if (!selectedCollection) return;
    try {
      await deleteCollection(selectedCollection.id).unwrap();
      toast.success("Collection deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedCollection(null);
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
        return [...prev, { 
          ...rule, 
          category: rule.suggestedCategory,
          tempId: crypto.randomUUID(),
        }];
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
          {collection.teamAssignments?.map((assignment) => {
            const infoColors = getSemanticColor("info");
            return (
              <span
                key={assignment.id}
                className={`px-2 py-1 ${infoColors.badge} rounded text-xs`}
              >
                {assignment.team.name}
              </span>
            );
          }) || <span className="text-gray-400 text-sm">No teams</span>}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (collection) => (
        <div className="flex gap-2">
          <button
            onClick={async () => {
              setSelectedCollection(collection);
              setIsViewDrawerOpen(true);
              setIsLoadingViewRules(true);
              // Load rules immediately when opening view drawer
              try {
                const rules = await ruleCollectionsApi.getCollectionRules(collection.id);
                setViewCollectionRules(rules);
              } catch (err) {
                console.error("Failed to load collection rules:", err);
                toast.error("Failed to load collection rules");
                setViewCollectionRules([]);
              } finally {
                setIsLoadingViewRules(false);
              }
            }}
            className={`p-1 ${getSemanticColor("info").text} hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded`}
            title="View Details"
          >
            <BiShow size={18} />
          </button>
          <button
            onClick={async () => {
              setSelectedCollection(collection);
              // Load collection rules for edit mode
              try {
                const rules = await ruleCollectionsApi.getCollectionRules(collection.id);
                const selectedRulesForEdit: SelectedRule[] = rules.map((rule) => ({
                  tempId: crypto.randomUUID(),
                  appName: rule.appName,
                  appType: rule.appType,
                  category: rule.category,
                  ruleType: (rule.ruleType as RuleType) || undefined,
                  pattern: rule.pattern || undefined,
                }));
                setSelectedRules(selectedRulesForEdit);
                resetEdit({
                  name: collection.name,
                  description: collection.description || "",
                  teamIds: collection.teamAssignments?.map((ta) => ta.teamId.toString()) || [],
                });
                setIsEditModalOpen(true);
              } catch (err) {
                toast.error("Failed to load collection rules");
                console.error(err);
              }
            }}
            className={`p-1 ${getSemanticColor("success").text} hover:bg-green-50 dark:hover:bg-green-900/20 rounded`}
            title="Edit"
          >
            <BiEdit size={18} />
          </button>
          <button
            onClick={() => {
              setSelectedCollection(collection);
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
              className={`flex items-center gap-2 px-4 py-2 ${getPrimaryButtonStyle()} rounded-lg`}
            >
              <BiPlus size={20} />
              Create Collection
            </button>
          }
        />

        {error && (
          <div className={`p-4 ${getSemanticColor("error").bg} ${getSemanticColor("error").border} rounded-lg ${getSemanticColor("error").text}`}>
            {error}
          </div>
        )}

        <AdminDataTable
          data={filteredCollections}
          columns={columns}
          loading={loading}
          emptyMessage="No collections found. Create your first collection to get started."
        />

        {/* Create Collection Drawer */}
        <RuleCollectionDrawer
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            resetCreate();
            setSelectedRules([]);
          }}
          onSubmit={handleSubmitCreate(handleCreate)}
          isLoading={isSubmittingCreate}
          teams={teams}
          suggestedApps={suggestedApps}
          selectedRules={selectedRules}
          setSelectedRules={setSelectedRules}
          selectedAppType={selectedAppType}
          setSelectedAppType={setSelectedAppType}
          bulkCategory={bulkCategory}
          setBulkCategory={setBulkCategory}
          applyBulkCategory={applyBulkCategory}
          toggleRuleSelection={toggleRuleSelection}
          updateRuleCategory={updateRuleCategory}
          updateRuleType={updateRuleType}
          updateRulePattern={updateRulePattern}
          register={registerCreate}
          errors={errorsCreate}
          customInputRef={customInputRef}
        />

        {/* View Drawer */}
        <ViewCollectionDrawer
          isOpen={isViewDrawerOpen}
          onClose={() => {
            setIsViewDrawerOpen(false);
            setSelectedCollection(null);
            setViewCollectionRules([]);
            setIsLoadingViewRules(false);
          }}
          collection={viewCollection || selectedCollection}
          rules={viewCollectionRules.length > 0 ? viewCollectionRules : collectionRules}
          teams={teams}
          isLoading={isLoadingViewRules || isLoadingRules}
        />

        {/* Edit Drawer */}
        {selectedCollection && (
          <RuleCollectionDrawer
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedCollection(null);
              resetEdit();
              setSelectedRules([]);
            }}
            onSubmit={handleSubmitEdit(handleEdit)}
            isLoading={isSubmittingEdit}
            teams={teams}
            suggestedApps={suggestedApps}
            selectedRules={selectedRules}
            setSelectedRules={setSelectedRules}
            selectedAppType={selectedAppType}
            setSelectedAppType={setSelectedAppType}
            bulkCategory={bulkCategory}
            setBulkCategory={setBulkCategory}
            applyBulkCategory={applyBulkCategory}
            toggleRuleSelection={toggleRuleSelection}
            updateRuleCategory={updateRuleCategory}
            updateRuleType={updateRuleType}
            updateRulePattern={updateRulePattern}
            register={registerEdit}
            errors={errorsEdit}
            customInputRef={customInputRef}
            mode="edit"
            initialCollection={
              selectedCollection
                ? {
                    id: selectedCollection.id,
                    name: selectedCollection.name,
                    description: selectedCollection.description || undefined,
                    teamIds:
                      selectedCollection.teamAssignments?.map((ta) => ta.teamId) || [],
                    rules: selectedRules.length > 0 
                      ? selectedRules.map(({ tempId, suggestedCategory, ...rule }) => rule)
                      : undefined,
                  }
                : null
            }
          />
        )}

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
