---
description: Frontend & Brand Identity
---

# Frontend & Brand Identity

## Goal
Ensure all frontend changes align with the BlanketSmith Brand Identity and Design System.

## Visual Language
- **Aesthetics**: Vibrant, modern, "wow" factor. Avoid generic "dev tools" looks.
- **Glassmorphism**: Use heavily for overlays and panels.
- **Colors**:
    - Primary: Use defined CSS variables/Tailwind tokens for primary brand colors.
    - Dark Mode: Optimize for deep, sleek dark modes (not just flat grey).

## Component Usage
- **NO Native Elements**: Do NOT use raw `<button>`, `<input>`, or `<div>` for interactive elements if a Design System component exists.
    - Use `<Button>`, `<TextInput>`, `<Card>`, etc.
- **Tailwind**: Use utility classes for layout, but rely on component abstractions for visual style ("tokens").

## Image Generation
- If new assets are needed, use `generate_image` with prompts that emphasize "premium", "modern", "dynamic", and "consistent with existing palette".

## Implementation Rules
1. **Check Existing**: Before creating a new component, check `apps/tool/src/components/ui` or similar.
2. **Responsive**: Always check mobile views.
3. **Animations**: Add subtle micro-interaction animations (hover, click, transition) to make the app feel "alive".
