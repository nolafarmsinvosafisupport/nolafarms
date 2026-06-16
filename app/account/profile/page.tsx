import { AccountProfileForm } from '@/components/account/AccountProfileForm';

export default function AccountProfilePage() {
  return (
    <div className="border border-farm-border bg-cream-secondary p-8">
      <h1 className="font-serif text-5xl text-brand-deep">Profile Details</h1>
      <p className="mt-4 max-w-2xl leading-7 text-brand-deep/70">Update your account details and phone number for booking communication.</p>
      <div className="mt-10">
        <AccountProfileForm />
      </div>
    </div>
  );
}
