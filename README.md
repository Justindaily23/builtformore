# BuiltForMore

Brand and events website. Current stage: **home page only**, using sample data.

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
        admin/            Admin panel (later, empty)
      components/
        layout/           Header, mobile menu, footer
        home/             One file per home page section
        ui/               Small reusable pieces
        admin/            Admin components (later, empty)
      content/            Sample data and brand wording
      types/              Content shapes, a starting point for the database design
      lib/                Helpers, e.g. date formatting
      server/             Database and payment code (later, empty)
    public/images/        Images

## Editing content
| What | File |
|---|---|
| Brand name, headline, contacts | `src/content/brand.ts` |
| Current event | `src/content/featured-event.ts` |
| Pillars, BUILT journey, outcomes | `src/content/home.ts` |
| Colours and fonts | `src/app/globals.css` |
| Menu links | `src/components/layout/nav-links.ts` |

**Event photo:** put it in `public/images/`, then set
`imageUrl: "/images/your-photo.jpg"`.

**No upcoming event:** set `featuredEvent` to `null`.

These are code files for now. Editing from the admin panel comes with the
database. At that point `brand` and `featuredEvent` are loaded on the server
(including in the header, footer and page title), and admin changes must refresh
the cached pages (`cacheComponents` is on in `next.config.ts`).

## To confirm before launch
- Official theme line, brand name spelling and colour shades
- Venue booking (the proposal still lists a hotel quotation as outstanding)
- Permission to name the convener
- Real logo, photo and contact details
- Set `NEXT_PUBLIC_SITE_URL` to the real domain
