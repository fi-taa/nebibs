import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { learningSlice } from "./slices/learningSlice";
import { experimentsSlice } from "./slices/experimentsSlice";
import { serviceSlice } from "./slices/serviceSlice";

const persistConfig = {
  key: "nebibs",
  storage,
  version: 1,
};

const learningPersisted = persistReducer(
  { ...persistConfig, key: "nebibs-learning" },
  learningSlice.reducer
);
const experimentsPersisted = persistReducer(
  { ...persistConfig, key: "nebibs-experiments" },
  experimentsSlice.reducer
);
const servicePersisted = persistReducer(
  { ...persistConfig, key: "nebibs-service" },
  serviceSlice.reducer
);

export const store = configureStore({
  reducer: {
    learning: learningPersisted,
    experiments: experimentsPersisted,
    service: servicePersisted,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
