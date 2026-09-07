import { notFound } from "next/navigation";
import { getPromotionById } from "@/lib/promotions-store";
import { updatePromotionAction } from "../../actions";
import PromotionForm from "../../PromotionForm";

export const metadata = { title: "Edit Promotion" };
export const dynamic = "force-dynamic";

export default async function EditPromotionPage({ params }: { params: { id: string } }) {
  const promo = await getPromotionById(params.id);
  if (!promo) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Edit promotion</h1>
      <p className="text-sm text-steel mb-8">{promo.name}</p>
      <PromotionForm action={updatePromotionAction} initial={promo} submitLabel="Save changes" />
    </div>
  );
}
