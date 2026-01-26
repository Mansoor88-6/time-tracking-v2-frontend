"use client";
import Modal from "@/components/ui/Modal/Modal";
import {
  DataTable,
  BaseTableData,
  ColumnDefinition,
} from "@/components/ui/Table/DataTable";
import React, { useState } from "react";

import { useRouter } from "next/navigation";
import AddRole from "./_Forms/AddRole";

//! Column fields as per api resposne and pass as a key to the column object
interface Roles extends BaseTableData {
  role_id: number;
  role_uuid: string;
  name: string;
  description: string;
  formatted_created_at: string;
  last_modified_at: string;
}

const Roles = () => {
  const router = useRouter();
  const columns: ColumnDefinition<Roles>[] = [
    {
      key: "name",
      label: "Role",
      sortable: true,
    },
    {
      key: "description",
      label: "Description",
      sortable: false,
      renderCell: (row) =>
        row.description ? (
          row.description
        ) : (
          <span className="font-extrabold text-lg ml-10">-</span>
        ), // Render fallback if description is null or undefined
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
      const response = await fetch(`/api/iam/rbac/roles?${params.toString()}`);

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

  //! Handling the functions on create Roles button click || Row click
  const [isViewRecordModalOpen, setIsViewRecordModalOpen] = useState(false);
  //   const [selectedRecord, setselectedRecord] = useState(null);
  const [isCreateRecordModalOpen, setIsCreateRecordModalOpen] = useState(false);
  //! Manage the date on row select in Modal - show current clicked row details in modal
  // const [selectedRecord, setselectedRecord] = useState<Roles | null>(null);
  //* On Add New Roles Click
  const handleAddNewRecord = () => {
    setIsCreateRecordModalOpen(true);
  };
  //* On table row CLick
  const handleRowClick = (Roles: Roles) => {
    // setselectedRecord(Roles);
    // setIsViewRecordModalOpen(true);
    router.push(`roles/permissions/${Roles.role_uuid}/services`);
  };

  return (
    <div className=" ">
      <div>
        <DataTable
          columns={columns}
          fetchData={fetchData}
          onRowClick={handleRowClick}
          tableTitle="Roles"
          addNewButton={{
            label: "Add New Role",
            onClick: handleAddNewRecord,
          }}
          enableDelete={false}
          enableExport={false}
          enableSearch={false}
          enablePagination={false}
          pageSizeOptions={[5, 10, 25, 50, 100]}
        />
      </div>
      {/* Create new Roles */}
      <Modal
        isOpen={isCreateRecordModalOpen}
        onClose={() => setIsCreateRecordModalOpen(false)}
        title="Add new Role"
        size="md"
      >
        {/* <AddUserForm /> */}
        <AddRole onSuccess={() => setIsCreateRecordModalOpen(false)} />
      </Modal>
      {/* View Roles */}

      <Modal
        isOpen={isViewRecordModalOpen}
        onClose={() => setIsViewRecordModalOpen(false)}
        title="Role Details"
        size="md"
      >
        View Role
        {/* {selectedRecord ? (
          <div>
            <p>
              <strong>ID:</strong> {selectedRecord.user_id}
            </p>

            <p>
              <strong>Name:</strong> {selectedRecord.name}
            </p>

            <p>
              <strong>Email:</strong> {selectedRecord.email}
            </p>
            <p>
              <strong>Status :</strong>
              {selectedRecord.is_active}
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
        )} */}
      </Modal>
    </div>
  );
};

export default Roles;
