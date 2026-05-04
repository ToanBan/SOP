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
        <Route path="/oauth-success" element={<OAuthSuccess />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route
            path="customers"
            element={
              <ProtectedRoute allowedRoles={["admin", "sales", "marketing"]}>
                <CustomerPage />
              </ProtectedRoute>
            }
          />
          <Route path="posts" element={<PostPage />} />

          <Route
            path="connections"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ConnectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/sales"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminSales />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/roles"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminRole />
              </ProtectedRoute>
            }
          />

          <Route
            path="marketing"
            element={
              <ProtectedRoute allowedRoles={["admin", "marketing"]}>
                <MarketingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="campaign"
            element={
              <ProtectedRoute allowedRoles={["admin", "marketing"]}>
                <CampaignPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="chat"
            element={
              <ProtectedRoute allowedRoles={["admin", "sales"]}>
                <ChatPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;