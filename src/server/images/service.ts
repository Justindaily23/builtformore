// Attaching pictures to events and people. Callers MUST check permission first.
import { and, eq } from "drizzle-orm";
import { events, eventSpeakers, speakers, teamMembers } from "@/server/db/schema";
import { lockEvent, log, RuleError, type Db } from "@/server/events/service";
import { deleteImage, uploadImage, type ImageFolder, type StoredImage } from "./cloudinary";

/**
 * Uploads first, then saves. If saving fails the new file is removed; the old
 * file is removed only after the new one is saved.
 */
async function replace(
  file: Blob | null, folder: ImageFolder, save: (image: StoredImage | null) => Promise<string | null>,
) {
  const image = file ? await uploadImage(file, folder) : null;
  let old: string | null;
  try {
    old = await save(image);
  } catch (error) {
    await deleteImage(image?.publicId);
    throw error;
  }
  await deleteImage(old);
}

/** file is null to remove the picture. */
export function setEventImage(db: Db, adminId: string, eventId: string, file: Blob | null, alt: string | null) {
  return replace(file, "events", (image) => db.transaction(async (tx) => {
    const current = await lockEvent(tx, eventId);
    await tx.update(events)
      .set({ imageUrl: image?.url ?? null, imagePublicId: image?.publicId ?? null, imageAlt: image ? alt : null })
      .where(eq(events.id, eventId));
    await log(tx, adminId, image ? "event.image_saved" : "event.image_removed", "event", eventId);
    return current.imagePublicId;
  }));
}

/** The photo belongs to the person, so it shows at every event they appear in. */
export function setSpeakerPhoto(db: Db, adminId: string, eventId: string, appearanceId: string, file: Blob | null) {
  return replace(file, "speakers", (image) => db.transaction(async (tx) => {
    await lockEvent(tx, eventId);
    const [appearance] = await tx.select().from(eventSpeakers)
      .where(and(eq(eventSpeakers.id, appearanceId), eq(eventSpeakers.eventId, eventId)));
    if (!appearance) throw new RuleError("This person is no longer part of the event. Reload the page.");
    const [person] = await tx.select().from(speakers).where(eq(speakers.id, appearance.speakerId)).for("update");
    await tx.update(speakers).set({ photoUrl: image?.url ?? null, photoPublicId: image?.publicId ?? null })
      .where(eq(speakers.id, person.id));
    await log(tx, adminId, image ? "speaker.photo_saved" : "speaker.photo_removed", "event_speaker", appearanceId, { eventId });
    return person.photoPublicId;
  }));
}

export function setMemberPhoto(db: Db, adminId: string, memberId: string, file: Blob | null) {
  return replace(file, "team", (image) => db.transaction(async (tx) => {
    const [member] = await tx.select().from(teamMembers).where(eq(teamMembers.id, memberId)).for("update");
    if (!member) throw new RuleError("This person no longer exists. Reload the page.");
    await tx.update(teamMembers).set({ photoUrl: image?.url ?? null, photoPublicId: image?.publicId ?? null })
      .where(eq(teamMembers.id, memberId));
    await log(tx, adminId, image ? "team.photo_saved" : "team.photo_removed", "team_member", memberId);
    return member.photoPublicId;
  }));
}
