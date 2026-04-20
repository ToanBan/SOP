import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  X,
  Search,
  Settings2,
  CheckCircle2,
  Trash2,
  Loader2,
  Key,
  Lock,
  Eye,
} from "lucide-react";
import Swal from "sweetalert2";
import getAllRoles from "../api/admin/getAllRoles";
import getAllPermissions from "../api/admin/getAllPermissions";
import handleAssignPermissions from "../api/admin/handleAssignPermissions";
import getPermissionsByRole from "../api/admin/getPermissionsByRole";

interface RoleProps {
  id: string;
  name: string;
  description: string;
  permissionCount: number;
}

interface PermissionProps {
  id: string;
  name: string;
  permissionId?: string;   
  permissionName?: string;
}

const AdminRole: React.FC = () => {
  const [roles, setRoles] = useState<RoleProps[]>([]);
  const [permissions, setPermissions] = useState<PermissionProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleProps | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [permSearchTerm, setPermSearchTerm] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [rolePermissions, setRolePermissions] = useState<any[]>([]);
  const [viewLoading, setViewLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [permissionsRes, rolesRes] = await Promise.all([
        getAllPermissions(),
        getAllRoles(),
      ]);
    
      setRoles(rolesRes);
      setPermissions(permissionsRes);
    } catch (error) {
      console.error("Fetch data error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredPermissions = permissions.filter((p) =>
    p.name.toLowerCase().includes(permSearchTerm.toLowerCase()),
  );

  const handleOpenViewModal = async (role: RoleProps) => {
    setSelectedRole(role);
    setIsViewModalOpen(true);
    setViewLoading(true);
    try {
      const results = await getPermissionsByRole(role.id);
      setRolePermissions(results || []);
    } catch (error) {
      console.error("Lỗi xem quyền:", error);
      setRolePermissions([]);
    } finally {
      setViewLoading(false);
    }
  };

  const handleOpenAssignModal = async (role: RoleProps) => {
    setSelectedRole(role);
    setIsModalOpen(true);
    setSelectedPermissions([]); 
    
    try {
      const currentPerms = await getPermissionsByRole(role.id);
      const activeIds = currentPerms.map((p: any) => p.permissionId || p.id);
      setSelectedPermissions(activeIds);
    } catch (error) {
      console.error("Lỗi lấy quyền hiện tại:", error);
      setSelectedPermissions([]);
    }
  };

  const handleSubmitAssign = async () => {
    try {
      if (!selectedRole) return;

      const result = await handleAssignPermissions(
        selectedRole.id,
        selectedPermissions,
      );

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Thành công 🎉",
          text: "Cập nhật quyền hạn thành công",
          timer: 1500,
          showConfirmButton: false,
        });
        setIsModalOpen(false);
        fetchData();
      } else {
        throw new Error();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Đặt Quyền Không Thành Công",
      });
    }
  };


  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-800 relative">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-900">
              <div className="p-2 bg-purple-600 rounded-lg shadow-lg shadow-purple-200">
                <Settings2 className="text-white" size={28} />
              </div>
              Quản lý Vai trò
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Thiết lập các nhóm quyền hạn cố định cho hệ thống.</p>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Tìm tên vai trò..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 w-full md:w-80 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center">
              <Loader2 className="animate-spin mx-auto text-purple-500 mb-2" size={32} />
              <span className="text-slate-400 font-medium">Đang tải dữ liệu...</span>
            </div>
          ) : filteredRoles.length > 0 ? (
            filteredRoles.map((role) => (
              <div key={role.id} className="group bg-white rounded-[2rem] border border-slate-100 p-6 shadow-xl hover:shadow-purple-100 transition-all duration-300 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-purple-50 transition-colors">
                    <ShieldCheck className="text-slate-400 group-hover:text-purple-600" size={24} />
                  </div>
                  <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors active:scale-90">
                    <Trash2 size={18} />
                  </button>
                </div>

                <h3 className="text-xl font-black text-slate-800 mb-2">{role.name}</h3>
                <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2 flex-grow">{role.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <Key size={14} className="text-indigo-500" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{role.permissionCount} Quyền</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenViewModal(role)} className="p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-200 transition-all active:scale-95">
                      <Eye size={18} />
                    </button>
                    <button onClick={() => handleOpenAssignModal(role)} className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all active:scale-95">
                      Gán quyền
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-[2rem] border border-dashed border-slate-200">Không tìm thấy vai trò nào.</div>
          )}
        </div>
      </div>

      {isViewModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsViewModalOpen(false)}></div>
          <div className="relative w-full max-w-md rounded-[2.5rem] bg-white shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900">Quyền của {selectedRole?.name}</h3>
              <X className="cursor-pointer text-slate-400" onClick={() => setIsViewModalOpen(false)} />
            </div>
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              {viewLoading ? <Loader2 className="animate-spin mx-auto text-indigo-500" /> : 
                rolePermissions.length > 0 ? (
                  <div className="grid gap-2">
                    {rolePermissions.map((p, i) => (
                      <div key={i} className="p-3 bg-indigo-50 rounded-xl text-sm font-bold text-indigo-700 uppercase">
                        {p.permissionName || p.name}
                      </div>
                    ))}
                  </div>
                ) : <p className="text-center text-slate-400 italic">Trống</p>
              }
            </div>
            <button onClick={() => setIsViewModalOpen(false)} className="w-full mt-6 py-3 bg-slate-900 text-white rounded-2xl font-bold">Đóng</button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl rounded-[2rem] bg-white shadow-2xl flex flex-col overflow-hidden">
            <div className="p-8 border-b flex justify-between items-center">
              <h3 className="text-2xl font-black">Thiết lập: {selectedRole?.name}</h3>
              <X className="cursor-pointer" onClick={() => setIsModalOpen(false)} />
            </div>

            <div className="p-8 pb-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="text"
                  placeholder="Tìm quyền..."
                  value={permSearchTerm}
                  onChange={(e) => setPermSearchTerm(e.target.value)}
                  className="w-full pl-12 py-3 bg-slate-50 rounded-2xl outline-none border focus:border-indigo-300 transition-all"
                />
              </div>
            </div>

            <div className="p-8 max-h-[400px] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPermissions.map((perm) => {
                  const isChecked = selectedPermissions.includes(perm.id);
                  return (
                    <div
                      key={perm.id}
                      onClick={() => {
                        setSelectedPermissions(prev => 
                          isChecked ? prev.filter(id => id !== perm.id) : [...prev, perm.id]
                        );
                      }}
                      className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                        isChecked ? "bg-indigo-50 border-indigo-200" : "hover:bg-slate-50 border-slate-100"
                      }`}
                    >
                      <div className="relative h-6 w-6 flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          readOnly
                          className="peer h-6 w-6 appearance-none rounded-lg border-2 border-slate-200 checked:bg-indigo-600 checked:border-indigo-600 transition-all"
                        />
                        {isChecked && <CheckCircle2 className="absolute text-white" size={14} strokeWidth={3} />}
                      </div>
                      <div>
                        <div className={`text-sm font-bold uppercase ${isChecked ? "text-indigo-700" : "text-slate-700"}`}>
                          {perm.name}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-8 bg-slate-50/50 flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white border rounded-2xl font-bold text-slate-500">Hủy</button>
              <button onClick={handleSubmitAssign} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AdminRole;