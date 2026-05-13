import { useState, useMemo } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Spinner } from '../../../shared/components/Spinner';
import toast from 'react-hot-toast';
import {
  useAdminUsers,
  useUpdateUserRole,
  useSuspendUser,
  useDeleteUser,
  type AdminUser,
} from '../hooks/useAdminUsers';

const ROLE_BADGE: Record<string, React.CSSProperties> = {
  ADMIN: { background: '#fef3c7', color: '#92400e' },
  HOST:  { background: '#dbeafe', color: '#1e40af' },
  GUEST: { background: '#f3f4f6', color: '#374151' },
};

type RoleFilter = 'ALL' | 'ADMIN' | 'HOST' | 'GUEST';

/* ── Edit user modal ────────────────────────────────────────────────── */
function EditUserModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const updateRole = useUpdateUserRole();
  const [role, setRole] = useState(user.role);

  const handleSave = async () => {
    try {
      await updateRole.mutateAsync({ id: user.id, role });
      toast.success('Role updated');
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Edit User</h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280' }}>×</button>
        </div>

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '12px 14px', background: '#f8f9fa', borderRadius: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e5e7eb', overflow: 'hidden', flexShrink: 0 }}>
            {user.avatar
              ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontWeight: 700, color: '#6b7280' }}>{user.name.charAt(0).toUpperCase()}</div>
            }
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{user.name}</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>{user.email}</div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as AdminUser['role'])}
            style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px', fontSize: 14 }}
          >
            <option value="GUEST">Guest</option>
            <option value="HOST">Host</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            disabled={updateRole.isPending}
            onClick={handleSave}
            style={{ flex: 1, background: '#ff5722', color: 'white', border: 'none', borderRadius: 8, padding: '11px', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: updateRole.isPending ? 0.6 : 1 }}
          >
            {updateRole.isPending ? 'Saving…' : 'Save Changes'}
          </button>
          <button type="button" onClick={onClose} style={btnGhost}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────── */
export default function UserManagementPage() {
  const { data: users = [], isLoading, isError, error, refetch } = useAdminUsers();
  const suspendMutation = useSuspendUser();
  const deleteMutation  = useDeleteUser();

  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [editUser,   setEditUser]   = useState<AdminUser | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
      const matchRole   = roleFilter === 'ALL' || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const counts = {
    ALL:   users.length,
    ADMIN: users.filter((u) => u.role === 'ADMIN').length,
    HOST:  users.filter((u) => u.role === 'HOST').length,
    GUEST: users.filter((u) => u.role === 'GUEST').length,
  };

  return (
    <AdminLayout title="User Management" subtitle="View, edit roles, suspend, or delete user accounts.">

        {/* Search + filter */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <input
            placeholder="Search by name, email, or username…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 220, border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 14px', fontSize: 14 }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            {(['ALL', 'ADMIN', 'HOST', 'GUEST'] as RoleFilter[]).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                style={{
                  border: `1.5px solid ${roleFilter === r ? '#ff5722' : '#e5e7eb'}`,
                  background: roleFilter === r ? '#fff7f2' : 'white',
                  color: roleFilter === r ? '#ff5722' : '#374151',
                  borderRadius: 8, padding: '8px 14px',
                  fontWeight: roleFilter === r ? 700 : 500,
                  fontSize: 13, cursor: 'pointer',
                }}
              >
                {r} <span style={{ fontSize: 11, opacity: 0.7 }}>({counts[r]})</span>
              </button>
            ))}
          </div>
        </div>

        {/* States */}
        {isLoading && <Spinner />}
        {isError && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <p style={{ margin: '0 0 8px', color: '#991b1b', fontWeight: 700 }}>Failed to load users</p>
            <p style={{ margin: '0 0 10px', color: '#991b1b', fontSize: 13 }}>{(error as Error).message}</p>
            <button onClick={() => refetch()} style={btnGhost}>Retry</button>
          </div>
        )}

        {/* Table */}
        {!isLoading && !isError && (
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 160px', gap: 0, background: '#f8f9fa', borderBottom: '1px solid #e5e7eb', padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>User</span>
              <span>Email</span>
              <span>Role</span>
              <span>Listings</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 24px', color: '#9ca3af' }}>
                No users match your search.
              </div>
            )}

            {filtered.map((user, i) => {
              const isSuspending = suspendMutation.isPending && (suspendMutation.variables as any)?.id === user.id;
              const isDeleting   = deleteMutation.isPending  && deleteMutation.variables === user.id;

              return (
                <div
                  key={user.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 160px',
                    gap: 0,
                    padding: '12px 16px',
                    borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none',
                    alignItems: 'center',
                    opacity: user.isSuspended ? 0.6 : 1,
                  }}
                >
                  {/* User */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e5e7eb', overflow: 'hidden', flexShrink: 0 }}>
                      {user.avatar
                        ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14, color: '#6b7280' }}>{user.name.charAt(0).toUpperCase()}</div>
                      }
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>@{user.username}</div>
                    </div>
                  </div>

                  {/* Email */}
                  <div style={{ fontSize: 13, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </div>

                  {/* Role */}
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, ...(ROLE_BADGE[user.role] ?? ROLE_BADGE.GUEST) }}>
                      {user.role}
                    </span>
                  </div>

                  {/* Listings count */}
                  <div style={{ fontSize: 13, color: '#374151' }}>
                    {user._count?.listings ?? 0}
                  </div>

                  {/* Status */}
                  <div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
                      background: user.isSuspended ? '#fee2e2' : '#dcfce7',
                      color: user.isSuspended ? '#991b1b' : '#166534',
                    }}>
                      {user.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setEditUser(user)}
                      style={btnTiny}
                      title="Edit role"
                    >
                      ✏️
                    </button>
                    <button
                      disabled={isSuspending}
                      onClick={() => {
                        const action = user.isSuspended ? 'unsuspend' : 'suspend';
                        if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${user.name}?`)) return;
                        suspendMutation.mutate(
                          { id: user.id, suspend: !user.isSuspended },
                          {
                            onSuccess: () => toast.success(`User ${action}ed`),
                            onError: (e) => toast.error((e as Error).message),
                          },
                        );
                      }}
                      style={{ ...btnTiny, background: user.isSuspended ? '#dcfce7' : '#fef9c3', color: user.isSuspended ? '#166534' : '#854d0e' }}
                      title={user.isSuspended ? 'Unsuspend' : 'Suspend'}
                    >
                      {isSuspending ? '…' : user.isSuspended ? '✓' : '⏸'}
                    </button>
                    <button
                      disabled={isDeleting}
                      onClick={() => {
                        if (!confirm(`Permanently delete ${user.name}? This cannot be undone.`)) return;
                        deleteMutation.mutate(user.id, {
                          onSuccess: () => toast.success('User deleted'),
                          onError: (e) => toast.error((e as Error).message),
                        });
                      }}
                      style={{ ...btnTiny, background: '#fee2e2', color: '#991b1b' }}
                      title="Delete user"
                    >
                      {isDeleting ? '…' : '🗑'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 10 }}>
          Showing {filtered.length} of {users.length} users
        </p>

      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} />}
    </AdminLayout>
  );
}

const btnGhost: React.CSSProperties = {
  background: 'white', color: '#374151', border: '1px solid #d1d5db',
  borderRadius: 8, padding: '8px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
};
const btnTiny: React.CSSProperties = {
  background: '#f3f4f6', color: '#374151', border: 'none',
  borderRadius: 6, padding: '5px 8px', fontSize: 13, cursor: 'pointer',
};
