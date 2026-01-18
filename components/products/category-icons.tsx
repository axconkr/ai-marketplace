import {
  Workflow,
  Bot,
  Smartphone,
  Cloud,
  FileText,
  Zap,
  MoreHorizontal,
  LucideIcon,
} from 'lucide-react';
import { ProductCategory } from '@/lib/validations/product';

/**
 * Category icon mapping for visual representation
 */
export const CATEGORY_ICONS: Record<ProductCategory, LucideIcon> = {
  n8n: Workflow,
  make: Zap,
  ai_agent: Bot,
  app: Smartphone,
  api: Cloud,
  prompt: FileText,
  other: MoreHorizontal,
};

interface CategoryIconProps {
  category: ProductCategory;
  className?: string;
}

export function CategoryIcon({ category, className }: CategoryIconProps) {
  const Icon = CATEGORY_ICONS[category];
  return <Icon className={className} />;
}
