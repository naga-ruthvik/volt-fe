# Volt - Design System & Rules

This document outlines the core design language, colors, typography, and specific CSS/Tailwind notations used to construct the "Volt" developer profile map. Keep this as a reference for extending the project.

## 1. Core Philosophy
* **Aesthetic:** Monochromatic Brutalist with High-Fidelity Accents.
* **Vibe:** Technical, efficient, data-driven, and slightly aggressive but highly polished. 
* **Key Traits:** Sharp edges (no rounded corners), uppercase micro-typography, high contrast, subtle neon glows, and strict grid alignments.

## 2. Color Palette

### ⚡ Brand Accent
* **Volt Pink:** `#ff0066` 
  * *Tailwind:* `bg-brand-pink`, `text-brand-pink`, `border-brand-pink`
* **Heatmap Array** (from empty to peak): 
  * Level 0/Inactive: `#1a1a1a` 
  * Level 1: `#333333`
  * Level 2: `#660033`
  * Level 3: `#ff0066`
  * Level 4/Peak: `#ff3385` (Often paired with a glow: `shadow-[0_0_8px_#ff0066]`)

### 🔲 Monochromatic Base
* **Backgrounds:** `#000000` or very dark grays (`bg-brand-bg`, `bg-brand-accent-gray`).
* **Borders:** Extremely subtle whites (`border-white/5`, `border-white/20`) or specific gray borders (`border-brand-border`).
* **Text:**
  * Primary: White (`text-white`)
  * Secondary: Light/Medium Gray (`text-brand-muted`)
  * Selection state overriding: `selection:bg-[#ff0066] selection:text-white`

## 3. Typography & Text Notations
The design relies heavily on contrasting massive titles with extremely spaced-out micro-typography.

* **Macro Typography (Headings):**
  * *Notation:* `text-5xl` up to `text-9xl`, `uppercase`, `tracking-tighter`, `leading-[0.9]`, `font-bold` or `font-medium`.
  * *Use:* Hero texts, section titles. The tight tracking and tight leading create block-like text shapes.
  
* **Micro Typography (Labels, Navigation, Tags):**
  * *Notation:* `text-[10px]` or `text-[8px]`, `uppercase`, `tracking-[0.2em]`, `tracking-[0.3em]`, or `tracking-[0.4em]`, `font-bold`, `font-mono`.
  * *Use:* Used for system status, categories, small links, and footer watermarks. The extreme letter-spacing offsets the tiny size.

* **Body Text:**
  * *Notation:* `text-sm` or `text-base`, `text-brand-muted`, `leading-relaxed`.
  * *Use:* Descriptions and paragraphs.

## 4. Visual Effects & UI Components

### 🎛️ Shadows & Glows
Instead of native drop shadows, we use colored neon glows to simulate energy.
* **Subtle Glow:** `shadow-[0_0_15px_rgba(255,0,102,0.3)]`
* **Intense/Hover Glow:** `shadow-[0_0_40px_rgba(255,0,102,0.7)]`

### 📐 Structural Elements (Cards & Buttons)
No `rounded-lg` or `rounded-md` classes are used to maintain brutalism.
* **Glass Cards:** Subdued background with slight border. 
  * *Notation:* `glass-card`, `bg-brand-accent-gray/50`, `border border-white/5`
* **Buttons (Primary):**
  * *Notation:* `px-12 py-5 bg-brand-pink text-white text-sm font-bold uppercase tracking-widest`
* **Buttons (Ghost/Outlined):**
  * *Notation:* `px-12 py-5 border-2 border-brand-pink text-brand-pink text-sm font-bold uppercase tracking-widest hover:bg-brand-pink hover:text-white`

### 🎭 The "Knockout" Canvas Mask (Hero Text)
To achieve the static noise inside the "UNIFIED" text, a specific layered blend-mode structure was used:
1. **Container:** `mix-blend-screen bg-transparent`
2. **Text Layer:** `mix-blend-multiply bg-black text-[#ff0066]`
3. **Canvas Layer:** Positioned absolute behind the text. 
*Note: To prevent edge-bleeding around the text mask, negative margins and positive paddings were used (`px-8 -mx-8 py-2 -my-2`).*

## 5. Motion & Animation Rules
We rely on `motion/react` (Framer Motion) for entrance and interaction animations.
* **Easing:** `ease: "easeInOut"` is the standard for comfortable, luxurious component entry on page load.
* **Hover States:** Minimal scale and positional bump (`whileHover={{ scale: 1.02, y: -2 }}`).
* **Icon Rotations:** Small playful rotations on hover (`group-hover:rotate-12`).