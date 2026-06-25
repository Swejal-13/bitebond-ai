import React, { useState, useEffect } from 'react';
import { FiSearch, FiStar, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminRestaurantsTab = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminService.getRestaurants({ search, limit: 20 });
      setRestaurants(data.data || []);
    } catch { toast.error('Failed to load restaurants'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
  }, [search]);

  const toggle = async (r, field) => {
    try {
      const updated = await adminService.updateRestaurant(r._id, { [field]: !r[field] });
      setRestaurants((prev) => prev.map((x) => (x._id === r._id ? updated.restaurant : x)));
      toast.success(`${r.name} updated`);
    } catch { toast.error('Update failed'); }
  };

  return (
    <div className="card p-5">
      <div className="relative mb-4 max-w-sm">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search restaurants…" className="input pl-10 text-sm" />
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-2">
          {restaurants.map((r) => (
            <div key={r._id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
              {r.image ? (
                <img src={r.image} alt={r.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">🍽️</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{r.name}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <FiStar size={10} className="text-amber-400" fill="currentColor" /> {r.rating?.toFixed(1)} · {r.address?.city}
                </p>
              </div>
              <button onClick={() => toggle(r, 'isFeatured')} className="flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                {r.isFeatured ? <FiToggleRight className="text-primary-500" size={18} /> : <FiToggleLeft size={18} />} Featured
              </button>
              <button onClick={() => toggle(r, 'isActive')} className="flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                {r.isActive ? <FiToggleRight className="text-green-500" size={18} /> : <FiToggleLeft size={18} />} Active
              </button>
            </div>
          ))}
          {restaurants.length === 0 && <p className="text-center text-gray-400 py-8">No restaurants found</p>}
        </div>
      )}
    </div>
  );
};

export default AdminRestaurantsTab;
