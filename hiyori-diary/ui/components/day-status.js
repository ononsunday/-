// 状态只由传入的数据决定，方便日历、历史共用，也便于测试跨日边界。
// 日期采用 YYYY-MM-DD 格式，可以直接比较先后；todayKey 由页面传入。
export function dayStatus(day, key, todayKey) {
  const tasks = day?.tasks ?? [];
  const total = tasks.length;
  const completed = tasks.filter((task) => task.done).length;
  const recorded = total > 0 || Boolean(day?.diary?.trim()) || Boolean(day?.mood);
  let kind = "empty", mark = "", label = "暂无记录";

  // 没有计划时不能算“全部完成”，日记或心情仅表示留下了记录。
  if (total === 0 && recorded) {
    kind = "recorded"; mark = "•"; label = "有记录，无计划";
  } else if (total > 0 && completed === total) {
    kind = "complete"; mark = "✓"; label = "全部完成";
  } else if (completed > 0) {
    kind = "partial"; mark = "◐"; label = "部分完成";
  } else if (total > 0 && key < todayKey) {
    kind = "missed"; mark = "×"; label = "计划未完成";
  } else if (total > 0) {
    // 今天还没有结束，未来计划也不应被标成失败。
    kind = "pending"; mark = "—"; label = "待开始";
  }

  return { kind, mark, label, completed, total, hasRecord: recorded };
}

export function statusDescription(status) {
  return status.total > 0
    ? `${status.label}，计划完成 ${status.completed} / ${status.total}`
    : status.label;
}
