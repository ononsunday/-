import { validateCustomActivity } from "./activities.js";
// 日期使用本地年月日，避免 toISOString() 在午夜附近产生前一天的日期。
export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function parseDate(key) {
  return new Date(`${key}T12:00:00`);
}
export function newDay() {
  return { tasks: [], diary: "", mood: null };
}
export function newBook() {
  return {
    version: 1,
    updatedAt: 0,
    settings: { dark: false, progress: true, quote: true },
    days: {},
    customActivities: [],
  };
}
export function dayFor(book, key) {
  return book.days[key] ?? newDay();
}
export function taskAdd(day, text) {
  const value = text.trim();
  if (!value || value.length > 300) return false;
  day.tasks.push({ id: crypto.randomUUID(), text: value, done: false });
  return true;
}
export function taskMove(day, id, offset) {
  const from = day.tasks.findIndex((t) => t.id === id),
    to = from + offset;
  if (from < 0 || to < 0 || to >= day.tasks.length) return false;
  day.tasks.splice(to, 0, day.tasks.splice(from, 1)[0]);
  return true;
}
export function hasRecord(day) {
  return (
    day.tasks.length > 0 || day.diary.trim().length > 0 || day.mood !== null
  );
}
export function wordCount(text) {
  return [...text.replace(/\s/g, "")].length;
}
export function validateBook(value) {
  if (
    !value ||
    value.version !== 1 ||
    !value.days ||
    typeof value.days !== "object" ||
    Array.isArray(value.days)
  )
    throw new Error("这不是日和的备份文件，或版本不受支持。");
  const result = newBook();
  result.updatedAt = Number.isFinite(value.updatedAt) ? value.updatedAt : 0;
  if (Object.keys(value.days).length > 40000)
    throw new Error("备份中的日期数量过多。");
  for (const [key, day] of Object.entries(value.days)) {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(key) ||
      Number(key.slice(0, 4)) < 1900 ||
      Number(key.slice(0, 4)) > 9999 ||
      isNaN(parseDate(key)) ||
      dateKey(parseDate(key)) !== key
    )
      throw new Error("备份包含无效日期。");
    if (
      !day ||
      !Array.isArray(day.tasks) ||
      day.tasks.length > 5000 ||
      typeof day.diary !== "string" ||
      day.diary.length > 200000 ||
      ![null, "happy", "good", "neutral", "low", "tired"].includes(day.mood)
    )
      throw new Error("备份中的日记格式不正确。");
    const ids = new Set();
    const tasks = day.tasks.map((t) => {
      if (
        !t ||
        typeof t.id !== "string" ||
        !/^[\w-]{1,80}$/.test(t.id) ||
        ids.has(t.id) ||
        typeof t.text !== "string" ||
        !t.text.trim() ||
        t.text.length > 300 ||
        typeof t.done !== "boolean"
      )
        throw new Error("备份中的计划格式不正确。");
      ids.add(t.id);
      return { id: t.id, text: t.text, done: t.done };
    });
    result.days[key] = { tasks, diary: day.diary, mood: day.mood };
  }
  for (const name of ["dark", "progress", "quote"])
    if (typeof value.settings?.[name] === "boolean")
      result.settings[name] = value.settings[name];
  // 旧备份没有这个字段也能打开；新备份同时保留用户自己的晚间活动。
  if (value.customActivities !== undefined) {
    if (!Array.isArray(value.customActivities) || value.customActivities.length > 1000)
      throw new Error("自定义活动列表格式不正确，或超过 1000 条。");
    const ids = new Set();
    result.customActivities = value.customActivities.map((activity) => {
      if (!activity || typeof activity.id !== "string" || !/^custom-[\w-]{1,80}$/.test(activity.id) || ids.has(activity.id)
        || typeof activity.duration !== "number" || typeof activity.energy !== "number")
        throw new Error("备份中的自定义活动格式不正确。");
      ids.add(activity.id);
      return { id: activity.id, ...validateCustomActivity(activity) };
    });
  }
  return result;
}
