import type { UploadResult, UploadService } from './types';

export const uploadService: UploadService = {
  async uploadFile(file: File): Promise<UploadResult> {
    // Mock implementation - simulates file upload
    // In production, this would upload to external storage API
    const filename = `${Date.now()}-${file.name}`;
    const url = `/uploads/files/${filename}`;
    
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return { url, filename };
  },

  async uploadCover(file: File): Promise<UploadResult> {
    // Mock implementation - simulates cover image upload
    // In production, this would upload to external storage API
    const filename = `${Date.now()}-${file.name}`;
    const url = `/uploads/covers/${filename}`;
    
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    return { url, filename };
  },

  async deleteFile(url: string): Promise<void> {
    // Mock implementation - simulates file deletion
    // In production, this would delete from external storage API
    await new Promise((resolve) => setTimeout(resolve, 200));
    console.log(`Deleted file: ${url}`);
  },
};
