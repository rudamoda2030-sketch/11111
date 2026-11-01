import { NextResponse } from 'next/server';
import { runFullParserTestSuite } from '@/server/tests/parserUnitTestSuite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const report = await runFullParserTestSuite();
    return NextResponse.json({
      code: 200,
      success: report.failed === 0,
      message: report.failed === 0 ? '所有解析单元与集成测试全部通过' : '部分测试未通过',
      data: report,
    });
  } catch (err: any) {
    return NextResponse.json({
      code: 500,
      success: false,
      message: err.message || '运行测试套件发生异常',
    }, { status: 500 });
  }
}
