import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export function ProfilePage() {
  const { user, signOut } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [deleteOpen, setDeleteOpen] = useState(false);

  function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    /* demo: real app would PATCH user */
  }

  return (
    <div className="bg-white pb-20 pt-10">
      <div className="mx-auto max-w-[720px] px-6 lg:px-8">
        <h1 className="text-[32px] font-extrabold text-ink">Account</h1>
        <p className="mt-2 text-[15px] text-ink-60">Profile, roles, and deletion (demo shell).</p>

        <form onSubmit={onSaveProfile} className="mt-10 space-y-4 rounded-2xl border border-ink-10 p-6">
          <h2 className="text-lg font-extrabold text-ink">Profile</h2>
          <label className="block">
            <span className="text-[12px] font-semibold text-ink-60">Display name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
            />
          </label>
          <label className="block">
            <span className="text-[12px] font-semibold text-ink-60">Email</span>
            <input
              value={user?.email ?? ''}
              disabled
              className="mt-1.5 w-full rounded-xl border border-ink-10 bg-ink-5 px-4 py-3 text-[14px] text-ink-40"
            />
          </label>
          <Button type="submit" variant="dark" size="md">
            Save (demo)
          </Button>
        </form>

        <div className="mt-10 rounded-2xl border border-ink-10 p-6">
          <h2 className="text-lg font-extrabold text-ink">Apply for a role</h2>
          <p className="mt-2 text-[14px] text-ink-60">
            Talent, Vendor, or Organizer applications are reviewed by Admin. Upload documents in the full product.
          </p>
          <Button variant="outline" size="md" className="mt-4">
            Start application (demo)
          </Button>
        </div>

        <div className="mt-10 rounded-2xl border border-red-200 bg-red-50/50 p-6">
          <h2 className="text-lg font-extrabold text-red-900">Delete account</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-red-900/80">
            Permanent data loss; valid tickets auto-listed for auction per Terms. Irreversible.
          </p>
          <Button variant="danger" size="md" className="mt-4" type="button" onClick={() => setDeleteOpen(true)}>
            Delete account
          </Button>
        </div>

        <p className="mt-10">
          <button
            type="button"
            onClick={() => signOut()}
            className="text-[14px] font-semibold text-coral hover:underline"
          >
            Sign out
          </button>
        </p>
      </div>

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" role="dialog">
          <div className="max-w-md rounded-2xl bg-white p-6 shadow-card-lg">
            <h3 className="text-lg font-extrabold text-ink">Confirm deletion</h3>
            <p className="mt-2 text-[14px] text-ink-60">
              This is a demo — no data will be removed. In production, valid tickets would be listed for resale and
              your account wiped per policy.
            </p>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" size="md" className="flex-1" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="md" className="flex-1" onClick={() => setDeleteOpen(false)}>
                Confirm (demo)
              </Button>
            </div>
            <p className="mt-4 text-center text-[12px]">
              <Link to="/terms" className="text-coral underline">
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
