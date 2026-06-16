import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-farm-dark px-6 py-28">
      <SignIn appearance={{ variables: { colorPrimary: '#486018', colorText: '#102818' } }} />
    </main>
  );
}
