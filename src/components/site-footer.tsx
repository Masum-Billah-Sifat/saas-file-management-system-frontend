// src/components/site-footer.tsx
export default function SiteFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-sm font-semibold">SaaS File Manager</p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Subscription-based file & folder management with strict enforcement across every action.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">Product</p>
            <div className="mt-2 space-y-2 text-sm">
              <a className="block text-gray-600 hover:text-gray-900" href="/#about">About</a>
              <a className="block text-gray-600 hover:text-gray-900" href="/#packages">Packages</a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">Account</p>
            <div className="mt-2 space-y-2 text-sm">
              <a className="block text-gray-600 hover:text-gray-900" href="/login">Login</a>
              <a className="block text-gray-600 hover:text-gray-900" href="/register">Register</a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">Assessment</p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Tech stack: PostgreSQL + Prisma + Node/Express + TypeScript + Next.js.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t pt-6 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SaaS File Management System</p>
          <p>Built for company technical assessment</p>
        </div>
      </div>
    </footer>
  );
}