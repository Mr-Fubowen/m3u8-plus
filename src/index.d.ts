export interface Key {
    /** 加密方式，如 'AES-128' */
    method: string
    /** 加密密钥的 URL */
    url: string
    /** 初始化向量 */
    iv: string
}

export interface Segment {
    /** 持续时间（秒） */
    duration: number
    /** 标题 */
    title: string
    /** 地址 */
    url: string
    /** 可选：对应的解密密钥（若存在） */
    key?: Key
}

export interface M3U8 {
    /** 将解析的 M3U8 对象转换为文本的变换数组 */
    transforms: Transform[]
    /** 将 M3U8 对象转为文本 */
    toText: () => string
    /** 是否开始 */
    start?: boolean
    /** 版本号（如 3） */
    version?: number
    /** 每个片段最大持续时间（整数秒） */
    targetDuration?: number
    /** 媒体序列号 */
    mediaSequence?: number
    /** 类型：EVENT、VOD等 */
    type?: string
    /** 全局密钥（默认） */
    key?: Key
    /** 所有密钥, 播放列表中所有密钥集合 */
    keys: Key[]
    /** 片段数组 */
    segments: Segment[]
    /** 是否结束 */
    end?: boolean
    /** 所有片段总长度（秒） */
    totalDuration: number
    /** 未知参数或额外信息 */
    unknowns: string[]
    /** 内部使用, 外部禁止使用 */
    usedKey: Key
}

/**
 * 解析 m3u8 文本内容为 M3U8 对象
 * @param m3u8Text - m3u8 文件内容
 * @returns M3U8对象
 */
export declare function parse(m3u8Text: string): M3U8

export interface Transform {
    /**
     * m3u8 标记的关键字，例如: #EXTM3U
     * 使用 startsWith 前缀匹配关键字
     */
    id: string
    /**
     * 处理器函数
     * @param text - 当前匹配到的行文本
     * @param result - 当前累积的结果对象
     * @param iterator -文本行迭代器
     */
    fn: (text: string, result: M3U8, iterator: Iterator<string>) => any
    /** 变换描述 */
    description: string
}

/**
 * 默认变换数组, 可手动扩充以支持其他 m3u8 关键字
 */
export const transforms: Transform[]

/**
 * 文本占位符替换函数
 * replace('{0}:{1}', "a", "b")
 * @param text - 模板文本，比如 '{0}:{1}'
 * @param args - 替换参数
 * @returns 替换后的字符串
 */
export declare function replace(text: string, ...args: unknown[]): string
