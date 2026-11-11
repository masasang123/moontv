export interface AdminConfig {
  ConfigFile: string;
  SiteConfig: {
    SiteName: string;
    Announcement: string;
    SearchDownstreamMaxPage: number;
    SiteInterfaceCacheTime: number;
    DoubanProxyType: string;
    DoubanProxy: string;
    DoubanImageProxyType: string;
    DoubanImageProxy: string;
    BangumiProxy?: string;
    BangumiImageProxy?: string;
    DisableYellowFilter: boolean;
    // 弹幕接口配置
    DanmakuApiBaseUrl?: string;
    // TVBox 接口开关与访问密码
    TVBoxEnabled?: boolean;
    TVBoxPassword?: string;
    // 播放进度自动保存间隔（秒），用于控制播放记录保存频率
    PlaybackSaveInterval?: number;
    // 网页直播开关（移植自上游 LunaTV SiteConfig.EnableWebLive；本分支无后台开关 UI，layout 注入时未设置默认按开启处理）
    EnableWebLive?: boolean;
  };
  UserConfig: {
    AllowRegister: boolean;
    Users: {
      username: string;
      role: 'user' | 'admin' | 'owner';
      banned?: boolean;
      group?: string;
      lastOnline?: number;
    }[];
    Groups?: {
      name: string;
      sourceKeys: string[];
    }[];
  };
  SourceConfig: {
    key: string;
    name: string;
    api: string;
    detail?: string;
    from: 'config' | 'custom';
    disabled?: boolean;
  }[];
  CustomCategories: {
    name?: string;
    type: 'movie' | 'tv';
    query: string;
    from: 'config' | 'custom';
    disabled?: boolean;
  }[];
  // 直播源配置（移植自上游 LunaTV，字段与上游 AdminConfig.LiveConfig 一致）
  LiveConfig?: {
    key: string;
    name: string;
    url: string; // m3u 地址
    ua?: string;
    epg?: string; // 节目单
    from: 'config' | 'custom';
    channelNumber?: number;
    disabled?: boolean;
  }[];
  SubscriptionConfig?: {
    subscriptionUrl?: string;
    autoUpdate?: boolean;
    updateInterval?: number; // seconds
    lastUpdated?: number; // timestamp in seconds
    importMode?: 'overwrite' | 'merge';
  };
}

export interface AdminConfigResult {
  Role: 'owner' | 'admin';
  Config: AdminConfig;
}
