import { NextResponse } from 'next/server';
import { globalParserRegistry } from '@/server/parser/parserRegistry';

export async function GET() {
  const sources = globalParserRegistry.getSupportedSources();
  return NextResponse.json({
    code: 200,
    success: true,
    message: 'success',
    data: {
      total: sources.length,
      list: sources,
    },
  });
}
