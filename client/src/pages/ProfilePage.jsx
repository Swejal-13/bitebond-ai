/**
 * Profile Page
 * View & edit profile, manage addresses and contacts
 */

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiEdit2, FiMapPin, FiHeart, FiPackage, FiStar, FiCamera } from 'react-icons/fi';
import { updateProfile } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'profile', label: 'Profile', icon: FiEdit2 },
  { id: 'addresses', label: 'Addresses', icon: FiMapPin },
  { id: 'contacts', label: 'Family & Friends', icon: FiHeart },
  { id: 'orders', label: 'Orders', icon: FiPackage },
  { id: 'loyalty', label: 'Loyalty Points', icon: FiStar },
];

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('phone', form.phone);
    const res = await dispatch(updateProfile(formData));
    if (!res.error) {
      toast.success('Profile updated!');
      setEditing(false);
    } else {
      toast.error('Update failed. Please try again.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-5"
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-2xl object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-3xl font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <button className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-md hover:bg-primary-600 transition-colors">
            <FiCamera size={13} />
          </button>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{user?.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{user?.email}</p>
          {user?.phone && <p className="text-gray-500 dark:text-gray-400 text-sm">{user.phone}</p>}
          <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
            <span className="badge badge-primary">⭐ {user?.loyaltyPoints || 0} Points</span>
            <span className="badge bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              ✓ Active Account
            </span>
          </div>
        </div>
      </motion.div>

      {/* Tab Nav */}
      <div className="flex gap-1 overflow-x-auto hide-scrollbar mb-6 bg-gray-100 dark:bg-surface-dark-muted p-1 rounded-2xl">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
              activeTab === id
                ? 'bg-white dark:bg-surface-dark-card text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card p-6"
      >
        {activeTab === 'profile' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h2>
              <button
                onClick={() => editing ? handleSave() : setEditing(true)}
                disabled={isLoading}
                className="btn-primary text-sm py-2 px-4"
              >
                {editing ? (isLoading ? 'Saving…' : 'Save Changes') : 'Edit Profile'}
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Phone Number', key: 'phone', type: 'tel' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                  {editing ? (
                    <input
                      type={type}
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="input"
                    />
                  ) : (
                    <p className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-surface-dark-muted text-gray-800 dark:text-gray-200 text-sm">
                      {user?.[key] || <span className="text-gray-400">Not set</span>}
                    </p>
                  )}
                </div>
              ))}

              {/* Read-only fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <p className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-surface-dark-muted text-gray-800 dark:text-gray-200 text-sm">
                  {user?.email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Account Role</label>
                <p className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-surface-dark-muted text-gray-800 dark:text-gray-200 text-sm capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>

            {editing && (
              <button onClick={() => setEditing(false)} className="btn-secondary text-sm py-2 px-4 mt-4">
                Cancel
              </button>
            )}
          </div>
        )}

        {activeTab === 'addresses' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Saved Addresses</h2>
              <button className="btn-primary text-sm py-2 px-4">+ Add Address</button>
            </div>
            {user?.addresses?.length === 0 || !user?.addresses ? (
              <div className="text-center py-12">
                <span className="text-5xl mb-4 block">📍</span>
                <p className="text-gray-500 dark:text-gray-400">No addresses saved yet.</p>
                <p className="text-sm text-gray-400 mt-1">Add an address for faster checkout.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {user.addresses.map((addr) => (
                  <div key={addr._id} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center flex-shrink-0">
                      <FiMapPin className="text-primary-500" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{addr.label}</span>
                        {addr.isDefault && <span className="badge badge-primary text-xs">Default</span>}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {addr.fullAddress}, {addr.city} — {addr.pincode}
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-primary-500 transition-colors text-sm">Edit</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'contacts' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Family & Friends</h2>
              <button className="btn-primary text-sm py-2 px-4">+ Add Contact</button>
            </div>
            {!user?.contacts?.length ? (
              <div className="text-center py-12">
                <span className="text-5xl mb-4 block">❤️</span>
                <p className="text-gray-500 dark:text-gray-400">No contacts saved yet.</p>
                <p className="text-sm text-gray-400 mt-1">Save family and friends for quick remote ordering.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {user.contacts.map((c) => (
                  <div key={c._id} className="card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold">
                      {c.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{c.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{c.relationship} · {c.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(activeTab === 'orders' || activeTab === 'loyalty') && (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">{activeTab === 'orders' ? '📦' : '⭐'}</span>
            <p className="text-gray-500 dark:text-gray-400">
              {activeTab === 'orders' ? 'Your order history will appear here.' : `You have ${user?.loyaltyPoints || 0} loyalty points.`}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {activeTab === 'orders' ? 'Coming in Phase 4.' : 'Earn points with every order. Coming soon!'}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProfilePage;
