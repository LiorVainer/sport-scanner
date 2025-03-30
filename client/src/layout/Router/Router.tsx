import { Route, Routes } from 'react-router';
import { Layout } from '@/layout/Layout';
import { ROUTES } from '@/constants/routes.const';
import { ProtectedRoutes } from '@/layout/Router/ProtectedRoutes.tsx';
import { AuthPage } from '@pages/AuthPage';
import { PackageDetailsScreen } from '@/pages/PackageDetailsScreen';
import { PackagesScreen } from '@/pages/PackagesScreen';

export interface RouterProps {}

export const Router = (_props: RouterProps) => {
    return (
        <Routes>
            <Route path={ROUTES.AUTH} element={<AuthPage />} />
            <Route element={<ProtectedRoutes />}>
                <Route element={<Layout />}>
                    <Route path={`${ROUTES.PACKAGES}/results`} element={<PackagesScreen />} />
                    <Route path={`${ROUTES.PACKAGES}/results/:id`} element={<PackageDetailsScreen />} />
                </Route>
            </Route>
        </Routes>
    );
};
