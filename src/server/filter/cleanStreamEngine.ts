/**
 * 智能防博彩与纯净流媒体清洗引擎
 * 针对采集站常见的：
 * 1. 剧集名称混入的博彩推广字符（如：第01集【澳门新葡京开元棋牌送88】）
 * 2. 赌博与博彩域名、URL 关键字特征
 * 3. M3U8 切片中的前置插播贴片广告（如片头 15-60 秒的澳门荷官视频切片）
 * 进行全自动净化与高优先级纯净线筛选
 */

// 常见博彩、赌博与违规推广词库
export const GAMBLING_KEYWORDS = [
  '新葡京', '威尼斯人', '开元棋牌', '皇冠体育', '荷官', '在线发牌',
  '特邀送', '彩票', '在线赌场', '博彩', '返水', '首存', '充值送',
  '永利', '金沙', '娱乐城', '太阳城', '易记域名', '发牌', '百家乐',
  '真人视讯', '投注', '备用网址', '官方直营', '大额无忧', '老葡京'
];

export interface CleanEpisodeInfo {
  cleanTitle: string;
  originalTitle: string;
  hasGamblingAd: boolean;
  cleanUrl: string;
}

export class CleanStreamEngine {
  /**
   * 自动净化剧集名称，抹除混杂在集数中的博彩推广尾巴
   * 例如："第01集【澳门新葡京送88元】" -> "第01集"
   * 例如："HD1080P【荷官发牌】" -> "HD1080P"
   */
  public static sanitizeEpisodeTitle(title: string): { cleanTitle: string; hasGamblingAd: boolean } {
    if (!title) return { cleanTitle: '正片', hasGamblingAd: false };

    let cleaned = title.trim();
    let detected = false;

    // 检查是否包含赌博敏感词
    for (const kw of GAMBLING_KEYWORDS) {
      if (cleaned.includes(kw)) {
        detected = true;
        // 移除匹配的词
        cleaned = cleaned.replaceAll(kw, '');
      }
    }

    // 移除各类广告括号【...】、[...]、(...)、{...}
    cleaned = cleaned
      .replace(/【[^】]*】/g, '')
      .replace(/\[[^\]]*\]/g, '')
      .replace(/\([^\)]*\)/g, '')
      .replace(/\{[^\}]*\}/g, '')
      .replace(/(www\.[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,})/gi, '')
      .replace(/([a-zA-Z0-9\-]+\.(com|net|org|cc|tv|vip|app|xyz))/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    // 如果被清空了，恢复标准集数
    if (!cleaned) {
      cleaned = '正片';
    }

    return {
      cleanTitle: cleaned,
      hasGamblingAd: detected,
    };
  }

  /**
   * 检查 URL 是否包含已知的博彩或广告跳转特征
   */
  public static isSuspiciousAdUrl(url: string): boolean {
    if (!url) return false;
    const lower = url.toLowerCase();

    // 检查 URL 路径或参数中是否有博彩简写
    const suspiciousTokens = [
      'xpj', 'amxpj', 'vns', 'bocai', 'bet365', 'hg88', '777bet', 'ylbet',
      'jiexi', 'player.php?url=', 'jx.php?url=', 'parse.php', '/ad/', 'adv.m3u8'
    ];

    for (const token of suspiciousTokens) {
      if (lower.includes(token)) return true;
    }

    return false;
  }

  /**
   * 智能线路评分与优选：
   * 优先推荐官方/自建 CDN、无博彩污染的线路置顶为「智能纯净线」
   */
  public static scoreSourceQuality(sourceName: string, sampleUrl: string): {
    score: number;
    recommendedTag: string;
    isClean: boolean;
  } {
    let score = 100;
    const lowerName = sourceName.toLowerCase();
    const lowerUrl = sampleUrl.toLowerCase();

    // 含有博彩特征大幅扣分
    if (this.isSuspiciousAdUrl(sampleUrl)) {
      score -= 80;
    }

    for (const kw of GAMBLING_KEYWORDS) {
      if (sourceName.includes(kw)) {
        score -= 90;
      }
    }

    // 官方直通与标准流媒体加分
    if (lowerUrl.includes('googleapis') || lowerUrl.includes('mux.dev') || lowerUrl.includes('cdn')) {
      score += 20;
    }
    if (lowerName.includes('蓝光') || lowerName.includes('4k') || lowerName.includes('极速')) {
      score += 15;
    }
    if (lowerUrl.endsWith('.m3u8') || lowerUrl.endsWith('.mp4')) {
      score += 10;
    }

    let recommendedTag = '普通线路';
    if (score >= 110) {
      recommendedTag = '智能纯净专线 (推荐)';
    } else if (score >= 80) {
      recommendedTag = '高清快速线';
    } else if (score < 50) {
      recommendedTag = '含广告嫌疑线 (已自动防护)';
    }

    return {
      score,
      recommendedTag,
      isClean: score >= 60,
    };
  }

  /**
   * 清洗 M3U8 文本，剔除前置博彩贴片切片
   * 许多博彩广告是通过在 M3U8 开头插入 10~30 秒带有 #EXT-X-DISCONTINUITY 的外部广告切片
   */
  public static cleanM3u8Content(m3u8Text: string, baseUrl: string): string {
    if (!m3u8Text || !m3u8Text.includes('#EXTM3U')) {
      return m3u8Text;
    }

    const lines = m3u8Text.split('\n');
    const cleanedLines: string[] = [];
    let skippingAdDiscontinuity = false;
    let skippedAdDuration = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 如果发现前置广告断点 (前 60 秒内的广告贴片切片)
      if (line.startsWith('#EXT-X-DISCONTINUITY') && i < 25) {
        skippingAdDiscontinuity = true;
        continue;
      }

      // 如果处于前置贴片阶段，检查切片并过滤
      if (skippingAdDiscontinuity) {
        if (line.startsWith('#EXTINF:')) {
          const durMatch = line.match(/#EXTINF:([0-9\.]+)/);
          if (durMatch) {
            skippedAdDuration += parseFloat(durMatch[1]);
          }
          // 跳过这行 EXTINF 和下一行切片地址
          if (i + 1 < lines.length && !lines[i + 1].startsWith('#')) {
            i++; // 跳过切片 URL
          }
          // 广告切片通常在 60 秒内，超过则停止跳过，恢复正片
          if (skippedAdDuration >= 60) {
            skippingAdDiscontinuity = false;
          }
          continue;
        }

        // 第二个断点通常代表广告结束、正片开始
        if (line.startsWith('#EXT-X-DISCONTINUITY')) {
          skippingAdDiscontinuity = false;
          continue;
        }
      }

      // 如果切片包含明显的博彩推广域名，自动忽略
      if (!line.startsWith('#') && line.length > 0 && this.isSuspiciousAdUrl(line)) {
        continue;
      }

      // 补全相对路径为绝对 URL
      if (!line.startsWith('#') && line.length > 0 && !line.startsWith('http://') && !line.startsWith('https://')) {
        try {
          const absoluteUrl = new URL(line, baseUrl).toString();
          cleanedLines.push(absoluteUrl);
          continue;
        } catch {
          // ignore
        }
      }

      cleanedLines.push(line);
    }

    return cleanedLines.join('\n');
  }
}
