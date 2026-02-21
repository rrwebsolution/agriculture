import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import NotFound from './notFound.tsx';
import LoaderLogin from './components/loader/LoaderLogin.tsx';
import Loader from './components/loader/Loader.tsx';

import AgricultureLayout from './views/admin/AgricultureLayout.tsx';

function wait(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

const Login = lazy(() => 
  wait(3000).then(() => import('./views/auth/login/Login.tsx'))
);

const DashboardContainer = lazy(() => 
  wait(3000).then(() => import('./views/admin/dashboard/DashboardContainer.tsx'))
);

const RoleManagement = lazy(() => 
  wait(3000).then(() => import('./views/admin/accessControl/role/RoleManagement.tsx'))
);

const UserManagement = lazy(() => 
  wait(3000).then(() => import('./views/admin/accessControl/user/UserManagement.tsx'))
);

const routes = [
  {
    path: '/',
    element: <Navigate to="/user-login" />,
  },
  {
    path: 'user-login',
    element: (
      <Suspense fallback={<LoaderLogin />}>
        <Login />
      </Suspense>
    )
  },

  // Admin Routes
   {
    path: '/admin',
    element: <AgricultureLayout />, 
    children: [
      {
        path: '',
        element: <Navigate to="/admin/admin-dashboard" />,
      },
      {
        path: 'admin-dashboard',
        element: (
          <Suspense fallback={<Loader />}>
            <DashboardContainer />
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
      
    ],
  },

 

  {
    path: '*',
    element: <NotFound />,
  },
];

const router = createBrowserRouter(routes);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
