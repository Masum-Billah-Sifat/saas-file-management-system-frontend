import PublicOnly from "@/components/public-only";

// src/app/page.tsx
export default async function Home() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const res = await fetch(`${base}/public/packages`, { cache: "no-store" });
  const json = await res.json();
  const packages = json?.data || [];

  return (
    <PublicOnly>
      <main className="bg-white">
        {/* HERO */}
        <section className="relative overflow-hidden border-b">
          {/* background */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-200 via-purple-200 to-pink-200 blur-3xl opacity-70 animate-float" />
            <div className="absolute -bottom-40 -left-20 h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-emerald-200 via-cyan-200 to-sky-200 blur-3xl opacity-70 animate-float-delayed" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.10),transparent_55%)]" />
          </div>

          <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs text-gray-700 shadow-sm backdrop-blur">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Subscription-based storage with enforced limits
                </div>

                <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                  SaaS File Management System
                </h1>

                <p className="mt-4 text-base leading-relaxed text-gray-700 sm:text-lg">
                  A real-world assessment-grade product: admins define packages
                  (Free/Silver/Gold/Diamond), users manage folders and uploads,
                  and every action is enforced by the active subscription tier.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href="/register"
                    className="group inline-flex items-center justify-center rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md active:scale-[0.98]"
                  >
                    Get started
                    <span className="ml-2 inline-block transition group-hover:translate-x-0.5">
                      →
                    </span>
                  </a>
                  <a
                    href="/login"
                    className="inline-flex items-center justify-center rounded-2xl border bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
                  >
                    Login
                  </a>
                </div>

                {/* quick feature bullets */}
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <Feature
                    title="Strict enforcement"
                    desc="Every request checks tier limits (folders, nesting, types, sizes)."
                  />
                  <Feature
                    title="Admin-controlled tiers"
                    desc="Limits are dynamic—defined in the admin panel, not hardcoded."
                  />
                  <Feature
                    title="Real uploads"
                    desc="Upload/view/download files under package constraints."
                  />
                  <Feature
                    title="Clean UX"
                    desc="Responsive UI with clear states, actions, and navigation."
                  />
                </div>
              </div>

              {/* right side visual card */}
              <div className="relative">
                <div className="rounded-3xl border bg-white/80 p-5 shadow-sm backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">
                        Active Plan Preview
                      </p>
                      <p className="mt-1 font-display text-lg font-semibold">
                        Gold Tier
                      </p>
                    </div>
                    <div className="rounded-2xl border bg-gray-50 px-3 py-1 text-xs text-gray-700">
                      Demo
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <Stat label="Max Folders" value="50" />
                    <Stat label="Max Nesting" value="5" />
                    <Stat label="Max File Size" value="50 MB" />
                    <Stat
                      label="Allowed Types"
                      value="Image, PDF, Video, Audio"
                    />
                  </div>

                  <div className="mt-5 rounded-2xl border bg-gradient-to-br from-gray-50 to-white p-4">
                    <p className="text-sm font-semibold text-gray-900">
                      What’s enforced?
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-gray-700">
                      <li>• Folder depth checks before creating a subfolder</li>
                      <li>
                        • Upload type/size validation before accepting files
                      </li>
                      <li>
                        • Total file limits and per-folder limits always
                        respected
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pointer-events-none absolute -right-6 -top-6 hidden h-16 w-16 rounded-2xl border bg-white shadow-sm sm:block animate-pop" />
                <div className="pointer-events-none absolute -left-8 -bottom-8 hidden h-20 w-20 rounded-3xl border bg-white shadow-sm sm:block animate-pop-delayed" />
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Built like a real SaaS storage product
              </h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                This system simulates a subscription-controlled storage
                platform. Admins create tier rules, users operate within those
                limits, and the backend enforces policy on every file/folder
                action.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <InfoChip
                  title="Admin Panel"
                  desc="Manage packages, limits, and settings."
                />
                <InfoChip
                  title="User Panel"
                  desc="Manage folders, upload and access files."
                />
                <InfoChip
                  title="Enforcement"
                  desc="Limits checked before every action."
                />
                <InfoChip
                  title="Scalable structure"
                  desc="Clean separation of logic and UI."
                />
              </div>
            </div>

            <div className="rounded-3xl border bg-gray-50 p-6">
              <p className="text-xs text-gray-500">
                Assessment coverage snapshot
              </p>
              <div className="mt-4 space-y-4">
                <ChecklistItem text="Subscription tiers with limits: folders, nesting, file types, max size, total file cap, per-folder cap" />
                <ChecklistItem text="User authentication: login/register (email verification + reset gives extra priority)" />
                <ChecklistItem text="Folder management: create/rename/delete + nesting rules" />
                <ChecklistItem text="File management: upload/view/download (+ rename optional)" />
                <ChecklistItem text="Package switching applies going forward, existing data preserved" />
              </div>
            </div>
          </div>
        </section>

        {/* PACKAGES */}
        <section id="packages" className="border-t bg-gray-50">
          <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  Subscription Packages
                </h2>
                <p className="mt-2 text-gray-700">
                  These packages are loaded from your backend (Admin-managed).
                  Pick the plan that fits your needs.
                </p>
              </div>
              <a
                href="/register"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50 active:scale-[0.98]"
              >
                Create account
              </a>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {packages.map((p: any) => (
                <div
                  key={p.id}
                  className="group relative rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-70" />

                  <div className="mt-2 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold">
                        {p.name}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Enforced limits per tier
                      </p>
                    </div>

                    <span className="rounded-2xl border bg-gray-50 px-2.5 py-1 text-xs text-gray-700">
                      Tier
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-gray-800">
                    <Row label="Max folders" value={p.maxFolders} />
                    <Row label="Nesting level" value={p.maxNestingLevel} />
                    <Row label="Max upload" value={`${p.maxFileSizeMB} MB`} />
                    <Row label="Total files" value={p.totalFileLimit} />
                    <Row label="Files/folder" value={p.filesPerFolder} />
                  </div>

                  <div className="mt-4 rounded-2xl bg-gray-50 p-3 text-xs text-gray-600">
                    Allowed:{" "}
                    <span className="text-gray-800">
                      {(p.allowedTypes || []).join(", ")}
                    </span>
                  </div>

                  <div className="mt-4">
                    <a
                      href="/register"
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95 active:scale-[0.98]"
                    >
                      Choose {p.name}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-12 rounded-3xl border bg-white p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-display text-xl font-semibold">
                    Ready to manage files like a SaaS product?
                  </p>
                  <p className="mt-1 text-gray-700">
                    Create an account, pick your package, and start organizing
                    folders with enforced rules.
                  </p>
                </div>
                <div className="flex gap-3">
                  <a
                    href="/login"
                    className="inline-flex items-center justify-center rounded-2xl border bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
                  >
                    Login
                  </a>
                  <a
                    href="/register"
                    className="inline-flex items-center justify-center rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md active:scale-[0.98]"
                  >
                    Register
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicOnly>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-700">{desc}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function InfoChip({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-700">{desc}</p>
    </div>
  );
}

function ChecklistItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500" />
      <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}
