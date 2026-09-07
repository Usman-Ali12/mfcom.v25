import PromotionForm from "../PromotionForm";
import { createPromotionAction } from "../actions";

export const metadata = { title: "New Promotion" };

export default function NewPromotionPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">New promotion</h1>
      <p className="text-sm text-steel mb-8">Create a countdown/flash-sale banner.</p>
      <PromotionForm action={createPromotionAction} submitLabel="Create promotion" />
    </div>
  );
}
