import { ClerkAccountControls } from '@/components/account/ClerkAccountControls';
import { NotificationSettingsForm } from '@/components/account/NotificationSettingsForm';

export default function AccountSettingsPage() {
  return (
    <div className="space-y-10">
      <div className="border border-farm-border bg-cream-secondary p-8">
        <h1 className="font-serif text-5xl text-brand-deep">Settings</h1>
        <p className="mt-4 max-w-2xl leading-7 text-brand-deep/70">
          Manage your notification preferences and account details.
        </p>
      </div>

      <section className="border border-farm-border bg-cream-secondary p-8">
        <h2 className="font-serif text-3xl text-brand-deep">Email Notifications</h2>
        <p className="mt-3 text-brand-deep/70">
          Choose which booking emails you receive. Submission confirmation emails always send regardless of these settings.
        </p>
        <div className="mt-8">
          <NotificationSettingsForm />
        </div>
      </section>

      <section className="border border-farm-border bg-cream-secondary p-8">
        <h2 className="font-serif text-3xl text-brand-deep">Account Management</h2>
        <p className="mt-3 text-brand-deep/70">
          Password, connected accounts, and account deletion.
        </p>
        <div className="mt-8 max-w-lg">
          <ClerkAccountControls />
        </div>
      </section>
    </div>
  );
}
