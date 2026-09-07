"use server";

import { addNewsletterSubscriber } from "@/lib/newsletter-store";

export async function subscribeToNewsletterAction(email: string) {
  return addNewsletterSubscriber(email);
}
