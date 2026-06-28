import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from '../guards/ProtectedRoute';
import { GuestRoute } from '../guards/GuestRoute';
import { PageSpinner } from '../components/ui/Spinner';

// Pages
import { LandingPage } from '../features/landing/LandingPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { ShopPage } from '../features/shop/ShopPage';
import { ProductDetailPage } from '../features/shop/ProductDetailPage';
import { ClientDashboard } from '../features/client/ClientDashboard';
import { OrdersPage } from '../features/client/OrdersPage';
import { OrderDetailPage } from '../features/client/OrderDetailPage';
import { RepairsPage } from '../features/client/RepairsPage';
import { TicketDetailPage } from '../features/client/TicketDetailPage';
import { NewRepairPage } from '../features/client/NewRepairPage';
import { CartPage } from '../features/client/CartPage';
import { CheckoutPage } from '../features/client/CheckoutPage';
import { MasterDashboard } from '../features/master/MasterDashboard';
import { MasterTicketDetail } from '../features/master/MasterTicketDetail';
import { AdminDashboard } from '../features/admin/AdminDashboard';
import { AdminProductsPage } from '../features/admin/AdminProductsPage';
import { ProductFormPage } from '../features/admin/ProductFormPage';
import { AdminOrdersPage } from '../features/admin/AdminOrdersPage';
import { AdminTicketsPage } from '../features/admin/AdminTicketsPage';
import { AdminUsersPage } from '../features/admin/AdminUsersPage';

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function NotFound() {
  return (
    <PublicLayout>
      <div className="flex min-h-[60vh] flex-col items-center justify-center pt-20 text-center">
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="font-display text-4xl font-bold text-navy mb-3">404</h1>
        <p className="text-muted mb-6">Страница не найдена</p>
        <a href="/" className="text-blue hover:underline font-medium">Вернуться на главную</a>
      </div>
    </PublicLayout>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
        <Route path="/shop" element={<PublicLayout><ShopPage /></PublicLayout>} />
        <Route path="/shop/:id" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />

        {/* Auth (guest only) */}
        <Route path="/auth/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/auth/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* Client routes */}
        <Route path="/client/*" element={
          <ProtectedRoute requiredRole="Client">
            <DashboardLayout>
              <Routes>
                <Route path="dashboard"    element={<ClientDashboard />} />
                <Route path="orders"       element={<OrdersPage />} />
                <Route path="orders/:id"   element={<OrderDetailPage />} />
                <Route path="repairs"      element={<RepairsPage />} />
                <Route path="repairs/new"  element={<NewRepairPage />} />
                <Route path="repairs/:id"  element={<TicketDetailPage />} />
                <Route path="cart"         element={<CartPage />} />
                <Route path="checkout"     element={<CheckoutPage />} />
                <Route index              element={<Navigate to="dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Master routes */}
        <Route path="/master/*" element={
          <ProtectedRoute requiredRole={['Master', 'Admin']}>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard"   element={<MasterDashboard />} />
                <Route path="tickets"     element={<MasterDashboard />} />
                <Route path="tickets/:id" element={<MasterTicketDetail />} />
                <Route index             element={<Navigate to="dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute requiredRole="Admin">
            <DashboardLayout>
              <Routes>
                <Route path="dashboard"           element={<AdminDashboard />} />
                <Route path="products"            element={<AdminProductsPage />} />
                <Route path="products/new"        element={<ProductFormPage />} />
                <Route path="products/:id/edit"   element={<ProductFormPage />} />
                <Route path="orders"              element={<AdminOrdersPage />} />
                <Route path="orders/:id"          element={<OrderDetailPage />} />
                <Route path="tickets"             element={<AdminTicketsPage />} />
                <Route path="tickets/:id"         element={<MasterTicketDetail />} />
                <Route path="users"               element={<AdminUsersPage />} />
                <Route index                     element={<Navigate to="dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
