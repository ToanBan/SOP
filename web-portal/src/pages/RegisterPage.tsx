import React, { useState } from "react";
import handleRegister from "../api/user/handleRegister";
import AlertSuccess from "../components/common/AlertSuccess";
import AlertError from "../components/common/AlertError";
const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const handleSubmitRegister = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      const result = await handleRegister(
        username,
        email,
        password,
        confirmPassword,
      );
      if (result) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(true);
        setTimeout(() => setError(false), 3000);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 3000);
      return;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-indigo-100">
        {/* Background Decor */}
        <div className="fixed inset-0 z-0">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
          <div className="absolute top-0 right-1/3 w-80 h-80 bg-fuchsia-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 flex w-full max-w-6xl bg-white rounded-3xl shadow-2xl shadow-indigo-100 overflow-hidden backdrop-blur-sm bg-white/90 ring-1 ring-slate-100/50">
          {/* Left Side - Welcome & Illustration (BẢN ĐÃ CẬP NHẬT SVG ĐẸP) */}
          <div className="hidden lg:flex w-1/2 p-16 bg-gradient-to-br from-indigo-50/50 to-indigo-100/30 flex-col justify-between items-start border-r border-slate-100">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-100">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                    ></path>
                  </svg>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tighter">
                  <span className="text-indigo-600">SOP</span> Omni
                  <span className="text-slate-400 font-light">Channel</span>
                </h1>
              </div>

              <h2 className="text-5xl font-extrabold text-slate-900 leading-[1.15] tracking-tight mb-6">
                Nền tảng chat & <br /> bán hàng{" "}
                <span className="text-indigo-600">tập trung</span>.
              </h2>
              <p className="text-xl text-slate-600 max-w-md leading-relaxed">
                Gom tin nhắn từ FB, Zalo, Telegram về một nơi. Tự động hóa chốt
                đơn và quản lý khách hàng thông minh.
              </p>
            </div>

            {/* Bức tranh SVG mô phỏng Dashboard thực tế */}
            <div className="w-full h-80 flex items-center justify-center p-6 bg-white/50 rounded-2xl ring-1 ring-indigo-50/50 shadow-inner">
              <svg
                viewBox="0 0 400 240"
                className="w-full h-full text-indigo-100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Dashboard Frame */}
                <rect
                  x="20"
                  y="20"
                  width="360"
                  height="200"
                  rx="12"
                  fill="white"
                  stroke="#E2E8F0"
                  strokeWidth="2"
                />
                <rect
                  x="20"
                  y="20"
                  width="360"
                  height="40"
                  rx="12"
                  fill="#F8FAFC"
                />
                <circle cx="45" cy="40" r="5" fill="#EE4444" />
                <circle cx="65" cy="40" r="5" fill="#FBBF24" />
                <circle cx="85" cy="40" r="5" fill="#22C55E" />
                {/* Sidebar */}
                <rect
                  x="30"
                  y="70"
                  width="80"
                  height="140"
                  rx="6"
                  fill="#F1F5F9"
                />
                <rect
                  x="40"
                  y="80"
                  width="60"
                  height="8"
                  rx="4"
                  fill="#6366F1"
                />
                <rect
                  x="40"
                  y="100"
                  width="60"
                  height="8"
                  rx="4"
                  fill="#CBD5E1"
                />
                <rect
                  x="40"
                  y="120"
                  width="60"
                  height="8"
                  rx="4"
                  fill="#CBD5E1"
                />
                {/* Platform Icons (The "Omnichannel" part) */}
                <circle
                  cx="160"
                  cy="90"
                  r="20"
                  fill="white"
                  stroke="#6366F1"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <path
                  d="M160 82L160 98M152 90L168 90"
                  stroke="#6366F1"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="160" cy="150" r="18" fill="#1877F2" /> {/* FB */}
                <path
                  d="M164 150H156M160 146V154"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="160" cy="200" r="18" fill="#0088CC" /> {/* Tele */}
                <path
                  d="M154 200L166 200M160 194V206"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Connections */}
                <path
                  d="M178 90C190 90 200 100 200 115C200 130 190 140 178 140"
                  stroke="#6366F1"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
                {/* Main Content - Charts & Messages */}
                <rect
                  x="230"
                  y="70"
                  width="140"
                  height="60"
                  rx="6"
                  fill="#F1F5F9"
                />
                <path
                  d="M240 110L260 90L280 105L310 80"
                  stroke="#6366F1"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <rect
                  x="230"
                  y="140"
                  width="140"
                  height="15"
                  rx="4"
                  fill="#6366F1"
                />
                <rect
                  x="230"
                  y="160"
                  width="140"
                  height="15"
                  rx="4"
                  fill="#E2E8F0"
                />
                <rect
                  x="230"
                  y="180"
                  width="140"
                  height="15"
                  rx="4"
                  fill="#E2E8F0"
                />
              </svg>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="w-full lg:w-1/2 p-12 md:p-16 flex flex-col justify-center">
            <div className="mb-10 text-center lg:text-left">
              <h3 className="text-4xl font-black text-slate-950 tracking-tighter mb-2">
                Đăng ký tài khoản mới
              </h3>
              <p className="text-lg text-slate-500">
                Bắt đầu quản lý bán hàng đa kênh ngay hôm nay.
              </p>
            </div>

            <form onSubmit={handleSubmitRegister} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    className="block text-sm font-semibold text-slate-700 mb-2"
                    htmlFor="name"
                  >
                    Tên hiển thị
                  </label>
                  <div className="relative">
                    <svg
                      className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      ></path>
                    </svg>
                    <input
                      type="text"
                      id="name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="Lê Toàn Bân"
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-slate-900 placeholder:text-slate-300 transition"
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold text-slate-700 mb-2"
                    htmlFor="email"
                  >
                    Email công việc
                  </label>
                  <div className="relative">
                    <svg
                      className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      ></path>
                    </svg>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="ban.le@sop.vn"
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-slate-900 placeholder:text-slate-300 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-semibold text-slate-700 mb-2"
                  htmlFor="password"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <svg
                    className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"
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
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-slate-900 transition"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-semibold text-slate-700 mb-2"
                  htmlFor="password"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <svg
                    className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"
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
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-slate-900 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-indigo-100 hover:shadow-indigo-200"
              >
                <span>Đăng ký ngay</span>
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
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  ></path>
                </svg>
              </button>
            </form>

            <div className="relative my-8">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-sm font-medium">
                <span className="bg-white/90 backdrop-blur-sm px-2 text-slate-400">
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2.5 py-3 border border-slate-200 rounded-xl text-slate-900 font-medium hover:bg-slate-50 transition">
                <img
                  src="https://authjs.dev/img/providers/google.svg"
                  alt="Google"
                  className="h-5"
                />
                Google
              </button>
              <button className="flex items-center justify-center gap-2.5 py-3 border border-slate-200 rounded-xl text-slate-900 font-medium hover:bg-slate-50 transition">
                <img
                  src="https://authjs.dev/img/providers/facebook.svg"
                  alt="Facebook"
                  className="h-5"
                />
                Facebook
              </button>
            </div>

            <p className="mt-10 text-center text-base text-slate-600">
              Bạn đã có tài khoản?{" "}
              <a
                href="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-700 transition"
              >
                Đăng nhập tại đây
              </a>
            </p>
          </div>
        </div>
      </div>

      {success && (
        <div className="fixed top-4 right-4 z-50">
          <AlertSuccess message="Đăng ký thành công!" />
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 z-50">
          <AlertError message="Đăng ký thất bại. Vui lòng thử lại." />
        </div>
      )}
    </>
  );
};

export default RegisterPage;
