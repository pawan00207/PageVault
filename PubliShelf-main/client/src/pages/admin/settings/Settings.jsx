import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  getAllAdmins,
  createAdmin,
  deleteAdmin,
  changeAdminKey,
  updateAdminKey
} from '../../../services/admin.services';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/AlertDialog';

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useSelector(state => state.user);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [showChangeKeyDialog, setShowChangeKeyDialog] = useState(false);
  const [showCreateAdminDialog, setShowCreateAdminDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showChangeAdminKeyDialog, setShowChangeAdminKeyDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  
  const [createAdminError, setCreateAdminError] = useState('');
  const [changeKeyError, setChangeKeyError] = useState('');
  const [changeAdminKeyError, setChangeAdminKeyError] = useState('');

  const adminNameRules = {
    required: 'Name is required.',
    validate: {
      alphabetsOnly: v => /^[A-Za-z\s]+$/.test(v) || 'Name must contain only alphabets and spaces.',
      noLeadingTrailingSpaces: v => v.trim() === v || 'Name cannot have leading or trailing spaces.',
      notEmpty: v => v.trim().length > 0 || 'Name cannot be empty.'
    }
  };

  const emailRules = {
    required: 'Email is required.',
    validate: {
      validEmail: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Please enter a valid email address.',
      lowercase: v => v === v.toLowerCase() || 'Email must be in lowercase.',
      noSpaces: v => !/\s/.test(v) || 'Email cannot contain spaces.'
    }
  };

  const adminKeyRules = {
    required: 'Admin key is required.',
    minLength: { value: 6, message: 'Admin key must be at least 6 digits.' },
    validate: {
      numbersOnly: v => /^\d+$/.test(v) || 'Admin key must contain only numbers.',
      noSpaces: v => !/\s/.test(v) || 'Admin key cannot contain spaces.'
    }
  };

  const {
    register: registerChangeKey,
    handleSubmit: handleSubmitChangeKey,
    formState: { errors: errorsChangeKey },
    reset: resetChangeKey
  } = useForm({ mode: 'onBlur' });

  const {
    register: registerCreateAdmin,
    handleSubmit: handleSubmitCreateAdmin,
    formState: { errors: errorsCreateAdmin },
    reset: resetCreateAdmin
  } = useForm({ mode: 'onBlur' });

  const {
    register: registerChangeAdminKey,
    handleSubmit: handleSubmitChangeAdminKey,
    formState: { errors: errorsChangeAdminKey },
    reset: resetChangeAdminKey
  } = useForm({ mode: 'onBlur' });

  useEffect(() => {
    if (activeTab === 'team' && user?.isSuperAdmin) {
      fetchAdmins();
    }
  }, [activeTab, user]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await getAllAdmins();
      setAdmins(data);
    } catch (err) {
      console.error('Failed to load admins:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeKey = async (data) => {
    setChangeKeyError('');
    try {
      setActionLoading(true);
      await updateAdminKey(data.currentKey.trim(), data.newKey.trim());
      toast.success('Admin key updated successfully! Please login again with your new key.');
      setShowChangeKeyDialog(false);
      resetChangeKey();
      setChangeKeyError('');
    } catch (err) {
      console.error('Change key error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update admin key';
      setChangeKeyError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateAdmin = async (data) => {
    setCreateAdminError('');
    try {
      setActionLoading(true);
      const adminData = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        adminKey: data.adminKey.trim()
      };
      console.log('Creating admin with data:', adminData);
      await createAdmin(adminData);
      await fetchAdmins();
      toast.success('Admin created successfully!');
      setShowCreateAdminDialog(false);
      resetCreateAdmin();
      setCreateAdminError('');
    } catch (err) {
      console.error('Create admin error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to create admin';
      setCreateAdminError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAdmin = async () => {
    try {
      setActionLoading(true);
      await deleteAdmin(selectedAdmin._id);
      await fetchAdmins();
      setShowDeleteDialog(false);
      setSelectedAdmin(null);
      toast.success('Admin deleted successfully!');
    } catch (err) {
      console.error('Delete admin error:', err); // Added logging
      toast.error(err.response?.data?.message || 'Failed to delete admin');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeAdminKey = async (data) => {
    setChangeAdminKeyError(''); // Clear previous errors
    try {
      setActionLoading(true);
      console.log('Changing admin key for:', selectedAdmin._id, 'New key:', data.newAdminKey.trim());
      await changeAdminKey(selectedAdmin._id, data.newAdminKey.trim());
      toast.success(`Admin key changed successfully for ${selectedAdmin.name}!`);
      setShowChangeAdminKeyDialog(false);
      setSelectedAdmin(null);
      resetChangeAdminKey();
      setChangeAdminKeyError('');
      await fetchAdmins();
    } catch (err) {
      console.error('Change admin key error:', err);
      let errorMessage;
      if (err.response?.status === 409) {
        errorMessage = 'This admin key is already in use by another admin. Please choose a different key.';
      } else {
        errorMessage = err.response?.data?.message || 'Failed to change admin key';
      }
      setChangeAdminKeyError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'fa-user' },
    ...(user?.isSuperAdmin ? [{ id: 'team', label: 'Admin Team', icon: 'fa-users-cog' }] : [])
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your admin account and preferences</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchParams({ tab: tab.id });
                  }}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                    activeTab === tab.id
                      ? 'border-b-2 border-purple-600 text-purple-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className={`fas ${tab.icon} mr-2`}></i>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Name</p>
                      <p className="font-medium text-gray-900">{user?.name}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="font-medium text-gray-900">{user?.email}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Role</p>
                      <p className="font-medium text-purple-600">
                        {user?.isSuperAdmin ? 'Super Admin' : 'Admin'}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Account Status</p>
                      <p className="font-medium text-green-600">Active</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Security</h2>
                  <button
                    onClick={() => {
                      setChangeKeyError('');
                      setShowChangeKeyDialog(true);
                    }}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
                  >
                    <i className="fas fa-key mr-2"></i>
                    Change Admin Key
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'team' && user?.isSuperAdmin && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Admin Team Management</h2>
                  <button
                    onClick={() => {
                      setCreateAdminError('');
                      setShowCreateAdminDialog(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
                  >
                    <i className="fas fa-plus"></i>
                    Create Admin
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <i className="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
                    <p className="text-gray-600">Loading admins...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {admins.map((admin) => (
                      <div key={admin._id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                              <i className="fas fa-user-shield text-purple-600 text-xl"></i>
                            </div>
                            <div className="ml-3">
                              <h3 className="font-semibold text-gray-900">{admin.name}</h3>
                              <p className="text-sm text-gray-500">{admin.email}</p>
                            </div>
                          </div>
                          {admin.isSuperAdmin && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs font-semibold rounded">
                              Super Admin
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <i className="fas fa-calendar w-5"></i>
                            <span>Joined {new Date(admin.createdAt).toLocaleDateString()}</span>
                          </div>
                          {admin.lastLogin && (
                            <div className="flex items-center text-sm text-gray-600">
                              <i className="fas fa-clock w-5"></i>
                              <span>Last login: {new Date(admin.lastLogin).toLocaleDateString()}</span>
                            </div>
                          )}
                          {admin.createdBy && (
                            <div className="flex items-center text-sm text-gray-600">
                              <i className="fas fa-user-plus w-5"></i>
                              <span>Created by: {admin.createdBy.name}</span>
                            </div>
                          )}
                        </div>

                        {!admin.isSuperAdmin && (
                          <div className="flex gap-2 pt-3 border-t border-gray-200">
                            <button
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setChangeAdminKeyError('');
                                setShowChangeAdminKeyDialog(true);
                              }}
                              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                            >
                              <i className="fas fa-key"></i>
                              Change Key
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setShowDeleteDialog(true);
                              }}
                              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                            >
                              <i className="fas fa-trash"></i>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      
      {/* Change Admin Key Dialog (Own Key) */}
      <AlertDialog open={showChangeKeyDialog} onOpenChange={setShowChangeKeyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Admin Key</AlertDialogTitle>
            <AlertDialogDescription>
              Update your admin key for enhanced security. You'll need to login again after changing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handleSubmitChangeKey(handleChangeKey)}>
            {changeKeyError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                  <i className="fas fa-exclamation-circle mt-0.5"></i>
                  <p className="text-sm">{changeKeyError}</p>
                </div>
              </div>
            )}
            <div className="space-y-4 my-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Admin Key</label>
                <input
                  type="password"
                  {...registerChangeKey('currentKey', adminKeyRules)}
                  className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errorsChangeKey.currentKey ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter current key"
                />
                {errorsChangeKey.currentKey && (
                  <p className="text-red-600 text-sm mt-1">{errorsChangeKey.currentKey.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Admin Key</label>
                <input
                  type="password"
                  {...registerChangeKey('newKey', adminKeyRules)}
                  className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errorsChangeKey.newKey ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter new key (min 6 digits)"
                />
                {errorsChangeKey.newKey && (
                  <p className="text-red-600 text-sm mt-1">{errorsChangeKey.newKey.message}</p>
                )}
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => resetChangeKey()}>Cancel</AlertDialogCancel>
              <button
                type="submit"
                disabled={actionLoading}
                className="inline-flex h-10 items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading ? 'Updating...' : 'Update Key'}
              </button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Admin Dialog */}
      <AlertDialog open={showCreateAdminDialog} onOpenChange={setShowCreateAdminDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Add a new admin to the team. They will receive access with the specified credentials.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handleSubmitCreateAdmin(handleCreateAdmin)}>
            {createAdminError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                  <i className="fas fa-exclamation-circle mt-0.5"></i>
                  <p className="text-sm">{createAdminError}</p>
                </div>
              </div>
            )}
            <div className="space-y-4 my-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  {...registerCreateAdmin('name', adminNameRules)}
                  className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errorsCreateAdmin.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter name (alphabets only)"
                />
                {errorsCreateAdmin.name && (
                  <p className="text-red-600 text-sm mt-1">{errorsCreateAdmin.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  {...registerCreateAdmin('email', emailRules)}
                  className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errorsCreateAdmin.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter email"
                />
                {errorsCreateAdmin.email && (
                  <p className="text-red-600 text-sm mt-1">{errorsCreateAdmin.email.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Key</label>
                <input
                  type="password"
                  {...registerCreateAdmin('adminKey', adminKeyRules)}
                  className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errorsCreateAdmin.adminKey ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Set admin key (min 6 digits)"
                />
                {errorsCreateAdmin.adminKey && (
                  <p className="text-red-600 text-sm mt-1">{errorsCreateAdmin.adminKey.message}</p>
                )}
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => resetCreateAdmin()}>Cancel</AlertDialogCancel>
              <button
                type="submit"
                disabled={actionLoading}
                className="inline-flex h-10 items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading ? 'Creating...' : 'Create Admin'}
              </button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Admin Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedAdmin?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedAdmin(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAdmin} disabled={actionLoading} className="bg-red-600 hover:bg-red-700">
              {actionLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Admin Key Dialog (For Other Admins) */}
      <AlertDialog open={showChangeAdminKeyDialog} onOpenChange={setShowChangeAdminKeyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Admin Key</AlertDialogTitle>
            <AlertDialogDescription>
              Set a new admin key for <strong>{selectedAdmin?.name}</strong>. The key must be unique and at least 6 digits long.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handleSubmitChangeAdminKey(handleChangeAdminKey)}>
            {changeAdminKeyError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                  <i className="fas fa-exclamation-circle mt-0.5"></i>
                  <p className="text-sm">{changeAdminKeyError}</p>
                </div>
              </div>
            )}
            <div className="my-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Admin Key</label>
              <input
                type="password"
                {...registerChangeAdminKey('newAdminKey', adminKeyRules)}
                className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errorsChangeAdminKey.newAdminKey ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter new admin key (min 6 digits)"
              />
              {errorsChangeAdminKey.newAdminKey && (
                <p className="text-red-600 text-sm mt-1">{errorsChangeAdminKey.newAdminKey.message}</p>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setSelectedAdmin(null); resetChangeAdminKey(); }}>Cancel</AlertDialogCancel>
              <button
                type="submit"
                disabled={actionLoading}
                className="inline-flex h-10 items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading ? 'Changing...' : 'Change Key'}
              </button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;