import { configureStore } from '@reduxjs/toolkit';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';

import { authApi } from './api/auth.api';
import { expenseApi } from './api/expense.api';
import { menuApi } from './api/menu.api';
import { openSellsApi } from './api/open-sells.api';
import { reportApi } from './api/report.api';
import { userApi } from './api/user.api';

import expenseReducer from './slice/expense.slice';
import menuReducer from './slice/menu.slice';
import openSellsReducer from './slice/open-sells.slice';
import reportReducer from './slice/report.slice';
import toastReducer from './slice/toast.slice';
import userReducer from './slice/user.slice';


export const store = configureStore({
  reducer: {
    toast: toastReducer,
    menu: menuReducer,
    // sells: sellsReducer,
    openSells: openSellsReducer,
    expense: expenseReducer,
    report: reportReducer,
    user: userReducer,

    [authApi.reducerPath]: authApi.reducer,
    [menuApi.reducerPath]: menuApi.reducer,
    // [sellsApi.reducerPath]: sellsApi.reducer,
    [openSellsApi.reducerPath]: openSellsApi.reducer,
    [expenseApi.reducerPath]: expenseApi.reducer,
    [reportApi.reducerPath]: reportApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(

      authApi.middleware,
      menuApi.middleware,
      // sellsApi.middleware,
      openSellsApi.middleware,
      expenseApi.middleware,
      reportApi.middleware,
      userApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;