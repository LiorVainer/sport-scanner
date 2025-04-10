import { Route, Routes } from 'react-router';
import { Layout } from '@/layout/Layout';
import { ROUTES } from '@/constants/routes.const';
import { ProtectedRoutes } from '@/layout/Router/ProtectedRoutes.tsx';
import { AuthPage } from '@pages/AuthPage';
import HomeScreen from '@/pages/HomeScreen/HomeScreen';
import { PackageDetailsScreen } from '@/pages/PackageDetailsScreen';
import { PackagesScreen } from '@/pages/PackagesScreen';
import { HistoryScreen } from '@/pages/HistoryScreen';
import { SavedPackagesScreen } from '@/pages/SavedPackagesScreen';

export interface RouterProps {}

export const Router = (_props: RouterProps) => {
    return (
        <Routes>
            <Route path={ROUTES.AUTH} element={<AuthPage />} />
            <Route element={<ProtectedRoutes />}>
                <Route element={<Layout />}>
                    <Route path={ROUTES.HOME} element={<HomeScreen />} />
                    <Route path={ROUTES.PACKAGES} element={<PackagesScreen />} />
                    <Route path={`${ROUTES.PACKAGES}/:packageId`} element={<PackageDetailsScreen />} />
                    <Route path={ROUTES.HISTORY} element={<HistoryScreen />} />
                    <Route path={ROUTES.SAVED_PACKAGES} element={<SavedPackagesScreen />} />
                </Route>
            </Route>
        </Routes>
    );
};
