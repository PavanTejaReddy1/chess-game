import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api/client";

const initialState = {
    user: null,
    status: "idle",
    error: null
};

export const login = createAsyncThunk(
    "auth/login",
    async({ eamil, password }, thunkAPI) => {
        try {
            const res = await api.post("auth/login", { eamil, password });
            return res.data;
        } catch(err) {
            return thunkAPI.rejectWithValue(err.message || "Login failed");
        }
    }
)

export const signup = createAsyncThunk(
    "auth/signup",
    async({ name, eamil, password }, thunkAPI) => {
        try {
            const res = await api.post("auth/signup", { name, eamil, password });
            return res.data;
        } catch(err) {
            return thunkAPI.rejectWithValue(err.message || "Signup failed");
        }
    }
)

export const logout = createAsyncThunk(
    "auth/logout",
    async(_, thunkAPI) => {
        try {
            const res = await api.post("auth/logout");
            return res.data;
        } catch(err) {
            return thunkAPI.rejectWithValue(err.message || "Logout failed");
        }
    }
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    function pending(state) {
      state.user = null;
      state.status = "pending";
      state.error = null;
    }
    function fulfilled(state) {
      state.status = "success";
      state.error = null;
    }
    function rejected(state, action) {
      state.error = action.payload;
      state.status = "error";
      state.user = null;
    }
    builder
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, fulfilled)
      .addCase(login.rejected, rejected)
      .addCase(signup.pending, pending)
      .addCase(signup.fulfilled, fulfilled)
      .addCase(signup.rejected, rejected);
  },
});

const authReducer = authSlice.reducer;
export { authReducer };