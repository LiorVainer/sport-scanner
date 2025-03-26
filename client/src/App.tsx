import './App.css';
import { GlobalContextProvider } from './context/GlobalProvider';
import { ErrorBoundary } from './components/BaseErrorBoundary';
import { BrowserRouter } from 'react-router';
import { Router } from '@/layout/Router';

export const App = () => {
    return (
        <BrowserRouter>
            <ErrorBoundary>
                <GlobalContextProvider>
                    <Router />
                </GlobalContextProvider>
            </ErrorBoundary>
        </BrowserRouter>
    );
};
