# Nick & Rizelle — "They Liked You First"

## Context
This is a wedding invitation site for Nick and Rizelle, who met on Facebook Dating. The whole UI speaks Dating's visual language and grows from a phone layout into a full website. The feature list and order follow the reference site, with none of its content. Everything real is a placeholder: dates, places, names, and photos.

The attached Dating screens didn't come through in this session. I'm working from Facebook Dating's known UI: violet `#9b3cf6`, a single sans, about 24px card radius, lavender wells, and frosted pills.

## The original idea: a one-sided like waiting for the guest
On Dating, a match only happens when both people like each other. This site flips that around: the couple has already liked the guest.

- **Entrance:** the guest gets a "Nick & Rizelle liked you" notification.
- **Sections:** the site is the couple's profile, laid out as prompt cards. Each card answers a Dating-style prompt:
  - "How we met…"
  - "Find us on the day…"
  - "Dress like…"
  - "Our people…"
  - "Snapshots…"
  - "Ask us about…"
  - "If you want to spoil us…"
- **Liking cards:** each prompt card has a small purple heart circle on its corner. Tapping it "likes" that part of the invitation. The heart springs, and a tiny "You liked their story" toast pill slides up.
- **Reply = liking back:** the RSVP is the guest liking the couple back. Only the accept circle (a purple heart) turns the one-way like into a match.

**The extra interaction Dating doesn't have, "Match Meter":** the fixed pill bar has a split avatar of the couple on the left and a dashed empty circle on the right, labelled "You". Every liked prompt card fills a segment of the ring around the "You" circle. The ring never closes by itself. It closes only on the RSVP:
- **Accept:** the guest's initial drops into the circle, the two avatars slide together, and the screen dims. A full "It's a match — see you at the wedding" sheet rises with a seat-number ticket. The Reply pill becomes "Matched ✓".
- **Decline:** the ring settles gray and shows "We'll save you a slice." It stays kind, not a rejection.

The guest's liked prompts are listed on the final sheet, under "What you liked about us". This personal recap only appears once they've replied.

## Files
- First, check which App file `src/main.tsx` imports (`src/App.tsx` or `src/app/App.tsx`). That file holds all the section components.
- **Fonts:** Inter 400/500/800, added to `src/index.css` or `src/styles/fonts.css`. Imports go first.
- **Theme tokens:** update values only, and keep `--background`, `--foreground`, `--border`, and the `@theme inline` mapping.
  - ink `#050505`
  - gray `#65676b`
  - violet `#9b3cf6` / `#7b2ff2`
  - lavender well `#f1ebfe`
  - canvas `#f0f2f5`
  - surface `#fff`
- **Before code:** run the `aesthetic-stance` skill, call `create_make_theme`, and write `guidelines/Guidelines.md`. Pull placeholder photos with the `make:unsplash` skill.

## Primitives
These are reused across all frames:
- **`Pill`:** fully rounded tab or badge, in medium weight.
- **`CircleBtn`:**
  - Variants: white with a gray X, or solid violet with a white heart or smile.
  - Uses a motion/react spring that scales to 0.88 when pressed.
- **`IconWell`:** a lavender circle holding a thin gray lucide icon, with a tiny label underneath.
- **`PromptCard`:** a white sheet with a 28px radius.
  - Gray prompt label at the top, heavy answer, then content.
  - A like-heart overlaps the corner.
  - Rises in on view (y 32→0, scale .97→1).
- **`FrostedPill`:** `bg-white/70 backdrop-blur`.
- **`LikesContext`:** holds the set of liked card ids and the RSVP status. Saved to localStorage.

## Frames (in order)
1. **Entrance**
   - Full-bleed couple photo.
   - Top row: ChevronLeft, a Settings gear, and a MoreHorizontal mark.
   - A notification pill drops in: "Nick & Rizelle liked you · now".
   - At the bottom, a wide frosted pill: "See why they liked you →". Tapping it swipes the photo card left and away, and the profile rises under it. Scroll stays locked until then.
2. **Fixed pill bar**
   - Split "N|R" avatar, the section links, the Match Meter, and a violet Reply pill.
   - The active link crossfades to violet based on scroll position (IntersectionObserver).
   - On mobile, the links become a horizontally scrolling tab row.
3. **Hero (the profile header)**
   - Three fanned photo cards. The X and heart circles overlap the front card's corner, and the X just shuffles the stack.
   - "Nick & Rizelle", heavy weight.
   - A violet badge: "Getting married".
   - A thin gray icon row of calendar, pin, and ring: `[DATE]` · `[CITY]` · "Engaged".
   - A countdown in four lavender wells.
4. **Quote:** a white sheet with the prompt label "A line we live by…" and the quote.
5. **Story:** prompt "How we met…".
   - Photo card beside the text, stacked on mobile.
   - A faint giant "20XX" sits behind the heading.
   - Milestone icon wells: Dating, the first message, the first date, the yes.
6. **Ceremony & Reception:** prompt "Find us on the day…".
   - Two large cards, each with a map iframe placeholder, a MapPin line `[VENUE]`, a time, and a "Directions" pill.
7. **Attire:** prompt "Dress like…".
   - Guests / Sponsors tabs that crossfade between each other.
   - Round clothing-color swatches (sage, dusty rose, champagne, taupe, navy) with notes.
8. **Party:** prompt "Our people…".
   - A circular icon-button bar with tiny labels: Couple, Parents, Principal, Secondary, Party, Little Ones.
   - Selecting a group crossfades in a stack of white cards with avatar plus `[Name]`.
9. **Photos:** prompt "Snapshots…".
   - A swipe stack: drag, or press X/heart, to fling the top card away, and the next one rises.
   - Tapping a card opens a Radix Dialog lightbox.
10. **FAQ:** prompt "Ask us about…".
    - Radix Accordion notes with a rotating chevron.
11. **Gift:** prompt "If you want to spoil us…".
    - A white card with a lavender Gift well and placeholder copy.
12. **Reply:** titled "Like them back?".
    - Fields: name, email, mobile, a seats stepper, and a message.
    - Accept or decline is chosen with the two big circles, not radios.
    - A full-width violet "Confirm" pill triggers the Match Meter close and the match sheet.
    - **Wishes:** they appear below as chat-bubble white cards under "Messages under the match". New ones prepend with a rise and slight stacked offset, and a few placeholder wishes come seeded.
13. **Closing bar**
    - "Nick & Rizelle" in heavy weight, plus a sign-off: "Thanks for swiping right on our day."
    - A small heart circle that scrolls to the top.

## Responsive
- **Mobile:** a single column of cards up to 440px wide.
- **md and up:** max-w-6xl. Story, venues, and attire use two columns, and the hero photo stack sits beside the name block.

## Verification
- Check the preview at 390px and 1440px.
- Walk through the entrance swipe, nav highlight, countdown, likes filling the meter, photo swipe and lightbox, and accordion.
- Submit the RSVP with accept and with decline. Check that the ring closes, the match sheet appears with the liked recap, and the wish card prepends.
- Run `pnpm build` and confirm it compiles cleanly.
