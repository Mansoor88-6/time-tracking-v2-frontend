import { RolePermission } from "@/types/auth/auth";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { resetState } from "../reset";

interface RBACState {
  rolePermissions: RolePermission[];
}

const initialRBACState: RBACState = {
  rolePermissions: [],
};

const rbacSlice = createSlice({
  name: "rbac",
  initialState: initialRBACState,
  reducers: {
    setPermissions(state, action: PayloadAction<RolePermission[]>) {
      state.rolePermissions = action.payload;
    },
    clearPermissions(state) {
      state.rolePermissions = [];
    },
  },
  extraReducers: (builder) => {
    // Handle global reset action
    builder.addCase(resetState, () => ({
      rolePermissions: [],
    }));
  },
});

export const { setPermissions, clearPermissions } = rbacSlice.actions;
export default rbacSlice.reducer;
