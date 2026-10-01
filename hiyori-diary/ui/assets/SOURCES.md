# 插画来源

`evening.webp` 沿用用户此前指定的动漫官网参考素材，原文件为 `visual2.webp`。图片保存在本地，软件运行时不需要联网加载。

- 作品：きみが死ぬまで恋をしたい
- 官网：[动画官方网站](https://www.kimishinu-anime.com/)
- 图片：[官网主视觉 visual2.webp](https://www.kimishinu-anime.com/assets/img/top/visual/visual2.webp)
- 版权署名：©あおのなち・一迅社／「きみ死ぬ」製作委員会

插画版权属于原权利方。软件中的花朵线稿、花瓣形状、界面排版和交互动画由本项目实现。

## 心情表情

`moods/pack-143.jpg` 和 `moods/pack-193.jpg` 是用户提供的两张《崩坏：星穹铁道》表情包截图，分别为「帕姆展览馆第 143 弹」与「第 193 弹」。图片中的发布方为「崩坏星穹铁道」，表情版权属于原权利方。

软件保留原图，通过 SVG 的 `viewBox` 只显示下列区域，没有重绘人物。所有选图均来自表情列表第一排，序号从左向右数。

| 心情     | 截图      | 第一排位置 |
| -------- | --------- | ---------- |
| 开心     | 第 143 弹 | 第 1 个    |
| 还不错   | 第 143 弹 | 第 2 个    |
| 普通     | 第 193 弹 | 第 1 个    |
| 有点低落 | 第 193 弹 | 第 3 个    |
| 很累     | 第 143 弹 | 第 4 个    |

## 分层场景

`scenes/` 的高清图片转换自用户提供的本机 Wallpaper Engine 素材。原文件夹未修改，软件运行时只加载随程序附带的图片。

| 素材 | Workshop 编号 | 当前用途 | 来源信息 |
| --- | --- | --- | --- |
| 清夏／若叶睦 | 3558034522 | 今天页背景与透明人物 | 原画：虎皮玄椒，[原画页面](https://www.pixiv.net/artworks/123655095)；壁纸动效：bai22331 |
| 蓝色夜景 | 3370333034 | 今晚页天空、人物与前景草 | 本机项目标题：爱莉希雅(崩坏星琼铁道-PV）；标题沿用原项目文字 |
| 利兹与青鸟 | 3459218400 | 历史页插画 | 本机项目标题：利兹与青鸟 |

图片保留原素材的画面内容和透明图层，转换时读取场景中的位置、颜色参数及人物网格静态姿态，没有执行壁纸中的脚本。界面的光影、星点和草叶动画由本项目实现，没有嵌入 Wallpaper Engine 播放器或照搬其全部特效。素材版权仍属于原作者和权利方。

历史页使用原项目中的「人物蒙版1」：解码后的 `scenes/history-character-mask.png` 为 4274×2404 像素。CSS 按蒙版亮度分离人物，再对原图下沿做轻微渐隐；人物的脸、头发和衣服沿用原画，没有重新绘制。

`scenes/asset-manifest.json` 记录图片尺寸、透明通道及来源。格式转换参考开源解析代码：[TextureParser](https://github.com/Almamu/linux-wallpaperengine/blob/main/src/WallpaperEngine/Data/Parsers/TextureParser.cpp)、[MDL parser](https://github.com/wqlouis/pkg_parser/blob/crate/src/pkg_parser/mdl_parser.rs)。
