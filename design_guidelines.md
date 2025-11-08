# FlowChain Design Guidelines

## Design Approach
**Design System:** Material Design 3 principles adapted for a professional productivity application. FlowChain is a utility-focused, role-based authentication platform requiring clarity, trust signals, and efficient workflows.

**Key Principles:**
- Security-first visual language that builds user confidence
- Clean, distraction-free authentication flows
- Scalable foundation for future dashboard complexity

## Typography System

**Font Family:** Inter via Google Fonts CDN (primary), system font fallback

**Hierarchy:**
- Page Titles: text-4xl, font-bold (Signup, Login, Welcome)
- Section Headers: text-2xl, font-semibold
- Form Labels: text-sm, font-medium
- Input Text: text-base, font-normal
- Helper Text/Errors: text-sm, font-normal
- Buttons: text-base, font-semibold

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, and 12 for consistent rhythm
- Component padding: p-6 to p-8
- Section spacing: space-y-6 for forms, space-y-4 for grouped elements
- Page margins: Standard container with max-w-md for auth pages, max-w-7xl for homepage

**Authentication Pages Layout:**
Centered card approach with:
- Full-height flex container (min-h-screen)
- Card width: max-w-md
- Card padding: p-8
- Logo/branding at top with mb-8
- Form fields with consistent mb-6 spacing
- CTA buttons full-width (w-full)

## Component Library

### Authentication Cards
- Rounded corners: rounded-xl
- Elevated appearance with subtle shadow
- Background treatment distinct from page
- Logo placement: Centered, h-12 width auto
- Form container: space-y-6

### Form Elements
**Text Inputs:**
- Height: h-12
- Padding: px-4
- Border radius: rounded-lg
- Label above input with mb-2 spacing
- Error messages below input with mt-1, accompanied by icon

**Dropdown (Role Selection):**
- Same styling as text inputs (h-12, px-4, rounded-lg)
- Chevron icon right-aligned
- Options display full role names clearly

**Password Input:**
- Toggle visibility icon positioned right within input (pr-10 for input padding)
- Eye icon to show/hide password

**Buttons:**
- Primary CTA: h-12, rounded-lg, w-full, font-semibold
- Text hierarchy: Primary actions full-width, secondary actions as text links
- Loading states: Spinner icon with disabled state

### Navigation (Homepage)
- Top navigation bar: h-16
- Left-aligned logo/brand name
- Right-aligned user menu with role badge and avatar
- Dropdown for profile/logout actions

### Trust & Security Indicators
**Signup Page:**
- Password strength meter below password field (4 segments showing strength)
- Requirement checklist: "8+ characters, 1 uppercase, 1 number" with check icons
- Security badge near submit button: "<!-- CUSTOM ICON: shield --> Encrypted & Secure"

**Login Page:**
- "Forgot Password?" link aligned right, text-sm
- "Remember me" checkbox option
- "Don't have an account? Sign up" link below form

### Form Validation
- Real-time validation on blur
- Error states: Red indicator icon, border change, error text below field
- Success states: Green checkmark icon appears in input
- Disabled state for submit until form valid

## Page-Specific Specifications

### Signup Page
**Structure:**
1. Logo/Brand (h-12, mb-8)
2. Page title "Create Account" (text-4xl, mb-2)
3. Subtitle "Join FlowChain to manage your projects" (text-base, mb-8)
4. Form fields in order: Name → Email → Password → Role Dropdown (each mb-6)
5. Password requirements checklist (mb-6)
6. Submit button "Create Account" (mb-4)
7. Redirect link "Already have an account? Log in" (text-center)

### Login Page
**Structure:**
1. Logo/Brand (h-12, mb-8)
2. Page title "Welcome Back" (text-4xl, mb-2)
3. Subtitle "Log in to continue" (text-base, mb-8)
4. Form: Email → Password (each mb-6)
5. Remember me checkbox + Forgot password link (flex justify-between, mb-6)
6. Submit button "Log In" (mb-4)
7. Redirect link "Need an account? Sign up" (text-center)

### Homepage (Initial)
**Structure:**
1. Top navigation with logo, user info, role badge
2. Main container: max-w-7xl, mx-auto, p-8
3. Welcome section: "Welcome, [Name]" (text-3xl, mb-2), Role displayed (text-lg, mb-8)
4. Dashboard placeholder: Grid layout (grid-cols-1 md:grid-cols-3, gap-6) with 3 card placeholders
5. Each card: p-6, rounded-xl, h-48, centered text "Dashboard Module"

## Icons
**Library:** Heroicons via CDN (outline style for most, solid for emphasis)

**Usage:**
- Form fields: Mail icon, Lock icon, User icon, ChevronDown for dropdown
- Navigation: Bars3 (menu), UserCircle (profile)
- Validation: CheckCircle (success), XCircle (error)
- Security: ShieldCheck for trust indicators

## Responsive Behavior
- Mobile (< 768px): Auth cards p-6, full-width with small side margins (mx-4)
- Tablet/Desktop: Centered cards, max-w-md maintains ideal form width
- Homepage: Single column on mobile, 3-column grid on desktop

## Images
No hero images for authentication pages—focus remains on form completion efficiency. Clean, minimal backgrounds enhance trust and reduce cognitive load.