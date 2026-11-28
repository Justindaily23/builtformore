export const MINIMUM_AGE = 25;

export const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara",
] as const;

export const FCT = "FCT (Abuja)";
export const OUTSIDE_NIGERIA = "Outside Nigeria";

const inNigeria = [...nigerianStates, FCT].sort((a, b) => a.localeCompare(b));

/** The choices on the form: 36 states and the FCT in order, then outside Nigeria. */
export const stateOptions = [...inNigeria, OUTSIDE_NIGERIA] as unknown as [string, ...string[]];
