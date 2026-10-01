import test from "node:test";
import assert from "node:assert/strict";
import { quotes, dailyQuote } from "../ui/quotes.js";

test("句库超过二百条，中英文及作品出处完整且无重复", () => {
  assert(quotes.length >= 200);
  assert.equal(new Set(quotes.map(q => q.id)).size, quotes.length);
  assert.equal(new Set(quotes.map(q => q.text)).size, quotes.length);
  for (const quote of quotes) {
    assert(quote.text.trim() && quote.author.trim() && quote.work.trim());
    assert(["zh", "en"].includes(quote.language));
    assert.equal(new URL(quote.sourceUrl).protocol, "https:");
  }
  assert(quotes.some(q => /Karamazov|卡拉马佐夫/.test(q.work)));
});
test("同一天保持一致，完整一轮不重复且两种语言都会出现", () => {
  const start = Date.UTC(2026, 9, 1), seen = new Set(), languages = new Set();
  for (let i = 0; i < quotes.length; i++) {
    const key = new Date(start + i * 86400000).toISOString().slice(0, 10);
    const quote = dailyQuote(key);
    assert.equal(dailyQuote(key).id, quote.id);
    seen.add(quote.id); languages.add(quote.language);
  }
  assert.equal(seen.size, quotes.length);
  assert.equal(languages.size, 2);
});
test("日期跨月、闰年与过去日期正常，拒绝不存在的日期", () => {
  for (const key of ["1900-01-01", "2024-02-29", "2026-09-30", "2026-10-01", "9999-12-31"])
    assert(dailyQuote(key).text);
  for (const key of ["1899-12-31", "2026-02-29", "2026-04-31", "2026-13-01", "2026-10-00", "bad"])
    assert.throws(() => dailyQuote(key), RangeError);
});
