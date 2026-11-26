export const roleNames = {
  convener: "Convener",
  keynote: "Keynote speaker",
  speaker: "Speaker",
  panelist: "Panelist",
  facilitator: "Facilitator",
} as const;

export type SpeakerRole = keyof typeof roleNames;
export const speakerRoles = Object.keys(roleNames) as [SpeakerRole, ...SpeakerRole[]];
