import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import restaurantDashboardService from '../../services/restaurantDashboardService';
import toast from 'react-hot-toast';

const EMPTY_ITEM = { name: '', description: '', price: '', category: 'Main Course', isVeg: false, image: '' };

const RestaurantMenuTab = ({ restaurantId }) => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_ITEM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await restaurantDashboardService.getMenu(restaurantId);
      setMenu(data.menu || []);
    } catch { toast.error('Failed to load menu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [restaurantId]);

  const openAdd = () => { setForm(EMPTY_ITEM); setEditingId(null); setShowForm(true); };
  const openEdit = (item) => { setForm(item); setEditingId(item._id); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name || !form.price) return toast.error('Name and price are required');
    setSaving(true);
    try {
      if (editingId) {
        const data = await restaurantDashboardService.updateMenuItem(restaurantId, editingId, form);
        setMenu(data.menu);
        toast.success('Item updated');
      } else {
        const data = await restaurantDashboardService.addMenuItem(restaurantId, form);
        setMenu(data.menu);
        toast.success('Item added');
      }
      setShowForm(false);
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (itemId) => {
    try {
      const data = await restaurantDashboardService.deleteMenuItem(restaurantId, itemId);
      setMenu(data.menu);
      toast.success('Item removed');
    } catch { toast.error('Delete failed'); }
  };

  const toggleAvailable = async (item) => {
    try {
      const data = await restaurantDashboardService.updateMenuItem(restaurantId, item._id, { isAvailable: !item.isAvailable });
      setMenu(data.menu);
    } catch { toast.error('Update failed'); }
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Menu Items ({menu.length})</h3>
        <button onClick={openAdd} className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
          <FiPlus size={14} /> Add Item
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-2">
          {menu.map((item) => (
            <div key={item._id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
              {item.image ? <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                : <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg flex-shrink-0">🍽️</div>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-sm border-2 flex-shrink-0 ${item.isVeg ? 'border-green-600' : 'border-red-500'}`} />
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{item.name}</p>
                </div>
                <p className="text-xs text-gray-400">{item.category} · ₹{item.price}</p>
              </div>
              <button onClick={() => toggleAvailable(item)}
                className={`text-xs px-2 py-1 rounded-lg font-medium ${item.isAvailable ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                {item.isAvailable ? 'Available' : 'Hidden'}
              </button>
              <button onClick={() => openEdit(item)} className="p-2 text-gray-400 hover:text-primary-500 transition-colors"><FiEdit2 size={14} /></button>
              <button onClick={() => handleDelete(item._id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><FiTrash2 size={14} /></button>
            </div>
          ))}
          {menu.length === 0 && <p className="text-center text-gray-400 py-8">No menu items yet. Add your first dish!</p>}
        </div>
      )}

      {/* Add/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white">{editingId ? 'Edit Item' : 'Add Menu Item'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><FiX size={18} /></button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Item name" className="input text-sm" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="input text-sm resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="Price (₹)" className="input text-sm" />
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input text-sm cursor-pointer">
                  {['Starters', 'Main Course', 'Breads', 'Biryani', 'Desserts', 'Drinks', 'Sides'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Image URL (optional)" className="input text-sm" />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isVeg} onChange={(e) => setForm({ ...form, isVeg: e.target.checked })} className="accent-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Vegetarian</span>
              </label>
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-2.5 mt-4">
              {saving ? 'Saving…' : editingId ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantMenuTab;
