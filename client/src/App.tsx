import './App.css';
import { GlobalContextProvider } from './context/GlobalProvider';
import { ErrorBoundary } from './components/BaseErrorBoundary';
import { BrowserRouter } from 'react-router';
import { Router } from '@/layout/Router';
import { PackagesProvider } from './context/PackagesContext';

export const App = () => {
    return (
        <BrowserRouter>
            <ErrorBoundary>
                <PackagesProvider>
                    <GlobalContextProvider>
                        <Router />
                    </GlobalContextProvider>
                </PackagesProvider>
            </ErrorBoundary>
        </BrowserRouter>
    );
};
