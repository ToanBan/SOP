import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  X,
  Plus,
  Search,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Loader2,
} from "lucide-react";
import getAllUser from "../api/admin/getAllUser";
import getAllRoles from "../api/admin/getAllRoles";
import assignRole from "../api/admin/assignRole";
import Swal from "sweetalert2";
interface UserProps {
  id: string;
  roles: string[];
  username: string;
  email: string;
  roleId: string;
}

interface RoleProps {
  id: string;
  name: string;
}

const AdminSales: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<UserProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [permSearchTerm, setPermSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProps | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, usersRes] = await Promise.all([
        getAllRoles(),
        getAllUser(),
      ]);

      setUsers(usersRes);
      setRoles(rolesRes);
    } catch (error) {
      console.error("Fetch data error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleOpenModal = (user: UserProps) => {
    setSelectedUser(user);
    const currentRoleIds = user.roles.map(roleName => {
      const role = roles.find(r => r.name === roleName);
      return role ? role.id : '';
    }).filter(id => id !== '');
    setSelectedRoles(currentRoleIds);
    setIsModalOpen(true);
  };

  const handleAssignRoles = async () => {
    try {
      const result = await assignRole(selectedUser!.id, selectedRoles);
      console.log("Assign role result:", result);
      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Vai trò đã được gán thành công.",
        });
        fetchData();
        setIsModalOpen(false);
      } else {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: result.message || "Không thể gán vai trò. Vui lòng thử lại.",
        });
      }
    } catch (error) {
      console.error("Assign roles error:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể gán vai trò. Vui lòng thử lại.",
      });
      return;
    }
  };

  

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-800 relative">
      <div className="mx-auto max-w-6xl">
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-900">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200">
                <ShieldCheck className="text-white" size={28} />
              </div>
              Quản lý Phân quyền
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Thiết lập vai trò và giới hạn quyền truy cập cho nhân viên hệ
              thống.
            </p>
          </div>
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 w-full md:w-96 rounded-2xl border border-slate-200 bg-white shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </header>

        {/* User Table Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 font-bold text-slate-400 uppercase text-[11px] tracking-widest">
                    Người dùng
                  </th>
                  <th className="px-8 py-5 font-bold text-slate-400 uppercase text-[11px] tracking-widest">
                    Vai trò hiện tại
                  </th>
                  <th className="px-8 py-5 text-right font-bold text-slate-400 uppercase text-[11px] tracking-widest">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-20 text-center">
                      <Loader2
                        className="animate-spin mx-auto text-indigo-500 mb-2"
                        size={32}
                      />
                      <span className="text-slate-400 font-medium">
                        Đang tải dữ liệu...
                      </span>
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/80 transition-all group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {user.username}
                            </div>
                            <div className="text-sm text-slate-400 font-medium">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-tighter">
                            {user.roles.length > 0 ? (
                              user.roles.map((role) => role).join(", ")
                            ) : (
                              <></>
                            )}
                            <X
                              size={14}
                              className="cursor-pointer hover:bg-rose-600 hover:text-white rounded-full p-0.5 transition-all"
                            />
                          </span>
                          <button
                            onClick={() => handleOpenModal(user)}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                          >
                            <Plus size={14} /> Gán Vai Trò
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2.5 rounded-xl text-slate-300 hover:bg-white hover:text-amber-500 hover:shadow-md transition-all border border-transparent hover:border-slate-100">
                          <ShieldAlert size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-20 text-center text-slate-400 font-medium"
                    >
                      Không tìm thấy người dùng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-2xl animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-50 p-8 bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900">
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                    <Lock size={20} />
                  </div>
                  Phân quyền cho {selectedUser?.username}
                </h3>
                <p className="text-sm text-slate-400 mt-1 font-medium">
                  Chọn các quyền hạn cần thiết từ danh sách bên dưới
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedRoles([]);
                }}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="px-8 pt-4">
              <div className="relative group">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Tìm nhanh quyền hạn (ví dụ: create_user...)"
                  value={permSearchTerm}
                  onChange={(e) => setPermSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-300 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            {/* Permissions Grid */}
            <div className="p-8 max-h-[400px] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <div
                      key={role.id}
                      className="group relative flex items-center gap-4 rounded-2xl border border-slate-100 p-4 transition-all hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer"
                    >
                      <div className="relative flex h-6 w-6 shrink-0 items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role.id)}
                          onChange={() => {
                            setSelectedRoles((prev) => {
                              if (prev.includes(role.id)) {
                                return prev.filter((id) => id !== role.id);
                              } else {
                                return [...prev, role.id];
                              }
                            });
                          }}
                          className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-slate-200 checked:bg-indigo-600 checked:border-indigo-600 transition-all shadow-sm"
                        />
                        <CheckCircle2
                          className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                          size={16}
                          strokeWidth={3}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-slate-700 truncate group-hover:text-indigo-700 uppercase tracking-tight">
                          {role.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold opacity-60">
                          ID: {role.id.slice(0, 12)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-slate-300 italic">
                    Không có quyền hạn nào khớp với từ khóa.
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-4 border-t border-slate-50 bg-slate-50/30 p-8">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedRoles([]);
                }}
                className="flex-1 rounded-2xl bg-white border border-slate-200 py-4 font-bold text-slate-500 hover:bg-slate-100 transition-all active:scale-95"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleAssignRoles}
                className="flex-1 rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styled Scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}</style>
    </div>
  );
};

export default AdminSales;
