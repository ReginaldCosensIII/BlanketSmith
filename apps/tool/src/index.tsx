import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ErrorBoundary>
            <ToastProvider>
                <App />
            </ToastProvider>
        </ErrorBoundary>
    </React.StrictMode>,
);
