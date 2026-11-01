import { MacCmsRawVodItem, MacCmsCategory } from '@/types/maccms';

export const MOCK_MACCMS_CATEGORIES: MacCmsCategory[] = [
  { type_id: 1, type_name: '电影', type_pid: 0 },
  { type_id: 2, type_name: '连续剧', type_pid: 0 },
  { type_id: 3, type_name: '综艺', type_pid: 0 },
  { type_id: 4, type_name: '动漫', type_pid: 0 },
  { type_id: 6, type_name: '动作片', type_pid: 1 },
  { type_id: 7, type_name: '喜剧片', type_pid: 1 },
  { type_id: 8, type_name: '科幻片', type_pid: 1 },
  { type_id: 13, type_name: '国产剧', type_pid: 2 },
  { type_id: 14, type_name: '欧美剧', type_pid: 2 },
  { type_id: 15, type_name: '日韩剧', type_pid: 2 },
];

/**
 * Authentic MacCMS V10 mock items containing multi-source and multi-episode play_from and play_url
 * Uses genuine open-licensed HLS and MP4 streams (Creative Commons / Open Source cinema)
 */
export const MOCK_MACCMS_ITEMS: MacCmsRawVodItem[] = [
  {
    vod_id: 1001,
    vod_name: '大雄兔：奇幻森林 (Big Buck Bunny)',
    type_id: 1,
    type_name: '电影',
    vod_en: 'daxiongtuqihansenlin',
    vod_time: '2026-03-28 14:20:00',
    vod_remarks: '4K超清原画',
    vod_play_from: 'kkm3u8$$$lzm3u8$$$mp4',
    vod_play_server: 'default$$$backup$$$direct',
    vod_play_note: '自建CDN加速$$$应急备用$$$直接下载',
    vod_play_url: 
      '超清蓝光$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8#1080P超清$https://test-streams.mux.dev/x36xhzz/url_0/1920_1080/index.m3u8' +
      '$$$' +
      '主线备用$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' +
      '$$$' +
      'MP4高速直链$https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    vod_pic: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    vod_actor: 'Bunny / Rodents',
    vod_director: 'Sacha Goedegebure',
    vod_blurb: '开源动画电影巅峰之作，讲述大雄兔惩治丛林恶霸的爆笑冒险故事。',
    vod_content: '<p>一只温和硕大的兔子正在享受美好的清晨阳光，却屡遭森林中三只飞鼠捣蛋破坏。忍无可忍的雄兔运用智慧，布下重重机关，展开了一场智勇双全的欢乐反击战。</p>',
    vod_area: '荷兰 / 欧美',
    vod_lang: '无对白',
    vod_year: '2024',
    vod_score: '9.3',
  },
  {
    vod_id: 1002,
    vod_name: '钢铁之泪：时空守望 (Tears of Steel)',
    type_id: 8,
    type_name: '科幻片',
    vod_en: 'gangtiezhilei',
    vod_time: '2026-03-27 10:15:22',
    vod_remarks: '杜比视界 / 蓝光',
    vod_play_from: 'ffm3u8$$$mp4',
    vod_play_server: 'fast$$$direct',
    vod_play_note: '',
    vod_play_url: 
      '正片4K$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8#花絮与特效解密$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' +
      '$$$' +
      'MP4超清$https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    vod_pic: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    vod_actor: 'Derek de Lint, Sergio Hasselbaink',
    vod_director: 'Ian Hubert',
    vod_blurb: '反乌托邦科幻巨作，一群顶尖科学家在阿姆斯特丹老运河桥下重构记忆。',
    vod_content: '<p>未来世界被毁灭性的机器人占领，人类最后的科学家小队利用全息记忆神经技术，试图重温往日爱恨情仇以解开拯救地球的终极指令密码。</p>',
    vod_area: '欧美',
    vod_lang: '英语',
    vod_year: '2025',
    vod_score: '9.0',
  },
  {
    vod_id: 1003,
    vod_name: '寻梦之翼：辛特尔传奇 (Sintel)',
    type_id: 1,
    type_name: '电影',
    vod_en: 'xunmengzhiyi',
    vod_time: '2026-03-26 19:40:10',
    vod_remarks: '完结',
    vod_play_from: 'kkm3u8$$$mp4',
    vod_play_server: 'cdn1$$$cdn2',
    vod_play_note: '',
    vod_play_url: 
      '正片国语$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8#原声蓝光$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' +
      '$$$' +
      'MP4原画$https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    vod_pic: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    vod_actor: 'Halina Reijn, Thom Hoffman',
    vod_director: 'Colin Levy',
    vod_blurb: '年轻女孩辛特尔救下受伤的幼龙，跋山涉水寻找被掳走伙伴的动人故事。',
    vod_content: '<p>暴风雪肆虐的高山之上，辛特尔被刺客袭击后踏上漫漫征程。回忆中她与小幼龙温馨依偎，现实中却必须面对残酷绝伦的命运抉择。</p>',
    vod_area: '欧美',
    vod_lang: '英语 / 汉语',
    vod_year: '2024',
    vod_score: '9.5',
  },
  {
    vod_id: 1004,
    vod_name: '未来纪元：星际征途 (Interstellar Cosmos)',
    type_id: 2,
    type_name: '连续剧',
    vod_en: 'weilaijiyuan',
    vod_time: '2026-03-29 09:12:00',
    vod_remarks: '更新至04集',
    vod_play_from: 'kkm3u8$$$hnm3u8$$$mp4',
    vod_play_server: '',
    vod_play_note: '',
    // Multi-source with multiple episodes (测试多源多剧集匹配)
    vod_play_url: 
      '第01集$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8#第02集$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8#第03集$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8#第04集$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' +
      '$$$' +
      '第01集$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8#第02集$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8#第03集$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8#第04集$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' +
      '$$$' +
      '第01集$https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4#第02集$https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4#第03集$https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4#第04集$https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    vod_pic: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    vod_actor: '陈星宇 / 林晨曦 / 艾萨克·诺亚',
    vod_director: '张智峰',
    vod_blurb: '太阳风暴逼近，深空科考母舰开启穿越虫洞的生存大迁徙。',
    vod_content: '<p>人类历史上最大规模的深空跃迁探索任务启动，跨越未知星云，直面引力裂缝与星际异兽的残酷考验。</p>',
    vod_area: '大陆 / 科幻',
    vod_lang: '国语',
    vod_year: '2026',
    vod_score: '9.2',
  },
  {
    vod_id: 1005,
    vod_name: '赛博都市：霓虹暗影 (Cyberpunk Shadows)',
    type_id: 6,
    type_name: '动作片',
    vod_en: 'saibodushi',
    vod_time: '2026-03-25 18:30:00',
    vod_remarks: 'HD国语',
    vod_play_from: 'lzm3u8$$$mp4',
    vod_play_server: '',
    vod_play_note: '',
    vod_play_url: 
      '超清直连$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' +
      '$$$' +
      'MP4蓝光$https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
    vod_pic: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80',
    vod_actor: '高桥凉介 / 约翰·韦恩',
    vod_director: '渡边信一郎',
    vod_blurb: '地下赏金猎人揭发垄断巨头意识上传阴谋的生死决战。',
    vod_content: '<p>夜幕降临的新东京，霓虹流光下暗潮涌动。义体化特工接受一项危险保护委托，逐步揭露跨国科技财团控制人类神经记忆的终极计划。</p>',
    vod_area: '亚洲 / 科幻',
    vod_lang: '日语 / 汉语',
    vod_year: '2025',
    vod_score: '8.9',
  },
  {
    vod_id: 1006,
    vod_name: '大象之梦：机械迷宫 (Elephants Dream)',
    type_id: 8,
    type_name: '科幻片',
    vod_en: 'daxiangzhimeng',
    vod_time: '2026-03-24 11:00:00',
    vod_remarks: '经典典藏',
    vod_play_from: 'kkm3u8$$$mp4',
    vod_play_server: '',
    vod_play_note: '',
    vod_play_url: 
      '蓝光首发$https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' +
      '$$$' +
      '高清MP4$https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    vod_pic: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&auto=format&fit=crop&q=80',
    vod_actor: 'Tygo Gernandt, Cas Jansen',
    vod_director: 'Bassam Kurdali',
    vod_blurb: '两位旅人在庞大奇异的巨型机械装置内部探讨存在与自由。',
    vod_content: '<p>老者普鲁格引导着年轻的埃莫探索无边无际的机器巨兽世界，机器的齿轮轰鸣中暗藏着对现实与幻觉的深层哲思。</p>',
    vod_area: '欧美',
    vod_lang: '英语',
    vod_year: '2024',
    vod_score: '8.7',
  }
];
