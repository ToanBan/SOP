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
import RegisterPage from "./pages/RegisterPage";
import OAuthSuccess from "./components/OAuthSuccess";
import AdminSales from "./pages/AdminSales";
import AdminRole from "./pages/AdminRole";
import ProtectedRoute from "./components/ProtectedRoute";
import ConnectionPage from "./pages/ConnectionPage";
import PostPage from "./pages/PostPage";
import MarketingPage from "./pages/MarketingPage";
import CampaignPage from "./pages/CampaignPage";
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
          <Route path="customers" element={<CustomerPage />} />
          <Route path="connections" element={<ConnectionPage />} />
          <Route path="marketing" element={<MarketingPage />} />
          <Route path="posts" element={<PostPage />} />
          <Route path="campaign" element={<CampaignPage />} />
          <Route
            path="admin/sales"
            element={
              <ProtectedRoute>
                <AdminSales />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/roles"
            element={
              <ProtectedRoute>
                <AdminRole />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="/oauth-success" element={<OAuthSuccess />} />
      </Routes>
    </Router>
  );
}

export default App;
