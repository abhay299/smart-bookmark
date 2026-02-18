# UI Components Documentation

This document describes the reusable UI components and design system used in Smart Bookmark.

## Design System

### Color Palette

#### Background Colors
- `gray-900` (#111827) - Main background
- `gray-800` (#1f2937) - Card backgrounds
- `gray-700` (#374151) - Borders, dividers

#### Text Colors
- `white` (#ffffff) - Headings, emphasis
- `gray-100` (#f9fafb) - Body text
- `gray-300` (#d1d5db) - Secondary text
- `gray-400` (#9ca3af) - Placeholder text
- `gray-500` (#6b7280) - Tertiary text

#### Accent Colors
- **Blue** (Primary)
  - `blue-600` → `blue-500` (gradient)
  - Used for: Primary buttons, links, focus states
- **Red** (Danger)
  - `red-600` → `red-500` (gradient)
  - Used for: Delete buttons, error states

### Typography

**Font**: Inter (Google Fonts)
- Modern, clean sans-serif
- Excellent readability
- Variable font weights

**Sizes**:
- Headings: `text-xl` (20px), `text-2xl` (24px), `text-3xl` (30px)
- Body: `text-base` (16px)
- Small: `text-sm` (14px), `text-xs` (12px)

**Weights**:
- Regular: `font-normal` (400)
- Medium: `font-medium` (500)
- Semibold: `font-semibold` (600)
- Bold: `font-bold` (700)

### Spacing

**Gap/Padding Scale**:
- `1` = 0.25rem (4px)
- `2` = 0.5rem (8px)
- `3` = 0.75rem (12px)
- `4` = 1rem (16px)
- `6` = 1.5rem (24px)
- `8` = 2rem (32px)

### Border Radius
- Small: `rounded-lg` (8px) - Inputs, buttons
- Medium: `rounded-xl` (12px) - Cards
- Large: `rounded-2xl` (16px) - Modals, login card

### Shadows
- Card: `shadow-xl` - Standard card elevation
- Button: `shadow-lg shadow-blue-500/30` - Glowing effect
- Hover: `shadow-blue-500/10` - Subtle glow on hover

## Component Library

### Button Component

**File**: `components/ui/Button.tsx`

#### Variants

##### Primary (Default)
```tsx
<Button variant="primary">Click Me</Button>
```
- Blue gradient background
- White text
- Glowing blue shadow
- Usage: Main actions (Add Bookmark, Login)

##### Danger
```tsx
<Button variant="danger">Delete</Button>
```
- Red gradient background
- White text
- Glowing red shadow
- Usage: Destructive actions (Delete)

##### Ghost
```tsx
<Button variant="ghost">Cancel</Button>
```
- Transparent background
- Gray text
- Hover: Dark gray background
- Usage: Secondary actions (Logout, Cancel)

##### Outline
```tsx
<Button variant="outline">More Options</Button>
```
- Transparent background
- Gray border
- Hover: Dark background
- Usage: Tertiary actions

#### Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>  {/* Default */}
<Button size="lg">Large</Button>
```

#### States

```tsx
<Button disabled>Loading...</Button>
<Button>
  <Loader2 className="w-4 h-4 animate-spin mr-2" />
  Processing...
</Button>
```

### Input Component

**File**: `components/ui/Input.tsx`

#### Basic Usage

```tsx
<Input
  type="text"
  placeholder="Enter text..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

#### With Label

```tsx
<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
/>
```

#### With Error State

```tsx
<Input
  type="url"
  value={url}
  onChange={handleChange}
  error="Please enter a valid URL"
/>
```

#### With Icon

```tsx
<Input
  type="search"
  icon={<Search className="w-4 h-4" />}
  placeholder="Search..."
/>
```

#### Styling

- Dark background: `bg-gray-800/50`
- Gray border: `border-gray-700`
- Hover: `hover:border-gray-600`
- Focus: Blue ring `focus:ring-2 focus:ring-blue-500`
- Error: Red border and ring

### SkeletonCard Component

**File**: `components/ui/SkeletonCard.tsx`

#### Usage

```tsx
{isLoading && (
  <>
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </>
)}
```

#### Design

Matches `BookmarkCard` structure:
- Same height and padding
- Animated pulse effect
- Gray placeholders for text
- Circular placeholder for favicon

### ToastProvider Component

**File**: `components/providers/ToastProvider.tsx`

#### Setup

Added to root layout:

```tsx
<body>
  {children}
  <ToastProvider />
</body>
```

#### Usage in Components

```tsx
import toast from 'react-hot-toast'

// Success
toast.success('Bookmark added!')

// Error
toast.error('Failed to save')

// Loading
const loadingToast = toast.loading('Saving...')
// Later:
toast.dismiss(loadingToast)
toast.success('Saved!')
```

#### Styling
- Position: Top-right
- Duration: 3 seconds
- Dark theme to match app
- Icons: Green checkmark (success), Red X (error)

## Bookmark Components

### BookmarkCard

**File**: `components/bookmarks/BookmarkCard.tsx`

#### Structure

```
┌─────────────────────────────────────┐
│ [Favicon]  Title                 [×]│
│            https://example.com      │
│            Feb 17, 2024             │
└─────────────────────────────────────┘
```

#### Features
- **Hover Effects**: Scale up slightly, show delete button, border color change
- **Favicon**: Google's favicon service with error handling
- **Clickable Title**: Opens URL in new tab
- **Date Display**: Formatted creation date
- **Delete Button**: Appears on hover, shows confirmation

#### States
- Normal: Border gray-700
- Hover: Border gray-600, scale 102%, glowing shadow
- Deleting: Loading spinner in delete button

### BookmarkList

**File**: `components/bookmarks/BookmarkList.tsx`

#### Responsibilities
- Fetch bookmarks on mount
- Set up real-time subscription
- Filter bookmarks based on search
- Display loading skeletons
- Show empty states

#### Empty States

**No bookmarks**:
```tsx
<div className="text-center py-16">
  <BookmarkX className="w-8 h-8" />
  <h3>No bookmarks yet</h3>
  <p>Start by adding your first bookmark above</p>
</div>
```

**No search results**:
```tsx
<div className="text-center py-16">
  <BookmarkX className="w-8 h-8" />
  <h3>No bookmarks found</h3>
  <p>Try adjusting your search query</p>
</div>
```

### AddBookmarkForm

**File**: `components/bookmarks/AddBookmarkForm.tsx`

#### Layout

```
Add New Bookmark
┌─────────────────────────┐
│ URL                     │
│ [https://example.com] │
└─────────────────────────┘

┌─────────────────────────┐
│ Title                   │
│ [Example Site    ]│
└─────────────────────────┘

┌─────────────────────────┐
│    Add Bookmark         │
└─────────────────────────┘
```

#### Features
- Auto-focus URL input
- Auto-fetch title on blur
- Inline validation errors
- Loading states for fetch and submit
- Toast feedback on success/error

### SearchBar

**File**: `components/bookmarks/SearchBar.tsx`

#### Features
- Search icon prefix
- Real-time filter as you type
- Result count display
- Max width to prevent overly wide input

## Layout Structure

### Dashboard Layout

```tsx
<div className="min-h-screen bg-gradient">
  <header className="sticky top-0 border-b backdrop-blur">
    <div className="container mx-auto">
      {/* Logo + User Info + Logout */}
    </div>
  </header>
  
  <main className="container mx-auto max-w-4xl py-8">
    <AddBookmarkForm />
    <SearchBar />
    <BookmarkList />
  </main>
  
  <footer className="border-t mt-16 py-6">
    <div className="container mx-auto text-center">
      {/* Footer text */}
    </div>
  </footer>
</div>
```

#### Responsive Breakpoints

- **Mobile** (<640px): Single column, full width
- **Tablet** (640-1024px): Constrained width, centered
- **Desktop** (>1024px): Max width 896px (4xl)

### Container Setup

```tsx
className="container mx-auto px-4 max-w-4xl"
```

- `container`: Responsive max-width
- `mx-auto`: Center horizontally
- `px-4`: Padding on mobile
- `max-w-4xl`: Hard cap at 896px

## Animations & Transitions

### Hover Effects

```css
transition-all duration-200
hover:scale-[1.02]
hover:shadow-lg
```

**Components using**:
- BookmarkCard
- Buttons

### Loading Animations

```tsx
<Loader2 className="w-4 h-4 animate-spin" />
```

**Uses**:
- Button loading states
- Form submission
- Title fetching

### Skeleton Pulse

```css
animate-pulse
```

Fades background in and out to indicate loading.

### Page Transitions

Handled by Next.js App Router automatically.

## Accessibility

### Keyboard Navigation

All interactive elements are keyboard accessible:
- Buttons: `<button>` (native focus)
- Links: `<a>` with proper attributes
- Inputs: `<input>` with labels

### Focus States

```css
focus:outline-none
focus:ring-2
focus:ring-blue-500
focus:ring-offset-2
```

Visible focus ring for keyboard navigation.

### Semantic HTML

- `<header>`, `<main>`, `<footer>` for structure
- `<h1>`, `<h2>`, `<h3>` for headings hierarchy
- `<button>` for actions (not `<div>`)
- `<a>` for navigation

### ARIA Labels

```tsx
<button aria-label="Delete bookmark">
  <Trash2 />
</button>
```

Icons have descriptive labels for screen readers.

## Icons

**Library**: lucide-react

### Commonly Used Icons

| Icon | Component | Usage |
|------|-----------|-------|
| `Bookmark` | Logo, headings | Branding |
| `LogOut` | Logout button | Sign out |
| `Link2` | URL input | URL indicator |
| `Sparkles` | Title input, form | Auto-fetch indicator |
| `Search` | Search input | Search functionality |
| `ExternalLink` | Bookmark URL | Opens in new tab |
| `Trash2` | Delete button | Remove bookmark |
| `Loader2` | Loading states | Processing |
| `Chrome` | Google login | OAuth provider |
| `BookmarkX` | Empty states | No bookmarks |

### Icon Sizing

```tsx
<Search className="w-4 h-4" />  {/* 16px - Inputs */}
<Bookmark className="w-5 h-5" /> {/* 20px - Buttons */}
<Logo className="w-6 h-6" />     {/* 24px - Headers */}
<EmptyState className="w-8 h-8" /> {/* 32px - Large displays */}
```

## Custom Scrollbar

**File**: `app/globals.css`

```css
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1f2937;
}

::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}
```

Styled to match dark theme.

## Utility Functions

**File**: `lib/utils.ts`

### cn() - Class Name Merger

```tsx
import { cn } from '@/lib/utils'

<div className={cn(
  'base-class',
  isActive && 'active-class',
  className // Additional props
)}>
```

Combines class names, handles conditionals.

### URL Utilities

```typescript
isValidUrl(url: string): boolean
getDomainFromUrl(url: string): string
getFaviconUrl(url: string): string
```

Used throughout components for URL handling.

## Responsive Design

### Mobile-First Approach

Start with mobile styles, layer on desktop:

```tsx
<div className="text-sm md:text-base lg:text-lg">
  {/* Small on mobile, larger on tablet/desktop */}
</div>
```

### Grid Layouts

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 column mobile, 2 tablet, 3 desktop */}
</div>
```

### Container Queries (Future)

Not yet used, but could enable component-based responsiveness.

## Related Files

- `components/ui/Button.tsx`
- `components/ui/Input.tsx`
- `components/ui/SkeletonCard.tsx`
- `components/providers/ToastProvider.tsx`
- `components/bookmarks/*` - All bookmark components
- `app/globals.css` - Global styles
- `lib/utils.ts` - Utility functions
