import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { useAuthStore } from './stores/authStore';
import { PERMISSIONS, type Permission } from 'shared';

// Root layout
function RootComponent() {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
}

// Root route
const rootRoute = createRootRoute({
  component: RootComponent,
});

// Auth guard helper
function requireAuth(requiredPermissions?: Permission[]) {
  return () => {
    const { user, hasAllPermissions } = useAuthStore.getState();

    if (!user) {
      throw redirect({ to: '/login' });
    }

    if (requiredPermissions && requiredPermissions.length > 0) {
      if (!hasAllPermissions(...requiredPermissions)) {
        throw redirect({ to: '/unauthorized' });
      }
    }
  };
}

// Routes
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => import('./pages/Login').then(m => m.default),
});

const unauthorizedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/unauthorized',
  component: () => <div>Unauthorized - You don't have permission to access this page</div>,
});

// Admin routes - require dashboard view permission
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  beforeLoad: requireAuth([PERMISSIONS.DASHBOARD_VIEW]),
  component: () => import('./components/Layout').then(m => m.default),
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/dashboard',
  component: () => import('./pages/Dashboard').then(m => m.default),
});

const adminPaymentsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/payments',
  beforeLoad: requireAuth([PERMISSIONS.PAYMENT_VIEW]),
  component: () => import('./pages/RecentPayments').then(m => m.default),
});

const adminPaymentDetailRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/payments/$id',
  beforeLoad: requireAuth([PERMISSIONS.PAYMENT_VIEW]),
  component: () => import('./pages/PaymentDetail').then(m => m.default),
});

const adminOperatorsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/operators',
  beforeLoad: requireAuth([PERMISSIONS.OPERATOR_VIEW]),
  component: () => import('./pages/Operators').then(m => m.default),
});

const adminServicesRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/services',
  beforeLoad: requireAuth([PERMISSIONS.SERVICE_VIEW]),
  component: () => import('./pages/Services').then(m => m.default),
});

// Client routes - require operator view permission
const clientRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/client',
  beforeLoad: requireAuth([PERMISSIONS.OPERATOR_VIEW]),
  component: () => import('./components/ClientLayout').then(m => m.default),
});

const clientDashboardRoute = createRoute({
  getParentRoute: () => clientRoute,
  path: '/dashboard',
  component: () => <div>Client Dashboard</div>,
});

const clientPayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pay/$requestId',
  component: () => <div>Payment Page - Section D from mockup</div>,
});

// Index route - redirect based on permissions
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    const { user, hasPermission } = useAuthStore.getState();

    if (!user) {
      throw redirect({ to: '/login' });
    }

    // Redirect to admin if user has dashboard permission
    if (hasPermission(PERMISSIONS.DASHBOARD_VIEW)) {
      throw redirect({ to: '/admin/dashboard' });
    }

    // Redirect to client dashboard otherwise
    throw redirect({ to: '/client/dashboard' });
  },
});

// Route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  unauthorizedRoute,
  clientPayRoute,
  adminRoute.addChildren([
    adminDashboardRoute,
    adminPaymentsRoute,
    adminPaymentDetailRoute,
    adminOperatorsRoute,
    adminServicesRoute,
  ]),
  clientRoute.addChildren([clientDashboardRoute]),
]);

export { routeTree };
