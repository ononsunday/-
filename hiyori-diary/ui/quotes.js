import { chineseQuotes } from "./quotes-zh.js";
import { englishQuotes } from "./quotes-en.js";

// 原句和出处直接随软件保存，打开时不请求网络，也不写入用户的日记。
export const quotes = [...chineseQuotes, ...englishQuotes];
const dailyOrder = [...quotes];
let randomState = 0x4803ad5;
function nextRandom() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return (randomState >>> 0) / 4294967296;
}
// 固定种子先打乱，再按日期取一句：当天刷新不变，连续一轮不会重复。
for (let index = dailyOrder.length - 1; index > 0; index--) {
  const target = Math.floor(nextRandom() * (index + 1));
  [dailyOrder[index], dailyOrder[target]] = [dailyOrder[target], dailyOrder[index]];
}
export function dailyQuote(key) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) throw new RangeError("日期格式应为 YYYY-MM-DD。");
  const [, year, month, day] = match.map(Number);
  const time = Date.UTC(year, month - 1, day), date = new Date(time);
  if (year < 1900 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day)
    throw new RangeError("这不是有效的日历日期。");
  const ordinal = Math.floor(time / 86400000);
  return dailyOrder[((ordinal % dailyOrder.length) + dailyOrder.length) % dailyOrder.length];
}
