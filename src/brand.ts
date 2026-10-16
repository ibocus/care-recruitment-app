// Agency branding and demo switch, read from build-time env vars so the same
// code can be deployed for any agency without editing components.
//
//   VITE_BRAND_NAME   agency name shown to candidates and staff
//   VITE_BRAND_AREA   short line under the title (e.g. branches or region)
//   VITE_DEMO_MODE    "true" runs fully in the browser with sample data:
//                     no Supabase, Clerk, Blob, email or WhatsApp needed

const env = import.meta.env;

export const DEMO_MODE = env.VITE_DEMO_MODE === 'true';

export const BRAND = {
  name: (env.VITE_BRAND_NAME as string | undefined) || 'Demo Homecare Ltd',
  area: (env.VITE_BRAND_AREA as string | undefined) || 'Care worker recruitment',
  // Prefix for browser storage keys, so drafts never mix between deployments.
  storagePrefix: 'care-application',
};

export const storageKey = (name: string) => `${BRAND.storagePrefix}-${name}`;
