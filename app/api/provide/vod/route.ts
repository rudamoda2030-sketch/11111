import { NextRequest, NextResponse } from 'next/server';
import { globalMacCmsClient } from '@/server/maccms/macCmsClient';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ac = (searchParams.get('ac') || 'list') as 'list' | 'videolist' | 'detail';
  const pg = parseInt(searchParams.get('pg') || '1', 10);
  const t = searchParams.get('t') ? parseInt(searchParams.get('t')!, 10) : undefined;
  const wd = searchParams.get('wd') || undefined;
  const ids = searchParams.get('ids') || undefined;
  const h = searchParams.get('h') ? parseInt(searchParams.get('h')!, 10) : undefined;

  try {
    const { response } = await globalMacCmsClient.fetchProvide({
      ac: ['list', 'videolist', 'detail'].includes(ac) ? ac : 'list',
      pg,
      t,
      wd,
      ids,
      h,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({
      code: 0,
      msg: error.message || '获取 MacCMS Provide 数据异常',
      page: pg,
      pagecount: 0,
      limit: 20,
      total: 0,
      list: [],
    }, { status: 500 });
  }
}
