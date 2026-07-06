import { SignIn } from '@clerk/nextjs';

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ redirect_url?: string }> }) {
  const { redirect_url } = await searchParams;
  const isCheckoutRedirect = redirect_url?.startsWith('/checkout');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-farm-dark px-6 py-28">
      {isCheckoutRedirect && (
        <p className="mb-6 max-w-sm text-center text-sm leading-6 text-cream-secondary/80">
          Sign in to complete your order — your cart is saved and will be right here.
        </p>
      )}
      <SignIn appearance={{ variables: { colorPrimary: '#486018', colorText: '#102818' } }} />
    </main>
  );
}
