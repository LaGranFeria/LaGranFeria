import "./styles/global.css";
import "./styles/global2.css";

import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import Header from "./components/Header/Header";
import NotFound from "./pages/NotFound/NotFound";
import WhatsApp from "./components/Whatsapp/Whatsapp";
import ScrollToTopBtn from "./components/ScrollToTopBtn/ScrollToTopBtn";
import Footer from "./components/Footer/Footer";

import Catalogue from "./pages/frontOffice/Catalogue/Catalogue";
import CatalogueCart from "./pages/frontOffice/CatalogueCart/CatalogueCart";
import Ecommerce from "./pages/frontOffice/Ecommerce/Ecommerce";
import Product from "./pages/frontOffice/Product/Product";

import Login from "./pages/frontOffice/Login/Login";
import CreateUser from "./pages/frontOffice/CreateUser/CreateUser";
import ResetPassword from "./pages/frontOffice/ResetPassword/ResetPassword";

import AdminPanel from "./pages/backOffice/AdminPanel/AdminPanel";
import Faqs from "./pages/backOffice/Faqs/Faqs";

import UserManager from "./pages/backOffice/managers/UserManager/UserManager";
import CategoryManager from "./pages/backOffice/managers/CategoryManager/CategoryManager";
import SubcategoryManager from "./pages/backOffice/managers/SubcategoryManager/SubcategoryManager";
import DollarManager from "./pages/backOffice/managers/DollarManager/DollarManager";
import ProductManager from "./pages/backOffice/managers/ProductManager/ProductManager";
import DetailManager from "./pages/backOffice/managers/DetailManager/DetailManager";
import ShipmentManager from "./pages/backOffice/managers/ShipmentManager/ShipmentManager";
import OrderManager from "./pages/backOffice/managers/OrderManager/OrderManager";
import PaymentTypeManager from "./pages/backOffice/managers/PaymentTypeManager/PaymentTypeManager";
import SettingManager from "./pages/backOffice/managers/SettingManager/SettingManager";

import OrderStatistics from "./pages/backOffice/statistics/StatisticsOptions";
import OrderReports from "./pages/backOffice/statistics/OrderReports/OrderReports";
import OrderGraphics from "./pages/backOffice/statistics/OrderGraphics/OrderGraphics";

import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute";
import { RoleProtectedRoute } from "./components/RoleProtectedRoute/RoleProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      {(
        window.location.pathname === "/" ||
        // window.location.pathname === "/catalogo" ||
        // window.location.pathname === "/catalogo-minorista" ||
        // window.location.pathname === "/catalogo-minorista-redes" ||
        window.location.pathname === "/ecommerce" ||
        window.location.pathname.includes("/producto") ||
        window.location.pathname === "/catalogo-mayorista" ||
        window.location.pathname === "/catalogo-mayorista-redes") && <Header />}
      <Routes>
        <Route index element={<Navigate to="/catalogo-mayorista" replace />} />
        {/* <Route path="/" element={<Catalogue />} />
        <Route path="catalogo" element={<Catalogue />} /> */}
        {/* <Route path="catalogo-minorista" element={<CatalogueCart />} />
        <Route path="catalogo-minorista-redes" element={<CatalogueCart />} /> */}
        <Route path="ecommerce" element={<Ecommerce />} />
        <Route path="producto/:id" element={<Product />} />
        <Route path="catalogo-mayorista" element={<CatalogueCart />} />
        <Route path="catalogo-mayorista-redes" element={<CatalogueCart />} />

        <Route path="login" element={<Login />} />
        <Route path="create-user" element={<CreateUser />} />
        <Route path="reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="panel" element={<AdminPanel />} />
          <Route path="preguntas-frecuentes" element={<Faqs />} />

          <Route
            path="gestionar-usuarios"
            element={
              <RoleProtectedRoute allowedRoles={["SuperAdmin"]}>
                <UserManager />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="gestionar-gerentes"
            element={
              <RoleProtectedRoute allowedRoles={["Admin"]}>
                <UserManager />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="gestionar-supervisores"
            element={
              <RoleProtectedRoute allowedRoles={["Gerente"]}>
                <UserManager />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="gestionar-vendedores"
            element={
              <RoleProtectedRoute allowedRoles={["Supervisor"]}>
                <UserManager />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="gestionar-categorias"
            element={
              <RoleProtectedRoute
                allowedRoles={["SuperAdmin", "Admin", "Supervisor", "Vendedor"]}
              >
                <CategoryManager />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="gestionar-subcategorias/:id"
            element={
              <RoleProtectedRoute
                allowedRoles={["SuperAdmin", "Admin", "Supervisor", "Vendedor"]}
              >
                <SubcategoryManager />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="gestionar-cotizacion"
            element={
              <RoleProtectedRoute allowedRoles={["Supervisor", "SuperAdmin"]}>
                <DollarManager />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="gestionar-productos"
            element={
              <RoleProtectedRoute
                allowedRoles={["SuperAdmin", "Admin", "Supervisor", "Vendedor"]}
              >
                <ProductManager />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="detalles/:id"
            element={
              <RoleProtectedRoute
                allowedRoles={["SuperAdmin", "Admin", "Supervisor", "Vendedor"]}
              >
                <DetailManager />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="gestionar-entregas"
            element={
              <RoleProtectedRoute allowedRoles={["Supervisor", "SuperAdmin"]}>
                <ShipmentManager />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="gestionar-configuraciones"
            element={
              <RoleProtectedRoute allowedRoles={["Supervisor", "SuperAdmin"]}>
                <SettingManager />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="gestionar-medios-pago"
            element={
              <RoleProtectedRoute allowedRoles={["Supervisor", "SuperAdmin"]}>
                <PaymentTypeManager />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="gestionar-pedidos"
            element={
              <RoleProtectedRoute
                allowedRoles={["SuperAdmin", "Admin", "Supervisor", "Vendedor"]}
              >
                <OrderManager />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="estadisticas-pedidos"
            element={
              <RoleProtectedRoute allowedRoles={["Gerente", "SuperAdmin"]}>
                <OrderStatistics />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="reportes-pedidos"
            element={
              <RoleProtectedRoute allowedRoles={["Gerente", "SuperAdmin"]}>
                <OrderReports />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="graficos-pedidos"
            element={
              <RoleProtectedRoute allowedRoles={["Gerente", "SuperAdmin"]}>
                <OrderGraphics />
              </RoleProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      {(
        window.location.pathname === "/" ||
        // window.location.pathname === "/catalogo" ||
        // window.location.pathname === "/catalogo-minorista" ||
        // window.location.pathname === "/catalogo-minorista-redes" ||
        window.location.pathname === "/ecommerce" ||
        window.location.pathname.includes("/producto") ||
        window.location.pathname === "/catalogo-mayorista" ||
        window.location.pathname === "/catalogo-mayorista-redes") && <Footer />}
      {(
        window.location.pathname === "/" ||
        // window.location.pathname === "/catalogo" ||
        // window.location.pathname === "/catalogo-minorista" ||
        // window.location.pathname === "/catalogo-minorista-redes" ||
        window.location.pathname === "/ecommerce" ||
        window.location.pathname.includes("/producto") ||
        window.location.pathname === "/catalogo-mayorista" ||
        window.location.pathname === "/catalogo-mayorista-redes") && (
        <WhatsApp />
      )}
      <ScrollToTopBtn />
    </BrowserRouter>
  );
}

export default App;
