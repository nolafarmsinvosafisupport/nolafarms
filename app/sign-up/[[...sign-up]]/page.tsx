import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-farm-dark px-6 section-y">
      <SignUp appearance={{ variables: { colorPrimary: '#486018', colorText: '#102818' } }} />
    </main>
  );
}
