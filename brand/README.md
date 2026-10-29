# Tax Dey brand guide

One page on how to use the Tax Dey logo. Hand this to anyone making a flyer, sticker, video, social post or partner deck.

## The idea

Eight rings are everything you earn. One has been lifted out, filled in and turned gold: the tax, set aside and safe. The rings are drawn from the circles painted onto Nigerian resist-dyed cloth (adire) before it goes into the dye.

In one line: **your money, with the tax already put aside.**

## The logo family

Use the version that fits the space. Don't redraw or mix them.

| Version | File | Use it for |
|---|---|---|
| **Rings** (main logo) | `logo/mark-rings.svg` | Website hero, opening screen, documents, partner decks, billboards. Use at 48px or larger. |
| **Rings, small** | `logo/mark-rings-small.svg` | Website header, email signatures, anything 24–48px. Same rings without the centre points. |
| **Solid** | `logo/mark-solid.svg` | App icons, stickers, receipts, POS machines, embroidery, anything under 24px or printed cheaply. |
| **Favicon** | `logo/favicon.svg` | Browser tabs only (16–24px). |
| **Indigo** | `logo/mark-rings-indigo.svg` | Special editions only: filing-season campaigns, launch merch. The app stays green. |
| **Horizontal lockup** | `logo/lockup-horizontal.svg` | The default logo with the name, e.g. letterheads, website header, partner decks. |
| **Wordmark with full stop** | `logo/wordmark.svg` | Ads, social posts, merch. The gold full stop is the "set aside" dot: "Tax Dey. Full stop." |
| **Stacked lockup** | `logo/lockup-stacked.svg` | Square spaces: opening screen, posters, event banners. |

Every logo file has a `-reversed` version for dark backgrounds.

## Ready-made images (`png/`)

| File | Use |
|---|---|
| `app-icon-1024.png` (plus 512, 192, 180) | App stores and home screens. Full-bleed square; phones round the corners themselves. |
| `app-icon-light-*.png` | Light version, for places where dark icons get lost. |
| `social-avatar-800.png` | WhatsApp, Instagram, X, LinkedIn and Facebook profile pictures. Safe for circular crops. |
| `og-image-1200x630.png` | Link preview when the website is shared. Already wired into the site. |

## Colours

| Name | Hex | Role |
|---|---|---|
| Forest | `#0b3b2c` | Main brand colour: logo, buttons, headings |
| Gold | `#e2a72e` | **Only** for the set-aside dot and money that's been set aside. Never for decoration. |
| Paper | `#f7f4ec` | Background |
| Leaf | `#12684a` | Links, secondary accents, the dot pattern |
| Mint | `#dcefe4` | Soft highlights |
| Indigo | `#1f3460` | Special editions only |

Keep the gold scarce. It means "this is your tax, put aside". If everything is gold, nothing is.

## Type

- **Bricolage Grotesque** (ExtraBold) for the name and headlines.
- **Instrument Sans** for everything else.

Both are free on Google Fonts. The logo files have the lettering converted to shapes, so they look right even without the fonts installed.

## Pattern (`pattern/`)

`pattern-tile-on-forest.svg` and `pattern-tile-on-paper.svg` repeat seamlessly. Each tile has one gold dot lifted out of the grid. Use them for backgrounds on cards, banners and packaging. Don't put text directly over the busy part without a solid panel behind it.

## Space and size

- **Clear space:** keep empty space around the logo at least the width of one ring on every side.
- **Smallest sizes:** rings 48px, small rings 24px, solid 16px. On print, the solid mark should be at least 6mm wide.

## Don'ts

- Don't change the colours of the dots (apart from the approved reversed and indigo versions).
- Don't move the gold dot back into the grid or add more gold dots.
- Don't stretch, rotate, outline or add shadows to the logo.
- Don't put the green logo on a busy photo. Use the reversed version on a solid dark panel.
- Don't use the green, white and green of the flag next to the logo; the brand should feel Nigerian without the flag.

## About the cloth

Adire is the indigo resist-dyed cloth of Yoruba craftswomen, centred on Abeokuta and Ibadan. The logo borrows the idea of a dot pattern, not a specific design. In public, describe it as "inspired by Nigerian dyed cloth". If you ever use a full adire pattern, commission or credit an adire artist.

## Regenerating the files

Everything here is generated from `tools/`, so every version stays in sync. Change a colour or size there, not in the files.

```bash
# One-time setup (any folder outside the repo is fine)
python3 -m venv ~/.taxdey-brand && ~/.taxdey-brand/bin/pip install fonttools==4.55.3 uharfbuzz==0.42.0
# Bricolage Grotesque variable font from Google Fonts (SIL Open Font License)
curl -L -o ~/.taxdey-brand/Bricolage.ttf "https://github.com/google/fonts/raw/main/ofl/bricolagegrotesque/BricolageGrotesque%5Bopsz%2Cwdth%2Cwght%5D.ttf"

# From the repo root
~/.taxdey-brand/bin/python -I brand/tools/make_svgs.py ~/.taxdey-brand/Bricolage.ttf brand/logo
python3 -I brand/tools/make_pngs.py brand /tmp/taxdey-render   # needs Google Chrome; macOS (uses sips)
cp brand/png/app-icon-180.png src/app/apple-icon.png && cp brand/png/og-image-1200x630.png src/app/opengraph-image.png
```

In the app, the logo is the `LogoMark` component (`src/components/logo-mark.tsx`) and the favicon is `src/app/icon.svg`.
