import { Route, Routes } from 'react-router';
import { MatchExperienceDetailsScreen } from '@pages/MatchExperienceDetailsScreen';
import { MatchExperiencesCatalogScreen } from 'src/pages/MatchExperiencesCatalogScreen';
import { Layout } from '@/layout/Layout';
import { ROUTES } from '@/constants/routes.const';
import { ProtectedRoutes } from '@/layout/Router/ProtectedRoutes.tsx';
import { AuthPage } from '@pages/AuthPage';

export interface RouterProps {}

export const Router = (_props: RouterProps) => {
    return (
        <Routes>
            <Route path={ROUTES.AUTH} element={<AuthPage />} />
            <Route element={<ProtectedRoutes />}>
                <Route element={<Layout />}>
                    <Route path={ROUTES.MATCH_EXPERIENCES} element={<MatchExperiencesCatalogScreen mode="all" />} />
                    <Route path={`${ROUTES.MATCH_EXPERIENCES}/:id`} element={<MatchExperienceDetailsScreen />} />
                    <Route path={ROUTES.MY_EXPERIENCES} element={<MatchExperiencesCatalogScreen mode="my" />} />
                </Route>
            </Route>
        </Routes>
    );
};
