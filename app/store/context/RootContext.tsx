"use client";

import { store } from '@/app/store';
import React from 'react';
import { Provider } from 'react-redux';
import ToastContainer from './ToastContainer';
import SessionProviderWrapper from './SessionProviderWrapper';

interface RootContextProps {
    children: React.ReactNode
}

const RootContext = ({children}: RootContextProps) => {
  return (
    <SessionProviderWrapper>
        <Provider store={store}>
          <ToastContainer />
            {children}
        </Provider>
    </SessionProviderWrapper>
  )
}

export default RootContext