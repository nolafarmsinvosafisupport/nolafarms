import { NotificationSettingsForm } from '@/components/account/NotificationSettingsForm';

export default function AccountSettingsPage() {
  return (
    <div className="border border-farm-border bg-cream-secondary p-8">
      <h1 className="font-serif text-5xl text-brand-deep">Settings</h1>
      <p className="mt-4 max-w-2xl leading-7 text-brand-deep/70">Choose which booking emails you want to receive after the required submission notices.</p>
      <div className="mt-10">
        <NotificationSettingsForm />
      </div>
    </div>
  );
}
