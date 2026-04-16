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

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/register" element={<RegisterPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/admin" element={<MainLayout />}>
					<Route index element={<Navigate to="dashboard" replace />} />
					<Route path="dashboard" element={<DashboardPage />} />
					<Route path="chat" element={<ChatPage />} />
					<Route path="orders" element={<OrderPage />} />
					<Route path="customers" element={<CustomerPage />} />
				</Route>

				<Route path="/" element={<Navigate to="/login" replace />} />
			</Routes>
		</Router>
	);
}

export default App;
