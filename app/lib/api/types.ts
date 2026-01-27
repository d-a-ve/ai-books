export type ContentType = 'book' | 'magazine' | 'newspaper';

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  author?: string;
  publisher?: string;
  coverUrl: string;
  fileUrl: string;
  previewUrl?: string;
  pageCount?: number;
  publishedDate?: string;
  createdAt: string;
  updatedAt: string;
  featured?: boolean;
  tags?: string[];
}

export interface ContentFilters {
  type?: ContentType;
  search?: string;
  featured?: boolean;
  sortBy?: 'title' | 'createdAt' | 'publishedDate';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateContentInput {
  type: ContentType;
  title: string;
  description: string;
  author?: string;
  publisher?: string;
  coverUrl: string;
  fileUrl: string;
  previewUrl?: string;
  pageCount?: number;
  publishedDate?: string;
  featured?: boolean;
  tags?: string[];
}

export interface UpdateContentInput {
  type?: ContentType;
  title?: string;
  description?: string;
  author?: string;
  publisher?: string;
  coverUrl?: string;
  fileUrl?: string;
  previewUrl?: string;
  pageCount?: number;
  publishedDate?: string;
  featured?: boolean;
  tags?: string[];
}

export interface ContentService {
  getAll(filters?: ContentFilters): Promise<ContentItem[]>;
  getById(id: string): Promise<ContentItem | null>;
  getFeatured(): Promise<ContentItem[]>;
  getRecent(limit?: number): Promise<ContentItem[]>;
  getByType(type: ContentType, filters?: ContentFilters): Promise<ContentItem[]>;
  create(data: CreateContentInput): Promise<ContentItem>;
  update(id: string, data: UpdateContentInput): Promise<ContentItem>;
  delete(id: string): Promise<void>;
  getStats(): Promise<ContentStats>;
}

export interface ContentStats {
  total: number;
  books: number;
  magazines: number;
  newspapers: number;
}

export interface UploadResult {
  url: string;
  filename: string;
}

export interface UploadService {
  uploadFile(file: File): Promise<UploadResult>;
  uploadCover(file: File): Promise<UploadResult>;
  deleteFile(url: string): Promise<void>;
}
