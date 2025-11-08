import React, { useState, useEffect } from 'react';
import { Upload, Lock, Save, X, Edit2, Trash2 } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';

// Mock API calls (replace with actual axios calls)
const api = {
  getUser: async () => ({
    id: 1,
    full_name: 'John Doe',
    username: 'johndoe',
    email: 'john.doe@flowchain.com',
    phone: '+91 98765 43210',
    gender: 'Male',
    dob: '1990-05-15',
    department: 'Engineering',
    designation: 'Project Manager',
    join_date: '2023-01-15',
    address: '123 Tech Street, Gandhinagar, Gujarat',
    bio: 'Experienced project manager with a passion for streamlined workflows and team collaboration.',
    profile_image: null,
    role: 'Project Manager',
    status: 'Active',
    language: 'English',
    timezone: 'Asia/Kolkata',
    theme: 'Light',
    email_notifications: true,
    task_reminders: true,
    billing_alerts: true
  }),
  updateUser: async (data) => ({ success: true, data }),
  uploadImage: async (file) => ({ 
    success: true, 
    url: URL.createObjectURL(file) 
  }),
  updatePreferences: async (prefs) => ({ success: true, data: prefs }),
  changePassword: async (passwords) => ({ success: true }),
  deleteAccount: async () => ({ success: true })
};

const ChangePasswordModal = ({ isOpen, onClose, onSubmit }) => {
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwords.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      await onSubmit(passwords);
      onClose();
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError('Failed to change password');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={passwords.oldPassword}
              onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Change Password
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProfileOverview = ({ userData, onEdit, onPasswordChange, onImageUpload, isEditing }) => {
  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'JD';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          {userData?.profile_image ? (
            <img
              src={userData.profile_image}
              alt={userData.full_name}
              className="w-32 h-32 rounded-full object-cover border-4 border-purple-100"
            />
          ) : (
            <div className="w-32 h-32 bg-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-purple-100">
              {getInitials(userData?.full_name)}
            </div>
          )}
          <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition-colors">
            <Upload size={18} />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {userData?.full_name || 'John Doe'}
        </h2>
        <p className="text-gray-600 mb-2">{userData?.email}</p>
        <p className="text-purple-600 font-semibold mb-2">{userData?.role}</p>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          userData?.status === 'Active' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          {userData?.status}
        </span>

        <div className="flex gap-3 mt-6 w-full">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <Edit2 size={18} />
            {isEditing ? 'Editing...' : 'Edit Profile'}
          </button>
          <button
            onClick={onPasswordChange}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <Lock size={18} />
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

const PersonalDetails = ({ userData, isEditing, formData, onChange, onSave, onCancel }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Personal Details</h3>
        {isEditing && (
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <Save size={18} />
              Save
            </button>
            <button
              onClick={onCancel}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name || ''}
            onChange={onChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username || ''}
            onChange={onChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={onChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={onChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender || ''}
            onChange={onChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-50"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            name="dob"
            value={formData.dob || ''}
            onChange={onChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department / Team
          </label>
          <input
            type="text"
            name="department"
            value={formData.department || ''}
            onChange={onChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Designation / Role
          </label>
          <input
            type="text"
            name="designation"
            value={formData.designation || ''}
            onChange={onChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Joining Date
          </label>
          <input
            type="date"
            name="join_date"
            value={formData.join_date || ''}
            onChange={onChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-50"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address || ''}
            onChange={onChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-50"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio || ''}
            onChange={onChange}
            disabled={!isEditing}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-50 resize-none"
          />
        </div>
      </div>
    </div>
  );
};

const AccountSettings = ({ userData, preferences, onChange, onSave, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h3>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              name="language"
              value={preferences.language || 'English'}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Zone
            </label>
            <select
              name="timezone"
              value={preferences.timezone || 'Asia/Kolkata'}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Theme
            </label>
            <select
              name="theme"
              value={preferences.theme || 'Light'}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            >
              <option value="Light">Light</option>
              <option value="Dark">Dark</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Notification Settings
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="email_notifications"
                checked={preferences.email_notifications || false}
                onChange={onChange}
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
              />
              <span className="text-gray-700">Email Notifications</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="task_reminders"
                checked={preferences.task_reminders || false}
                onChange={onChange}
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
              />
              <span className="text-gray-700">Task Reminders</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="billing_alerts"
                checked={preferences.billing_alerts || false}
                onChange={onChange}
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
              />
              <span className="text-gray-700">Billing Alerts</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onSave}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <Save size={18} />
            Save Settings
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium ml-auto"
          >
            <Trash2 size={18} />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MyProfile() {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({});
  const [preferences, setPreferences] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await api.getUser();
      setUserData(data);
      setFormData(data);
      setPreferences({
        language: data.language,
        timezone: data.timezone,
        theme: data.theme,
        email_notifications: data.email_notifications,
        task_reminders: data.task_reminders,
        billing_alerts: data.billing_alerts
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(userData);
  };

  const handleSave = async () => {
    try {
      await api.updateUser(formData);
      setUserData(formData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSavePreferences = async () => {
    try {
      await api.updatePreferences(preferences);
      setUserData(prev => ({ ...prev, ...preferences }));
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Failed to save settings');
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const result = await api.uploadImage(file);
      const updatedData = { ...userData, profile_image: result.url };
      setUserData(updatedData);
      setFormData(updatedData);
      alert('Profile image updated successfully!');
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image');
    }
  };

  const handlePasswordChange = async (passwords) => {
    try {
      await api.changePassword(passwords);
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (window.confirm('Please confirm again. All your data will be permanently deleted.')) {
        api.deleteAccount().then(() => {
          alert('Account deleted successfully');
        });
      }
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-xl text-muted-foreground">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-screen overflow-y-auto bg-background">
        <div className="max-w-6xl mx-auto p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
          
          <div className="space-y-6">
            <ProfileOverview
              userData={userData}
              onEdit={handleEdit}
              onPasswordChange={() => setShowPasswordModal(true)}
              onImageUpload={handleImageUpload}
              isEditing={isEditing}
            />

            <PersonalDetails
              userData={userData}
              isEditing={isEditing}
              formData={formData}
              onChange={handleChange}
              onSave={handleSave}
              onCancel={handleCancel}
            />

            <AccountSettings
              userData={userData}
              preferences={preferences}
              onChange={handlePreferenceChange}
              onSave={handleSavePreferences}
              onDelete={handleDeleteAccount}
            />
          </div>
        </div>
        
        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onSubmit={handlePasswordChange}
        />
      </div>
    </AppLayout>
  );
}
