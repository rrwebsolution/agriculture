import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import NotFound from './notFound.tsx';
import LoaderLogin from './components/loader/LoaderLogin.tsx';
import Loader from './components/loader/Loader.tsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AgricultureLayout from './views/page/AgricultureLayout.tsx';
import RequireAuth from './components/RequireAuth';
import GuestOnly from './components/GuestOnly';
import NoRoleFound from './views/page/NoRole/NoRoleFound.tsx';
import PageNotAvailable from './views/page/pageNotAvailable/PageNotAvailable.tsx';

// 🌟 1. IMPORT ANG REDUX PROVIDER UG ANG IMONG STORE
import { Provider } from 'react-redux';
import { store } from './store/store'; // <-- I-adjust lang ang path kung lahi ang location sa imong store.ts

import RealtimeListener from './components/RealtimeListener.tsx';

import ChangePassword from './views/auth/changePassword/ChangePassword.tsx';
const ResetPassword = lazy(() =>
  wait(3000).then(() => import('./views/auth/resetPassword/ResetPassword.tsx'))
);

function wait(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

const Login = lazy(() => 
  wait(3000).then(() => import('./views/auth/login/Login.tsx'))
);

const Register = lazy(() => 
  wait(3000).then(() => import('./views/auth/register/Register.tsx'))
);

const DashboardContainer = lazy(() => 
  wait(3000).then(() => import('./views/page/dashboard/DashboardContainer.tsx'))
);

const RegisteredFarmerContainer = lazy(() => 
  wait(3000).then(() => import('./views/page/farmer/RegisterredFarmers/RegisteredFarmerContainer.tsx'))
);

const RegisteredFisherFolkContainer = lazy(() => 
  wait(3000).then(() => import('./views/page/fisherholk/RegisteredFisherFolkContainer.tsx'))
);

const CooperativesContainer = lazy(() => 
  wait(3000).then(() => import('./views/page/farmer/Cooperatives/CooperativesContainer.tsx'))
);

const CropsContainer = lazy(() => 
  wait(3000).then(() => import('./views/page/crops/CropsContainer.tsx'))
);

const BarangayListContainer = lazy(() => 
  wait(3000).then(() => import('./views/page/barangay/BarangayListContainer.tsx'))
);

const SectorsContainer = lazy(() =>
  wait(3000).then(() => import('./views/page/barangay/ClustersContainer.tsx'))
);

const DangerZonesContainer = lazy(() =>
  wait(3000).then(() => import('./views/page/barangay/DangerZonesContainer.tsx'))
);

const PlantingContainer = lazy(() => 
  wait(3000).then(() => import('./views/page/planting/PlantingContainer.tsx'))
);

const HarvestContainer = lazy(() => 
  wait(3000).then(() => import('./views/page/harvest/HarvestContainer.tsx'))
);

const FisheriesContainer = lazy(() => 
  wait(3000).then(() => import('./views/page/fisheries/FisheriesContainer.tsx'))
);

const LivestockContainer = lazy(() => 
  wait(3000).then(() => import('./views/page/livestock/LivestockContainer.tsx'))
);

const PoultryContainer = lazy(() => 
  wait(3000).then(() => import('./views/page/poultry/PoultryContainer.tsx'))
);

const InventoryContainer = lazy(() => 
  wait(3000).then(() => import('./views/page/resources/inventory/InventoryContainer.tsx'))
);

const EquipmentsContainer = lazy(() => 
  wait(3000).then(() => import('./views/page/resources/equipments/EquipmentsContainer.tsx'))
);

const LandmappingContainer = lazy(() => 
  wait(3000).then(() => import('./views/page/landMapping/LandmappingContainer.tsx'))
);

const ExpensesContainer = lazy(() => 
  wait(3000).then(() => import('./views/page/expenses/ExpensesContainer.tsx'))
);

const ReportsContainer = lazy(() => 
  wait(3000).then(() => import('./views/page/reports/ReportsContainer.tsx'))
);
const ReportFullPreview = lazy(() =>
  wait(3000).then(() => import('./views/page/reports/ReportFullPreview.tsx'))
);

const RoleManagement = lazy(() => 
  wait(3000).then(() => import('./views/page/accessControl/role/RoleManagement.tsx'))
);

const UserManagement = lazy(() => 
  wait(3000).then(() => import('./views/page/accessControl/user/UserManagement.tsx'))
);

const SettingsContainer = lazy(() => 
  wait(3000).then(() => import('./views/page/settings/SettingsContainer.tsx'))
);

const EmployeeInfoContainer = lazy(() =>
  wait(3000).then(() => import('./views/page/employees/EmployeeInfoContainer.tsx'))
);

const EmployeeLogsContainer = lazy(() =>
  wait(3000).then(() => import('./views/page/employeeLogs/EmployeeLogsContainer.tsx'))
);

const routes = [
  {
    path: '/',
    element: <Navigate to="/user-login" />,
  },
  {
    path: 'user-login',
    element: (
      <GuestOnly>
        <Suspense fallback={<LoaderLogin />}>
          <Login />
        </Suspense>
      </GuestOnly>
    )
  },
  {
    path: 'user-register',
    element: (
      <GuestOnly>
        <Suspense fallback={<LoaderLogin />}>
          <Register />
        </Suspense>
      </GuestOnly>
    )
  },
  {
    path: 'change-password',
    element: (
      <RequireAuth>
        <Suspense fallback={<LoaderLogin />}>
          <ChangePassword />
        </Suspense>
      </RequireAuth>
    )
  },
  {
    path: 'password-reset/:token',
    element: (
      <GuestOnly>
        <Suspense fallback={<LoaderLogin />}>
          <ResetPassword />
        </Suspense>
      </GuestOnly>
    )
  },
  {
    path: 'reports-preview/:id',
    element: (
      <RequireAuth>
        <Suspense fallback={<Loader />}>
          <ReportFullPreview />
        </Suspense>
      </RequireAuth>
    )
  },

  // page Routes
   {
    path: '/page',
    element: (
      <RequireAuth>
        <AgricultureLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: '',
        element: <Navigate to="/page/page-dashboard" />,
      },
      {
        path: 'page-dashboard',
        element: (
          <Suspense fallback={<Loader />}>
            <DashboardContainer />
          </Suspense>
        )
      },
      {
        path: 'farmer-management',
        element: (
          <Suspense fallback={<Loader />}>
            <RegisteredFarmerContainer />
          </Suspense>
        )
      },
      {
        path: 'fisherfolk-management',
        element: (
          <Suspense fallback={<Loader />}>
            <RegisteredFisherFolkContainer />
          </Suspense>
        )
      },
      {
        path: 'cooperatives-management',
        element: (
          <Suspense fallback={<Loader />}>
            <CooperativesContainer />
          </Suspense>
        )
      },
      {
        path: 'barangaylist-management',
        element: (
          <Suspense fallback={<Loader />}>
            <BarangayListContainer />
          </Suspense>
        )
      },
      {
        path: 'location-management',
        element: (
          <Suspense fallback={<Loader />}>
            <SectorsContainer />
          </Suspense>
        )
      },
      {
        path: 'danger-zones-management',
        element: (
          <Suspense fallback={<Loader />}>
            <DangerZonesContainer />
          </Suspense>
        )
      },
      {
        path: 'crop-management',
        element: (
          <Suspense fallback={<Loader />}>
            <CropsContainer />
          </Suspense>
        )
      },
      {
        path: 'planting-management',
        element: (
          <Suspense fallback={<Loader />}>
            <PlantingContainer />
          </Suspense>
        )
      },
      {
        path: 'harvest-management',
        element: (
          <Suspense fallback={<Loader />}>
            <HarvestContainer />
          </Suspense>
        )
      },
      {
        path: 'fisheries-management',
        element: (
          <Suspense fallback={<Loader />}>
            <FisheriesContainer />
          </Suspense>
        )
      },
      {
        path: 'livestock-management',
        element: (
          <Suspense fallback={<Loader />}>
            <LivestockContainer />
          </Suspense>
        )
      },
      {
        path: 'poultry-management',
        element: (
          <Suspense fallback={<Loader />}>
            <PoultryContainer />
          </Suspense>
        )
      },
      {
        path: 'inventory-management',
        element: (
          <Suspense fallback={<Loader />}>
            <InventoryContainer />
          </Suspense>
        )
      },
      {
        path: 'equipments-management',
        element: (
          <Suspense fallback={<Loader />}>
            <EquipmentsContainer />
          </Suspense>
        )
      },
      {
        path: 'landmapping-management',
        element: (
          <Suspense fallback={<Loader />}>
            <LandmappingContainer />
          </Suspense>
        )
      },
      {
        path: 'expenses-management',
        element: (
          <Suspense fallback={<Loader />}>
            <ExpensesContainer />
          </Suspense>
        )
      },
      {
        path: 'reports-management',
        element: (
          <Suspense fallback={<Loader />}>
            <ReportsContainer />
          </Suspense>
        )
      },
      {
        path: 'employees-management',
        element: (
          <Suspense fallback={<Loader />}>
            <EmployeeInfoContainer />
          </Suspense>
        )
      },
      {
        path: 'employee-logs-management',
        element: (
          <Suspense fallback={<Loader />}>
            <EmployeeLogsContainer />
          </Suspense>
        )
      },
      {
        path: 'role-management',
        element: (
          <Suspense fallback={<Loader />}>
            <RoleManagement />
          </Suspense>
        )
      },
      {
        path: 'user-management',
        element: (
          <Suspense fallback={<Loader />}>
            <UserManagement />
          </Suspense>
        )
      },
      {
        path: 'settings-management',
        element: (
          <Suspense fallback={<Loader />}>
            <SettingsContainer />
          </Suspense>
        )
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
  {
    path: '/pageNotAvailable',
    element: <PageNotAvailable />,
  },
  {
    path: '/no-role',
    element: <NoRoleFound />,
  },
];

const router = createBrowserRouter(routes);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 🌟 2. I-WRAP ANG TIBUOK APP SULOD SA PROVIDER */}
    <Provider store={store}>
      <ToastContainer />
      <RealtimeListener />
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)
