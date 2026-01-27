import { mockContent } from './mock-data';
import type {
  ContentItem,
  ContentFilters,
  ContentService,
  ContentStats,
  ContentType,
  CreateContentInput,
  UpdateContentInput,
} from './types';

let content: ContentItem[] = [...mockContent];

function filterContent(items: ContentItem[], filters?: ContentFilters): ContentItem[] {
  let result = [...items];

  if (filters?.type) {
    result = result.filter((item) => item.type === filters.type);
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(
      (item) =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.author?.toLowerCase().includes(searchLower) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  }

  if (filters?.featured !== undefined) {
    result = result.filter((item) => item.featured === filters.featured);
  }

  const sortBy = filters?.sortBy || 'createdAt';
  const sortOrder = filters?.sortOrder || 'desc';

  result.sort((a, b) => {
    let aVal: string | number = '';
    let bVal: string | number = '';

    switch (sortBy) {
      case 'title':
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
        break;
      case 'publishedDate':
        aVal = a.publishedDate || a.createdAt;
        bVal = b.publishedDate || b.createdAt;
        break;
      case 'createdAt':
      default:
        aVal = a.createdAt;
        bVal = b.createdAt;
    }

    if (sortOrder === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    }
    return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
  });

  if (filters?.offset) {
    result = result.slice(filters.offset);
  }

  if (filters?.limit) {
    result = result.slice(0, filters.limit);
  }

  return result;
}

export const contentService: ContentService = {
  async getAll(filters?: ContentFilters): Promise<ContentItem[]> {
    return filterContent(content, filters);
  },

  async getById(id: string): Promise<ContentItem | null> {
    return content.find((item) => item.id === id) || null;
  },

  async getFeatured(): Promise<ContentItem[]> {
    return filterContent(content, { featured: true, limit: 4 });
  },

  async getRecent(limit = 6): Promise<ContentItem[]> {
    return filterContent(content, { sortBy: 'createdAt', sortOrder: 'desc', limit });
  },

  async getByType(type: ContentType, filters?: ContentFilters): Promise<ContentItem[]> {
    return filterContent(content, { ...filters, type });
  },

  async create(data: CreateContentInput): Promise<ContentItem> {
    const now = new Date().toISOString();
    const newItem: ContentItem = {
      id: String(Date.now()),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    content.unshift(newItem);
    return newItem;
  },

  async update(id: string, data: UpdateContentInput): Promise<ContentItem> {
    const index = content.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Content with id ${id} not found`);
    }

    const updated: ContentItem = {
      ...content[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    content[index] = updated;
    return updated;
  },

  async delete(id: string): Promise<void> {
    const index = content.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Content with id ${id} not found`);
    }
    content.splice(index, 1);
  },

  async getStats(): Promise<ContentStats> {
    return {
      total: content.length,
      books: content.filter((item) => item.type === 'book').length,
      magazines: content.filter((item) => item.type === 'magazine').length,
      newspapers: content.filter((item) => item.type === 'newspaper').length,
    };
  },
};
