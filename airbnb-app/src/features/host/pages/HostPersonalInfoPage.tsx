import { useEffect, useRef, useState } from 'react';
import { FiCheck, FiMail, FiPlus, FiUser } from 'react-icons/fi';
import { HostLayout } from '../components/HostLayout';
import { useAuth } from '../../auth/hooks/useAuth';
import { api } from '../../../lib/api';

type AccountUser = {
  name: string;
  email: string;
  username: string;
  phone: string;
  bio?: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
};

export default function HostPersonalInfoPage() {
  const { userId, userName, userEmail } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(userName || '');
  const [email, setEmail] = useState(userEmail || '');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [role, setRole] = useState('HOST');
  const [joined, setJoined] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    api.get<AccountUser>('/account/me')
      .then((user) => {
        if (!active) return;
        setName(user.name ?? '');
        setEmail(user.email ?? '');
        setUsername(user.username ?? '');
        setPhone(user.phone ?? '');
        setBio(user.bio ?? '');
        setAvatar(user.avatar ?? '');
        setRole(user.role ?? 'HOST');
        setJoined(user.createdAt ?? '');
      })
      .catch((err) => {
        if (active) setError((err as Error).message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const handleSave = async () => {
    setError('');
    try {
      await api.put('/account/me', { name, username, phone, bio });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    setError('');
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const updatedUser = await api.upload<{ avatar?: string }>(`/users/${userId}/avatar`, formData);
      setAvatar(updatedUser.avatar ?? '');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAvatarUploading(false);
      event.target.value = '';
    }
  };

  const displayInitial = (name || email || 'H').charAt(0).toUpperCase();

  return (
    <HostLayout
      title="Personal Information"
      subtitle="Manage the details guests and admins use to identify your host account."
      action={
        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            background: saved ? '#16a34a' : '#ff5722',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '10px 18px',
            fontWeight: 800,
            fontSize: 13,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            opacity: loading ? 0.7 : 1,
          }}
        >
          <FiCheck size={15} />
          {saved ? 'Saved' : 'Save changes'}
        </button>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '280px minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
        <aside style={profileCard}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />

          <div style={{ position: 'relative', width: 124, height: 124, margin: '0 auto 22px' }}>
            <div style={avatarFrame}>
              {avatar ? (
                <img src={avatar} alt={name || 'Host'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ height: '100%', display: 'grid', placeItems: 'center', fontSize: 42, fontWeight: 900, color: '#ff5722' }}>
                  {displayInitial}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              title="Upload profile picture"
              style={{
                position: 'absolute',
                right: 4,
                bottom: 6,
                width: 38,
                height: 38,
                borderRadius: '50%',
                border: '3px solid white',
                background: avatarUploading ? '#9ca3af' : '#ff5722',
                color: 'white',
                display: 'grid',
                placeItems: 'center',
                cursor: avatarUploading ? 'wait' : 'pointer',
                boxShadow: '0 8px 18px rgba(255, 87, 34, 0.35)',
              }}
            >
              <FiPlus size={18} strokeWidth={3} />
            </button>
          </div>

          <h2 style={{ margin: '0 0 5px', fontSize: 20, fontWeight: 900, color: '#1a1a1a' }}>
            {name || 'Host profile'}
          </h2>
          <p style={{ margin: '0 0 16px', color: '#9ca3af', fontSize: 14 }}>{email}</p>
          <span style={rolePill}>{role.charAt(0) + role.slice(1).toLowerCase()}</span>
          {joined && (
            <p style={{ margin: '22px 0 0', color: '#9ca3af', fontSize: 13 }}>
              Joined {new Date(joined).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </p>
          )}
        </aside>

        <section style={formCard}>
          {loading ? (
            <div style={{ padding: 24, color: '#6b7280', fontWeight: 700 }}>Loading profile...</div>
          ) : (
            <div style={{ display: 'grid', gap: 18 }}>
              <div style={sectionHeader}>
                <FiUser size={18} color="#ff5722" />
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, color: '#1a1a1a' }}>Host details</h2>
                  <p style={{ margin: '3px 0 0', color: '#6b7280', fontSize: 13 }}>
                    Keep this accurate so guests can trust who they are booking with.
                  </p>
                </div>
              </div>

              <Field label="Full name">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" style={inputStyle} />
              </Field>

              <Field label="Username">
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" style={inputStyle} />
              </Field>

              <Field label="Email address">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1a1a1a', fontSize: 14, marginBottom: 4 }}>
                  <FiMail size={15} color="#9ca3af" />
                  {email}
                </div>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: 12 }}>Email cannot be changed here.</p>
              </Field>

              <Field label="Phone">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" style={inputStyle} />
              </Field>

              <Field label="Bio">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell guests a little about you as a host"
                  rows={5}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </Field>

              {error && <p style={{ margin: 0, color: '#b91c1c', fontSize: 13 }}>{error}</p>}
            </div>
          )}
        </section>
      </div>
    </HostLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const profileCard: React.CSSProperties = {
  background: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: '34px 22px',
  textAlign: 'center',
  minHeight: 340,
};

const avatarFrame: React.CSSProperties = {
  width: 124,
  height: 124,
  borderRadius: '50%',
  overflow: 'hidden',
  background: '#f3f4f6',
  border: '5px solid white',
  boxShadow: '0 18px 44px rgba(31, 41, 55, 0.14)',
};

const rolePill: React.CSSProperties = {
  display: 'inline-block',
  padding: '4px 13px',
  borderRadius: 999,
  background: '#fff1e8',
  color: '#c65d2e',
  fontSize: 12,
  fontWeight: 800,
};

const formCard: React.CSSProperties = {
  background: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 24,
};

const sectionHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  borderBottom: '1px solid #f3f4f6',
  paddingBottom: 16,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 700,
  fontSize: 13,
  color: '#374151',
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 14,
  boxSizing: 'border-box',
  outline: 'none',
};
