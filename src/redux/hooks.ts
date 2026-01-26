// src/redux/hooks.ts
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { RootState, AppDispatch } from "./store";

// Custom hook for dispatching actions
// Typed dispatch (so async thunks and actions are type-safe)
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Custom hook for selecting state
// Typed selector (so state.counter.value is autocompleted + type-checked)
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
