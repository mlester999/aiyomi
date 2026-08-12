# Landing Concept Assets

This inventory records the replaceable visual concepts used by the Phase 1A.1 public landing page. These assets establish direction without claiming that the current character names, illustration system, or virtual-world art is final product IP.

## Companion system

- Source: code-native HTML and CSS in `apps/web/components/mascot.tsx` and `apps/web/app/polish.css`
- Characters: Mori, Lumi, and Piko
- Purpose: consistent silhouettes, expressions, poses, props, responsive scaling, and reduced-motion behavior across the landing page
- Status: original replaceable concept system
- Production note: retain the silhouette and personality distinctions if final illustration assets replace the CSS concepts

Mori uses a grounded seedling silhouette, asymmetrical leaf crest, calm face, broad feet, and curled tail. Lumi uses a starlight silhouette, pointed crown, luminous freckles, large curious eyes, and crescent tail. Piko uses a wider sunrise silhouette, swept crest, energetic wink, and comet-like tail.

## World and garden concept

- File: `apps/web/public/landing/world-garden-concept-v1.jpg`
- Dimensions: 1536 by 1024 pixels
- Approximate source size: 536 KB
- Generation path: built-in ImageGen
- Status: replaceable concept art
- Rendering: below the fold through `next/image`, with responsive sizes and lazy loading

Prompt summary: an original premium clay-inspired cutaway room flowing into a garden, with a library nook, creative corner, movement space, flourishing plants, warm cream and restrained pastel materials, and a clear central area for a code-rendered companion. No characters, text, logos, or product claims were embedded.

## Social preview

- File: `apps/web/public/social/og-aiyomi-v2.jpg`
- Dimensions: 1200 by 630 pixels
- Approximate source size: 212 KB
- Generation path: built-in ImageGen
- Status: replaceable campaign asset

Final prompt summary: a premium 1.91:1 Aiyomi social card matching the landing page, with exact text "Aiyomi" and "Your AI companion for better days.", a softly dimensional phone, cozy room and garden motifs, and an original mint seedling companion. The prompt prohibited extra text, store badges, ratings, reviews, download counts, testimonials, engagement numbers, copyrighted character resemblance, and watermarks.

## Replacement rules

- Keep critical product text as HTML and CSS, except for the intentionally complete social-preview card.
- Preserve original character silhouettes and avoid resemblance to existing virtual-pet brands.
- Do not introduce fake availability, social proof, ratings, awards, or user counts.
- Optimize raster assets before committing them.
- Update this inventory when an asset is replaced or its status changes.
