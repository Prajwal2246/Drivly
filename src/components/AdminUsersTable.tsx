'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';
import { toast } from '@/components/ui/Toaster';

export type AdminUser = { id: string; name: string; phone: string; societyName: string; role: string; dlPath: string | null; dlVerified: boolean };

export default function AdminUsersTable({ users: initial }: { users: AdminUser[] }) {
  const [users, setUsers] = useState(initial);

  const setVerified = async (id: string, dlVerified: boolean) => {
    try {
      await api(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dlVerified }) });
      setUsers(u => u.map(x => (x.id === id ? { ...x, dlVerified } : x)));
    } catch (err) {
      toast((err as Error).message, 'error'); // was silently ignored before
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
      <h2 className="px-6 py-4 text-sm font-bold text-zinc-900 border-b border-zinc-200">Users &amp; DL Verification ({users.length})</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm text-zinc-600">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase tracking-wider font-bold text-zinc-700">
            <tr><th className="px-6 py-3">Name</th><th className="px-6 py-3">Phone</th><th className="px-6 py-3">Society</th><th className="px-6 py-3">Role</th><th className="px-6 py-3">DL</th><th className="px-6 py-3">Action</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-6 py-3 font-semibold text-zinc-900">{u.name}</td>
                <td className="px-6 py-3 font-mono text-xs">{u.phone}</td>
                <td className="px-6 py-3">{u.societyName}</td>
                <td className="px-6 py-3 text-xs">{u.role}</td>
                <td className="px-6 py-3 text-xs font-bold">
                  {u.dlVerified ? <span className="text-emerald-700">Verified</span> : u.dlPath ? <span className="text-amber-700">Pending</span> : <span className="text-zinc-400">None</span>}
                </td>
                <td className="px-6 py-3 flex gap-3 text-xs font-bold">
                  {u.dlPath && <a href={`/api/admin/users/${u.id}/dl`} target="_blank" rel="noreferrer" className="underline underline-offset-2 text-zinc-700 hover:text-zinc-900">View</a>}
                  {u.dlPath && (
                    <button onClick={() => setVerified(u.id, !u.dlVerified)} className="underline underline-offset-2 text-zinc-700 hover:text-zinc-900 cursor-pointer">
                      {u.dlVerified ? 'Revoke' : 'Mark verified'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
