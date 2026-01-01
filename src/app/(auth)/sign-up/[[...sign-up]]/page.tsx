/**
 * Sign Up Page - Clerk Authentication
 * @governance SEC-001
 */

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--orion-bg-primary)]">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-[var(--orion-bg-secondary)] border border-[var(--orion-border)]',
            headerTitle: 'text-[var(--orion-text-primary)]',
            headerSubtitle: 'text-[var(--orion-text-secondary)]',
            formFieldLabel: 'text-[var(--orion-text-secondary)]',
            formFieldInput: 'bg-[var(--orion-bg-elevated)] border-[var(--orion-border)] text-[var(--orion-text-primary)]',
            formButtonPrimary: 'bg-[var(--orion-cyan)] hover:bg-[var(--orion-cyan)]/80',
            footerActionLink: 'text-[var(--orion-cyan)]',
          },
        }}
      />
    </div>
  );
}
