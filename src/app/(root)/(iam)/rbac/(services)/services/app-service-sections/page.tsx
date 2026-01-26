"use client";
import Modal from "@/components/ui/Modal/Modal";
import {
  DataTable,
  BaseTableData,
  ColumnDefinition,
} from "@/components/ui/Table/DataTable";
import React, { useState } from "react";
import AddAppServiceSection from "./_Forms/AddAppServiceSection";

interface Services extends BaseTableData {
  app_service_sec_id: number;
  display_name: string;
  name: string;
  description: string;
  formatted_created_at: string;
  last_modified_at: string;
  app_service_name: string;
  app_service_display_name: string;
  isGroupHeader?: boolean;
}

const AppServiceSections = () => {
  // Transform data to include group headers
  const transformData = (data: Services[]) => {
    const groupedData: Services[] = [];
    const serviceGroups: { [key: string]: Services[] } = {};

    // Group sections by service
    data.forEach((section) => {
      if (!serviceGroups[section.app_service_display_name]) {
        serviceGroups[section.app_service_display_name] = [];
      }
      serviceGroups[section.app_service_display_name].push(section);
    });

    // Create final array with group headers and sections
    Object.entries(serviceGroups).forEach(([serviceName, sections]) => {
      // Add service header
      groupedData.push({
        ...sections[0],
        isGroupHeader: true,
        display_name: serviceName,
        name: "",
        description: "",
        app_service_sec_id: -1,
      });

      // Add sections
      sections.forEach((section) => {
        groupedData.push({
          ...section,
          isGroupHeader: false,
        });
      });
    });

    return groupedData;
  };

  const columns: ColumnDefinition<Services>[] = [
    {
      key: "display_name",
      label: "Name",
      sortable: true,

      renderCell(row) {
        if (row.isGroupHeader) {
          return (
            <div className="">
              <span className="font-semibold text-lg text-indigo-400">
                {row.app_service_display_name}
              </span>
            </div>
          );
        }
        return (
          <div className="">
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-200 text-blue-800">
              {row.display_name}
            </span>
          </div>
        );
      },
    },
    {
      key: "name",
      label: "Section Name",
      sortable: true,
      renderCell(row) {
        if (row.isGroupHeader) return null;
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
      renderCell(row) {
        if (row.isGroupHeader) return null;
        return row.description;
      },
    },
    {
      key: "formatted_created_at",
      label: "Created on",
      sortable: false,

      renderCell(row) {
        if (row.isGroupHeader) return null;
        return row.formatted_created_at;
      },
    },
    {
      key: "last_modified_at",
      label: "Last Modified on",
      sortable: false,
      renderCell(row) {
        if (row.isGroupHeader) return null;
        return row.last_modified_at;
      },
    },
  ];

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
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      sortBy,
      sortOrder,
    });

    try {
      const response = await fetch(
        `/api/iam/rbac/services/app-service-sections?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to Load Records");
      }

      const responseData = await response.json();
      const transformedData = transformData(responseData.data || []);

      return {
        data: transformedData,
        totalPages: responseData.totalPages || 1,
        range: responseData.range || "",
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

  const [isViewRecordModalOpen, setIsViewRecordModalOpen] = useState(false);
  const [isCreateRecordModalOpen, setIsCreateRecordModalOpen] = useState(false);
  const [selectedRecord, setselectedRecord] = useState<Services | null>(null);

  const handleAddNewRecord = () => {
    setIsCreateRecordModalOpen(true);
  };

  const handleRowClick = (service: Services) => {
    if (service.isGroupHeader) return;
    setselectedRecord(service);
    setIsViewRecordModalOpen(true);
  };

  return (
    <div>
      <DataTable
        columns={columns}
        fetchData={fetchData}
        onRowClick={handleRowClick}
        tableTitle="App Service Sections"
        addNewButton={{
          label: "Add New Section",
          onClick: handleAddNewRecord,
        }}
        enableDelete={false}
        enableExport={false}
        enableSearch={false}
        enablePagination={true}
        pageSizeOptions={[5, 10, 25, 50, 100]}
        rowClassName={(row) =>
          row.isGroupHeader
            ? "bg-slate-200 dark:bg-slate-900 text-indigo-400"
            : ""
        }
      />

      {/* Modals remain unchanged */}
      <Modal
        isOpen={isCreateRecordModalOpen}
        onClose={() => setIsCreateRecordModalOpen(false)}
        title="Add new Section"
        size="md"
      >
        <AddAppServiceSection
          onSuccess={() => setIsCreateRecordModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isViewRecordModalOpen}
        onClose={() => setIsViewRecordModalOpen(false)}
        title="App Service Section Details"
        size="md"
      >
        {selectedRecord ? (
          <div>
            <p>
              <strong>ID:</strong> {selectedRecord.app_service_sec_id}
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

export default AppServiceSections;
