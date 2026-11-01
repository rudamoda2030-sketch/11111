import {
  MacCmsVideo,
  parseMacCmsSources,
  validatePlaybackUrl,
  getSourceNames,
  splitGroups,
  parseEpisode,
  ParserError,
} from '@/server/parser/maccms-parser';
import { globalMacCmsClient } from '@/server/maccms/macCmsClient';

export interface UnitTestResult {
  id: string;
  name: string;
  category: '单元测试' | '集成测试' | '流媒体验证' | '安全防御';
  status: 'passed' | 'failed';
  durationMs: number;
  expected: string;
  actual: string;
  details?: any;
}

export async function runFullParserTestSuite(): Promise<{
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  results: UnitTestResult[];
}> {
  const overallStart = Date.now();
  const results: UnitTestResult[] = [];

  // ==========================================
  // Test 1: 单线路单剧集解析
  // ==========================================
  {
    const start = Date.now();
    try {
      const video: MacCmsVideo = {
        vod_id: 1,
        vod_name: '单片测试',
        vod_play_from: 'kkm3u8',
        vod_play_url: '正片$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      };
      const sources = parseMacCmsSources(video);
      const isPass = 
        sources.length === 1 &&
        sources[0].name === 'kkm3u8' &&
        sources[0].episodes.length === 1 &&
        sources[0].episodes[0].title === '正片';

      results.push({
        id: 'UT-01',
        name: '单线路单剧集标准解析',
        category: '单元测试',
        status: isPass ? 'passed' : 'failed',
        durationMs: Date.now() - start,
        expected: '1条线路，1集正片',
        actual: `${sources.length}条线路，${sources[0]?.episodes?.length || 0}集`,
      });
    } catch (e: any) {
      results.push({
        id: 'UT-01',
        name: '单线路单剧集标准解析',
        category: '单元测试',
        status: 'failed',
        durationMs: Date.now() - start,
        expected: '1条线路，1集正片',
        actual: `异常: ${e.message}`,
      });
    }
  }

  // ==========================================
  // Test 2: 多线路 ($$$) 多剧集 (# 与 $) 解析
  // ==========================================
  {
    const start = Date.now();
    try {
      const video: MacCmsVideo = {
        vod_id: 2,
        vod_name: '多线路多集剧集测试',
        vod_play_from: 'kkm3u8$$$ffm3u8$$$mp4',
        vod_play_url:
          '第01集$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8#第02集$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' +
          '$$$' +
          '第01集$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8#第02集$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' +
          '$$$' +
          '第01集$https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4#第02集$https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      };
      const sources = parseMacCmsSources(video);
      const isPass =
        sources.length === 3 &&
        sources[0].episodes.length === 2 &&
        sources[1].episodes.length === 2 &&
        sources[2].episodes.length === 2 &&
        sources[0].episodes[1].title === '第02集';

      results.push({
        id: 'UT-02',
        name: '多线路 ($$$) 与多剧集 (# 与 $) 零丢失映射',
        category: '单元测试',
        status: isPass ? 'passed' : 'failed',
        durationMs: Date.now() - start,
        expected: '3条独立线路，每条线路精准对应2集',
        actual: `成功解析 ${sources.length} 条线路，第1线集数: ${sources[0]?.episodes?.length}`,
      });
    } catch (e: any) {
      results.push({
        id: 'UT-02',
        name: '多线路 ($$$) 与多剧集 (# 与 $) 零丢失映射',
        category: '单元测试',
        status: 'failed',
        durationMs: Date.now() - start,
        expected: '3条独立线路',
        actual: `异常: ${e.message}`,
      });
    }
  }

  // ==========================================
  // Test 3: 逗号分隔的播放线路名称兼容测试
  // ==========================================
  {
    const start = Date.now();
    try {
      const video: MacCmsVideo = {
        vod_id: 3,
        vod_name: '逗号线路测试',
        vod_play_from: '极速蓝光,量子极速,官方MP4',
        vod_play_url:
          '第01集$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8$$$第01集$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8$$$第01集$https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      };
      const sources = parseMacCmsSources(video);
      const isPass =
        sources.length === 3 &&
        sources[0].name === '极速蓝光' &&
        sources[1].name === '量子极速' &&
        sources[2].name === '官方MP4';

      results.push({
        id: 'UT-03',
        name: '兼容逗号分隔播放线路与 $$$ 播放地址组',
        category: '单元测试',
        status: isPass ? 'passed' : 'failed',
        durationMs: Date.now() - start,
        expected: '极速蓝光, 量子极速, 官方MP4',
        actual: sources.map((s) => s.name).join(', '),
      });
    } catch (e: any) {
      results.push({
        id: 'UT-03',
        name: '兼容逗号分隔播放线路与 $$$ 播放地址组',
        category: '单元测试',
        status: 'failed',
        durationMs: Date.now() - start,
        expected: '极速蓝光, 量子极速, 官方MP4',
        actual: `异常: ${e.message}`,
      });
    }
  }

  // ==========================================
  // Test 4: 播放线路数量不对齐时的平滑容错
  // ==========================================
  {
    const start = Date.now();
    try {
      // 采集源只提供了1个名字，但地址有3组
      const video: MacCmsVideo = {
        vod_id: 4,
        vod_name: '容错测试',
        vod_play_from: '主线路',
        vod_play_url:
          '第1集$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8$$$第1集$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8$$$第1集$https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      };
      const sources = parseMacCmsSources(video);
      const isPass = sources.length === 3 && sources[0].name === '主线路' && sources[1].name === '线路2';

      results.push({
        id: 'UT-04',
        name: '线路与地址数量不对齐平滑容错（不崩溃）',
        category: '单元测试',
        status: isPass ? 'passed' : 'failed',
        durationMs: Date.now() - start,
        expected: '自动补齐为3条线路，首线路保留原名',
        actual: sources.map((s) => s.name).join(', '),
      });
    } catch (e: any) {
      results.push({
        id: 'UT-04',
        name: '线路与地址数量不对齐平滑容错（不崩溃）',
        category: '单元测试',
        status: 'failed',
        durationMs: Date.now() - start,
        expected: '自动补齐为3条线路',
        actual: `异常: ${e.message}`,
      });
    }
  }

  // ==========================================
  // Test 5: 空地址与空剧集过滤测试
  // ==========================================
  {
    const start = Date.now();
    try {
      const video: MacCmsVideo = {
        vod_id: 5,
        vod_name: '空尾部剧集测试',
        vod_play_from: 'kkm3u8',
        vod_play_url: '第01集$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8##', // Trailing empty episodes
      };
      const sources = parseMacCmsSources(video);
      const isPass = sources.length === 1 && sources[0].episodes.length === 1;

      results.push({
        id: 'UT-05',
        name: '尾部空 `#` 剧集与空白格式安全过滤',
        category: '单元测试',
        status: isPass ? 'passed' : 'failed',
        durationMs: Date.now() - start,
        expected: '过滤空条目，保留1集有效数据',
        actual: `保留集数: ${sources[0]?.episodes?.length}`,
      });
    } catch (e: any) {
      results.push({
        id: 'UT-05',
        name: '尾部空 `#` 剧集与空白格式安全过滤',
        category: '单元测试',
        status: 'failed',
        durationMs: Date.now() - start,
        expected: '过滤空条目',
        actual: `异常: ${e.message}`,
      });
    }
  }

  // ==========================================
  // Test 6: 第三方广告解析网页深度拦截测试
  // ==========================================
  {
    const start = Date.now();
    try {
      const adUrls = [
        'https://jx.example.com/player.php?url=https://v.qq.com/x/cover/123.html',
        'https://cdn.example.com/jiexi/play.html?url=test',
        'https://media.example.com/video.php?id=888',
      ];

      let blockedCount = 0;
      for (const adUrl of adUrls) {
        try {
          validatePlaybackUrl(adUrl);
        } catch (err: any) {
          if (err instanceof ParserError && err.status === 422) {
            blockedCount++;
          }
        }
      }

      const isPass = blockedCount === adUrls.length;

      results.push({
        id: 'UT-06',
        name: '第三方广告解析网页与跳转页面深度拦截',
        category: '安全防御',
        status: isPass ? 'passed' : 'failed',
        durationMs: Date.now() - start,
        expected: '拦截全部 3 个第三方带广告解析网页',
        actual: `成功拦截 ${blockedCount}/${adUrls.length} 个广告解析地址`,
      });
    } catch (e: any) {
      results.push({
        id: 'UT-06',
        name: '第三方广告解析网页与跳转页面深度拦截',
        category: '安全防御',
        status: 'failed',
        durationMs: Date.now() - start,
        expected: '拦截全部广告解析网页',
        actual: `异常: ${e.message}`,
      });
    }
  }

  // ==========================================
  // Test 7: 未知未授权域名严格阻断
  // ==========================================
  {
    const start = Date.now();
    try {
      const unauthorizedUrl = 'https://unknown-malicious-domain.com/movie/test.m3u8';
      let wasBlocked = false;
      let blockReason = '';

      try {
        validatePlaybackUrl(unauthorizedUrl);
      } catch (err: any) {
        if (err instanceof ParserError && err.status === 403) {
          wasBlocked = true;
          blockReason = err.message;
        }
      }

      results.push({
        id: 'UT-07',
        name: '非白名单未知域名严格阻断 (HTTP 403)',
        category: '安全防御',
        status: wasBlocked ? 'passed' : 'failed',
        durationMs: Date.now() - start,
        expected: '返回 HTTP 403 白名单拦截错误',
        actual: wasBlocked ? `正确拦截: ${blockReason}` : '未被拦截 (错误放行)',
      });
    } catch (e: any) {
      results.push({
        id: 'UT-07',
        name: '非白名单未知域名严格阻断 (HTTP 403)',
        category: '安全防御',
        status: 'failed',
        durationMs: Date.now() - start,
        expected: '正确拦截',
        actual: `异常: ${e.message}`,
      });
    }
  }

  // ==========================================
  // Test 8: 真实授权 M3U8 格式直连测试
  // ==========================================
  {
    const start = Date.now();
    try {
      const hlsUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
      const validated = validatePlaybackUrl(hlsUrl);
      const isPass = validated.type === 'hls' && validated.url.startsWith('https://');

      results.push({
        id: 'UT-08',
        name: '授权 HLS/M3U8 直链格式识别与协议规范化',
        category: '流媒体验证',
        status: isPass ? 'passed' : 'failed',
        durationMs: Date.now() - start,
        expected: 'type: hls',
        actual: `type: ${validated.type}, url: ${validated.url}`,
      });
    } catch (e: any) {
      results.push({
        id: 'UT-08',
        name: '授权 HLS/M3U8 直链格式识别与协议规范化',
        category: '流媒体验证',
        status: 'failed',
        durationMs: Date.now() - start,
        expected: 'type: hls',
        actual: `异常: ${e.message}`,
      });
    }
  }

  // ==========================================
  // Test 9: 真实授权 MP4 格式直连测试
  // ==========================================
  {
    const start = Date.now();
    try {
      const mp4Url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
      const validated = validatePlaybackUrl(mp4Url);
      const isPass = validated.type === 'mp4' && validated.url.startsWith('https://');

      results.push({
        id: 'UT-09',
        name: '授权 MP4 高品质原画直链识别',
        category: '流媒体验证',
        status: isPass ? 'passed' : 'failed',
        durationMs: Date.now() - start,
        expected: 'type: mp4',
        actual: `type: ${validated.type}, url: ${validated.url}`,
      });
    } catch (e: any) {
      results.push({
        id: 'UT-09',
        name: '授权 MP4 高品质原画直链识别',
        category: '流媒体验证',
        status: 'failed',
        durationMs: Date.now() - start,
        expected: 'type: mp4',
        actual: `异常: ${e.message}`,
      });
    }
  }

  // ==========================================
  // Test 10: 实际 MacCMS ac=videolist 数据读取集成测试
  // ==========================================
  {
    const start = Date.now();
    try {
      const provideRes = await globalMacCmsClient.fetchProvide({
        ac: 'videolist',
        ids: '1001',
      });

      const items = provideRes.response.list || [];
      const item = items[0];
      const sources = parseMacCmsSources({
        vod_id: item.vod_id,
        vod_name: item.vod_name,
        vod_play_from: item.vod_play_from || '',
        vod_play_url: item.vod_play_url || '',
      });

      const isPass = sources.length >= 2 && sources[0].episodes.length >= 1;

      results.push({
        id: 'INT-10',
        name: 'MacCMS ac=videolist 完整数据读取与解析集成测试',
        category: '集成测试',
        status: isPass ? 'passed' : 'failed',
        durationMs: Date.now() - start,
        expected: '成功通过 ac=videolist 获取并解析出多条线路与集数',
        actual: `成功提取影片 [${item.vod_name}]，包含 ${sources.length} 条线路`,
      });
    } catch (e: any) {
      results.push({
        id: 'INT-10',
        name: 'MacCMS ac=videolist 完整数据读取与解析集成测试',
        category: '集成测试',
        status: 'failed',
        durationMs: Date.now() - start,
        expected: '成功提取影片并解析',
        actual: `异常: ${e.message}`,
      });
    }
  }

  const passed = results.filter((r) => r.status === 'passed').length;
  const failed = results.filter((r) => r.status === 'failed').length;

  return {
    total: results.length,
    passed,
    failed,
    durationMs: Date.now() - overallStart,
    results,
  };
}
