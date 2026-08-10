import { useState } from 'react';

const Settings = ({ token, handleLogout }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [isChanging, setIsChanging] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteMessage, setDeleteMessage] = useState({ type: '', text: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (!currentPassword || !newPassword) {
      setPasswordMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }

    setIsChanging(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessage({ type: 'error', text: data.error || 'Failed to update password.' });
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'An error occurred. Please try again later.' });
    } finally {
      setIsChanging(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteMessage({ type: '', text: '' });

    if (!deletePassword) {
      setDeleteMessage({ type: 'error', text: 'Please enter your password.' });
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: deletePassword })
      });

      const data = await response.json();

      if (response.ok) {
        setDeleteMessage({ type: 'success', text: 'Account deleted. Logging out...' });
        setTimeout(() => {
          handleLogout();
        }, 1500);
      } else {
        setDeleteMessage({ type: 'error', text: data.error || 'Failed to delete account.' });
      }
    } catch (error) {
      setDeleteMessage({ type: 'error', text: 'An error occurred. Please try again later.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Change Password</h3>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', marginTop: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Current Password</label>
            <input 
              type="password" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
              className="input-field" 
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>New Password</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              className="input-field" 
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              className="input-field" 
              required
            />
          </div>
          
          {passwordMessage.text && (
            <div style={{ color: passwordMessage.type === 'error' ? 'var(--danger-color)' : 'var(--success-color)', fontSize: '0.9rem' }}>
              {passwordMessage.text}
            </div>
          )}
          
          <button type="submit" disabled={isChanging} style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
            {isChanging ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      <div className="card" style={{ border: '1px solid rgba(220, 53, 69, 0.3)', backgroundColor: 'rgba(220, 53, 69, 0.05)' }}>
        <h3 style={{ color: 'var(--danger-color)' }}>Danger Zone</h3>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Once you delete your account, there is no going back. Please be certain.
        </p>
        
        {!showDeleteConfirm ? (
          <button 
            onClick={() => setShowDeleteConfirm(true)} 
            style={{ backgroundColor: 'var(--danger-color)' }}
          >
            Delete Account
          </button>
        ) : (
          <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--bg-primary)' }}>
            <h4 style={{ marginTop: 0 }}>Are you absolutely sure?</h4>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers. Please type your password to confirm.
            </p>
            <form onSubmit={handleDeleteAccount} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
              <input 
                type="password" 
                placeholder="Enter your password"
                value={deletePassword} 
                onChange={(e) => setDeletePassword(e.target.value)} 
                className="input-field" 
                required
              />
              
              {deleteMessage.text && (
                <div style={{ color: deleteMessage.type === 'error' ? 'var(--danger-color)' : 'var(--success-color)', fontSize: '0.9rem' }}>
                  {deleteMessage.text}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" disabled={isDeleting} style={{ backgroundColor: 'var(--danger-color)' }}>
                  {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowDeleteConfirm(false)} 
                  style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
