import { NextRequest, NextResponse } from 'next/server';
import { globalMacCmsClient } from '@/server/maccms/macCmsClient';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const typeId = searchParams.get('typeId') ? parseInt(searchParams.get('typeId')!, 10) : undefined;
  const keyword = searchParams.get('keyword') || searchParams.get('wd') || undefined;
  const hours = searchParams.get('hours') ? parseInt(searchParams.get('hours')!, 10) : undefined;

  try {
    const result = await globalMacCmsClient.getMovies({
      page,
      typeId,
      keyword,
      hours,
    });

    return NextResponse.json({
      code: 200,
      success: true,
      message: 'success',
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json({
      code: 500,
      success: false,
      message: error.message || '获取影片列表失败',
      error: 'FETCH_MOVIES_ERROR',
    }, { status: 500 });
  }
}
