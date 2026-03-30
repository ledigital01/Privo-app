# Design System: Onboarding: Welcome (The Fortified Prism)
**Project ID:** 1954877375521626345

## 1. Visual Theme & Atmosphere
**The Secure Sanctuary**: A blend of modern vault impenetrable security with high-end editorial elegance. The design favors "intentional asymmetry" and "overlapping elements" to break traditional templates and create a premium feel.

## 2. Color Palette & Roles
* **Deep Stable Navy** (#003d9b): Primary brand color, representing stability and trust. Used for headers and important UI anchors.
* **Vibrant Action Blue** (#0052CC): Primary interactive color, used for CTA gradients and focus states.
* **Sanctuary Base** (#f7f9fb): Soft, airy neutral background for the entire application.
* **Pure Content White** (#ffffff): Used for content cards (surface-container-lowest) to create maximum contrast against the base.
* **Tonal Neutrals** (#f2f4f6, #eceef0, #e6e8ea): Hierarchical surface layers (Low to Highest) to define space without relying on lines.
* **Success Mint** (#004e33 / #6ffbbe): Functional success states and security badges ("Secure" badge).
* **Warning Red** (#ba1a1a): Errors and critical alerts.

## 3. Typography Rules
* **Headline Anchor (Manrope)**: Geometric and architectural. Used for displays and section titles to convey authoritative trust.
* **Functional Precision (Inter)**: High legibility for body text and descriptive UI elements.
* **The "Editorial" Scale**: Large headlines paired with breathable body copy. Use strict baseline grid alignment for a polished look.

## 4. Component Stylings
* **Buttons**: Rounded `xl` (1.5rem/24px corner radius). 
    * **Primary**: Gradient fill (135° angle, #003d9b to #0052CC) with #ffffff text.
    * **Secondary**: Flat background (#eceef0), no border, #191c1e text.
* **Cards/Containers**: Rounded `xl` (1.5rem). Use **Tonal Layering** (white card on soft grey background) instead of 1px borders. No-Line rule applies strictly.
* **Inputs/Forms**: Rounded `md` (0.75rem). Background #e0e3e5. Focus state transitions to #ffffff background with a 1px "Ghost Border" (#003d9b at 40% opacity).
* **Security Badges**: Pill-shaped (full rounding) and color-coded. Frequent use of "Verified" and "Secure" badges for user reassurance.

## 5. Layout Principles
* **The No-Line Rule**: No 1px borders for sectioning. Boundaries are created through background shifts or tonal transitions.
* **Whitespace as Structure**: Generous padding (spacing scale 2, 4, 6) defining hierarchy. Don't crowd the edges.
* **Glassmorphism**: 70% opacity with 20px backdrop-blur for persistent elements like bottom navigation or modal headers.
* **intentional Asymmetry**: Overlapping cards and offset headers to create a custom, high-end feel.
