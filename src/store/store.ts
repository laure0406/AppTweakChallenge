import {configureStore} from "@reduxjs/toolkit";
import reducers from "./reducers";
import {apiSlice} from "../api/apiSlice";
export const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>  getDefaultMiddleware().concat(apiSlice.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

