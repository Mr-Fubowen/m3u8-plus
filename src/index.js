export function replace(msg, ...args) {
    return msg.replace(/\{([0-9]+)\}/g, (match, idx) => args.at(parseInt(idx)) ?? '')
}
export const transforms = [
    {
        id: '#EXTM3U',
        fn(text, result, iterator) {
            result.start = true
            result.transforms.push(() => text)
        },
        description: '文件的开始标志'
    },
    {
        id: '#EXT-X-VERSION',
        fn(text, result, iterator) {
            const [tag, value] = text.split(':')
            result.version = parseInt(value)
            result.transforms.push(() => replace('{0}:{1}', tag, result.version))
        },
        description: '定义 HLS 协议的版本'
    },
    {
        id: '#EXT-X-TARGETDURATION',
        fn(text, result, iterator) {
            const [tag, value] = text.split(':')
            result.targetDuration = parseInt(value)
            result.transforms.push(() => replace('{0}:{1}', tag, result.targetDuration))
        },
        description: '最长片段的时间，用于播放器缓冲策略'
    },
    {
        id: '#EXT-X-MEDIA-SEQUENCE',
        fn(text, result, iterator) {
            const [tag, value] = text.split(':')
            result.mediaSequence = parseInt(value)
            result.transforms.push(() => replace('{0}:{1}', tag, result.mediaSequence))
        },
        description: '直播或点播的片段起始序列号'
    },
    {
        id: '#EXT-X-PLAYLIST-TYPE',
        fn(text, result, iterator) {
            const [tag, value] = text.split(':')
            result.type = value
            result.transforms.push(() => replace('{0}:{1}', tag, result.type))
        },
        description: '指示播放列表类型VOD/EVENT'
    },
    {
        id: '#EXT-X-KEY',
        fn(text, result, iterator) {
            const [tag, value] = text.split(':')
            const kvs = value.split(',')
            const key = {}
            kvs.forEach(it => {
                let [name, val] = it.split('=')
                let upperName = name.toUpperCase()
                switch (upperName) {
                    case 'METHOD':
                        key.method = val
                        break
                    case 'URI':
                        key.url = val?.replaceAll('"', '')
                        break
                    case 'IV':
                        key.iv = val
                        break
                }
            })
            if (result.key) {
                result.usedKey = key
            } else {
                result.key = key
                result.usedKey = key
                result.transforms.push(() => {
                    result.usedKey = result.key
                    return replace(
                        '{0}:METHOD={1},URL="{2}",IV={3}',
                        tag,
                        result.key.method,
                        result.key.url,
                        result.key.iv
                    )
                })
            }
            result.keys.push(key)
        },
        description: '片段的加密信息，可存在多个用于多段加密'
    },
    {
        id: '#EXTINF',
        fn(text, result, iterator) {
            const [tag, value] = text.split(':')
            const [duration, title] = value.split(',')
            const url = iterator.next().value
            const part = {
                duration: parseInt(duration),
                title,
                url,
                key: result.usedKey
            }
            result.segments.push(part)
            result.transforms.push(() => {
                let key = ''
                if (result.usedKey != part.key) {
                    key = replace(
                        '{0}:METHOD={1},URL={2},IV={3}\n',
                        tag,
                        part.key.method,
                        part.key.url,
                        part.key.iv
                    )
                    result.usedKey = part.key
                }
                return replace('{0}{1}:{2},{3}\n{4}', key, tag, part.duration, part.title, part.url)
            })
        },
        description: '每个媒体片段的持续时间和URI'
    },

    {
        id: '#EXT-X-ENDLIST',
        fn(text, result, iterator) {
            result.end = true

            result.transforms.push(() => text)
        },
        description: '点播结束标志'
    },
    {
        id: '#EXT',
        fn(text, result, iterator) {
            result.unknowns.push(text)
            result.transforms.push(() => text)
        },
        description: '未识别的标记'
    },
    {
        id: '#',
        fn(text, result, iterator) {
            result.transforms.push(() => text)
        },
        description: '注释'
    }
]
export function parse(text) {
    const lines = text.split('\n')
    const iterator = lines[Symbol.iterator]()
    const result = {
        start: null,
        version: null,
        targetDuration: null,
        mediaSequence: null,
        type: null,
        key: null,
        keys: [],
        segments: [],
        end: null,
        totalDuration: 0,
        unknowns: [],
        toText() {
            return this.transforms.map(fn => fn()).join('\n')
        },
        transforms: []
    }
    for (let item = iterator.next(); !item.done; item = iterator.next()) {
        const value = item.value
        const handle = transforms.find(it => value.startsWith(it.id))
        if (handle) {
            handle.fn(value, result, iterator)
        }
    }
    result.totalDuration = result.segments.reduce((sum, value) => {
        const num = parseFloat(value.duration)
        return sum + (isNaN(num) ? 0 : num)
    }, 0)
    return result
}
