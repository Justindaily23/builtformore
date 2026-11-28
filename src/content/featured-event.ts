import type { FeaturedEvent } from "@/types/content";

// SAMPLE DATA used only by `npm run db:seed` on an empty database. The website
// shows what is in the database, which you edit in the admin panel.
export const featuredEvent: FeaturedEvent | null = {
  title: "BUILT FOR MORE Conference 2027",
  theme: "Becoming More",
  summary:
    "An annual gathering of women. A platform for growth. A movement towards impact.",
  startDate: "2027-11-25",
  endDate: "2027-11-27",
  venue: "Abuja Continental Hotel",
  address: "Wuse Zone 4, Abuja, Nigeria",
  convener: "Pastor Titi Olukoya",
  registrationStatus: "coming_soon",
  imageUrl: null,
};
