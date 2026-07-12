import { Route, Routes } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { AdminLayout } from '../components/layout/AdminLayout';
import { PrivateRoute } from './PrivateRoute';
import { HomePage } from '../pages/public/HomePage';
import { CatalogPage } from '../pages/public/CatalogPage';
import { ProductDetailPage } from '../pages/public/ProductDetailPage';
import { CartPage } from '../pages/public/CartPage';
import { NotFoundPage } from '../pages/public/NotFoundPage';
import { LoginPage } from '../pages/admin/LoginPage';
import { DashboardPage } from '../pages/admin/DashboardPage';
import { ProductsPage } from '../pages/admin/ProductsPage';
import { ProductFormPage } from '../pages/admin/ProductFormPage';
import { CategoriesPage } from '../pages/admin/CategoriesPage';
import { SuppliersPage } from '../pages/admin/SuppliersPage';
import { CustomersPage } from '../pages/admin/CustomersPage';
import { CustomerFormPage } from '../pages/admin/CustomerFormPage';
import { CustomerDetailPage } from '../pages/admin/CustomerDetailPage';
import { AgendaPage } from '../pages/admin/AgendaPage';
import { ExpedicaoPage } from '../pages/admin/ExpedicaoPage';
import { OrdersPage } from '../pages/admin/OrdersPage';
import { OrderDetailPage } from '../pages/admin/OrderDetailPage';
import { OrderFormPage } from '../pages/admin/OrderFormPage';
import { FinancialPage } from '../pages/admin/FinancialPage';
import { UsersPage } from '../pages/admin/UsersPage';
import { ReportsPage } from '../pages/admin/ReportsPage';
import { RomaneioPage } from '../pages/admin/RomaneioPage';
import { DeliveryRoutePage } from '../pages/admin/DeliveryRoutePage';
import { WeeklyForecastPage } from '../pages/admin/WeeklyForecastPage';
import { OrderTrackingPage } from '../pages/public/OrderTrackingPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/catalogo/:id" element={<ProductDetailPage />} />
        <Route path="/orcamento" element={<CartPage />} />
        <Route path="/rastrear" element={<OrderTrackingPage />} />
      </Route>

      <Route path="/admin/login" element={<LoginPage />} />

      <Route path="/admin" element={<PrivateRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="produtos" element={<ProductsPage />} />
          <Route path="produtos/novo" element={<ProductFormPage />} />
          <Route path="produtos/:id/editar" element={<ProductFormPage />} />
          <Route path="categorias" element={<CategoriesPage />} />
          <Route path="fornecedores" element={<SuppliersPage />} />
          <Route path="clientes" element={<CustomersPage />} />
          <Route path="clientes/novo" element={<CustomerFormPage />} />
          <Route path="clientes/:id/editar" element={<CustomerFormPage />} />
          <Route path="clientes/:id" element={<CustomerDetailPage />} />
          <Route path="agenda" element={<AgendaPage />} />
          <Route path="expedicao" element={<ExpedicaoPage />} />
          <Route path="financeiro" element={<FinancialPage />} />
          <Route path="pedidos" element={<OrdersPage />} />
          <Route path="pedidos/novo" element={<OrderFormPage />} />
          <Route path="pedidos/:id/editar" element={<OrderFormPage />} />
          <Route path="pedidos/:id" element={<OrderDetailPage />} />
          <Route path="romaneio" element={<RomaneioPage />} />
          <Route path="rota-entrega" element={<DeliveryRoutePage />} />
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="relatorios" element={<ReportsPage />} />
          <Route path="previsao" element={<WeeklyForecastPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
