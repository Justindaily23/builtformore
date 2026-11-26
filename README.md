# BuiltForMore

Brand and events website. Current stage: **home page** (still using sample files)
the **database**, **admin login**, **event and ticket management** and **public
event pages**, **speakers** and **schedule editing**.

## Run it
You need Node.js (a current LTS release; built and checked on Node 22).

    npm install
    npm run dev

Open http://localhost:3000. Before deploying, run `npm run lint` and `npm run build`.

To test on a phone on the same Wi-Fi: `npm run dev -- -H 0.0.0.0`, then open
`http://YOUR-COMPUTER-IP:3000`. If the menu does not respond, add that IP to
`allowedDevOrigins` in `next.config.ts`.

## Folder structure

    src/
      app/
        layout.tsx        Root layout: fonts, page title, link preview text
        globals.css       Brand colours and fonts
        (site)/           Public pages ("(site)" does not appear in the URL)
          layout.tsx      Header and footer
          page.tsx        Home page
        admin/            Sign-in page; (panel)/ holds signed-in pages
        api/auth/         Sign-in and sign-out only
      components/
        layout/           Header, mobile menu, footer
        home/             One file per home page section
        ui/               Small reusable pieces
        admin/            Login form and logout button
      content/            Sample data and brand wording
      types/              Content shapes, a starting point for the database design
      lib/                Helpers, e.g. date formatting
      server/db/          Database connection and schema (payment code comes later)
      server/auth/        Login setup, sessions and permissions
      server/events/      Event validation, rules and queries
    drizzle/              Database migrations (commit these)
    scripts/              Sample data and database check
    public/images/        Images

## Database
Neon Postgres with Drizzle. Put your connection string in `.env.local`:

    DATABASE_URL="..."

Then run:

    npm run db:migrate   # creates the tables
    npm run db:seed      # adds sample data (never overwrites an existing event)
    npm run db:check     # prints what is in the database

Use a development database for this, not the live one.

**Changing the schema:** edit `src/server/db/schema/`, run
`npm run db:generate`, read the new SQL file in `drizzle/`, then run
`npm run db:migrate`. Do not edit a migration that has already been applied.

In app code, use `getDb()` from `@/server/db`, on the server only.

| Table | Holds |
|---|---|
| `brand_settings` | Brand text and contacts (one row) |
| `events` | Event details, publishing and registration state, capacity, hold times |
| `ticket_options` | Prices (in **kobo**) and separate limits such as accommodation |
| `speakers`, `event_speakers` | Profiles, and role and visibility per event |
| `event_days`, `event_sessions`, `session_speakers` | Schedule |
| `registrations` | Participants, ticket and price at registration, consent |
| `payments` | Every payment attempt, manual proof, review flag |
| `webhook_events` | Payment notifications already received |
| `admin_users`, `activity_log` | Admin roles and history |

### Rules the database enforces
One featured event; tickets, sessions and speakers cannot be linked across events;
one active (pending or confirmed) registration per email per event; a successful
manual transfer needs the admin, bank reference and note; events and tickets with
registrations cannot be deleted.

### Rules the app code must still enforce (next steps)
- **Capacity.** The database stores limits but does not stop overbooking. When
  registering, use one transaction: lock the event row (`FOR UPDATE`), mark
  lapsed holds `expired`, count `pending` and `confirmed` registrations for the
  event and the ticket, then insert.
- Registration is allowed only if the event is published and open, before any
  deadline, and the ticket is active. Take the price from the database.
- A free ticket creates no payment; confirm the registration directly.
- Mark a payment successful only after verifying status, amount and currency.
  Flag late, duplicate or wrong amounts with `needs_review`.
- Staff need `can_confirm_payments` to confirm a transfer; check `is_active`.
- Public pages show only published events, visible speakers and sessions, the
  schedule only if `show_schedule`, and prices only if `show_price`.
- Check that session dates fall within the event dates.
- Write important admin actions to `activity_log`.

## Admin login
Public pages need no login. Admin pages are under `/admin`.

1. In `.env.local`, set `BETTER_AUTH_SECRET` (`openssl rand -base64 32`) and
   `BETTER_AUTH_URL=http://localhost:3000`.
2. `npm run db:migrate`
3. `npm run admin:create` (first owner)
4. `npm run dev`, then open http://localhost:3000/admin

| Task | Command |
|---|---|
| Add a staff account | `npm run admin:create -- --staff` |
| Set a new password (signs them out everywhere) | `npm run admin:reset-password` |

These commands change whichever database `DATABASE_URL` points to.

- Use the exact address in `BETTER_AUTH_URL`. A different port or `127.0.0.1`
  is blocked.
- A login lasts 12 hours. Sign-in is limited to 5 tries per minute per network
  address. There is no per-account lock and no two-step verification yet.
- To block someone, set `is_active` to false (a screen for this comes later).
  It applies on their next request. When building that screen, also delete
  their rows in `auth_sessions`, and never allow removing the last owner.
- Only sign-in and sign-out are exposed in `src/app/api/auth`. Allow another
  Better Auth endpoint only after checking its security.

### Rule for every new admin feature
Call `requireAdmin()` or `requirePermission("...")` from
`@/server/auth/session` **inside every admin page, Server Action and Route
Handler**, before reading or changing data. The layout is not a security check.
Roles are defined in `src/server/auth/permissions.ts`. A signed-out visitor is redirected, though the response status can be 200 if the
page has started streaming; no protected content is sent.

### Before going live
Use a new secret, the real `https` address, and strong passwords. Check how the
host reports visitors' IP addresses and set Better Auth's
`advanced.ipAddress` to match, so the sign-in limit cannot be dodged or shared
by everyone.

## Managing events
Sign in and open **Events** (`/admin/events`). Changes are saved to the database
and published events appear on the website on the next page load.

- New events start as hidden drafts. Events are archived, not deleted.
- Only a published event can be featured, and only one at a time. Unpublishing
  or archiving removes the feature.
- Registration can be "coming soon" or "closed". "Open" is blocked on purpose
  until the registration form exists.
- Prices are typed in naira and stored in kobo. Changing a price does not change
  what existing registrants owe.
- Places cannot be set below the number already taken. A ticket with
  registrations cannot be deleted; turn it off.
- If new dates leave schedule days outside the event, the schedule is hidden.
- Changes are recorded in `activity_log` (no screen for it yet).
- Not yet editable: brand text and images (including speaker photos).

Code: input checks in `src/server/events/validation.ts`, rules in
`service.ts`, and secured actions in `src/app/admin/(panel)/events/actions.ts`.
When opening registration is built, update `registrationChoice` and enforce
capacity and the deadline on the server.

## Public pages
| Page | Shows |
|---|---|
| `/` | The featured event, if it is published and has not ended |
| `/events` | Published events: upcoming, then past |
| `/events/web-address` | One published event |

- "Past" is decided by date: the day after the end date, in the event's
  timezone. It is not the same as "registration closed".
- Keep finished events **published** to keep them in the history. **Archived**
  and draft events are hidden, and their addresses show "not found".
- Hidden prices, hidden speakers and unavailable tickets are removed on the
  server. Past events show no tickets or prices.
- The schedule appears only after **Show schedule to visitors** is chosen.
- All visitor database reads are in `src/server/public/events.ts`. Keep it that
  way, and list columns by name.
- Pages are rendered on each visit (no caching), so every visit uses the
  database. `cacheComponents` is off in `next.config.ts`.
- Brand text and contacts still come from `src/content/`. Event data now comes
  from the database: `src/content/featured-event.ts` is only used by `db:seed`.

## Speakers and schedule
Open an event in the admin panel, then use the **Speakers** and **Schedule** tabs.

**Speakers**
- New people are hidden until **Show to visitors** is ticked. A hidden person
  appears nowhere on the website, including sessions.
- Each entry has one role. For a second role, use **Add someone already saved**.
  Visibility is set per entry.
- A person's name, title and biography are shared by all their entries,
  including past events.
- Removing someone's last entry deletes their saved details.

**Schedule**
- Each day must fall within the event's dates. Times are venue local time.
- Sessions are listed by **Order in the day**, then time.
- Nothing is public until **Show schedule to visitors** is chosen. This needs at
  least one visible session. After that, saved changes are public straight away
  (for a published event).
- If the event's dates change and a day falls outside them, the schedule is
  hidden automatically.
- If two admins edit the same speaker or session, the last save wins.

## Editing content
| What | File |
|---|---|
| Brand name, headline, contacts | `src/content/brand.ts` |
| Events | The admin panel |
| Pillars, BUILT journey, outcomes | `src/content/home.ts` |
| Colours and fonts | `src/app/globals.css` |
| Menu links | `src/components/layout/nav-links.ts` |

**Event photos:** uploads come later. Brand text is edited in code until brand
editing is built.

## To confirm before launch
- Official theme line, brand name spelling and colour shades
- Venue booking (the proposal still lists a hotel quotation as outstanding)
- Permission to name the convener
- Real logo, photo and contact details
- Approved ticket prices (placeholders, hidden with `show_price = false`)
- Hold times, full payment only, and one registration per email
- Proposed schedule (hidden with `show_schedule = false`)
- Set `NEXT_PUBLIC_SITE_URL` to the real domain
