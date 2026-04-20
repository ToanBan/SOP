import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import MainLayout from "./components/common/MainLayout";
import ChatPage from "./pages/ChatPage";
import CustomerPage from "./pages/CustomerPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import OrderPage from "./pages/OrderPage";
import RegisterPage from "./pages/RegisterPage";
import OAuthSuccess from "./components/OAuthSuccess";
import AdminSales from "./pages/AdminSales";
import AdminRole from "./pages/AdminRole";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="orders" element={<OrderPage />} />
          <Route path="customers" element={<CustomerPage />} />
          <Route path="admin/sales" element={<AdminSales />} />
          <Route path="admin/roles" element={<AdminRole/>}/>
        </Route>
        <Route path="/oauth-success" element={<OAuthSuccess />} />
      </Routes>
    </Router>
  );
}

export default App;
