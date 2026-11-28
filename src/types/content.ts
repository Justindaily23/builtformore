/**
 * The shape of the site's content. Later, the database will return data in
 * these same shapes, so the page components should not need to change.
 */
export type Brand = {
  name: string;
  descriptor: string;
  headline: string[];
  promise: string;
  intro: string;
  contact: { email: string; phone: string; whatsapp: string; location: string };
};

export type RegistrationStatus = "coming_soon" | "open" | "closed";

export type FeaturedEvent = {
  title: string;
  theme: string;
  summary: string;
  /** ISO dates (YYYY-MM-DD) */
  startDate: string;
  endDate: string;
  venue: string;
  address: string;
  convener: string;
  registrationStatus: RegistrationStatus;
  /** A path inside /public, e.g. "/images/event.jpg". Null shows a placeholder. */
  imageUrl: string | null;
};
