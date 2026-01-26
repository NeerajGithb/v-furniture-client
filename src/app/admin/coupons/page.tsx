'use client';

import { useState, useEffect } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNavigate } from '@/components/NavigationLoader';
import Loading from '@/components/ui/Loader';
import { Tag, Plus, Edit2, Trash2, X, RefreshCw } from 'lucide-react';

interface CouponFormData {
  code: string;
  type: 'flat' | 'percent';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiry: string;
  usageLimit: number;
  perUserLimit: number;
  description: string;
}

export default function CouponManagementPage() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    type: 'flat',
    value: 0,
    minOrderAmount: 0,
    maxDiscount: undefined,
    expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: 1000,
    perUserLimit: 1,
    description: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  useEffect(() => {
    if (!user || user.email !== 'neerajvishwakarma726689@gmail.com') {
      navigate.push('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.email === 'neerajvishwakarma726689@gmail.com') {
      loadCoupons();
    }
  }, [user]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.email === 'neerajvishwakarma726689@gmail.com') {
        loadCoupons();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/coupons/create?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await response.json();
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch (error) {
      setError('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    try {
      const url = editingCoupon 
        ? `/api/coupons/${editingCoupon._id}`
        : '/api/coupons/create';
      
      const method = editingCoupon ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          expiry: new Date(formData.expiry).toISOString(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(editingCoupon ? 'Coupon updated' : 'Coupon created');
        setShowForm(false);
        setEditingCoupon(null);
        resetForm();
        loadCoupons();
      } else {
        setError(data.error || 'Failed to save coupon');
      }
    } catch (error) {
      setError('Failed to save coupon');
    }
  };

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscount: coupon.maxDiscount,
      expiry: new Date(coupon.expiry).toISOString().split('T')[0],
      usageLimit: coupon.usageLimit,
      perUserLimit: coupon.perUserLimit,
      description: coupon.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (couponId: string, code: string) => {
    if (!confirm(`Delete "${code}"?`)) return;

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        
        if (response.status === 404) {
          setSuccess(`"${code}" was already deleted`);
          setCoupons(prev => prev.filter(c => c._id !== couponId));
        } else {
          setError(data.error || `Delete failed (${response.status})`);
        }
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Coupon deleted');
        setCoupons(prev => prev.filter(c => c._id !== couponId));
      } else {
        setError(data.error || 'Delete failed');
      }
    } catch (error: any) {
      setError(error?.message || 'Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'flat',
      value: 0,
      minOrderAmount: 0,
      maxDiscount: undefined,
      expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usageLimit: 1000,
      perUserLimit: 1,
      description: '',
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCoupon(null);
    resetForm();
    setError(null);
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!user || user.email !== 'neerajvishwakarma726689@gmail.com') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Tag className="w-6 h-6" />
              Coupon Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Create and manage discount coupons
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadCoupons}
              disabled={loading}
              className="p-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              New Coupon
            </button>
          </div>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm text-green-800 dark:text-green-300 flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-300 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
                  </h2>
                  <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Coupon Code *
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        required
                        disabled={!!editingCoupon}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'flat' | 'percent' })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        required
                      >
                        <option value="flat">Flat (₹)</option>
                        <option value="percent">Percent (%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Value *
                      </label>
                      <input
                        type="number"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        required
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Min Order Amount
                      </label>
                      <input
                        type="number"
                        value={formData.minOrderAmount}
                        onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        min="0"
                      />
                    </div>

                    {formData.type === 'percent' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Max Discount (₹)
                        </label>
                        <input
                          type="number"
                          value={formData.maxDiscount || ''}
                          onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value ? Number(e.target.value) : undefined })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          min="0"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Expiry Date *
                      </label>
                      <input
                        type="date"
                        value={formData.expiry}
                        onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Usage Limit
                      </label>
                      <input
                        type="number"
                        value={formData.usageLimit}
                        onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Per User Limit
                      </label>
                      <input
                        type="number"
                        value={formData.perUserLimit}
                        onChange={(e) => setFormData({ ...formData, perUserLimit: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSubmit}
                      className="flex-1 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      {editingCoupon ? 'Update' : 'Create'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          {coupons.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No coupons yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {coupons.map((coupon) => (
                <div key={coupon._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                          {coupon.code}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          coupon.type === 'flat'
                            ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                          {coupon.type === 'flat' ? `₹${coupon.value}` : `${coupon.value}%`}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          new Date(coupon.expiry) > new Date()
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {new Date(coupon.expiry) > new Date() ? 'Active' : 'Expired'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {coupon.description}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium">Min:</span> ₹{coupon.minOrderAmount}
                        </div>
                        {coupon.maxDiscount && (
                          <div>
                            <span className="font-medium">Max:</span> ₹{coupon.maxDiscount}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Used:</span> {coupon.usedCount}/{coupon.usageLimit}
                        </div>
                        <div>
                          <span className="font-medium">Per User:</span> {coupon.perUserLimit}
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Expires:</span> {new Date(coupon.expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id, coupon.code)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}