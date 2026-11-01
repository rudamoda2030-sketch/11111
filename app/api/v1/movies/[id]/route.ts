import { NextRequest, NextResponse } from 'next/server';
import { globalMacCmsClient } from '@/server/maccms/macCmsClient';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({
      code: 400,
      success: false,
      message: '缺少影片 ID',
      error: 'INVALID_ID',
    }, { status: 400 });
  }

  try {
    const movie = await globalMacCmsClient.getMovieById(id);
    if (!movie) {
      return NextResponse.json({
        code: 404,
        success: false,
        message: '未找到该影片详情',
        error: 'MOVIE_NOT_FOUND',
      }, { status: 404 });
    }

    return NextResponse.json({
      code: 200,
      success: true,
      message: 'success',
      data: movie,
    });
  } catch (error: any) {
    return NextResponse.json({
      code: 500,
      success: false,
      message: error.message || '获取影片详情失败',
      error: 'FETCH_MOVIE_DETAIL_ERROR',
    }, { status: 500 });
  }
}
