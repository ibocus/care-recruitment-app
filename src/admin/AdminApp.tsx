import { ClerkProvider, SignIn, SignedIn, SignedOut, UserButton, useAuth } from '@clerk/clerk-react';
import { AdminDashboard } from './AdminDashboard';
import { BRAND, DEMO_MODE } from '../brand';
import '../styles/app.css';
import '../styles/admin.css';

const publishableKey = import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string | undefined;

function AdminHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="admin-header">
      <div>
        <h1>{BRAND.name} — Applications</h1>
        <p className="admin-muted">Recruitment pipeline</p>
      </div>
      {children}
    </header>
  );
}

// Clerk's useAuth only works inside ClerkProvider, so the signed-in dashboard
// gets its token through this small wrapper.
function ClerkDashboard() {
  const { getToken } = useAuth();
  return <AdminDashboard getToken={getToken} />;
}

const demoToken = async () => 'demo';

export default function AdminApp() {
  if (DEMO_MODE) {
    return (
      <div className="admin-shell">
        <AdminHeader>
          <span className="admin-muted">Signed in as Demo Staff</span>
        </AdminHeader>
        <AdminDashboard getToken={demoToken} />
      </div>
    );
  }

  if (!publishableKey) {
    return (
      <div className="admin-shell">
        <AdminHeader />
        <p className="admin-error">
          Staff sign-in is not configured. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (and CLERK_SECRET_KEY on the
          server) to enable this panel — see the README.
        </p>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <div className="admin-shell">
        <AdminHeader>
          <SignedIn>
            <UserButton afterSignOutUrl="/admin" />
          </SignedIn>
        </AdminHeader>

        <SignedOut>
          <div className="admin-signin">
            <SignIn routing="virtual" />
          </div>
        </SignedOut>
        <SignedIn>
          <ClerkDashboard />
        </SignedIn>
      </div>
    </ClerkProvider>
  );
}
