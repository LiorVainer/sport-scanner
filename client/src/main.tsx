import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './theme/index.scss';
import './utils/date.utils.ts';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
