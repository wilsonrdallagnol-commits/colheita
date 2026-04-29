// packages/ui/src/index.ts

// ============================================================================
// shadcn / UI components — usam Tailwind CSS
// ============================================================================
export { Badge, type BadgeProps } from './components/badge.js';
// ============================================================================
// Compiler blocks — componentes para renderização de layouts via layout-inference
// Usam inline styles (sem Tailwind). Compatíveis com renderToStaticMarkup.
// ============================================================================
export { BadgeStrip } from './components/badge-strip.js';
export {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './components/breadcrumb.js';
export { Button, type ButtonProps, buttonVariants } from './components/button.js';
export { Card, CardContent, CardFooter, CardHeader, CardTitle } from './components/card.js';
export {
  type AutoContent,
  type CompilerTheme,
  type CtaContent,
  DEFAULT_THEME,
  deriveColors,
  type FeatureListContent,
  type FooterContent,
  type HeadlineContent,
  type IconGridContent,
  type LegalContent,
  type MediaContent,
  type ProductDataGridContent,
  type ProductRefContent,
  type QrContent,
  sectionTitleStyle,
} from './components/compiler-types.js';
export { CtaBlock } from './components/cta-block.js';
export { DataGrid } from './components/data-grid.js';
export { Decorative } from './components/decorative.js';
export { FeatureList } from './components/feature-list.js';
export { HeadlineBlock } from './components/headline-block.js';
export { IconGrid } from './components/icon-grid.js';
export { Input, type InputProps } from './components/input.js';
export { LegalBlock } from './components/legal-block.js';
export { MediaBlock } from './components/media-block.js';
export { ProductCenterpiece } from './components/product-centerpiece.js';
export { ProductGallery } from './components/product-gallery.js';
export { QrCode } from './components/qr-code.js';
export { Separator } from './components/separator.js';
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from './components/sidebar.js';
export { Skeleton } from './components/skeleton.js';
export { SubheadlineBlock } from './components/subheadline-block.js';
export {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './components/table.js';
export { TenantBrandHeader } from './components/tenant-brand-header.js';
export { TenantFooter } from './components/tenant-footer.js';
export { Testimonial } from './components/testimonial.js';
export { Textarea, type TextareaProps } from './components/textarea.js';
export { cn } from './lib/utils.js';
