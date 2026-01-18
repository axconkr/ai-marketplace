# Responsive Design Quick Reference

## Breakpoints
```tsx
// Mobile-first breakpoints
default: < 640px   // Mobile
sm:     640px      // Tablet portrait
md:     768px      // Tablet landscape
lg:     1024px     // Desktop
xl:     1280px     // Large desktop
```

## Common Patterns

### Typography
```tsx
// Headings
className="text-2xl sm:text-3xl lg:text-4xl"           // H1
className="text-xl sm:text-2xl lg:text-3xl"            // H2
className="text-lg sm:text-xl lg:text-2xl"             // H3

// Body text
className="text-sm sm:text-base lg:text-lg"            // Large body
className="text-xs sm:text-sm"                         // Small text
```

### Spacing
```tsx
// Padding
className="p-3 sm:p-4 lg:p-6"
className="px-4 sm:px-6 lg:px-8"
className="py-6 sm:py-8 lg:py-12"

// Margins
className="mb-4 sm:mb-6 lg:mb-8"
className="mt-6 sm:mt-8 lg:mt-10"

// Gaps
className="gap-3 sm:gap-4 lg:gap-6"
className="gap-4 sm:gap-6 lg:gap-8"
```

### Grids
```tsx
// Product grid (1 → 2 → 3 → 4)
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"

// Stats grid (2 → 4)
className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"

// Two column layout
className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"

// Sidebar layout (1 + 2)
className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
```

### Flexbox
```tsx
// Stack on mobile, row on desktop
className="flex flex-col sm:flex-row gap-4"

// Align items
className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"

// Button groups
className="flex flex-col sm:flex-row gap-3"
```

### Touch Targets (WCAG 2.1 AA)
```tsx
// Buttons (minimum 44x44px)
className="min-w-[44px] h-10"
className="min-w-[44px] min-h-[44px]"

// Icon buttons
<Button size="sm" className="min-w-[44px]">
  <Icon className="w-4 h-4" />
</Button>
```

### Visibility
```tsx
// Hide on mobile, show on desktop
className="hidden sm:block"
className="hidden lg:flex"

// Show on mobile, hide on desktop
className="sm:hidden"
className="lg:hidden"

// Conditional text
<span className="hidden sm:inline">Full Text</span>
<span className="sm:hidden">Short</span>
```

### Sticky Positioning
```tsx
// Sticky only on desktop
className="lg:sticky lg:top-6"
className="lg:sticky lg:top-4"
```

### Order Control
```tsx
// Reverse order on mobile
<div className="order-2 lg:order-1">Main Content</div>
<div className="order-1 lg:order-2">Sidebar</div>
```

### Images
```tsx
// Responsive sizes
className="w-16 h-16 sm:w-24 sm:h-24"
className="w-20 h-20 sm:w-32 sm:h-32"

// Icons
className="w-4 h-4 sm:w-5 sm:h-5"
className="w-6 h-6 sm:w-8 sm:h-8"
```

## Component Patterns

### Header/Navigation
```tsx
<header className="sticky top-0 z-50">
  <div className="container flex items-center justify-between h-16">
    {/* Logo */}
    <Link href="/">Logo</Link>

    {/* Desktop Nav */}
    <nav className="hidden md:flex gap-6">...</nav>

    {/* Mobile Menu Button */}
    <Button className="md:hidden">Menu</Button>
  </div>
</header>
```

### Page Container
```tsx
<div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8">
    Page Title
  </h1>
  {/* Content */}
</div>
```

### Card
```tsx
<Card>
  <CardHeader className="p-4 sm:p-6">
    <CardTitle className="text-lg sm:text-xl">Title</CardTitle>
  </CardHeader>
  <CardContent className="p-4 sm:p-6">
    {/* Content */}
  </CardContent>
</Card>
```

### Stats Grid
```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xs sm:text-sm font-medium">Label</CardTitle>
      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
    </CardHeader>
    <CardContent>
      <div className="text-xl sm:text-2xl font-bold">Value</div>
      <p className="text-[10px] sm:text-xs text-muted-foreground">Detail</p>
    </CardContent>
  </Card>
</div>
```

### Product Card
```tsx
<Card className="overflow-hidden">
  <div className="relative aspect-video w-full">
    <Image src="..." fill className="object-cover" />
  </div>
  <CardContent className="p-4 sm:p-6">
    <h3 className="text-base sm:text-lg font-semibold mb-2">Title</h3>
    <p className="text-sm text-muted-foreground line-clamp-2">Description</p>
    <div className="mt-4 flex items-center justify-between">
      <span className="text-xl sm:text-2xl font-bold">Price</span>
      <Button size="sm">Add</Button>
    </div>
  </CardContent>
</Card>
```

### Form Layout
```tsx
<form className="space-y-6">
  <div className="space-y-2">
    <Label htmlFor="field">Label</Label>
    <Input id="field" className="w-full" />
  </div>

  <Button type="submit" size="lg" className="w-full sm:w-auto">
    Submit
  </Button>
</form>
```

### Sidebar Layout
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
  {/* Main Content */}
  <div className="lg:col-span-2 order-2 lg:order-1">
    {/* ... */}
  </div>

  {/* Sidebar */}
  <div className="lg:col-span-1 order-1 lg:order-2">
    <div className="lg:sticky lg:top-6">
      {/* ... */}
    </div>
  </div>
</div>
```

### Pagination
```tsx
<div className="flex items-center gap-1 sm:gap-2">
  <Button className="h-10 min-w-[44px]">
    <ChevronLeft className="h-4 w-4 sm:mr-1" />
    <span className="hidden sm:inline">Previous</span>
  </Button>

  <div className="flex items-center gap-1 sm:gap-2">
    {pages.map(page => (
      <Button key={page} className="min-w-[44px] h-10">
        {page}
      </Button>
    ))}
  </div>

  <Button className="h-10 min-w-[44px]">
    <span className="hidden sm:inline">Next</span>
    <ChevronRight className="h-4 w-4 sm:ml-1" />
  </Button>
</div>
```

## Accessibility Checklist

- [ ] All touch targets >= 44x44px
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Screen reader labels (sr-only, aria-label)
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] No horizontal overflow
- [ ] Images have alt text
- [ ] Forms have proper labels

## Testing Viewports

```
Mobile:   375px × 667px   (iPhone SE)
Mobile:   390px × 844px   (iPhone 12/13/14)
Tablet:   768px × 1024px  (iPad)
Tablet:   820px × 1180px  (iPad Air)
Desktop:  1024px × 768px
Desktop:  1280px × 720px
Desktop:  1440px × 900px
Desktop:  1920px × 1080px
```

## Chrome DevTools Shortcuts

```
F12                    Open DevTools
Ctrl+Shift+M           Toggle device toolbar
Ctrl+Shift+C           Inspect element
Shift + Drag           Responsive mode resize
```

## Common Issues & Fixes

### Text Overflow
```tsx
// Problem
<p>Long text that overflows...</p>

// Solution
<p className="truncate">Long text that overflows...</p>
<p className="line-clamp-2">Long text that overflows...</p>
```

### Horizontal Scroll
```tsx
// Problem
<div className="flex gap-4">
  {manyItems.map(...)}
</div>

// Solution
<div className="flex gap-4 overflow-x-auto">
  {manyItems.map(...)}
</div>
```

### Small Touch Targets
```tsx
// Problem
<button className="p-1">
  <X className="w-3 h-3" />
</button>

// Solution
<button className="min-w-[44px] min-h-[44px] flex items-center justify-center">
  <X className="w-4 h-4" />
</button>
```

### Image Sizing
```tsx
// Problem
<img src="..." className="w-24 h-24" />

// Solution
<div className="w-16 h-16 sm:w-24 sm:h-24 relative">
  <Image src="..." fill className="object-cover" />
</div>
```
