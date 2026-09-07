import { loginAction } from "@/app/admin/actions";

export const metadata = { title: "Admin Login" };

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string };
}) {
  const next = searchParams.next || "/admin";

  return (
    <div className="min-h-screen bg-void text-paper flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-on-dark.png" alt="MF COM" className="h-12 w-auto" />
        </div>

        <div className="bg-graphite border border-white/10 chamfer p-8">
          <p className="mono-label text-[11px] text-red mb-1">Admin</p>
          <h1 className="font-display text-xl font-semibold mb-6">Sign in to the CMS</h1>

          {searchParams.error && (
            <p className="mb-4 text-sm text-red bg-red/10 px-3 py-2 chamfer-sm">
              Incorrect email or password.
            </p>
          )}

          <form action={loginAction} className="space-y-4">
            <input type="hidden" name="next" value={next} />
            <div>
              <label htmlFor="email" className="mono-label text-[10px] text-paper/50 block mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="username"
                className="w-full h-11 px-3 bg-white/[0.06] chamfer-sm outline-none text-sm focus:ring-1 focus:ring-red"
                placeholder="admin@mfcom.pk"
              />
            </div>
            <div>
              <label htmlFor="password" className="mono-label text-[10px] text-paper/50 block mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full h-11 px-3 bg-white/[0.06] chamfer-sm outline-none text-sm focus:ring-1 focus:ring-red"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full h-11 bg-red text-white text-sm font-medium chamfer hover:bg-red-dim transition-colors mt-2"
            >
              Sign in
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-paper/40 mt-6">
          Protected area staff only.
        </p>
      </div>
    </div>
  );
}
