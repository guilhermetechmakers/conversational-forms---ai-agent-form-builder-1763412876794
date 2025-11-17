# Modern Design Best Practices

## Philosophy

Create unique, memorable experiences while maintaining consistency through modern design principles. Every project should feel distinct yet professional, innovative yet intuitive.

---

## Landing Pages & Marketing Sites

### Hero Sections
**Go beyond static backgrounds:**
- Animated gradients with subtle movement
- Particle systems or geometric shapes floating
- Interactive canvas backgrounds (Three.js, WebGL)
- Video backgrounds with proper fallbacks
- Parallax scrolling effects
- Gradient mesh animations
- Morphing blob animations


### Layout Patterns
**Use modern grid systems:**
- Bento grids (asymmetric card layouts)
- Masonry layouts for varied content
- Feature sections with diagonal cuts or curves
- Overlapping elements with proper z-index
- Split-screen designs with scroll-triggered reveals

**Avoid:** Traditional 3-column equal grids

### Scroll Animations
**Engage users as they scroll:**
- Fade-in and slide-up animations for sections
- Scroll-triggered parallax effects
- Progress indicators for long pages
- Sticky elements that transform on scroll
- Horizontal scroll sections for portfolios
- Text reveal animations (word by word, letter by letter)
- Number counters animating into view

**Avoid:** Static pages with no scroll interaction

### Call-to-Action Areas
**Make CTAs impossible to miss:**
- Gradient buttons with hover effects
- Floating action buttons with micro-interactions
- Animated borders or glowing effects
- Scale/lift on hover
- Interactive elements that respond to mouse position
- Pulsing indicators for primary actions

---

## Dashboard Applications

### Layout Structure
**Always use collapsible side navigation:**
- Sidebar that can collapse to icons only
- Smooth transition animations between states
- Persistent navigation state (remember user preference)
- Mobile: drawer that slides in/out
- Desktop: sidebar with expand/collapse toggle
- Icons visible even when collapsed

**Structure:**
```
/dashboard (layout wrapper with sidebar)
  /dashboard/overview
  /dashboard/analytics
  /dashboard/settings
  /dashboard/users
  /dashboard/projects
```

All dashboard pages should be nested inside the dashboard layout, not separate routes.

### Data Tables
**Modern table design:**
- Sticky headers on scroll
- Row hover states with subtle elevation
- Sortable columns with clear indicators
- Pagination with items-per-page control
- Search/filter with instant feedback
- Selection checkboxes with bulk actions
- Responsive: cards on mobile, table on desktop
- Loading skeletons, not spinners
- Empty states with illustrations or helpful text

**Use modern table libraries:**
- TanStack Table (React Table v8)
- AG Grid for complex data
- Data Grid from MUI (if using MUI)

### Charts & Visualizations
**Use the latest charting libraries:**
- Recharts (for React, simple charts)
- Chart.js v4 (versatile, well-maintained)
- Apache ECharts (advanced, interactive)
- D3.js (custom, complex visualizations)
- Tremor (for dashboards, built on Recharts)

**Chart best practices:**
- Animated transitions when data changes
- Interactive tooltips with detailed info
- Responsive sizing
- Color scheme matching design system
- Legend placement that doesn't obstruct data
- Loading states while fetching data

### Dashboard Cards
**Metric cards should stand out:**
- Gradient backgrounds or colored accents
- Trend indicators (↑ ↓ with color coding)
- Sparkline charts for historical data
- Hover effects revealing more detail
- Icon representing the metric
- Comparison to previous period

---

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Elevated surfaces for depth

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)

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

## Unique Elements to Stand Out

### Distinctive Features
**Add personality:**
- Custom cursor effects on landing pages
- Animated page numbers or section indicators
- Unusual hover effects (magnification, distortion)
- Custom scrollbars
- Glassmorphism for overlays
- Animated SVG icons
- Typewriter effects for hero text
- Confetti or celebration animations for actions

### Interactive Elements
**Engage users:**
- Drag-and-drop interfaces
- Sliders and range controls
- Toggle switches with animations
- Progress steps with animations
- Expandable/collapsible sections
- Tabs with slide indicators
- Image comparison sliders
- Interactive demos or playgrounds

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
- Sufficient color contrast
- Respect reduced motion preferences

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


---

# Project-Specific Customizations

**IMPORTANT: This section contains the specific design requirements for THIS project. The guidelines above are universal best practices - these customizations below take precedence for project-specific decisions.**

## User Design Requirements

# Conversational Forms — AI Agent Form Builder - Development Blueprint

Conversational Forms is an AI-driven agent form builder that replaces static step-by-step forms with public, shareable conversational agents. Workspace users (marketers, sales, product teams, SMBs) design agents that collect structured lead data through LLM-guided chat sessions at public URLs. The backend orchestrates agent config, vectorized knowledge attachments, deterministic parsing and validation, session persistence, webhook delivery, billing, and admin controls.

## 1. Pages (UI Screens)

- Landing Page
  - Purpose: Public marketing page for product awareness and signup conversion.
  - Key sections/components: Hero (value props, demo GIF), Primary CTA, Feature highlight cards, Example agent demos, Pricing teaser, Footer (Docs, Privacy, Contact).

- Signup / Login
  - Purpose: Authentication entry with email/password and OAuth.
  - Key sections/components: Email/password form, Social login buttons (Google, GitHub), CAPTCHA, Forgot password, Switch toggle (signup/login), Security notice.

- Email Verification
  - Purpose: Confirm email verification token and guide next steps.
  - Key sections/components: Verification status card, Resend verification button, CTA to login/dashboard.

- Dashboard (Workspace Home)
  - Purpose: Workspace overview: agents, sessions, quick actions.
  - Key sections/components: Top nav (search/account), Agents list (cards with status, link, sessions), Sessions summary widgets, Recent sessions table, Quick create modal, Billing & usage summary.

- Agent Builder
  - Purpose: Create/edit/clone agents with fields, persona, appearance, knowledge, and publish controls.
  - Key sections/components: Builder canvas (center), Left sidebar (fields list + add), Right sidebar (field/agent properties), Field palette (text, email, phone, number, select, multi-select, checkbox, date, file upload), Persona settings, Knowledge attachments uploader, Appearance settings, Publish controls (slug, publish/unpublish, enable CAPTCHA, webhook mapping), Preview button.

- Agent Chat (Public Session UI)
  - Purpose: Full-page chat interface for visitors to interact with agent and provide field values conversationally.
  - Key sections/components: Chat header (avatar, name, tagline, trust badge), Message stream (assistant & visitor, timestamps, typing indicator), Input area (text input, quick replies, file upload for file fields), Minimal progress tracker, Expandable session state panel (collected fields), End session CTA (submit/restart), Accessibility controls.

- Session Viewer (Lead Detail)
  - Purpose: Inspect completed/in-progress session transcripts and parsed fields; trigger exports or webhooks.
  - Key sections/components: Session header (ID, agent, status, metadata), Transcript panel (filters: show/hide system messages), Parsed fields card (table with validation flags), Actions panel (export CSV/JSON, resend webhook, create CRM contact), Notes & tags, Activity log (webhook attempts, delivery status).

- Dashboard Analytics / Reports
  - Purpose: Agent performance analytics and exportable reports.
  - Key sections/components: Metric cards, Agent performance chart (sessions over time), Funnel drop-off analysis, Traffic sources table (referrer, UTM), Export controls / scheduled reports.

- Agent List / Management
  - Purpose: Bulk agent management and quick operations.
  - Key sections/components: Agent table/grid (search, filters), Quick actions (edit, clone, view link, disable), Usage badges (sessions, conversion rate).

- Settings / Preferences
  - Purpose: Account/workspace settings, billing, team, security.
  - Key sections/components: Account info, Workspace settings (defaults, custom domains), Billing & plan (usage, invoices, upgrade), API keys & webhooks (create/manage), Team management (invite, roles), Security (SSO, 2FA), Data & privacy controls (export/delete).

- Webhooks & Integrations Management
  - Purpose: Configure webhook endpoints and integrations.
  - Key sections/components: Webhook list (endpoint, secret, status), Create/edit webhook modal (mapping/template), Test/send button, Dead-letter queue viewer.

- Knowledge Attachments Library
  - Purpose: Manage uploaded docs, re-indexing, and versioning.
  - Key sections/components: Attachment list, Upload button, Status (indexed/processing), Re-index action, Version history.

- Help / Docs
  - Purpose: Product docs, guides, API references, onboarding walkthroughs.
  - Key sections/components: Searchable articles, Tutorials, Demo templates, Support contact.

- Password Reset
  - Purpose: Request & set new password flows.
  - Key sections/components: Request reset form, Set new password form with rules helper, Success confirmation.

- Privacy & Terms
  - Purpose: Legal content pages.
  - Key sections/components: Privacy policy, Terms of service, Cookie policy, Contact for legal requests.

- Admin Dashboard
  - Purpose: System-wide management for admins (users, agents, billing oversight).
  - Key sections/components: User management table, Agent oversight list, System metrics, Audit logs, Abuse reports.

- 404 / Error Pages
  - Purpose: Friendly error handling.
  - Key sections/components: 404 message + nav links, 500 message + retry/contact link.

## 2. Features

- Authentication & Authorization
  - Technical details: JWT access + refresh tokens in secure HTTP-only cookies, OAuth 2.0 (Google/GitHub), email verification tokens (expiry & resend), password hashing with bcrypt/scrypt, optional TOTP 2FA (RFC 6238), CSRF protection, rate limiting and CAPTCHA on auth endpoints.
  - Implementation notes: Use account/workspace multi-tenant model; role-based permissions (owner, admin, editor, viewer). Store salted hashes, rotate secrets via env/secret manager.

- Billing & Plans
  - Technical details: Stripe integration for subscriptions/invoices, usage metering pipeline (sessions, embedding calls, LLM tokens, attachments), plan enforcement middleware.
  - Implementation notes: Track usage via event pipeline (Kafka or server-side queue). Store metering records per workspace. Web UI for invoices, card updates, plan changes, and notifications when usage thresholds approach.

- Agent Builder & Management
  - Technical details: Agent DB model (id, workspace_id, owner_id, fields schema as JSON, persona, appearance, knowledge_refs, slug, status, versioning), field schema supports types, regex, conditional logic, required flags.
  - Implementation notes: Autosave drafts, optimistic locking for concurrent edits, clone and version history, slug uniqueness per workspace, publish/unpublish toggles. Implement preview mode using a sandboxed session endpoint.

- Knowledge Attachments & Retrieval (RAG Pipeline)
  - Technical details: File uploads to S3, background extraction (PDF/markdown/text), splitter (token or semantic based), embedding generation (OpenAI/Cohere), vector DB (Pinecone/Qdrant/Milvus) storage, retrieval endpoint (top-k with relevance scores).
  - Implementation notes: Sanitize uploads, permission checks, re-index job queue, attachment versioning, configurable top-k and similarity thresholds.

- Conversational Session Orchestration
  - Technical details: Session model (id, agent_id, state JSON, transcript, metadata: referrer, UTM, IP, UA), WebSocket/SSE streaming for assistant messages, orchestrator service: loads agent config, fetches context (vector retrieval), constructs prompt (system + persona + history + retrieved docs), call LLM with function-calling or structured JSON output, deterministic parsing of field answers.
  - Implementation notes: Use function-calling or constrained output (JSON schema) to reduce hallucinations. Validate answers (regex, type checks). Implement fallback messages and retry/backoff. For required verification (email/phone), integrate OTP or external verification flows.

- Session Storage, Search & Export
  - Technical details: Persist transcripts and parsed fields; full-text search via Elasticsearch/OpenSearch; indexes on agent_id, created_at, status, UTM; export endpoints (CSV/JSON), scheduled exports.
  - Implementation notes: Retention policies with configurable TTL; soft-delete with admin purge; export and data portability endpoints; session-level access control.

- Webhooks & Integrations
  - Technical details: Webhook management with templating/field mapping, HMAC signing, retries with exponential backoff, dead-letter queue, delivery logs.
  - Implementation notes: Support per-agent webhook configs, test delivery, webhook retry policy, allow IP allowlist, provide built-in CRM connectors (HubSpot/Salesforce) mapping templates.

- Notifications & Alerts
  - Technical details: Transactional email provider (SendGrid/Mailgun) for verification, reset, billing, session notifications; in-app notifications stored in DB; real-time pushes via WebSockets.
  - Implementation notes: Notification preferences per user/workspace, retry/backoff for failed notifications, admin alerts for critical failures.

- Security, Privacy & Compliance
  - Technical details: TLS in transit, AES-256 at rest, secure key management (KMS), RBAC, audit logs for sensitive actions, PII detection and optional redaction/hashing, GDPR endpoints (export/delete), consent logs.
  - Implementation notes: Implement rate limiting, CAPTCHA, abuse detection (IP blocking); rotate API keys; store minimal PII and provide configurable retention windows.

- Admin & Monitoring
  - Technical details: Admin controls for users/agents, system metrics (sessions, LLM cost), audit logs, error monitoring (Sentry), observability metrics (Prometheus/Grafana).
  - Implementation notes: Admin-only endpoints guarded by RBAC; alerts for webhook failure rates and LLM cost spikes.

- Analytics & Reports
  - Technical details: Events pipeline for sessions and conversions, aggregation jobs for metrics (completion rate, avg time), funnel analysis for field drop-off, scheduled exports.
  - Implementation notes: Precompute daily/weekly aggregates; expose API endpoints for dashboard charts; allow CSV/PDF exports.

## 3. User Journeys

- New User Signup → Create First Agent
  1. User visits landing page → clicks Sign up.
  2. Completes signup (email/password or OAuth). System sends verification email.
  3. User verifies email via verification page.
  4. Onboarded to Dashboard with guided walkthrough (tooltips).
  5. Quick-create modal opens Agent Builder with demo template.
  6. User edits fields, persona, uploads a knowledge doc, sets appearance, configures webhook.
  7. User publishes agent → slug generated; public URL shown.
  8. User shares link and views sessions as visitors interact.

- Visitor Completes Public Agent Chat
  1. Visitor opens public URL (/a/:workspace/:slug).
  2. Page loads agent chat header and initial assistant greeting (persona-guided).
  3. Assistant asks for first required field in conversational tone.
  4. Visitor replies (text or file). UI shows typing and streaming assistant responses.
  5. Backend validates input; if invalid, assistant asks clarifying question; if valid, stores field and progresses.
  6. Agent optionally pulls contextual snippets from knowledge attachments to clarify responses.
  7. Repeat until all required fields collected.
  8. Assistant offers completion CTA; on submit, session marked completed, webhook triggered and notifications sent.

- Workspace Admin Managing Sessions & Webhooks
  1. Admin logs in → Dashboard → Sessions table.
  2. Searches/filter by agent, UTM, date → opens a session.
  3. Reviews transcript and parsed fields; attaches internal notes and tags; can create CRM contact using prefilled mapping.
  4. If webhook failed, admin can re-send from actions panel or inspect delivery logs.
  5. Exports session to CSV/JSON or triggers scheduled export.

- Team Collaboration & Billing Upgrade
  1. Owner invites team members and assigns roles.
  2. Usage approaches plan limits → system displays notification.
  3. Admin navigates to Billing page → upgrade plan via Stripe.
  4. After upgrade, higher session/agent caps unlocked; plan enforcement middleware updates counts.

- Knowledge Attachment Lifecycle
  1. User uploads a document in Agent Builder.
  2. System uploads file to S3 and enqueues extraction + embedding job.
  3. Worker extracts text, splits content, generates embeddings, stores vectors in vector DB, marks attachment indexed.
  4. User views indexed status and can re-index or version rollback.

## 4. UI Guide
Apply the Visual Style section consistently. Key component specs:

- Layout & Responsiveness
  - Desktop-first with responsive breakpoints: 1280px (lg), 1024px (md), 768px (sm), 480px (xs).
  - Sidebar collapses on small screens; builder canvas becomes single-column with tabs for properties.

- Color & Typography
  - Use provided color palette exactly.
  - Font family: Inter; sizes: H1 28–32px (SemiBold), H2 20–24px (SemiBold), body 14–16px (Regular), metadata 12px (Regular/Medium).
  - Spacing: main container padding 24–32px; card padding 12–16px.

- Component Library (atomic)
  - Buttons: primary (filled #2563EB, white text, 8px radius), secondary (ghost/outline), disabled styling.
  - Inputs: rounded (8px), border #E5E7EB, focus ring (box-shadow with #E0E7EF).
  - Cards: 12px radius, shadow 0 2px 8px #0000000D, hover elevation + bg shift (#F3F4F6).
  - Sidebar: bg #F3F4F6, active state bg #F1F5F9, nested tree with chevron indicators.
  - Badges: small circles, colors per accent mapping for counts/status.
  - Chat Bubbles: assistant (accent background #FFFFFF with subtle border), visitor (light gray #F8F9FA), timestamps muted (#6B7280), typing indicator animated dots.
  - Progress Tracker: minimal pill with fraction (2/5) and subtle gradient accent.

- Accessibility
  - Contrast: ensure text contrast meets WCAG AA; provide high-contrast toggle.
  - Keyboard navigation: full keyboard support (tab order, focus rings).
  - ARIA roles for chat region, messages, and live regions for streaming assistant messages.
  - Alt text for avatars/images.

- Interaction Patterns
  - Autosave drafts in builder with toast feedback.
  - Confirm modals for destructive actions (delete agent/session).
  - Inline validation with clear helper/error text in field editor.
  - Preview public chat in a new tab; ensure preview uses sandbox agent config.

- Iconography & Imagery
  - Use consistent icon set across UI; folder/icons in dark gray #484848 with subtle gradient.
  - Avatars: circular, allow image or initial-based fallback.

Implementation Notes:
- Implement components as reusable design-system primitives (React + TypeScript recommended).
- Style system tokens: colors, spacing, typography, radius to be centralized (CSS variables or design token system).
- Ensure all UI adheres exactly to the Visual Style and Design Philosophy.

Instructions to AI Development Tool:
After every development step, refer back to this blueprint to ensure correct implementation. Verify all features and pages are built according to specifications before completing the project. Pay special attention to the UI Guide section and ensure all visual elements follow the design system exactly.

(End of blueprint)

## Implementation Notes

When implementing this project:

1. **Follow Universal Guidelines**: Use the design best practices documented above as your foundation
2. **Apply Project Customizations**: Implement the specific design requirements stated in the "User Design Requirements" section
3. **Priority Order**: Project-specific requirements override universal guidelines when there's a conflict
4. **Color System**: Extract and implement color values as CSS custom properties in RGB format
5. **Typography**: Define font families, sizes, and weights based on specifications
6. **Spacing**: Establish consistent spacing scale following the design system
7. **Components**: Style all Shadcn components to match the design aesthetic
8. **Animations**: Use Motion library for transitions matching the design personality
9. **Responsive Design**: Ensure mobile-first responsive implementation

## Implementation Checklist

- [ ] Review universal design guidelines above
- [ ] Extract project-specific color palette and define CSS variables
- [ ] Configure Tailwind theme with custom colors
- [ ] Set up typography system (fonts, sizes, weights)
- [ ] Define spacing and sizing scales
- [ ] Create component variants matching design
- [ ] Implement responsive breakpoints
- [ ] Add animations and transitions
- [ ] Ensure accessibility standards
- [ ] Validate against user design requirements

---

**Remember: Always reference this file for design decisions. Do not use generic or placeholder designs.**
