"use client";
import Modal from "@/components/ui/Modal/Modal";
import {
  DataTable,
  BaseTableData,
  ColumnDefinition,
} from "@/components/ui/Table/DataTable";
import React, { useState } from "react";
import AddAppService from "./_Forms/AddAppService";

//! Column fields as per api resposne and pass as a key to the column object
interface Services extends BaseTableData {
  app_service_id: number;
  display_name: string;
  name: string;
  dscription: string;
  formatted_created_at: string;
  last_modified_at: string;
}

const AppServices = () => {
  const columns: ColumnDefinition<Services>[] = [
    {
      key: "display_name",
      label: "Display Name",
      sortable: true,
    },
    {
      key: "name",
      label: "Service Name",
      sortable: true,
      renderCell(row) {
        return (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-indigo-200 text-blue-800">
            {row.name}
          </span>
        );
      },
    },
    {
      key: "description",
      label: "Description",
      sortable: true,
    },

    {
      key: "formatted_created_at",
      label: "Created on",
      sortable: false,
    },
    {
      key: "last_modified_at",
      label: "Last Modified on",
      sortable: false,
    },
  ];

  //! Fetch data from api
  const fetchData = async ({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  }: {
    page: number;
    limit: number;
    search: string;
    sortBy: string;
    sortOrder: "ASC" | "DESC";
  }) => {
    // Construct query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      sortBy,
      sortOrder,
    });

    try {
      // Fetch data from API
      const response = await fetch(
        `/api/iam/rbac/services/app-services?${params.toString()}`
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
  //! Manage the date on row select in Modal - show current clicked row details in modal
  const [selectedRecord, setselectedRecord] = useState<Services | null>(null);
  //* On Add New Services Click
  const handleAddNewRecord = () => {
    setIsCreateRecordModalOpen(true);
  };
  //* On table row CLick
  const handleRowClick = (Services: Services) => {
    setselectedRecord(Services);
    setIsViewRecordModalOpen(true);
    // router.push(`Services/permissions/${Services.role_uuid}/services`);
  };

  return (
    <div className=" ">
      <div>
        <DataTable
          columns={columns}
          fetchData={fetchData}
          onRowClick={handleRowClick}
          tableTitle="App Services"
          addNewButton={{
            label: "Add New Service",
            onClick: handleAddNewRecord,
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
        title="Add new Service"
        size="md"
      >
        <AddAppService onSuccess={() => setIsCreateRecordModalOpen(false)} />
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
