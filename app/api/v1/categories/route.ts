import { NextResponse } from 'next/server';
import { globalMacCmsClient } from '@/server/maccms/macCmsClient';

export async function GET() {
  try {
    const categories = await globalMacCmsClient.getCategories();
    return NextResponse.json({
      code: 200,
      success: true,
      message: 'success',
      data: categories,
    });
  } catch (error: any) {
    return NextResponse.json({
      code: 500,
      success: false,
      message: error.message || '获取电影分类失败',
      error: 'FETCH_CATEGORIES_ERROR',
    }, { status: 500 });
  }
}
