# Design Guidelines: AI-Enabled Data Analytics Platform

## Design Approach

**Selected Approach**: Design System + Reference-Based Hybrid  
**Primary References**: Linear (typography & cleanliness), Grafana (dashboard patterns), Notion (data organization), Vercel Analytics (modern visualization aesthetics)  
**Rationale**: Enterprise analytics tools demand functional excellence, information clarity, and professional aesthetics. We'll leverage proven dashboard patterns while maintaining a modern, distinctive visual identity.

**Core Design Principles**:
- Information density without cognitive overload
- Efficient screen real estate utilization for multi-panel dashboards
- Professional enterprise aesthetic with modern refinement
- Data-first design - visualizations are the hero elements
- Minimal decorative elements; maximum functional clarity

---

## Typography System

**Font Stack**:
- **Primary**: Inter (400, 500, 600, 700) - UI elements, body text, labels
- **Data/Metrics**: JetBrains Mono (500, 600) - numbers, metrics, code-like elements
- **Display**: Inter (700, 800) - page headings only

**Type Scale**:
- **Display**: text-4xl (36px) / font-bold - Main page titles
- **H1**: text-2xl (24px) / font-semibold - Section headers, dashboard titles
- **H2**: text-xl (20px) / font-semibold - Card titles, panel headers
- **H3**: text-lg (18px) / font-medium - Subsection labels
- **Body**: text-base (16px) / font-normal - Descriptions, general text
- **Small**: text-sm (14px) / font-medium - Labels, filter options, metadata
- **Tiny**: text-xs (12px) / font-medium - Chart axes, timestamps, auxiliary info
- **Metrics**: text-3xl to text-5xl / font-bold (JetBrains Mono) - KPI values, key numbers

---

## Layout System

**Spacing Primitives**: Tailwind units of **2, 3, 4, 6, 8, 12, 16**

**Common Patterns**:
- Card padding: `p-6`
- Section spacing: `space-y-6` or `gap-6`
- Tight spacing (charts, filters): `gap-3` or `gap-4`
- Page margins: `px-8` desktop, `px-4` mobile
- Component margins: `mb-8` for major sections, `mb-4` for subsections

**Grid System**:
- **Main Dashboard**: 12-column grid with `gap-6`
- **Chart Panels**: 1-4 columns responsive (grid-cols-1 md:grid-cols-2 xl:grid-cols-3)
- **Sidebar**: Fixed 280px width (w-70) on desktop, full-width drawer on mobile
- **Container Max-Width**: max-w-screen-2xl for ultra-wide support

**Key Layout Zones**:

1. **Sidebar Navigation** (Left, 280px fixed):
   - Logo/branding area: h-16
   - Navigation items: py-3 px-4, vertical stack
   - Section dividers: my-4
   - User profile at bottom: p-4

2. **Top Bar** (Full-width, h-16 fixed):
   - Search bar (max-w-xl)
   - Date range picker
   - View controls (grid/list toggle)
   - User avatar and settings (right-aligned)

3. **Main Canvas** (Scrollable):
   - Page header: mb-8 (title + description)
   - Chart grid: grid gap-6, responsive columns
   - Each chart card: min-h-80, resizable handles

4. **Right Panel** (Collapsible, 400px):
   - AI Assistant header: h-16 p-4
   - Chat messages: flex-1 overflow-y-auto p-4
   - Input area: fixed bottom p-4
   - Quick filters accordion

---

## Component Library

### Navigation Components

**Sidebar Navigation**:
- Items: flex items-center gap-3 px-4 py-3 rounded-lg transition-all
- Icons: w-5 h-5 (Heroicons)
- Active state: font-semibold with subtle background
- Collapsible sections with chevron indicators

**Top Navigation Bar**:
- Height: h-16
- Items: inline-flex items-center gap-4
- Search: w-full max-w-xl rounded-full px-4 py-2
- Icons: w-5 h-5 clickable with p-2 touch target

### Data Display Components

**Chart Cards**:
- Container: rounded-xl border shadow-sm p-6
- Header: flex justify-between items-start mb-4
- Chart title: text-xl font-semibold
- Controls: flex gap-2 (filter, export, expand icons)
- Chart area: min-h-64 to min-h-96
- Footer: pt-4 border-t (metadata, last updated)
- Resize handles: absolute positioning, 8px×8px touch targets

**KPI Cards**:
- Compact: p-6 rounded-xl border
- Metric value: text-4xl font-bold (JetBrains Mono)
- Label: text-sm font-medium mb-2
- Trend indicator: inline-flex items-center gap-1 text-sm
- Sparkline: h-12 w-full (mini trend chart)

**Data Tables**:
- Header row: bg-muted font-semibold text-sm
- Rows: hover:bg-muted/50 transition-colors
- Cell padding: px-4 py-3
- Sortable columns: cursor-pointer with sort icons
- Pagination: flex justify-between items-center mt-4

### Form & Filter Components

**Filter Panel**:
- Accordion sections: border-b py-4
- Filter groups: space-y-3
- Checkboxes/Radio: flex items-center gap-2 py-2
- Range sliders: custom styled with value labels
- Apply/Reset buttons: flex gap-2 mt-6

**Date Range Picker**:
- Trigger button: inline-flex items-center gap-2 px-4 py-2 rounded-lg border
- Dropdown: absolute shadow-xl rounded-xl p-4 w-80
- Calendar grid: grid grid-cols-7 gap-1
- Preset options: flex flex-wrap gap-2 mb-4

**Metric Builder**:
- Formula input: font-mono text-sm p-3 rounded-lg border
- Variable chips: inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs
- Operator buttons: grid grid-cols-4 gap-2

### AI Components

**Chat Interface**:
- Message bubbles: max-w-2xl p-4 rounded-2xl
- User messages: ml-auto (right-aligned)
- AI responses: mr-auto (left-aligned)
- Typing indicator: flex gap-1 items-center
- Input: flex items-center gap-2 p-4 border-t
- Text area: flex-1 min-h-12 max-h-32 resize-none rounded-lg px-4 py-3

**Insight Panels**:
- Container: border-l-4 p-6 rounded-r-xl
- Icon: w-12 h-12 rounded-full flex items-center justify-center mb-4
- Insight text: text-base leading-relaxed
- Action buttons: flex gap-2 mt-4

### Interactive Elements

**Buttons**:
- Primary: px-6 py-3 rounded-lg font-semibold text-base
- Secondary: px-6 py-3 rounded-lg font-medium border
- Icon-only: p-2 rounded-lg (w-10 h-10 touch target)
- Small: px-4 py-2 text-sm
- Large (CTA): px-8 py-4 text-lg

**Dropdowns/Selects**:
- Trigger: inline-flex items-center justify-between px-4 py-2 rounded-lg border w-full
- Menu: absolute shadow-xl rounded-xl p-2 max-h-80 overflow-y-auto
- Items: px-3 py-2 rounded-lg cursor-pointer hover transition

**Modals**:
- Overlay: fixed inset-0 bg-black/50 backdrop-blur-sm
- Container: relative bg-background rounded-2xl shadow-2xl max-w-2xl w-full p-8
- Close button: absolute top-4 right-4 p-2 rounded-lg

### Charts & Visualizations

**Chart Types** (using Recharts):
- Line charts: strokeWidth-2, smooth curves, gradient fills (optional)
- Bar charts: rounded-t-md bars, gap between bars
- Area charts: opacity-60 fills with stroke border
- Pie/Donut: centered labels, segment spacing
- All charts: responsive aspect ratio, tooltips on hover, legend placement

**Chart Interactions**:
- Tooltips: shadow-xl rounded-lg p-3 backdrop-blur
- Legends: inline-flex flex-wrap gap-4 items-center text-sm
- Grid lines: subtle, minimal (every major tick)
- Axis labels: text-xs, rotated if needed for x-axis

---

## Page Layouts

### Dashboard Homepage
- **Header**: Welcome message + quick stats (4 KPI cards in grid)
- **Main Grid**: 2×2 chart layout (responsive to 1 column mobile)
- **Recent Activity**: Table showing last 10 data updates
- **AI Summary Card**: Featured insight at top or sidebar

### Data Connection Page
- **Hero Section**: Centered content, upload dropzone (dashed border, p-12)
- **Connected Sources**: Grid of cards (3 columns desktop, 1 mobile)
- **Connection Form**: 2-column layout (form left, preview right)

### Chart Builder
- **Left**: Data source selector + metric configuration (w-80 fixed panel)
- **Center**: Live chart preview (flex-1)
- **Right**: Customization controls (w-96 collapsible)

### AI Insights Page
- **Full-width insights feed**: Cards with insights, each min-h-40 p-6
- **Filters sidebar**: Left, 280px
- **Detail view**: Modal or right panel expansion

---

## Responsive Breakpoints

- **Mobile**: < 768px - Single column, collapsible sidebar drawer, stacked charts
- **Tablet**: 768px - 1024px - 2-column grid, visible sidebar, reduced spacing
- **Desktop**: 1024px - 1536px - 3-column grid, full layout
- **Ultra-wide**: > 1536px - 4-column grid option, max-w-screen-2xl container

---

## Accessibility

- Focus states: ring-2 ring-offset-2 rounded-lg on all interactive elements
- Skip links for keyboard navigation
- ARIA labels on all icon-only buttons
- Contrast ratios meeting WCAG AA standards
- Keyboard shortcuts for common actions (displayed in tooltips)
- Screen reader announcements for chart data changes

---

## Animation Guidelines

**Minimal Use Only**:
- Chart data transitions: 300ms ease-in-out
- Panel open/close: 200ms ease-out
- Hover states: 150ms ease-in-out
- Loading spinners: smooth rotation
- NO scroll-triggered animations
- NO decorative animations

---

## Images

**Icons**: Use Heroicons (outline for inactive, solid for active states) via CDN
- Navigation: 20px (w-5 h-5)
- Buttons: 16px (w-4 h-4)
- Large actions: 24px (w-6 h-6)

**Illustrations**: For empty states only
- Data source connection: Centered illustration, max-w-md
- No data states: Simple line illustrations with helpful text
- Error states: Minimal icons with clear messaging

**No Hero Images**: This is a data-focused application - charts and metrics are the visual focus. Landing/marketing pages (if needed) may use abstract data visualization imagery, but the core app has no hero imagery.