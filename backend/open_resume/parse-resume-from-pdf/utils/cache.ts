import type { Resume } from "../../lib/redux/types";

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
}

export class ResumeParserCache {
  private cache: Map<string, CacheEntry<Resume>>;
  private maxSize: number;
  private defaultTTL: number;
  
  constructor(maxSize = 100, defaultTTLMs = 3600000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTLMs;
  }
  
  private generateKey(fileUrl: string, options?: Record<string, unknown>): string {
    const hash = Buffer.from(fileUrl).toString('base64').slice(0, 32);
    const optionsHash = options ? JSON.stringify(options) : '';
    return `${hash}:${optionsHash}`;
  }
  
  get(fileUrl: string, options?: Record<string, unknown>): Resume | null {
    const key = this.generateKey(fileUrl, options);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > this.defaultTTL) {
      this.cache.delete(key);
      return null;
    }
    
    entry.hits++;
    return entry.data;
  }
  
  set(fileUrl: string, data: Resume, options?: Record<string, unknown>): void {
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }
    
    const key = this.generateKey(fileUrl, options);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0,
    });
  }
  
  has(fileUrl: string, options?: Record<string, unknown>): boolean {
    return this.get(fileUrl, options) !== null;
  }
  
  invalidate(fileUrl: string): void {
    const prefix = Buffer.from(fileUrl).toString('base64').slice(0, 32);
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cache.delete(key));
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  private evictLeastUsed(): void {
    let minHits = Infinity;
    let minKey: string | null = null;
    
    this.cache.forEach((entry, key) => {
      if (entry.hits < minHits) {
        minHits = entry.hits;
        minKey = key;
      }
    });
    
    if (minKey) {
      this.cache.delete(minKey);
    }
  }
  
  getStats(): { size: number; maxSize: number; hitRate: number } {
    let totalHits = 0;
    this.cache.forEach((entry) => {
      totalHits += entry.hits;
    });
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.cache.size > 0 ? totalHits / this.cache.size : 0,
    };
  }
}

export const parserCache = new ResumeParserCache();

export const hashFile = async (buffer: ArrayBuffer): Promise<string> => {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const fileHashCache = new Map<string, string>();
