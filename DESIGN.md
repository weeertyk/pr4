---
version: alpha
name: "AI Travel Companion Warm Editorial"
description: "A mobile-first travel interface that blends warm atmospheric backgrounds, editorial serif headlines, and crisp utility controls."
colors:
  background: "#F7F5EE"
  surface: "#FFFEF6"
  surface-muted: "#EEEBE0"
  foreground: "#192532"
  foreground-muted: "#5E6A77"
  border: "#C6D3DD"
  input: "#E1DED3"
  ring: "#61B2AC"
  primary: "#CD5C40"
  on-primary: "#FEFCF4"
  secondary: "#B2E3DF"
  on-secondary: "#192A3C"
  accent: "#F0D7AE"
  on-accent: "#222F3C"
  destructive: "#D7352D"
  on-destructive: "#FEFCF4"
  map-ink: "#111111"
  map-paper: "#FFFFFF"
  map-origin: "#2563EB"
  map-destination: "#DC2626"
  atmospheric-sand: "#F4EFE7"
  atmospheric-mint: "#EDF4F3"
  hero-overlay-ink: "#121B29"
  card-overlay-ink: "#0E131E"
typography:
  display-xl:
    fontFamily: "Georgia, Times New Roman, serif"
    fontSize: 36px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.01em
  heading-lg:
    fontFamily: "Georgia, Times New Roman, serif"
    fontSize: 30px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.01em
  heading-md:
    fontFamily: "Georgia, Times New Roman, serif"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.25
  body-lg:
    fontFamily: "Aptos, Segoe UI, Trebuchet MS, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-md:
    fontFamily: "Aptos, Segoe UI, Trebuchet MS, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.45
  body-sm:
    fontFamily: "Aptos, Segoe UI, Trebuchet MS, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
  label-md:
    fontFamily: "Aptos, Segoe UI, Trebuchet MS, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.3
  label-kicker:
    fontFamily: "Aptos, Segoe UI, Trebuchet MS, sans-serif"
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0.18em
  data-mono:
    fontFamily: "ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.3
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 32px
  xxxl: 40px
  jumbo: 48px
  screen-side: 20px
  nav-bottom-offset: 12px
rounded:
  sm: 6px
  md: 8px
  lg: 10px
  xl: 14px
  full: 9999px
borders:
  thin: 1px
  strong: 2px
shadows:
  shell:
    value: "0 28px 60px rgba(33, 42, 61, 0.12), 0 2px 10px rgba(33, 42, 61, 0.05)"
  panel:
    value: "0 10px 24px rgba(33, 42, 61, 0.08)"
  floating-nav:
    value: "0 12px 30px rgba(24, 38, 54, 0.14)"
  cta:
    value: "0 10px 18px rgba(196, 104, 73, 0.26)"
  cta-strong:
    value: "0 14px 24px rgba(196, 104, 73, 0.22)"
elevation:
  base: "Strong borders and tone separation with no shadow."
  raised: "{shadows.panel.value}"
  floating: "{shadows.floating-nav.value}"
  shell: "{shadows.shell.value}"
motion:
  easing-standard: "cubic-bezier(0.4, 0, 0.2, 1)"
  duration-fast: 150ms
  duration-base: 200ms
  duration-map-pan: 500ms
  duration-map-fit: 600ms
  hover-lift-y: -2px
  spinner: "linear infinite"
blur:
  panel: 8px
gradients:
  page-base: "linear-gradient(180deg, #F4EFE7 0%, #EDF4F3 100%)"
  page-atmosphere: "linear-gradient(180deg, rgba(240, 214, 182, 0.38), transparent 28%), linear-gradient(135deg, rgba(127, 177, 173, 0.18), transparent 52%), linear-gradient(180deg, rgba(255, 255, 255, 0.54), rgba(255, 255, 255, 0.7))"
  shell-surface: "linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(246, 247, 248, 0.97)), rgba(255, 255, 255, 0.82)"
  hero-overlay: "linear-gradient(180deg, rgba(18, 27, 41, 0.18), rgba(18, 27, 41, 0.8))"
  card-overlay: "linear-gradient(180deg, rgba(14, 19, 30, 0.08), rgba(14, 19, 30, 0.42))"
sizing:
  app-max-width: 28rem
  map-min-height: 360px
  hero-min-height: 288px
  icon-sm: 16px
  icon-md: 20px
  icon-lg: 24px
  control-square: 40px
components:
  app-shell:
    background: "{gradients.shell-surface}"
    rounded: "{rounded.lg}"
    borderColor: "{colors.map-paper}"
    borderWidth: "{borders.thin}"
    shadow: "{shadows.shell.value}"
  panel-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    borderColor: "{colors.border}"
    borderWidth: "{borders.thin}"
    shadow: "{shadows.panel.value}"
    backdropBlur: "{blur.panel}"
    padding: "{spacing.lg}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    borderColor: "{colors.primary}"
    borderWidth: "{borders.strong}"
    padding: "12px 16px"
    shadow: "{shadows.cta.value}"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    borderColor: "{colors.foreground}"
    borderWidth: "{borders.strong}"
    padding: "12px 16px"
  nav-tab-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    shadow: "{shadows.cta.value}"
  nav-tab-idle:
    backgroundColor: "transparent"
    textColor: "{colors.foreground-muted}"
    rounded: "{rounded.md}"
  map-control:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    borderColor: "{colors.foreground}"
    borderWidth: "{borders.strong}"
    size: "{sizing.control-square}"
  map-marker-default:
    backgroundColor: "{colors.map-ink}"
    textColor: "{colors.map-paper}"
    size: 8px
  map-marker-selected:
    backgroundColor: "{colors.map-paper}"
    textColor: "{colors.map-ink}"
    size: 8px
  status-pill:
    backgroundColor: "rgba(255, 255, 255, 0.1)"
    textColor: "{colors.map-paper}"
    rounded: "{rounded.full}"
    borderColor: "rgba(255, 255, 255, 0.35)"
    borderWidth: "{borders.thin}"
    padding: "4px 12px"
---

## Overview
This visual system is a warm, travel-journal interface with a premium editorial layer. The foundation is soft and atmospheric, while interaction controls stay strict and readable. It should feel like a polished travel companion: emotionally warm, operationally clear, and mobile-first by default.

The style balances two modes:
- A soft narrative mode: textured gradients, image overlays, serif headlines, and muted whites.
- A hard utility mode: high-contrast map controls, 2px borders, simple iconography, and explicit state feedback.

## Colors
The palette is anchored in warm neutrals with terracotta as the key action color.
- **Background and surfaces:** off-white tones with subtle warmth to avoid sterile pure white.
- **Primary:** terracotta-orange for primary actions and active navigation state.
- **Secondary/accent:** mint and sand tones for soft emphasis, helper surfaces, and selected cards.
- **Foreground:** deep ink-blue for legibility and map controls.
- **Map-specific colors:** strict black/white markers with blue origin and red destination for immediate route comprehension.

Use translucent white overlays on media to preserve readability without removing depth.

## Typography
The system uses a two-family strategy:
- **Editorial headings:** serif display style for destination names, section headers, and hero titles.
- **Interface body/labels:** humanist sans for controls, descriptions, metadata, and helper copy.

Typography behavior:
- Keep kicker labels uppercase, compact, and highly tracked.
- Body copy should stay calm and practical; avoid excessive weight contrast.
- Primary hierarchy comes from size and family shift, not from many font weights.

## Layout
The layout is a centered mobile shell with a fixed maximum content width and strong vertical rhythm.
- Use generous side padding to maintain a calm, premium composition.
- Stack sections with consistent card spacing.
- Keep dense data inside contained panels rather than full-width text blocks.
- On map-heavy screens, reserve hard-edged controls for all direct manipulation zones.

## Elevation & Depth
Depth comes from layered translucent surfaces and restrained shadows.
- The app shell has the deepest shadow and acts as the physical frame.
- Panels use one soft shadow and subtle blur to separate from the atmospheric background.
- Primary action elements can use warm-tinted shadows to reinforce hierarchy.
- In utility contexts (map and navigation), hierarchy can rely on border thickness and contrast instead of heavy blur.

## Shapes
Rounded corners are moderate and consistent.
- Most cards and controls use medium rounding.
- Pills and tags are fully rounded.
- Inputs, buttons, and cards should share the same corner language.
- Do not mix sharp and highly rounded geometry in the same local cluster.

## Components
Component personality:
- **Panels:** translucent or near-white surfaces with thin borders and soft shadow.
- **Primary buttons/tabs:** terracotta fill, light text, medium rounding, optional warm glow.
- **Outline controls:** high-contrast ink border for utility actions.
- **Map controls:** square, high-contrast, 2px border, no decorative styling.
- **Status pills:** translucent white chips over media overlays.

Iconography:
- Use simple outlined icons with medium stroke weight.
- Icons are functional markers, not decorative illustrations.

## Do's and Don'ts
- Do keep one clearly dominant primary action per viewport.
- Do maintain a clear separation between narrative cards and hard utility controls.
- Do preserve high contrast in map, route, and alert contexts.
- Do use atmospheric gradients as backdrop, not as text backgrounds.
- Don't introduce saturated new hues outside the core warm/mint/ink family.
- Don't apply strong shadows to every element.
- Don't mix many font families or many weights in a single section.
- Don't replace high-contrast map controls with low-contrast glass styles.
