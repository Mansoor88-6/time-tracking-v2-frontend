"use client";
import Modal from "@/components/ui/Modal/Modal";
import {
  DataTable,
  BaseTableData,
  ColumnDefinition,
  DataTableParams,
} from "@/components/ui/Table/DataTable";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import AddAppServicePermission from "./_Forms/AddAppServicePermission";
import UpdateAppServicePermission from "./_Forms/UpdateAppServicePermissions";

//! Column fields as per api resposne and pass as a key to the column object
interface Services extends BaseTableData {
  key: number;
  app_service_id: number;
  app_service_display_name: string;
  app_service_name: string;
  has_access: boolean;
  assigned_at: string;
  last_modified_at: string;
}

const AppServices = () => {
  const { role_uuid } = useParams();
  const columns: ColumnDefinition<Services>[] = [
    {
      key: "app_service_display_name",
      label: "Display Name",
      sortable: true,
    },
    {
      key: "app_service_name",
      label: "Service Name",
      sortable: true,
      renderCell(row) {
        return (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-indigo-200 text-blue-800">
            {row.app_service_name}
          </span>
        );
      },
    },
    {
      key: "has_access",
      label: "Has Access",
      sortable: false,
      renderCell(row) {
        return (
          <div className="flex ml-8">
            <input
              className="w-5 cursor-pointer h-5 border border-gray-300  rounded-md mr-2 checked:bg-no-repeat checked:bg-center checked:border-indigo-500 checked:bg-indigo-100"
              type="checkbox"
              checked={row.has_access}
              readOnly
            />
          </div>
        );
      },
    },
    {
      key: "assigned_at",
      label: "Assigned on",
      sortable: false,
    },
    {
      key: "last_modified_at",
      label: "Last Modified on",
      sortable: false,
    },
  ];

  //! Fetch data from api
  // const fetchData1 = async ({
  //   page,
  //   limit,
  //   search,
  //   sortBy,
  //   sortOrder,
  // }: DataTableParamsWithRole) => {
  //   const { role_uuid } = useParams();
  //   // Construct query parameters
  //   const params = new URLSearchParams({
  //     page: page.toString(),
  //     limit: limit.toString(),
  //     search,
  //     sortBy,
  //     sortOrder,
  //     role_uuid: role_uuid ? role_uuid.toString() : "",
  //   });

  //   try {
  //     // Fetch data from API
  //     const response = await fetch(
  //       `/api/iam/rbac/permissions/app-services?${params.toString()}`
  //     );

  //     if (!response.ok) {
  //       throw new Error("Failed to Load Records");
  //     }

  //     const data = await response.json();

  //     return {
  //       data: data.data || [],
  //       totalPages: data.totalPages || 1,
  //       range: data.range || "",
  //     };
  //   } catch (error) {
  //     console.error("Error fetching Records:", error);
  //     return {
  //       data: [],
  //       totalPages: 1,
  //       range: "",
  //     };
  //   }
  // };

  const fetchData = async ({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  }: DataTableParams) => {
    if (!role_uuid) {
      throw new Error("role_uuid is missing");
    }
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      sortBy,
      sortOrder,
      role_uuid: role_uuid.toString(),
    });
    try {
      const response = await fetch(
        `/api/iam/rbac/permissions/app-services?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to Load Records");
      }

      const data = await response.json();

      return {
        data: data.data || [],
        totalPages: data.totalPages || 1,
        range: data.range || "",
      };
    } catch (error) {
      console.error("Error fetching Records:", error);
      return {
        data: [],
        totalPages: 1,
        range: "",
      };
    }
  };

  //! Handling the functions on create Services button click || Row click
  const [isViewRecordModalOpen, setIsViewRecordModalOpen] = useState(false);
  //   const [selectedRecord, setselectedRecord] = useState(null);
  const [isCreateRecordModalOpen, setIsCreateRecordModalOpen] = useState(false);

  const [isUpdateRecordModalOpen, setIsUpdateRecordModalOpen] = useState(false);
  //! Manage the date on row select in Modal - show current clicked row details in modal
  const [selectedRecord, setselectedRecord] = useState<Services | null>(null);
  //* On Add New Services Click
  const handleAddNewRecord = () => {
    setIsCreateRecordModalOpen(true);
  };

  const handleUpdateRecord = () => {
    setIsUpdateRecordModalOpen(true);
  };

  //* On table row CLick
  const handleRowClick = (Services: Services) => {
    setselectedRecord(Services);
    setIsViewRecordModalOpen(true);
    // router.push(`Services/permissions/${Services.role_uuid}/services`);
  };

  return (
    <div>
      <div>
        <DataTable
          columns={columns}
          fetchData={fetchData}
          onRowClick={handleRowClick}
          tableTitle="App Service Permissions"
          addNewButton={{
            label: "Set New Permission",
            onClick: handleAddNewRecord,
          }}
          editButton={{
            label: "Update Existing Permissions",
            onClick: handleUpdateRecord,
          }}
          enableDelete={false}
          enableExport={false}
          enableSearch={false}
          enablePagination={true}
          pageSizeOptions={[5, 10, 25, 50, 100]}
        />
      </div>
      {/* Create new Services */}
      <Modal
        isOpen={isCreateRecordModalOpen}
        onClose={() => setIsCreateRecordModalOpen(false)}
        title="Set new Service Permission"
        size="md"
      >
        <AddAppServicePermission
          onSuccess={() => setIsCreateRecordModalOpen(false)}
        />
      </Modal>

      {/* Update Existing */}
      <Modal
        isOpen={isUpdateRecordModalOpen}
        onClose={() => setIsUpdateRecordModalOpen(false)}
        title="Update Service Permission"
        size="md"
      >
        <UpdateAppServicePermission
          onSuccess={() => setIsUpdateRecordModalOpen(false)}
        />
      </Modal>
      {/* View Services */}

      <Modal
        isOpen={isViewRecordModalOpen}
        onClose={() => setIsViewRecordModalOpen(false)}
        title="App Service Details"
        size="md"
      >
        {selectedRecord ? (
          <div>
            <p>
              <strong>ID:</strong> {selectedRecord.app_service_id}
            </p>

            <p>
              <strong>Name:</strong> {selectedRecord.name}
            </p>

            <button
              onClick={() => console.log("Edit User Logic Here")}
              className="btn btn-primary"
            >
              Edit User Details
            </button>
          </div>
        ) : (
          <p>No User selected.</p>
        )}
      </Modal>
    </div>
  );
};

export default AppServices;
