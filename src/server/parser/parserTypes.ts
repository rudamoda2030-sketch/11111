import { StreamType } from '@/types/parser';

export interface StreamAdapter {
  id: string;
  name: string;
  canHandle(url: string, sourceCode?: string): boolean;
  parse(url: string, context?: { sourceCode?: string; title?: string }): Promise<{
    type: StreamType;
    cleanUrl: string;
    headers?: Record<string, string>;
    expireAt?: number | null;
  }>;
}
