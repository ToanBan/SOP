import type React from "react";
import { useState } from "react";

const LoginPage: React.FC = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);

	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: Kết nối với Identity Service ở Task 2
		console.log("Logging in with:", { email, password, rememberMe });
	};

	return (
		<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-indigo-100">
			{/* Background Decor (Giữ nguyên để đồng bộ với trang Register) */}
			<div className="fixed inset-0 z-0">
				<div className="absolute top-20 right-1/4 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
				<div className="absolute bottom-10 left-1/3 w-96 h-96 bg-fuchsia-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
			</div>

			<div className="relative z-10 flex w-full max-w-5xl bg-white rounded-3xl shadow-2xl shadow-indigo-100 overflow-hidden backdrop-blur-sm bg-white/90 ring-1 ring-slate-100/50">
				{/* Left Side - Giao diện trang Login tối giản hơn */}
				<div className="w-full lg:w-1/2 p-12 md:p-16 flex flex-col justify-center">
					<div className="mb-10 text-center lg:text-left">
						<div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
							<div className="p-2.5 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-200">
								<svg
									className="w-6 h-6 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
									></path>
								</svg>
							</div>
							<span className="text-2xl font-black text-slate-900 tracking-tighter">
								SOP <span className="text-indigo-600">Omni</span>
							</span>
						</div>
						<h3 className="text-4xl font-black text-slate-950 tracking-tighter mb-2">
							Chào mừng trở lại!
						</h3>
						<p className="text-lg text-slate-500 font-medium">
							Vui lòng đăng nhập để quản lý cửa hàng của bạn.
						</p>
					</div>

					<form onSubmit={handleLogin} className="space-y-5">
						<div>
							<label
								className="block text-sm font-semibold text-slate-700 mb-2"
								htmlFor="email"
							>
								Email
							</label>
							<div className="relative">
								<span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206"
										></path>
									</svg>
								</span>
								<input
									type="email"
									id="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									placeholder="admin@sop.vn"
									className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 text-slate-900 transition-all outline-none"
								/>
							</div>
						</div>

						<div>
							<div className="flex justify-between mb-2">
								<label
									className="text-sm font-semibold text-slate-700"
									htmlFor="password"
								>
									Mật khẩu
								</label>
								<a
									href="#"
									className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition"
								>
									Quên mật khẩu?
								</a>
							</div>
							<div className="relative">
								<span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
										></path>
									</svg>
								</span>
								<input
									type="password"
									id="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									placeholder="••••••••"
									className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 text-slate-900 transition-all outline-none"
								/>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="remember"
								checked={rememberMe}
								onChange={(e) => setRememberMe(e.target.checked)}
								className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
							/>
							<label
								htmlFor="remember"
								className="text-sm font-medium text-slate-600 cursor-pointer"
							>
								Ghi nhớ đăng nhập
							</label>
						</div>

						<button
							type="submit"
							className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-100 hover:shadow-indigo-200 flex items-center justify-center gap-2 group"
						>
							Đăng nhập hệ thống
							<svg
								className="w-5 h-5 group-hover:translate-x-1 transition-transform"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M14 5l7 7m0 0l-7 7m7-7H3"
								></path>
							</svg>
						</button>
					</form>

					<div className="mt-10 text-center">
						<p className="text-slate-500 font-medium">
							Chưa có tài khoản doanh nghiệp?{" "}
							<a
								href="/register"
								className="text-indigo-600 font-bold hover:underline"
							>
								Đăng ký ngay
							</a>
						</p>
					</div>
				</div>

				{/* Right Side - Hình ảnh & Thông số (Sạch sẽ & Hiện đại) */}
				<div className="hidden lg:flex w-1/2 bg-slate-950 relative overflow-hidden items-center justify-center p-16">
					<div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

					{/* Một khối đồ họa trừu tượng thể hiện sự kết nối dữ liệu */}
					<div className="relative z-10 w-full text-center">
						<div className="inline-flex p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-xl mb-8 animate-pulse">
							<svg
								className="w-16 h-16 text-indigo-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="1.5"
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10m14 0v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v14"
								></path>
							</svg>
						</div>
						<h4 className="text-3xl font-bold text-white mb-4">
							Sẵn sàng để bùng nổ?
						</h4>
						<p className="text-indigo-200/70 text-lg leading-relaxed max-w-sm mx-auto">
							Hệ thống đang quản lý{" "}
							<span className="text-white font-bold">+1,200</span> hội thoại
							thời gian thực từ đa nền tảng.
						</p>

						{/* Mini Stats Card */}
						<div className="mt-12 grid grid-cols-2 gap-4">
							<div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
								<p className="text-xs text-indigo-300 uppercase tracking-widest font-bold mb-1">
									Tin nhắn
								</p>
								<p className="text-2xl font-black text-white">99k+</p>
							</div>
							<div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
								<p className="text-xs text-indigo-300 uppercase tracking-widest font-bold mb-1">
									Chốt đơn
								</p>
								<p className="text-2xl font-black text-white">85%</p>
							</div>
						</div>
					</div>

					{/* Decorative circles */}
					<div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-20"></div>
					<div className="absolute -top-20 -left-20 w-64 h-64 bg-fuchsia-600 rounded-full blur-[100px] opacity-20"></div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
