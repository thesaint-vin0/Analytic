import { useCallback, useEffect, useState } from 'react';
import { Loader2, Search, ShieldCheck, Trash2, UserCog } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { supabase, type Profile, type Role, type AuditLogRow } from '../services/supabase';
import { ALL_ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS } from '../services/rbac';
import { clsx } from '../utils/clsx';

const roleTone: Record<Role, 'success' | 'info' | 'warning' | 'default' | 'primary'> = {
  super_admin: 'primary',
  admin: 'info',
  manager: 'success',
  analyst: 'warning',
  viewer: 'default',
};

export function UserManagement() {
  const { profile: me } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [editRole, setEditRole] = useState<Role>('viewer');
  const [saving, setSaving] = useState(false);
  const [deleteUser, setDeleteUser] = useState<Profile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>([]);

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) { console.error(error); return; }
    setUsers((data as Profile[]) ?? []);
    setLoading(false);
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(20);
    setAuditLogs((data as AuditLogRow[]) ?? []);
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchAuditLogs();
  }, [fetchUsers, fetchAuditLogs]);

  const logAction = async (action: string, targetUserId: string | null, details: string) => {
    if (!me) return;
    await supabase.from('audit_logs').insert({
      user_id: me.id,
      action,
      target_user_id: targetUserId,
      details,
    });
  };

  const openEdit = (u: Profile) => {
    setEditUser(u);
    setEditRole(u.role);
  };

  const saveRole = async () => {
    if (!editUser || !me) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ role: editRole })
      .eq('id', editUser.id);
    if (error) {
      console.error(error);
      setSaving(false);
      return;
    }
    await logAction('update_role', editUser.id, `Changed role to ${ROLE_LABELS[editRole]}`);
    setEditUser(null);
    setSaving(false);
    fetchUsers();
    fetchAuditLogs();
  };

  const confirmDelete = async () => {
    if (!deleteUser || !me) return;
    setDeleting(true);
    const { error } = await supabase.from('profiles').delete().eq('id', deleteUser.id);
    if (error) {
      console.error(error);
      setDeleting(false);
      return;
    }
    await logAction('delete_user', deleteUser.id, `Removed user ${deleteUser.email}`);
    setDeleteUser(null);
    setDeleting(false);
    fetchUsers();
    fetchAuditLogs();
  };

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        subtitle="Manage user roles, permissions, and access."
        action={<Badge tone="primary"><ShieldCheck size={12} className="mr-1" /> Super Admin</Badge>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {ALL_ROLES.map((r) => {
          const count = users.filter((u) => u.role === r).length;
          return (
            <Card key={r} className="text-center">
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-muted mt-1">{ROLE_LABELS[r]}</p>
            </Card>
          );
        })}
        <Card className="text-center">
          <p className="text-2xl font-bold">{users.length}</p>
          <p className="text-xs text-muted mt-1">Total</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Users ({filtered.length})</h3>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="pl-9 pr-3 py-2 text-sm surface-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted">
                <th className="text-left p-3 font-semibold">User</th>
                <th className="text-left p-3 font-semibold">Role</th>
                <th className="text-left p-3 font-semibold">Joined</th>
                <th className="text-right p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.full_name?.charAt(0)?.toUpperCase() || u.email?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{u.full_name || 'Unnamed'}</p>
                        <p className="text-xs text-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3"><Badge tone={roleTone[u.role]}>{ROLE_LABELS[u.role]}</Badge></td>
                  <td className="p-3 text-xs text-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(u)}
                        disabled={u.id === me?.id}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-muted hover:text-primary transition disabled:opacity-40 disabled:cursor-not-allowed"
                        title={u.id === me?.id ? 'Cannot edit your own role' : 'Edit role'}
                      >
                        <UserCog size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteUser(u)}
                        disabled={u.id === me?.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-muted hover:text-error transition disabled:opacity-40 disabled:cursor-not-allowed"
                        title={u.id === me?.id ? 'Cannot delete yourself' : 'Remove user'}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-muted">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold mb-3">Role Descriptions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ALL_ROLES.map((r) => (
            <div key={r} className={clsx('p-3 rounded-lg surface-2 border', r === 'super_admin' ? 'border-primary/30' : 'border-border')}>
              <Badge tone={roleTone[r]}>{ROLE_LABELS[r]}</Badge>
              <p className="text-xs text-muted mt-2">{ROLE_DESCRIPTIONS[r]}</p>
            </div>
          ))}
        </div>
      </Card>

      {auditLogs.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold mb-3">Audit Log</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 p-2 surface-2 rounded-lg text-xs">
                <span className="font-medium text-primary capitalize">{log.action.replace('_', ' ')}</span>
                <span className="text-muted flex-1">{log.details}</span>
                <span className="text-muted">{new Date(log.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Change User Role">
        {editUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 surface-2 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center text-white font-bold">
                {editUser.full_name?.charAt(0)?.toUpperCase() || editUser.email?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{editUser.full_name || 'Unnamed'}</p>
                <p className="text-xs text-muted">{editUser.email}</p>
              </div>
            </div>
            <Select label="Role" value={editRole} onChange={(v) => setEditRole(v as Role)} options={ALL_ROLES.map((r) => ({ label: ROLE_LABELS[r], value: r }))} />
            <div className="p-3 surface-2 rounded-lg">
              <p className="text-xs text-muted">{ROLE_DESCRIPTIONS[editRole]}</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setEditUser(null)}>Cancel</Button>
              <Button size="sm" onClick={saveRole} disabled={saving}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                {saving ? 'Saving...' : 'Save Role'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!deleteUser} onClose={() => setDeleteUser(null)} title="Remove User">
        {deleteUser && (
          <div className="space-y-4">
            <p className="text-sm">
              Are you sure you want to remove <span className="font-semibold">{deleteUser.email}</span>? This will delete their profile and revoke access. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteUser(null)}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={confirmDelete} disabled={deleting}>
                {deleting ? <Loader2 size={14} className="animate-spin" /> : null}
                {deleting ? 'Removing...' : 'Remove User'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
