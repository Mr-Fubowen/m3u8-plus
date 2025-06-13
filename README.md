# m3u8-plus

**m3u8-plus** 是一个用于解析和修改 **.m3u8** 播放列表文件的工具库。它可以将 **.m3u8** 文件内容转换成 JavaScript 对象，支持 Node.js、ES 模块以及浏览器环境。

## 功能特点

1. 轻松解析 .m3u8 文件
1. 支持 AES-128 加密信息解析
1. 可修改播放列表信息
1. 支持将修改后的对象以 .m3u8 文本格式输出
1. 通用环境兼容（Node/ES/浏览器）

## 安装

### npm

```sh
npm install m3u8-plus
```

### 浏览器

```html
<script src="path/to/index.umd.cjs"></script>
```

## 示例

```js
import { parse, replace } from 'm3u8-plus'

const demo01 = `
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-KEY:METHOD=AES-128,URI="key.dat",IV=0x00000000000000000000000000000000
#EXTINF:10.000000,
segmt0.ts
#EXTINF:10.000000,
segmt1.ts
#EXTINF:10.000000,
segmt2.ts
#EXT-X-ENDLIST
`
const m3u8 = parse(demo01)
console.log(m3u8)
/*
{
  start: true,
  version: 3,
  targetDuration: 10,
  mediaSequence: 0,
  type: 'VOD',
  key: {
    method: 'AES-128',
    url: 'key.dat',
    iv: '0x00000000000000000000000000000000'
  },
  keys: [
    {
      method: 'AES-128',
      url: 'key.dat',
      iv: '0x00000000000000000000000000000000'
    }
  ],
  segments: [
    { duration: 10, title: '', url: 'segmt0.ts', key: [Object] },
    { duration: 10, title: '', url: 'segmt1.ts', key: [Object] },
    { duration: 10, title: '', url: 'segmt2.ts', key: [Object] }
  ],
  end: true,
  totalDuration: 2040,
  unknowns: [],
  toText: [Function: toText]
}
*/
console.log(m3u8.toText())
/*
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-KEY:METHOD=AES-128,URL="key.dat",IV=0x00000000000000000000000000000000
#EXTINF:10,
segmt0.ts
#EXTINF:10,
segmt1.ts
#EXTINF:10,
segmt2.ts
#EXT-X-ENDLIST
*/
```

## API 说明

### **parse(text: string)**

解析 .m3u8 文本，返回一个包含播放列表信息的对象。

### **replace(message: string, ...args: any[])**

用于字符串参数占位符替换的辅助函数。

## 更多

1. 支持自定义标签解析逻辑
2. 可通过 .toText() 方法导出编辑后的 m3u8 文本
3. 内部维护 segments、keys、unknowns 等详细信息

## 许可证

**MIT**\
如果你觉得这个项目对你有帮助，欢迎点赞和 Star！🎉
