import { ROUTES } from '@/constants/routes.const';
import { useAuth } from '@/context/AuthContext.tsx';
import { Navigate, Outlet } from 'react-router';

import { LoadingContainer } from '@components/LoadingContainer';

export const ProtectedRoutes = () => {
    const { loggedInUser, isLoading } = useAuth();

    if (isLoading) return <LoadingContainer loadingText={`Loading User's Data`} />;

    return loggedInUser ? <Outlet /> : <Navigate to={ROUTES.AUTH} replace />;
};
