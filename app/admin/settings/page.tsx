import { FarmSettingsForm } from '@/components/admin/FarmSettingsForm';
import { SITE } from '@/lib/constants';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div className="border border-farm-border bg-cream-secondary p-8">
        <h1 className="font-serif text-5xl text-brand-deep">Farm Settings</h1>
        <p className="mt-4 text-brand-deep/70">Configure notifications and booking behaviour.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Static farm details (from constants) */}
        <section className="border border-farm-border bg-cream-warm p-6">
          <h2 className="font-serif text-3xl text-brand-deep">Farm Details</h2>
          <dl className="mt-5 space-y-3 text-brand-deep/75">
            <div><dt className="font-semibold">Farm name</dt><dd>{SITE.name}</dd></div>
            <div><dt className="font-semibold">Contact email</dt><dd>{SITE.email}</dd></div>
            <div><dt className="font-semibold">WhatsApp</dt><dd>{SITE.whatsapp}</dd></div>
          </dl>
          <p className="mt-5 text-xs text-brand-deep/50">
            Edit these in <code>lib/constants.ts</code> to update site-wide.
          </p>
        </section>

        {/* Static booking rules */}
        <section className="border border-farm-border bg-cream-warm p-6">
          <h2 className="font-serif text-3xl text-brand-deep">Booking Rules</h2>
          <dl className="mt-5 space-y-3 text-brand-deep/75">
            <div><dt className="font-semibold">Minimum advance notice</dt><dd>24 hours</dd></div>
            <div><dt className="font-semibold">Visit time slots</dt><dd>Morning (9:00 AM) &amp; Afternoon (1:00 PM)</dd></div>
          </dl>
        </section>
      </div>

      {/* Editable settings */}
      <section className="border border-farm-border bg-cream-secondary p-8">
        <h2 className="font-serif text-3xl text-brand-deep">Notification Settings</h2>
        <p className="mt-3 text-brand-deep/70">Changes are saved immediately to the database.</p>
        <div className="mt-8">
          <FarmSettingsForm />
        </div>
      </section>

      {/* Clerk account info */}
      <section className="border border-farm-border bg-cream-warm p-6">
        <h2 className="font-serif text-3xl text-brand-deep">Account</h2>
        <p className="mt-4 text-brand-deep/70">
          Password, two-factor authentication, and connected accounts are managed via Clerk.
        </p>
      </section>
    </div>
  );
}
