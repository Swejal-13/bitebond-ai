import React, { useState, useEffect } from 'react';
import { FiSearch, FiShield, FiUserX, FiUserCheck } from 'react-icons/fi';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const ROLE_COLORS = {
  user: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  restaurant_owner: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const AdminUsersTab = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({ search, limit: 20 });
      setUsers(data.data || []);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
  }, [search]);

  const toggleActive = async (user) => {
    try {
      const updated = await adminService.updateUser(user._id, { isActive: !user.isActive });
      setUsers((prev) => prev.map((u) => (u._id === user._id ? updated.user : u)));
      toast.success(`${user.name} ${updated.user.isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed to update user'); }
  };

  return (
    <div className="card p-5">
      <div className="relative mb-4 max-w-sm">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…" className="input pl-10 text-sm" />
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <th className="py-2 pr-4 font-medium">User</th>
                <th className="py-2 pr-4 font-medium">Role</th>
                <th className="py-2 pr-4 font-medium">Points</th>
                <th className="py-2 pr-4 font-medium">Joined</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-gray-50 dark:border-gray-800/50">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`badge text-xs ${ROLE_COLORS[u.role]}`}>{u.role.replace('_', ' ')}</span>
                  </td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{u.loyaltyPoints}</td>
                  <td className="py-3 pr-4 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="py-3 pr-4">
                    <span className={`badge text-xs ${u.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="py-3">
                    <button onClick={() => toggleActive(u)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                        u.isActive ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30'}`}>
                      {u.isActive ? <><FiUserX size={12} /> Deactivate</> : <><FiUserCheck size={12} /> Activate</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="text-center text-gray-400 py-8">No users found</p>}
        </div>
      )}
    </div>
  );
};

export default AdminUsersTab;
