# Volt - Design System & Rules (V2: Pure Brutalist B&W)

This document outlines the core design language, colors, typography, and specific CSS/Tailwind notations used to construct the "Volt" developer profile map after the V2 transition. Keep this as a reference for extending the project.

## 1. Core Philosophy
* **Aesthetic:** Monochromatic Brutalist, High-Fidelity Terminal, Pure Black & White.
* **Vibe:** Technical, efficient, data-driven, architectural, and highly polished.
* **Key Traits:** Sharp edges (no rounded corners), uppercase micro-typography, extreme high contrast, subtle white glows, strict grid alignments, structural crosshairs (`+`), and hollow text outlines.

## 2. Color Palette

### ⚡ Brand Accent (V2 update)
* **Volt White:** `#ffffff` (Replaced the legacy Volt Pink)
  * *Tailwind:* `bg-brand-pink`, `text-brand-pink`, `border-brand-pink` (Variables kept in CSS for backward compatibility, but redefined as pure white).
* **Heatmap Array** (from empty to peak): 
  * Level 0/Inactive: `#1a1a1a` 
  * Level 1: `#333333`
  * Level 2: `#777777`
  * Level 3: `#cccccc`
  * Level 4/Peak: `#ffffff` (Often paired with a white glow: `shadow-[0_0_8px_#ffffff]`)

### 🔲 Monochromatic Base
* **Backgrounds:** `#000000` or very dark grays (`bg-brand-bg`, `bg-brand-accent-gray`).
* **Borders:** Extremely subtle whites (`border-white/5`, `border-white/20`) or specific gray borders (`border-brand-border`).
* **Text:**
  * Primary: White (`text-white`)
  * Contrast Override: Black (`text-black`) when placed over bright white active buttons.
  * Secondary: Light/Medium Gray (`text-brand-muted`)
  * Selection state overriding: `selection:bg-white selection:text-black`

## 3. Typography & Text Notations
The design relies heavily on contrasting massive titles with extremely spaced-out micro-typography.

* **Macro Typography (Headings):**
  * *Notation:* `text-5xl` up to `text-9xl`, `uppercase`, `tracking-tighter`, `leading-[0.9]`, `font-bold` or `font-medium`.
  * *Use:* Hero texts, section titles. The tight tracking and tight leading create block-like text shapes.
  * *New V2 Utility:* `.text-outline` (transparent fill, white stroke) which fills with solid white on hover.
  
* **Micro Typography (Labels, Navigation, Tags):**
  * *Notation:* `text-[10px]` or `text-[8px]`, `uppercase`, `tracking-[0.2em]`, `tracking-[0.3em]`, or `tracking-[0.4em]`, `font-bold`, `font-mono`.
  * *Use:* Used for system status, categories, small links, and footer watermarks.

## 4. Visual Effects & Structural Elements

### 🎛️ Shadows & Glows
Neon glows simulate high-intensity energy and screen glare.
* **Subtle Glow:** `shadow-[0_0_15px_rgba(255,255,255,0.3)]`
* **Intense/Hover Glow:** `shadow-[0_0_40px_rgba(255,255,255,0.7)]`

### 📐 Structural Elements & Terminal Aesthetics
No `rounded-lg` or `rounded-md` classes are used to maintain brutalism.

* **Glass Cards:** Subdued background with slight border. 
  * *Notation:* `glass-card`, `bg-brand-accent-gray/50`, `border border-white/5`
* **Terminal Headers:** Added dark, top-positioned bars to cards to simulate floating UI windows.
  * *Pattern:* Includes `px-4 py-2 border-b border-white/5 bg-black/40` and three small LED-like squares `w-2 h-2 bg-white/20`.
* **Crosshairs:** Small `+` characters positioned absolutely in the 4 corners of cards.
  * *Notation:* `absolute top-2 left-2 text-white/20 text-[10px] font-mono leading-none`
* **Buttons (Primary):**
  * *Notation:* `px-12 py-5 bg-brand-pink text-black text-sm font-bold uppercase tracking-widest`
  * *Hover Effects:* Brackets `[ ]` that smoothly fade in via `opacity-0 group-hover:opacity-100`.

### 🎭 The "Knockout" Canvas Mask (Hero Text)
To achieve the static noise inside the "UNIFIED" text, a specific layered blend-mode structure was used:
1. **Container:** `mix-blend-screen bg-transparent`
2. **Text Layer:** `mix-blend-multiply bg-black text-white`
3. **Canvas Layer:** Positioned absolute behind the text. 

## 5. Motion & Texture
We rely on `motion/react` (Framer Motion) for entrance and interaction animations.
* **Easing:** `ease: "easeInOut"` is the standard for comfortable component entry.
* **Texture:** Heavy reliance on background noise overlaid with a faint grid.
  * *Grid CSS:* `linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)`
  * *Noise Opacity:* `0.06`
