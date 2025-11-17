# Design Rules for This Project

## Project Design Pattern: ---

## Visual Style

### Color Palette:
- Primary background: #F8F9FA (soft, cool white)
- Card and container backgrounds: #FFFFFF (pure white)
- Sidebar and navigation: #F3F4F6 (light gray)
- Borders and dividers: #E5E7EB (light neutral gray)
- Primary text: #222222 (deep charcoal)
- Secondary text: #6B7280 (muted gray)
- Accent colors (icons, badges): #2563EB (blue), #10B981 (green), #F59E42 (orange), #EF4444 (red)
- Folder icons: #484848 (dark gray) with subtle gradients
- Hover/active states: #E0E7EF (very light blue for subtle highlights)

### Typography & Layout:
- Font family: Inter, sans-serif; clean, geometric, highly readable
- Font weights: Regular (400) for body, Medium (500) and SemiBold (600) for emphasis and headings
- Hierarchy: Clear separation with increased size and weight for section titles; smaller, lighter text for metadata
- Spacing: Generous padding (24-32px main containers, 12-16px within cards/lists)
- Alignment: Left-aligned text, consistent vertical rhythm, centered elements for icons/badges
- Typography treatments: No text shadows, all-caps reserved for small UI elements (e.g., tags/buttons)

### Key Design Elements
#### Card Design:
- Cards have rounded corners (12px radius), subtle drop shadow (0 2px 8px #0000000D)
- Minimal borders or borderless, emphasizing shadow and layering for hierarchy
- Hover state: Slight elevation and background color shift (#F3F4F6)
- Visual hierarchy: Large folder icons top, title and metadata (file count) below

#### Navigation:
- Left sidebar with collapsible, nested tree navigation; clear expand/collapse indicators
- Active state: Slightly darker background (#F1F5F9) and bolder text
- Icon buttons (top left) with circle backgrounds and subtle hover effect
- Tabs/switches (Folders/Tags) with pill-shaped active indicator

#### Data Visualization:
- No explicit charts; instead, visual data is shown through badges, file counts, and icons
- Badges: Small, colored circles with numeric indicators for counts

#### Interactive Elements:
- Buttons: Rounded corners (8px), solid fill for primary actions, outline or ghost style for secondary
- Hover: Subtle background color change, slight box-shadow for elevation
- Form elements: Minimal, border-radius, light gray borders (#E5E7EB), clear focus ring
- Checkbox: Custom, rounded with animation on check

### Design Philosophy
This interface embodies:
- A modern, minimalist, and highly functional aesthetic
- Clean, distraction-free design with a focus on clarity and usability
- Intuitive hierarchy, making information easy to scan and interact with
- Professional and approachable tone, balanced between friendly and serious
- Consistent visual language leveraging whitespace, soft color contrasts, and subtle accents to guide the user’s attention
- User experience goals center on fast comprehension, low cognitive load, and seamless navigation for productivity-focused workflows

---

This project follows the "---

## Visual Style

### Color Palette:
- Primary background: #F8F9FA (soft, cool white)
- Card and container backgrounds: #FFFFFF (pure white)
- Sidebar and navigation: #F3F4F6 (light gray)
- Borders and dividers: #E5E7EB (light neutral gray)
- Primary text: #222222 (deep charcoal)
- Secondary text: #6B7280 (muted gray)
- Accent colors (icons, badges): #2563EB (blue), #10B981 (green), #F59E42 (orange), #EF4444 (red)
- Folder icons: #484848 (dark gray) with subtle gradients
- Hover/active states: #E0E7EF (very light blue for subtle highlights)

### Typography & Layout:
- Font family: Inter, sans-serif; clean, geometric, highly readable
- Font weights: Regular (400) for body, Medium (500) and SemiBold (600) for emphasis and headings
- Hierarchy: Clear separation with increased size and weight for section titles; smaller, lighter text for metadata
- Spacing: Generous padding (24-32px main containers, 12-16px within cards/lists)
- Alignment: Left-aligned text, consistent vertical rhythm, centered elements for icons/badges
- Typography treatments: No text shadows, all-caps reserved for small UI elements (e.g., tags/buttons)

### Key Design Elements
#### Card Design:
- Cards have rounded corners (12px radius), subtle drop shadow (0 2px 8px #0000000D)
- Minimal borders or borderless, emphasizing shadow and layering for hierarchy
- Hover state: Slight elevation and background color shift (#F3F4F6)
- Visual hierarchy: Large folder icons top, title and metadata (file count) below

#### Navigation:
- Left sidebar with collapsible, nested tree navigation; clear expand/collapse indicators
- Active state: Slightly darker background (#F1F5F9) and bolder text
- Icon buttons (top left) with circle backgrounds and subtle hover effect
- Tabs/switches (Folders/Tags) with pill-shaped active indicator

#### Data Visualization:
- No explicit charts; instead, visual data is shown through badges, file counts, and icons
- Badges: Small, colored circles with numeric indicators for counts

#### Interactive Elements:
- Buttons: Rounded corners (8px), solid fill for primary actions, outline or ghost style for secondary
- Hover: Subtle background color change, slight box-shadow for elevation
- Form elements: Minimal, border-radius, light gray borders (#E5E7EB), clear focus ring
- Checkbox: Custom, rounded with animation on check

### Design Philosophy
This interface embodies:
- A modern, minimalist, and highly functional aesthetic
- Clean, distraction-free design with a focus on clarity and usability
- Intuitive hierarchy, making information easy to scan and interact with
- Professional and approachable tone, balanced between friendly and serious
- Consistent visual language leveraging whitespace, soft color contrasts, and subtle accents to guide the user’s attention
- User experience goals center on fast comprehension, low cognitive load, and seamless navigation for productivity-focused workflows

---" design pattern.
All design decisions should align with this pattern's best practices.

## General Design Principles

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Dark mode with elevated surfaces

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)
- Test colors in both light and dark modes

### Typography
**Create hierarchy through contrast:**
- Large, bold headings (48-72px for heroes)
- Clear size differences between levels
- Variable font weights (300, 400, 600, 700)
- Letter spacing for small caps
- Line height 1.5-1.7 for body text
- Inter, Poppins, or DM Sans for modern feel

### Shadows & Depth
**Layer UI elements:**
- Multi-layer shadows for realistic depth
- Colored shadows matching element color
- Elevated states on hover
- Neumorphism for special elements (sparingly)
- Adjust shadow intensity based on theme (lighter in dark mode)

---

---

## Interactions & Micro-animations

### Button Interactions
**Every button should react:**
- Scale slightly on hover (1.02-1.05)
- Lift with shadow on hover
- Ripple effect on click
- Loading state with spinner or progress
- Disabled state clearly visible
- Success state with checkmark animation

### Card Interactions
**Make cards feel alive:**
- Lift on hover with increased shadow
- Subtle border glow on hover
- Tilt effect following mouse (3D transform)
- Smooth transitions (200-300ms)
- Click feedback for interactive cards

### Form Interactions
**Guide users through forms:**
- Input focus states with border color change
- Floating labels that animate up
- Real-time validation with inline messages
- Success checkmarks for valid inputs
- Error states with shake animation
- Password strength indicators
- Character count for text areas

### Page Transitions
**Smooth between views:**
- Fade + slide for page changes
- Skeleton loaders during data fetch
- Optimistic UI updates
- Stagger animations for lists
- Route transition animations

---

---

## Mobile Responsiveness

### Mobile-First Approach
**Design for mobile, enhance for desktop:**
- Touch targets minimum 44x44px
- Generous padding and spacing
- Sticky bottom navigation on mobile
- Collapsible sections for long content
- Swipeable cards and galleries
- Pull-to-refresh where appropriate

### Responsive Patterns
**Adapt layouts intelligently:**
- Hamburger menu → full nav bar
- Card grid → stack on mobile
- Sidebar → drawer
- Multi-column → single column
- Data tables → card list
- Hide/show elements based on viewport

---

---

## Loading & Empty States

### Loading States
**Never leave users wondering:**
- Skeleton screens matching content layout
- Progress bars for known durations
- Animated placeholders
- Spinners only for short waits (<3s)
- Stagger loading for multiple elements
- Shimmer effects on skeletons

### Empty States
**Make empty states helpful:**
- Illustrations or icons
- Helpful copy explaining why it's empty
- Clear CTA to add first item
- Examples or suggestions
- No "no data" text alone

---

---

## Consistency Rules

### Maintain Consistency
**What should stay consistent:**
- Spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- Border radius values
- Animation timing (200ms, 300ms, 500ms)
- Color system (primary, secondary, accent, neutrals)
- Typography scale
- Icon style (outline vs filled)
- Button styles across the app
- Form element styles

### What Can Vary
**Project-specific customization:**
- Color palette (different colors, same system)
- Layout creativity (grids, asymmetry)
- Illustration style
- Animation personality
- Feature-specific interactions
- Hero section design
- Card styling variations
- Background patterns or textures

---

---

## Technical Excellence

### Performance
- Optimize images (WebP, lazy loading)
- Code splitting for faster loads
- Debounce search inputs
- Virtualize long lists
- Minimize re-renders
- Use proper memoization

### Accessibility
- Keyboard navigation throughout
- ARIA labels where needed
- Focus indicators visible
- Screen reader friendly
- Sufficient color contrast (both themes)
- Respect reduced motion preferences

---

---

## Key Principles

1. **Be Bold** - Don't be afraid to try unique layouts and interactions
2. **Be Consistent** - Use the same patterns for similar functions
3. **Be Responsive** - Design works beautifully on all devices
4. **Be Fast** - Animations are smooth, loading is quick
5. **Be Accessible** - Everyone can use what you build
6. **Be Modern** - Use current design trends and technologies
7. **Be Unique** - Each project should have its own personality
8. **Be Intuitive** - Users shouldn't need instructions
9. **Be Themeable** - Support both dark and light modes seamlessly

---

