import { test } from "node:test";
import assert from "node:assert/strict";
import {
  newBook,
  newDay,
  dateKey,
  parseDate,
  taskAdd,
  taskMove,
  hasRecord,
  wordCount,
  validateBook,
} from "../ui/model.js";
test("本地日期往返，包括闰日和跨年", () => {
  for (const day of ["2024-02-29", "2026-01-01", "2026-12-31"])
    assert.equal(dateKey(parseDate(day)), day);
});
test("任务排序保留文字和完成状态，拒绝越界", () => {
  const day = newDay();
  assert.equal(taskAdd(day, "   "), false);
  taskAdd(day, " 学 Python ");
  taskAdd(day, "SQL");
  day.tasks[0].done = true;
  const id = day.tasks[0].id;
  assert.equal(taskMove(day, id, -1), false);
  assert.equal(taskMove(day, id, 1), true);
  assert.equal(day.tasks[1].text, "学 Python");
  assert.equal(day.tasks[1].done, true);
  assert.equal(taskMove(day, id, 1), false);
});
test("只浏览空日期不算记录，心情和日记都能独立构成记录", () => {
  const day = newDay();
  assert.equal(hasRecord(day), false);
  day.diary = "\n ";
  assert.equal(hasRecord(day), false);
  day.mood = "tired";
  assert.equal(hasRecord(day), true);
});
test("字数统计忽略空白，表情按 Unicode 码点统计", () =>
  assert.equal(wordCount("今天 A\n🙂"), 4));
test("备份往返保留内容，清除未定义字段", () => {
  const book = newBook();
  book.days["2024-02-29"] = {
    tasks: [{ id: "test", text: "<script>不能执行</script>", done: true }],
    diary: "第一行\n第二行",
    mood: "good",
  };
  book.settings.dark = true;
  book.unused = "skip";
  const clean = validateBook(JSON.parse(JSON.stringify(book)));
  assert.equal(clean.unused, undefined);
  assert.deepEqual(clean.days, book.days);
  assert.equal(clean.settings.dark, true);
});
test("错误的版本、日期、任务、心情不能导入", () => {
  assert.throws(() => validateBook({ version: 2, days: {} }));
  for (const key of ["2025-02-29", "2026-13-01", "__proto__"]) {
    const b = newBook();
    Object.defineProperty(b.days, key, { value: newDay(), enumerable: true });
    assert.throws(() => validateBook(b));
  }
  const b = newBook();
  b.days["2026-09-26"] = newDay();
  b.days["2026-09-26"].mood = "unknown";
  assert.throws(() => validateBook(b));
  b.days["2026-09-26"].mood = null;
  b.days["2026-09-26"].tasks = [
    { id: "one", text: "x", done: false },
    { id: "one", text: "y", done: false },
  ];
  assert.throws(() => validateBook(b));
});
test("旧备份正常打开，自定义活动随新备份往返且拒绝重复编号", () => {
  const oldBook = { version: 1, days: {}, settings: { dark: true } };
  assert.deepEqual(validateBook(oldBook).customActivities, []);
  const book = newBook();
  book.customActivities = [{ id: "custom-one", name: "整理课堂笔记", category: "学习", duration: 25, energy: 2, description: "先整理一小节。" }];
  assert.deepEqual(validateBook(JSON.parse(JSON.stringify(book))).customActivities, book.customActivities);
  book.customActivities.push({ ...book.customActivities[0] });
  assert.throws(() => validateBook(book));
});
