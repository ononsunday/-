// 复用旧版 C:/code/app.js 的活动库：8 个分类、252 条活动。
// 这里只保存原始数据和纯函数，不读取、迁移或覆盖旧软件的 localStorage。
export const categories = ["玩游戏", "看动漫", "看电影", "看书", "学习", "出门", "放松", "随便做点什么"];

const starterActivities = [
  { id: "starter-game", name: "玩一会单机游戏", category: "玩游戏", duration: 30, description: "开一局没有压力的单机游戏，玩到这一关结束就好。", energy: 2 },
  { id: "starter-anime", name: "看一集动漫", category: "看动漫", duration: 30, description: "挑一集一直想看的番，不用补进度，只看眼前这一集。", energy: 1 },
  { id: "starter-book", name: "读 20 页书", category: "看书", duration: 30, description: "把书翻开，读到一个自然停下来的地方，不必追求效率。", energy: 2 },
  { id: "starter-sql", name: "做一道 SQL 题", category: "学习", duration: 20, description: "挑一道刚好够得着的题，做完就停。今天只需要比昨天多懂一点点。", energy: 3 },
  { id: "starter-japanese", name: "学 20 分钟日语", category: "学习", duration: 20, description: "复习几个单词，或者看一小段简单的日语内容。", energy: 2 },
  { id: "starter-desk", name: "整理桌面", category: "随便做点什么", duration: 10, description: "只整理眼前这一小块地方。桌面变干净一点，脑子也会松一点。", energy: 1 },
  { id: "starter-music", name: "听三首喜欢的歌", category: "放松", duration: 15, description: "戴上耳机，什么都不用做，让三首歌替你把时间填满。", energy: 1 },
  { id: "starter-walk", name: "出门散步", category: "出门", duration: 30, description: "走到附近转一圈，看看夜里的风和路灯，再慢慢回来。", energy: 2 },
  { id: "starter-movie", name: "看一部轻松的电影", category: "看电影", duration: 120, description: "找一部不用动脑的电影，给自己留一段完整的空白时间。", energy: 1 },
  { id: "starter-breathe", name: "关灯发会儿呆", category: "放松", duration: 10, description: "把手机放远一点，听听房间里的声音，什么也不用解决。", energy: 1 },
  { id: "starter-cook", name: "给自己弄点好吃的", category: "随便做点什么", duration: 60, description: "做一道简单的东西，认真吃完。照顾自己也算一件正事。", energy: 2 },
  { id: "starter-library", name: "去附近的书店或便利店", category: "出门", duration: 60, description: "出门走走，随便看看，不需要买东西才算有收获。", energy: 2 }
];

function createPack(category, rawEntries, notes) {
  return rawEntries.trim().split("\n").map((line, index) => {
    const [name, duration, energy] = line.split("|");
    return {
      id: `pack-${category}-${index}`,
      name,
      category,
      duration: Number(duration),
      energy: Number(energy),
      description: `${name}。${notes[index % notes.length]}`
    };
  });
}

const expandedActivities = [
  ...createPack("玩游戏", `
打开一款很久没碰的单机游戏|30|2
玩一局不看输赢的竞技游戏|30|3
给角色换一套新装扮|20|2
重玩最熟悉的游戏关卡|20|1
试试游戏里的拍照模式|10|1
整理一次游戏库|20|1
玩一局桌游模拟器|30|2
在沙盒游戏里盖一间小屋|60|2
完成一个支线任务|60|3
探索地图上还没去过的角落|60|3
试一款评分很高的独立游戏|60|3
做一次游戏截图小合集|30|1
玩一局解谜游戏|30|2
挑战一个一直没过的关卡|60|3
给游戏角色写一段背景故事|30|2
体验一款复古小游戏|30|1
玩一局纸牌或麻将|20|1
把游戏设置调成最舒服的样子|10|1
看一段游戏里的剧情回放|20|1
试试今天最想玩的那个游戏|30|2
完成每日任务，但不多做一点|20|2
和朋友联机玩半小时|30|3
在游戏里收集一组材料|60|2
做一张游戏地图标记|30|2
给最喜欢的角色拍张截图|10|1
挑战一次速通路线|60|3
找一个冷门游戏试玩|60|3
把一个游戏玩到第一个存档点|30|2
看一眼自己的游戏成就|10|1
选一个游戏，认真玩满两小时|120|3
`, ["不用通关，也不用证明什么。玩到想停的地方就好。", "给自己一小段没有任务的时间，随便逛逛也算。", "今天只抽一个小目标，完成后就可以收工。", "把注意力放回手里的操作，别急着看结果。"]),
  ...createPack("看动漫", `
看一集一直收藏的动漫|30|1
重看最喜欢的一集|30|1
看一集轻松的日常番|30|1
看一部动漫的开场|10|1
补一集短篇泡面番|15|1
找一部画风特别的作品|30|2
看一集喜剧番|30|1
看一段喜欢的片尾曲|10|1
回看一个名场面|10|1
看三集短番|60|1
给待看列表删掉三部作品|20|1
找一部新番的第一集|30|2
看一集悬疑番|30|2
看一部老动画的第一集|30|1
看一集运动番|30|2
找一部治愈系作品|30|1
看一集科幻番|30|2
回顾喜欢的角色出场集|30|1
看一部只有十分钟的短动画|10|1
给朋友推荐一部动漫|10|1
看一集不需要连贯剧情的番|30|1
把字幕语言换一种试试|30|2
看一段作画分析视频|20|2
找一部被低估的老番|60|2
看动漫原声带的现场片段|20|1
补上最近更新的一集|30|1
看一集冒险题材的作品|30|2
按季整理自己的待看清单|20|1
看一部短篇合集里的单集|30|1
留两个小时看一场动漫电影|120|1
`, ["不用补完整季，今晚只陪一个角色走一小段。", "选一集没有压力的，看完就可以安心停下。", "如果十分钟后还不想看，就换一件事也没关系。", "把灯光调暗一点，让故事自己开始。"]),
  ...createPack("看电影", `
看一部轻松喜剧|120|1
看一部收藏很久的电影|120|2
重看最喜欢的电影开头|30|1
看一部温柔的短片|30|1
找一部九十分钟左右的电影|90|2
看一部动画电影|120|1
看一部老电影|120|2
看一部旅行题材的电影|120|2
看一部不用动脑的动作片|120|2
看一部悬疑片的前半段|60|3
看一部纪录片的第一章|30|2
看一部音乐电影|120|2
看一部黑色幽默电影|120|3
找一部海边背景的电影|120|1
看一部只有一个晚上的故事|120|2
看一部朋友推荐的电影|120|2
看一部科幻电影|120|3
看一部治愈系电影|120|1
看一部短纪录片|30|1
回看电影里最喜欢的十分钟|10|1
看一部导演处女作|120|3
挑一部海报最好看的电影|120|2
看一部公路电影|120|2
看一部轻松的爱情片|120|1
看一部关于食物的电影|120|1
看一部结局温暖的电影|120|1
看一部不超过一小时的电影|60|2
看一部获奖动画短片|30|2
看一段电影幕后花絮|20|1
留出完整的夜晚看一部大片|150|3
`, ["先把片名放在那里，愿意开始就是今天的进度。", "找一部不需要解释太多的电影，让两个小时自然过去。", "看到一半想停也可以，故事不会跑掉。", "准备一杯喝的，再把房间的灯调成舒服的亮度。"]),
  ...createPack("看书", `
读十页正在看的书|20|1
读一篇短篇小说|30|2
翻一翻诗集|10|1
读一章轻松的漫画|30|1
整理书签和待读清单|20|1
读一本散文集的一篇|30|1
看一本摄影书|20|1
读一章科普书|30|2
重读喜欢的段落|10|1
读一本小说的开头|30|2
找一本旧书重新翻开|30|1
读一封名人书信|20|2
看一会儿画册|20|1
读一篇杂志文章|30|2
读完一个短篇故事|60|2
为书里喜欢的句子做标记|30|1
读一本旅行随笔|30|1
在书店网站逛一会儿|20|1
听着音乐读十五页书|30|1
读一章历史故事|30|2
给未来的自己选一本书|20|2
找一本封面好看的书|10|1
读一本工具书的一个小节|30|3
把床边的书摆整齐|10|1
看一本菜谱或食谱|20|1
读一篇长文章|60|2
读一本推理小说的一章|30|3
读一段喜欢的歌词注释|10|1
在阳台读一会儿书|30|1
安排一整个下午慢慢看书|150|2
`, ["读到一个自然停下来的位置，不用追求页数。", "让书先陪你坐一会儿，能看进去多少算多少。", "把手机放远一点，给文字留出一点安静。", "如果今天只读了一页，那一页也已经发生了。"]),
  ...createPack("学习", `
做一道 SQL 题|20|3
复习十个日语单词|10|2
看一节网课|30|2
整理今天的课堂笔记|20|2
学会一个快捷键|10|1
读一篇技术文章|30|3
写一段小 JavaScript|30|3
练习十分钟打字|10|2
背五个英语短语|10|1
画一张知识结构图|30|2
复习一个数据库概念|20|2
看一段发音教程|20|1
做一组基础计算题|30|2
读一页专业书|10|2
整理电脑里的学习资料|30|1
写下今天学到的三件事|10|1
跟着教程做一个小练习|60|3
复盘一道做错的题|30|3
了解一个网络命令|20|2
练习一次自我介绍|20|2
做一张单词卡片|10|1
学一个新的 Excel 函数|30|2
看一个公开课的章节|60|2
写一份学习计划|30|2
读一篇职业经验分享|30|2
做一次代码格式整理|20|1
完成一个小型编程练习|60|3
用自己的话解释一个概念|30|3
整理一份面试题错题本|60|3
安排一个两小时深度学习时段|120|3
`, ["只解决一个小问题，学习就有了落点。", "先做最容易开始的那一步，不需要一次学完整章。", "写下来比默默看过更容易留下印象。", "如果注意力不够，十分钟也可以算一次练习。"]),
  ...createPack("出门", `
下楼走一圈|10|1
去便利店买瓶饮料|20|1
在小区里散步|30|2
去附近的公园坐一会儿|30|1
走到下一站再坐车|30|2
去街角看看夜景|30|2
到附近书店逛逛|60|2
买一份喜欢的甜点|30|1
绕远路回家|30|2
去河边吹吹风|60|2
找一家没去过的咖啡店|60|2
去超市慢慢逛一圈|60|1
拍三张路上的照片|30|2
找一面有趣的墙|30|2
到小区楼下晒晒太阳|20|1
去附近的文具店|60|2
沿着熟悉的路反方向走|30|2
去公园看一会儿树|30|1
买一束小花|30|1
坐公交到下一站看看|60|2
去夜市看看有什么吃的|60|2
找一家面包店|30|1
出门听一张专辑|60|2
去附近的图书馆|60|2
走到一个没去过的街口|30|2
在便利店挑一种新饮料|20|1
带相机出门拍十分钟|30|2
去看一场日落或夜色|60|2
在城市里随便走一个小时|60|3
安排一次没有目的地的半日散步|150|3
`, ["不用走很远，换个街角就算离开房间。", "把注意力放到风、灯光和脚下的路上。", "如果不想说话，就一个人走一小段。", "出门前不用准备得很完整，穿好鞋就可以开始。"]),
  ...createPack("放松", `
听三首喜欢的歌|15|1
关灯发会儿呆|10|1
做五分钟伸展|10|1
泡一杯热饮|10|1
洗个舒服的热水澡|30|1
看一会儿窗外|10|1
做一组深呼吸|10|1
点一盏小灯|10|1
听一段白噪音|20|1
躺着听一张专辑|60|1
整理自己的歌单|30|1
做十分钟肩颈放松|20|1
给自己涂护手霜|10|1
换上最舒服的睡衣|10|1
点喜欢的香氛|10|1
看一段自然纪录片|30|1
慢慢吃一份水果|20|1
做一次简单冥想|10|1
把房间灯光调暗|10|1
听雨声入睡前放空|30|1
看一会儿云或星星|20|1
做一套睡前拉伸|20|1
给自己写几句心情|20|2
泡脚十五分钟|20|1
把手机调成勿扰模式|10|1
靠着窗边坐一会儿|30|1
看一集熟悉的轻松节目|30|1
做一份睡前护肤|20|1
安排一个不做正事的晚上|120|1
在舒服的音乐里慢慢入睡|120|1
`, ["不用立刻变开心，先让身体松一点。", "这件事没有完成标准，舒服一点就够了。", "把房间调成适合休息的样子，剩下的交给时间。", "今晚不处理所有问题，先照顾现在的自己。"]),
  ...createPack("随便做点什么", `
整理桌面的一角|10|1
给植物浇水|10|1
换一套床单|30|2
清理手机相册十分钟|20|1
删掉五个不用的 App|10|1
给朋友发一句问候|10|2
做一份简单的早餐|30|2
收拾一个抽屉|30|1
洗一只杯子或水壶|10|1
把衣服叠好|20|1
给电脑桌面换张壁纸|10|1
整理一个文件夹|20|1
写一张明天的待办|10|1
把垃圾带下楼|10|1
给自己做一碗面|30|2
学一道新菜|60|2
修一件小物品|30|2
给宠物梳毛|20|1
拍一张今天的照片|10|1
把冰箱里快过期的食材列出来|20|1
写一段随笔|20|2
做一个简单的手工|60|2
拼一会儿拼图|60|1
给相册加几个标签|30|1
把明天要穿的衣服放好|10|1
清洗一双常穿的鞋|30|2
给家里一个角落换个摆法|60|2
整理收藏夹|30|1
做一件拖了很久的小事|60|3
给自己安排一个慢慢生活的下午|150|2
`, ["从眼前最小的一块开始，做完就可以停。", "这种小事没有掌声，但会让明天轻松一点。", "不用把家里全部整理好，只改变一个角落。", "做点有形的事情，心里的杂音有时会小一点。"])
];

export const activities = [...starterActivities, ...expandedActivities];
export const energyLabels = {
  1: "很累时也可以",
  2: "有点累时也可以",
  3: "有精神时更合适",
  0: "随时都可以",
};

export function createTonightState() {
  return { category: "all", time: 30, energy: 3, currentId: null, addedIds: [], customActivities: [] };
}

// 表单和导入校验都可以复用此函数。拒绝错误输入，而不是悄悄截断内容。
export function validateCustomActivity(input) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("活动信息格式不正确。");
  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (!name || name.length > 100) throw new Error("活动名称需要 1 到 100 个字。");
  const category = input.category;
  if (!categories.includes(category)) throw new Error("请选择一个已有分类。");
  if (!["number", "string"].includes(typeof input.duration))
    throw new Error("请填写活动时长。");
  if (!["number", "string"].includes(typeof input.energy))
    throw new Error("请选择需要的精力程度。");
  const duration = Number(input.duration), energy = Number(input.energy);
  if (!Number.isInteger(duration) || duration < 1 || duration > 600)
    throw new Error("时长需要是 1 到 600 之间的整数分钟。");
  if (!Number.isInteger(energy) || energy < 1 || energy > 3)
    throw new Error("请选择需要的精力程度。");
  const description = input.description == null ? "" : input.description;
  if (typeof description !== "string" || description.trim().length > 300)
    throw new Error("说明最多填写 300 个字。");
  return { name, category, duration, energy, description: description.trim() };
}

export function createCustomActivity(input) {
  const fields = validateCustomActivity(input);
  // 随机 ID 不依赖名称；两件同名的活动仍可保持各自的身份。
  const suffix = globalThis.crypto?.randomUUID?.()
    || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return { id: `custom-${suffix}`, ...fields };
}

// 保留原软件的时长分组。数字 0 表示不限制时长；这些值是大致时间。
export function timeMatches(activity, target = 0) {
  target = Number(target);
  if (!target) return true;
  if (target === 10) return activity.duration <= 15;
  if (target === 30) return activity.duration > 15 && activity.duration <= 45;
  if (target === 60) return activity.duration > 45 && activity.duration <= 90;
  if (target === 120) return activity.duration >= 90;
  return false;
}

export function filterActivities(state, source = activities) {
  return [...source, ...(state.customActivities || [])].filter((activity) =>
    (state.category === "all" || activity.category === state.category) &&
    timeMatches(activity, state.time) &&
    (!activity.energy || activity.energy <= Number(state.energy)),
  );
}

// 已经有两个以上候选时，排除上一条，避免点“换一个”马上抽到同一条。
// rng 参数可注入固定随机数，测试时就不必依赖碰运气。
export function pickActivity(pool, previousId, rng = Math.random) {
  if (!pool.length) return null;
  const choices = pool.length > 1
    ? pool.filter((activity) => activity.id !== previousId)
    : pool;
  const index = Math.min(choices.length - 1, Math.max(0, Math.floor(rng() * choices.length)));
  return choices[index];
}

export function formatDuration(minutes) {
  // 精确显示 90、150 分钟，避免旧版四舍五入成 2 或 3 小时。
  if (minutes >= 60 && minutes % 60 === 0) return `${minutes / 60} 小时`;
  return `${minutes} 分钟`;
}

