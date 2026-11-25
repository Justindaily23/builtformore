import type { FeaturedEvent } from "@/types/content";

// SAMPLE DATA: will come from the database once the admin panel exists.
// Set to null to see the home page with no upcoming event.
export const featuredEvent: FeaturedEvent | null = {
  title: "Global Women Leadership Conference 2027",
  theme: "Built for More",
  summary:
    "Four days of leadership, purpose, influence, empowerment and transformation.",
  startDate: "2027-09-15",
  endDate: "2027-09-18",
  venue: "Abuja Continental Hotel",
  address: "Wuse Zone 4, Abuja, Nigeria",
  convener: "Pastor Titi Olukoya",
  registrationStatus: "coming_soon",
  imageUrl: null,
};
