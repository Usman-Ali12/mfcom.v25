import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ImportClient from "./ImportClient";

export const metadata = { title: "Import catalog" };

export default function ImportCatalogPage() {
  return (
    <div>
      <Link href="/admin/products" className="flex items-center gap-1.5 text-sm text-steel hover:text-void mb-4">
        <ArrowLeft size={14} /> Back to products
      </Link>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Import from WhatsApp catalog</h1>
        <p className="text-sm text-steel mt-1">
          Upload the CSV from your catalog scraper. Review and fix anything before it goes live —
          nothing is saved until you click Import.
        </p>
      </div>
      <ImportClient />
    </div>
  );
}
