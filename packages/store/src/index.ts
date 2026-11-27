import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import routineReducer from './slices/routineSlice';
import recordReducer from './slices/recordSlice';
import userReducer from './slices/userSlice';
import dateReducer from './slices/dateSlice';

export * from './slices/routineSlice';
export * from './slices/recordSlice';
export * from './slices/userSlice';
export * from './slices/dateSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      routine: routineReducer,
      record: recordReducer,
      user: userReducer,
      date: dateReducer,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
