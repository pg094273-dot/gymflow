import React from 'react';
import ReactDOM from 'react-dom/client';
import { StoreProvider } from './context/StoreContext';
import { App } from './App';
import '../css/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>
);
