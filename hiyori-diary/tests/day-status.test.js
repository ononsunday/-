import { test } from "node:test";
import assert from "node:assert/strict";
import { dayStatus, statusDescription } from "../ui/components/day-status.js";

const today = "2026-10-01";
const day = (done = [], diary = "", mood = null) => ({
  tasks: done.map((value, i) => ({ id: String(i), text: `计划 ${i}`, done: value })),
  diary,
  mood,
});

test("无记录与空白日记不会显示完成或失败", () => {
  for (const key of ["2026-09-30", today, "2026-10-02"])
    for (const value of [undefined, day(), day([], " \n ")]) {
      const status = dayStatus(value, key, today);
      assert.equal(status.kind, "empty");
      assert.equal(status.mark, "");
      assert.equal(status.hasRecord, false);
    }
});

test("零任务的日记或心情只有记录小点，不记为全部完成", () => {
  for (const value of [day([], "今天有点累"), day([], "", "good")]) {
    const status = dayStatus(value, "2026-09-30", today);
    assert.equal(status.kind, "recorded");
    assert.equal(status.mark, "•");
    assert.equal(status.total, 0);
    assert.equal(status.hasRecord, true);
    assert.equal(statusDescription(status), "有记录，无计划");
  }
});

test("昨日零完成显示叉号，跨月仍正确；今天和未来等待开始", () => {
  const value = day([false, false]);
  assert.equal(dayStatus(value, "2026-09-30", today).kind, "missed");
  assert.equal(dayStatus(value, "2026-09-30", today).mark, "×");
  for (const key of [today, "2026-10-02", "2027-01-01"]) {
    const status = dayStatus(value, key, today);
    assert.equal(status.kind, "pending");
    assert.equal(status.mark, "—");
    assert.equal(status.completed, 0);
    assert.equal(status.total, 2);
  }
});

test("部分完成与全部完成分别显示半圆和对号，保留实际数量", () => {
  for (const key of ["2026-09-30", today, "2026-10-02"]) {
    const partial = dayStatus(day([true, false, true]), key, today);
    assert.equal(partial.kind, "partial");
    assert.equal(partial.mark, "◐");
    assert.equal(statusDescription(partial), "部分完成，计划完成 2 / 3");
    const complete = dayStatus(day([true, true]), key, today);
    assert.equal(complete.kind, "complete");
    assert.equal(complete.mark, "✓");
    assert.equal(statusDescription(complete), "全部完成，计划完成 2 / 2");
  }
});

test("同一条记录经过午夜才从待开始变成过去未完成，不修改记录", () => {
  const value = day([false], "留一段日记", "neutral");
  const before = JSON.stringify(value);
  assert.equal(dayStatus(value, today, today).kind, "pending");
  assert.equal(dayStatus(value, today, "2026-10-02").kind, "missed");
  assert.equal(JSON.stringify(value), before);
});
