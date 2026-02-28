export default async function Home() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const res = await fetch(`${base}/public/packages`, { cache: "no-store" });
  const json = await res.json();

  const packages = json?.data || [];

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">SaaS File Management System</h1>
            <p className="text-gray-600">Choose a plan and manage folders/files with enforced limits.</p>
          </div>
          <div className="flex gap-2">
            <a className="rounded-xl border bg-white px-4 py-2 hover:bg-gray-50" href="/login">Login</a>
            <a className="rounded-xl bg-black px-4 py-2 text-white hover:opacity-90" href="/register">Register</a>
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((p: any) => (
            <div key={p.id} className="rounded-2xl border bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold">{p.name}</h2>
              <div className="mt-3 space-y-1 text-sm text-gray-700">
                <p>Max folders: {p.maxFolders}</p>
                <p>Nesting: {p.maxNestingLevel}</p>
                <p>Max size: {p.maxFileSizeMB} MB</p>
                <p>Total files: {p.totalFileLimit}</p>
                <p>Files/folder: {p.filesPerFolder}</p>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Allowed: {(p.allowedTypes || []).join(", ")}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}