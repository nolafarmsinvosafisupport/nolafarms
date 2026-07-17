import { clerkMiddleware, clerkClient, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// TEMPORARY MAINTENANCE SWITCH
// Set to false and push to GitHub to bring the live site back.
const MAINTENANCE_MODE = true;

const isHealthRoute = createRouteMatcher(['/api/health']);

const isAccountRoute = createRouteMatcher(['/account(.*)']);
const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isCheckoutRoute = createRouteMatcher(['/checkout(.*)']);

const maintenanceHtml = `<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nola Ranches - System Administration</title>
  
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  
  <!-- Tailwind CSS Integration -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            serif: ['Playfair Display', 'Georgia', 'serif'],
            sans: ['Inter', 'system-ui', 'sans-serif'],
          },
          colors: {
            ranch: {
              dark: '#0a1a10',
              forest: '#112919',
              gold: '#d4a76a',
              goldHover: '#c59659',
              cream: '#faf5f0',
              sage: '#8a9d8f',
              border: '#2a4432',
            }
          }
        }
      }
    }
  </script>

  <style>
    /* Custom premium ambient lighting and background effects */
    .ambient-glow {
      background: radial-gradient(circle at 50% 30%, rgba(212, 167, 106, 0.08) 0%, rgba(10, 26, 16, 0) 70%);
    }
    .blur-card {
      background: rgba(17, 41, 25, 0.7);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }
    /* Smooth transition presets */
    .transition-all-300 {
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }
  </style>
</head>
<body class="bg-ranch-dark text-ranch-cream font-sans min-h-screen flex flex-col justify-between relative overflow-x-hidden selection:bg-ranch-gold selection:text-ranch-dark">

  <!-- Ambient background elements -->
  <div class="absolute inset-0 ambient-glow pointer-events-none z-0"></div>
  <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-10 pointer-events-none z-0">
    <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d4a76a" stroke-width="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </div>

  <!-- Header -->
  <header class="w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-10">
    <div class="flex items-center gap-3">
      <!-- Premium Ranch Crest Logo Symbol -->
      <div class="w-10 h-10 rounded-full border border-ranch-gold/30 flex items-center justify-center bg-ranch-forest/50">
        <svg class="w-5 h-5 text-ranch-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.015 9.015 0 010 18M12 3a9 9 0 000 18"></path>
        </svg>
      </div>
      <span class="font-serif tracking-[0.2em] uppercase text-sm font-semibold text-ranch-gold">Nola Ranches</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
      <span class="text-xs uppercase tracking-widest text-ranch-sage font-medium">Administration Mode</span>
    </div>
  </header>

  <!-- Main Portal Section -->
  <main class="flex-grow flex items-center justify-center px-4 md:px-8 py-12 relative z-10">
    <div class="w-full max-w-xl">
      
      <!-- Logo Accent -->
      <div class="text-center mb-6">
        <span class="inline-block px-4 py-1.5 rounded-full border border-ranch-gold/20 bg-ranch-gold/5 text-ranch-gold text-xs font-semibold uppercase tracking-[0.2em] mb-4">
          Portal Offline
        </span>
        <h1 class="font-serif text-4xl md:text-5xl font-light tracking-tight text-ranch-cream leading-tight">
          System Administration <br/>
          <span class="font-normal italic text-ranch-gold">Required</span>
        </h1>
        <div class="flex items-center justify-center gap-3 my-6">
          <span class="h-[1px] w-12 bg-ranch-gold/20"></span>
          <span class="text-ranch-gold text-xs font-serif italic">Est. 2026</span>
          <span class="h-[1px] w-12 bg-ranch-gold/20"></span>
        </div>
        <p class="text-ranch-sage text-base md:text-lg leading-relaxed max-w-md mx-auto">
          The digital gateway for Nola Ranches is temporarily restricted due to pending balance reconciliation. Normal service will resume immediately upon verification.
        </p>
      </div>

      <!-- Developer Reference Card -->
      <div class="blur-card border border-ranch-border rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
        <!-- Top highlighting bar -->
        <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-ranch-gold/40 to-transparent"></div>
        
        <h2 class="text-sm font-semibold uppercase tracking-widest text-ranch-gold mb-5 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Technical Partner & Billing Action
        </h2>
        
        <div class="space-y-4 text-left">
          <p class="text-ranch-sage text-sm leading-relaxed">
            System on hold pending Invoice Settlement from Developers Firm. Please contact them to make update their accounts accordingly.
          </p>
          
          <div class="bg-ranch-dark/60 rounded-xl p-4 border border-ranch-border/60 transition-all-300 hover:border-ranch-gold/25">
            <div class="text-xs text-ranch-sage uppercase tracking-widest font-semibold mb-1">Developer Firm</div>
            <div class="text-base font-semibold text-ranch-cream tracking-wide">MERIDIAN ARC DIGITAL</div>
          </div>

          <!-- Contact details flex layout with direct-action copy-to-clipboard elements -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            <!-- Phone Button -->
            <button onclick="copyToClipboard('+254112674945', 'Phone Number')" class="flex items-center justify-between p-3.5 bg-ranch-dark/40 rounded-xl border border-ranch-border hover:border-ranch-gold/30 hover:bg-ranch-dark/80 group/btn transition-all-300 text-left">
              <div class="overflow-hidden mr-2">
                <span class="block text-[10px] text-ranch-sage uppercase tracking-wider font-semibold">Direct Dial</span>
                <span class="block text-sm font-medium text-ranch-cream font-mono truncate">+254 112 674 945</span>
              </div>
              <span class="p-1.5 bg-ranch-forest rounded-lg text-ranch-gold group-hover/btn:bg-ranch-gold group-hover/btn:text-ranch-dark transition-all-300 shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                </svg>
              </span>
            </button>

            <!-- Email Button -->
            <button onclick="copyToClipboard('benjaminnjihianjami@gmail.com', 'Email Address')" class="flex items-center justify-between p-3.5 bg-ranch-dark/40 rounded-xl border border-ranch-border hover:border-ranch-gold/30 hover:bg-ranch-dark/80 group/btn transition-all-300 text-left">
              <div class="overflow-hidden mr-2">
                <span class="block text-[10px] text-ranch-sage uppercase tracking-wider font-semibold">Inquiries Email</span>
                <span class="block text-sm font-medium text-ranch-cream truncate">benjaminnjihianjami...</span>
              </div>
              <span class="p-1.5 bg-ranch-forest rounded-lg text-ranch-gold group-hover/btn:bg-ranch-gold group-hover/btn:text-ranch-dark transition-all-300 shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                </svg>
              </span>
            </button>

          </div>
          
          <div class="pt-2 flex flex-col sm:flex-row gap-2">
            <a href="tel:+254112674945" class="flex-1 py-3 px-4 bg-ranch-gold hover:bg-ranch-goldHover text-ranch-dark font-semibold text-center text-sm rounded-xl transition-all-300 shadow-lg shadow-ranch-gold/10 flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
              </svg>
              Call Developer
            </a>
            <a href="mailto:benjaminnjihianjami@gmail.com?subject=Nola%20Ranches%20Account%20Invoice%20Update" class="flex-1 py-3 px-4 bg-ranch-forest hover:bg-ranch-forest/80 text-ranch-cream border border-ranch-border hover:border-ranch-gold/30 font-semibold text-center text-sm rounded-xl transition-all-300 flex items-center justify-center gap-2">
              <svg class="w-4 h-4 text-ranch-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              Email Developer
            </a>
          </div>
        </div>
      </div>
      
    </div>
  </main>

  <!-- Toast Notification -->
  <div id="toast" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ranch-forest/95 border border-ranch-gold/40 text-ranch-cream px-5 py-3.5 rounded-xl shadow-2xl z-50 flex items-center gap-3 transition-all duration-300 translate-y-24 opacity-0 pointer-events-none">
    <div class="w-5 h-5 rounded-full bg-ranch-gold/20 flex items-center justify-center">
      <svg class="w-3 h-3 text-ranch-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
      </svg>
    </div>
    <span id="toast-text" class="text-sm font-medium tracking-wide">Copied text!</span>
  </div>

  <!-- Footer -->
  <footer class="w-full max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-ranch-border/30 relative z-10 text-xs text-ranch-sage">
    <div>
      &copy; 2026 Nola Ranches Ltd. All administrative rights reserved.
    </div>
    <div class="flex items-center gap-4">
      <span class="hover:text-ranch-gold cursor-pointer transition-all-300">Secure Protocol v3.2.1</span>
      <span class="h-3 w-[1px] bg-ranch-border"></span>
      <span class="hover:text-ranch-gold cursor-pointer transition-all-300">Terms of Administration</span>
    </div>
  </footer>

  <script>
    /**
     * Safely copies target text directly to user device's clipboard.
     * Incorporates automatic fallback mechanisms to protect iframe sandboxing.
     */
    function copyToClipboard(text, label) {
      try {
        const dummyInput = document.createElement('textarea');
        dummyInput.value = text;
        dummyInput.style.position = 'fixed';
        dummyInput.style.top = '0';
        dummyInput.style.left = '0';
        dummyInput.style.opacity = '0';
        document.body.appendChild(dummyInput);
        dummyInput.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(dummyInput);
        
        if (successful) {
          triggerToast(label + ' copied securely!');
        } else {
          throw new Error('Fallback failed');
        }
      } catch (err) {
        console.error('Copy execution unsuccessful: ', err);
      }
    }

    /**
     * Controls interactive presentation of on-screen Toast Notification elements.
     */
    function triggerToast(message) {
      const toast = document.getElementById('toast');
      const textSpan = document.getElementById('toast-text');
      
      textSpan.textContent = message;
      
      // Animate entry
      toast.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');
      toast.classList.add('translate-y-0', 'opacity-100');
      
      // Auto dismiss after duration
      setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
      }, 3000);
    }
  </script>
</body>
</html>`;

export default clerkMiddleware(async (auth, req) => {
  if (MAINTENANCE_MODE && !isHealthRoute(req)) {
    return new NextResponse(maintenanceHtml, {
      status: 503,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Retry-After': '3600',
      },
    });
  }

  if (isAccountRoute(req) || isCheckoutRoute(req)) {
    await auth.protect();
  }

  if (isAdminRoute(req)) {
    const { userId } = await auth.protect();

    let isAdmin = Boolean(process.env.CLERK_ADMIN_USER_ID && userId === process.env.CLERK_ADMIN_USER_ID);

    if (!isAdmin) {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const meta = user.publicMetadata as { role?: string };
      isAdmin = meta?.role === 'admin';
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ico|ttf|woff2?|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
};
