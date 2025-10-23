"use client";

import { store } from '@/app/store';
import React from 'react';
import { Provider } from 'react-redux';
import ToastContainer from './ToastContainer';

interface RootContextProps {
    children: React.ReactNode
}

const RootContext = ({children}: RootContextProps) => {
  return (
    <Provider store={store}>
      <ToastContainer />
        {children}
    </Provider>
  )
}

export default RootContext