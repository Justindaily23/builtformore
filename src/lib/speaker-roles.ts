export const roleNames = {
  convener: "Convener",
  keynote: "Keynote speaker",
  speaker: "Speaker",
  panelist: "Panelist",
  facilitator: "Workshop facilitator",
  moderator: "Moderator",
  guest: "Special guest",
} as const;

export type SpeakerRole = keyof typeof roleNames;
export const speakerRoles = Object.keys(roleNames) as [SpeakerRole, ...SpeakerRole[]];
