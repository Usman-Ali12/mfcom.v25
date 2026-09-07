// Own title template for everything under /admin, so admin pages read
// "Products — MF COM Admin" rather than inheriting the storefront's
// "%s — MF COM" template (which was the actual bug: pages that already
// included "— MF COM Admin" in their own title got the suffix appended a
// second time, e.g. "RAM — MF COM — MF COM").
export const metadata = { title: { template: "%s — MF COM Admin", default: "MF COM Admin" } };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
