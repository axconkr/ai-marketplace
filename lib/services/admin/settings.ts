import { prisma } from '@/lib/prisma';
import type { Announcement, Category } from '@prisma/client';
import { AnnouncementType } from '@prisma/client';
import { AdminListParams, AdminListResult, AdminActionResult } from './types';
import { buildPaginationQuery, buildPaginationInfo } from './utils';

// ==========================================
// System Settings
// ==========================================

/**
 * Get all system settings
 */
export async function getSystemSettings(): Promise<
  Array<{ key: string; value: any; description: string | null }>
> {
  const settings = await prisma.systemSettings.findMany({
    select: {
      key: true,
      value: true,
      description: true,
    },
  });

  return settings;
}

/**
 * Update single system setting
 */
export async function updateSystemSetting(
  key: string,
  value: any,
  adminId: string
): Promise<AdminActionResult> {
  try {
    await prisma.systemSettings.upsert({
      where: { key },
      create: {
        key,
        value,
        updated_by: adminId,
      },
      update: {
        value,
        updated_by: adminId,
      },
    });

    return {
      success: true,
      message: `System setting '${key}' updated successfully`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update system setting: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Get current platform fee rate (default 0.15 = 15%)
 */
export async function getPlatformFeeRate(): Promise<number> {
  const setting = await prisma.systemSettings.findUnique({
    where: { key: 'platform_fee_rate' },
  });

  if (!setting) {
    return 0.15; // Default 15%
  }

  const rate = typeof setting.value === 'object' && setting.value !== null
    ? (setting.value as any).rate || 0.15
    : (setting.value as number) || 0.15;

  return rate;
}

/**
 * Update fee rate (validate 0.01-0.50 range)
 */
export async function updatePlatformFeeRate(
  rate: number,
  adminId: string
): Promise<AdminActionResult> {
  // Validate fee rate is between 1% and 50%
  if (rate < 0.01 || rate > 0.5) {
    return {
      success: false,
      message: 'Platform fee rate must be between 0.01 (1%) and 0.50 (50%)',
    };
  }

  try {
    await prisma.systemSettings.upsert({
      where: { key: 'platform_fee_rate' },
      create: {
        key: 'platform_fee_rate',
        value: { rate },
        description: 'Platform fee rate as a decimal (0.01 = 1%, 0.50 = 50%)',
        updated_by: adminId,
      },
      update: {
        value: { rate },
        updated_by: adminId,
      },
    });

    return {
      success: true,
      message: `Platform fee rate updated to ${(rate * 100).toFixed(2)}%`,
      data: { rate },
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update platform fee rate: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// ==========================================
// Announcements
// ==========================================

/**
 * List announcements with filters (type, is_active)
 */
export async function listAnnouncements(
  params: AdminListParams & { type?: AnnouncementType; is_active?: boolean }
): Promise<AdminListResult<Announcement>> {
  const pagination = buildPaginationQuery(params);

  const where: any = {};
  if (params.type) where.type = params.type;
  if (params.is_active !== undefined) where.is_active = params.is_active;
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { content: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: {
        [params.sortBy || 'created_at']: params.sortOrder || 'desc',
      },
    }),
    prisma.announcement.count({ where }),
  ]);

  return {
    items,
    pagination: buildPaginationInfo(total, params),
  };
}

/**
 * Create new announcement
 */
export async function createAnnouncement(data: {
  title: string;
  content: string;
  type?: AnnouncementType;
  start_date?: Date;
  end_date?: Date;
}): Promise<AdminActionResult> {
  try {
    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type || AnnouncementType.INFO,
        start_date: data.start_date,
        end_date: data.end_date,
      },
    });

    return {
      success: true,
      message: 'Announcement created successfully',
      data: announcement,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to create announcement: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Update announcement
 */
export async function updateAnnouncement(
  id: string,
  data: Partial<{
    title: string;
    content: string;
    type: AnnouncementType;
    is_active: boolean;
    start_date: Date;
    end_date: Date;
  }>
): Promise<AdminActionResult> {
  try {
    const announcement = await prisma.announcement.update({
      where: { id },
      data,
    });

    return {
      success: true,
      message: 'Announcement updated successfully',
      data: announcement,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('not found')
    ) {
      return {
        success: false,
        message: 'Announcement not found',
      };
    }
    return {
      success: false,
      message: `Failed to update announcement: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Soft delete announcement (set is_active=false)
 */
export async function deleteAnnouncement(id: string): Promise<AdminActionResult> {
  try {
    const announcement = await prisma.announcement.update({
      where: { id },
      data: { is_active: false },
    });

    return {
      success: true,
      message: 'Announcement deleted successfully',
      data: announcement,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('not found')
    ) {
      return {
        success: false,
        message: 'Announcement not found',
      };
    }
    return {
      success: false,
      message: `Failed to delete announcement: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// ==========================================
// Categories
// ==========================================

/**
 * List categories with hierarchy
 */
export async function listCategories(
  params: AdminListParams & { parent_id?: string | null }
): Promise<AdminListResult<Category & { children?: Category[] }>> {
  const pagination = buildPaginationQuery(params);

  const where: any = {
    is_active: true,
  };

  if (params.parent_id !== undefined) {
    where.parent_id = params.parent_id;
  }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { slug: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.category.findMany({
      where,
      include: {
        children: {
          where: { is_active: true },
          orderBy: { sort_order: 'asc' },
        },
      },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: {
        [params.sortBy || 'sort_order']: params.sortOrder || 'asc',
      },
    }),
    prisma.category.count({ where }),
  ]);

  return {
    items,
    pagination: buildPaginationInfo(total, params),
  };
}

/**
 * Create category
 */
export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  sort_order?: number;
}): Promise<AdminActionResult> {
  try {
    // Check for duplicate slug
    const existingCategory = await prisma.category.findUnique({
      where: { slug: data.slug },
    });

    if (existingCategory) {
      return {
        success: false,
        message: `Category with slug '${data.slug}' already exists`,
      };
    }

    // Validate parent_id exists if provided
    if (data.parent_id) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: data.parent_id },
      });

      if (!parentCategory) {
        return {
          success: false,
          message: 'Parent category not found',
        };
      }
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        parent_id: data.parent_id,
        sort_order: data.sort_order || 0,
      },
    });

    return {
      success: true,
      message: 'Category created successfully',
      data: category,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to create category: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Update category
 */
export async function updateCategory(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    parent_id: string;
    sort_order: number;
    is_active: boolean;
  }>
): Promise<AdminActionResult> {
  try {
    // Check for duplicate slug if slug is being updated
    if (data.slug) {
      const existingCategory = await prisma.category.findUnique({
        where: { slug: data.slug },
      });

      if (existingCategory && existingCategory.id !== id) {
        return {
          success: false,
          message: `Category with slug '${data.slug}' already exists`,
        };
      }
    }

    // Validate parent_id exists if being updated
    if (data.parent_id) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: data.parent_id },
      });

      if (!parentCategory) {
        return {
          success: false,
          message: 'Parent category not found',
        };
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    return {
      success: true,
      message: 'Category updated successfully',
      data: category,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('not found')
    ) {
      return {
        success: false,
        message: 'Category not found',
      };
    }
    return {
      success: false,
      message: `Failed to update category: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Soft delete category (check no products using it first via Product.category field)
 */
export async function deleteCategory(id: string): Promise<AdminActionResult> {
  try {
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return {
        success: false,
        message: 'Category not found',
      };
    }

    // Check if any products are using this category (by slug)
    const productsUsingCategory = await prisma.product.count({
      where: {
        category: category.slug,
      },
    });

    if (productsUsingCategory > 0) {
      return {
        success: false,
        message: `Cannot delete category. ${productsUsingCategory} product(s) are using this category`,
      };
    }

    // Check if category has active child categories
    const hasActiveChildren = await prisma.category.count({
      where: {
        parent_id: id,
        is_active: true,
      },
    });

    if (hasActiveChildren > 0) {
      return {
        success: false,
        message: `Cannot delete category. It has ${hasActiveChildren} active subcategory(ies). Please delete or reassign them first`,
      };
    }

    // Soft delete by setting is_active to false
    await prisma.category.update({
      where: { id },
      data: { is_active: false },
    });

    return {
      success: true,
      message: 'Category deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to delete category: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
