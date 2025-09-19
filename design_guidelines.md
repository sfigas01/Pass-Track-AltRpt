# Fitness Class Pass Tracker - Design Guidelines

## Design Approach
**Selected Approach:** Reference-Based Design inspired by fitness apps like Nike Training Club and Strava, combined with productivity app patterns from Linear and Notion for clean data management.

**Justification:** This fitness utility app needs both visual appeal to motivate users and efficient functionality for quick pass management on mobile devices.

## Core Design Elements

### Color Palette
**Primary Colors:**
- Light Mode: Deep teal (180 85% 25%) for headers and primary actions
- Dark Mode: Bright teal (180 75% 60%) for visibility against dark backgrounds
- Success/Active: Vibrant green (140 70% 45%) for available passes
- Warning: Warm orange (25 85% 55%) for expiring passes
- Error: Clean red (0 70% 50%) for expired passes

**Supporting Colors:**
- Neutral grays: Use Tailwind's slate scale for backgrounds and text
- Card backgrounds: White/slate-50 (light) and slate-800 (dark)

### Typography
**Font Stack:** Inter from Google Fonts via CDN
- Headers: Inter 600-700 weight, sizes 24px-32px
- Body text: Inter 400-500 weight, 16px base size
- Small text/labels: Inter 400 weight, 14px

### Layout System
**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8
- Component padding: p-4 or p-6
- Section margins: mb-6 or mb-8
- Icon spacing: gap-2 or gap-4
- Card spacing: space-y-4

### Component Library

**Navigation:**
- Bottom tab bar for mobile with 3-4 primary sections
- Sticky header with studio/pass filtering options
- Floating action button for quick "Add Pass" access

**Cards & Data Display:**
- Pass cards with studio logo, remaining classes, and expiration countdown
- Progress bars showing pass usage (circular progress for mobile)
- Quick stats cards showing total active passes and this week's classes

**Forms & Input:**
- Large touch-friendly form inputs (min 44px height)
- Dropdown selectors for studio/pass type selection
- Date pickers optimized for mobile interaction
- Stepper controls for class quantity adjustment

**Interactive Elements:**
- Swipe actions on pass cards for quick check-in
- Pull-to-refresh on main pass list
- Haptic feedback confirmation for class check-ins
- Modal overlays for pass details and editing

**Visual Indicators:**
- Color-coded pass status (active/warning/expired)
- Badge indicators for passes expiring within 7 days
- Empty states with motivational fitness imagery and clear CTAs

### Mobile-First Considerations
- Thumb-friendly navigation with bottom placement
- Single-column layout with generous spacing
- Large, tappable areas (minimum 44px)
- Simplified interactions optimized for one-handed use
- Progressive disclosure to avoid overwhelming small screens

### Key User Flows
1. **Quick Check-in:** Swipe pass card → confirm → haptic feedback
2. **Add Pass:** FAB → minimal form → confirmation
3. **Pass Overview:** Visual dashboard → tap for details → usage history

This design prioritizes speed and clarity for busy fitness enthusiasts while maintaining visual appeal that motivates continued use.