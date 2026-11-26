// These let you load linked data in one query (db.query.events.findFirst).
import { relations } from "drizzle-orm";
import { activityLog, adminUsers } from "./admin";
import { events, ticketOptions } from "./events";
import { eventDays, eventSessions, eventSpeakers, sessionSpeakers, speakers } from "./programme";
import { payments, registrations } from "./registrations";

export const eventsRelations = relations(events, ({ many }) => ({
  tickets: many(ticketOptions),
  speakers: many(eventSpeakers),
  days: many(eventDays),
  registrations: many(registrations),
}));

export const ticketOptionsRelations = relations(ticketOptions, ({ one }) => ({
  event: one(events, { fields: [ticketOptions.eventId], references: [events.id] }),
}));

export const speakersRelations = relations(speakers, ({ many }) => ({
  appearances: many(eventSpeakers),
}));

export const eventSpeakersRelations = relations(eventSpeakers, ({ one, many }) => ({
  event: one(events, { fields: [eventSpeakers.eventId], references: [events.id] }),
  speaker: one(speakers, { fields: [eventSpeakers.speakerId], references: [speakers.id] }),
  sessions: many(sessionSpeakers),
}));

export const eventDaysRelations = relations(eventDays, ({ one, many }) => ({
  event: one(events, { fields: [eventDays.eventId], references: [events.id] }),
  sessions: many(eventSessions),
}));

export const eventSessionsRelations = relations(eventSessions, ({ one, many }) => ({
  day: one(eventDays, { fields: [eventSessions.dayId], references: [eventDays.id] }),
  speakers: many(sessionSpeakers),
}));

export const sessionSpeakersRelations = relations(sessionSpeakers, ({ one }) => ({
  session: one(eventSessions, { fields: [sessionSpeakers.sessionId], references: [eventSessions.id] }),
  eventSpeaker: one(eventSpeakers, { fields: [sessionSpeakers.eventSpeakerId], references: [eventSpeakers.id] }),
}));

export const registrationsRelations = relations(registrations, ({ one, many }) => ({
  event: one(events, { fields: [registrations.eventId], references: [events.id] }),
  ticket: one(ticketOptions, { fields: [registrations.ticketOptionId], references: [ticketOptions.id] }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  registration: one(registrations, { fields: [payments.registrationId], references: [registrations.id] }),
  confirmedBy: one(adminUsers, { fields: [payments.confirmedByAdminId], references: [adminUsers.id] }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  admin: one(adminUsers, { fields: [activityLog.adminId], references: [adminUsers.id] }),
}));
