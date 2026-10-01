import { test } from "node:test";
import assert from "node:assert/strict";
import {
  activities,
  categories,
  createTonightState,
  filterActivities,
  pickActivity,
  formatDuration,
  validateCustomActivity,
  createCustomActivity,
} from "../ui/activities.js";

test("原活动库完整保留，八个分类均有至少三十条", () => {
  assert.equal(activities.length, 252);
  assert.equal(categories.length, 8);
  assert.equal(new Set(activities.map((activity) => activity.id)).size, 252);
  for (const category of categories)
    assert.ok(activities.filter((activity) => activity.category === category).length >= 30);
});

test("分类、时长、精力同时限制候选，不悄悄放宽空结果", () => {
  const state = { ...createTonightState(), category: "学习", time: 10, energy: 1 };
  const pool = filterActivities(state);
  assert.ok(pool.some((activity) => activity.name === "学会一个快捷键"));
  assert.ok(!pool.some((activity) => activity.name === "做一道 SQL 题"));
  assert.ok(pool.every((activity) => activity.category === "学习" && activity.duration <= 15 && activity.energy <= 1));
  state.time = 120;
  assert.deepEqual(filterActivities(state), []);
  state.category = "放松";
  assert.ok(filterActivities(state).some((activity) => activity.name === "安排一个不做正事的晚上"));
});

test("不限制时长时仍遵循分类和精力", () => {
  const state = { ...createTonightState(), time: 0, category: "看电影", energy: 1 };
  const pool = filterActivities(state);
  assert.ok(pool.some((activity) => activity.duration === 120));
  assert.ok(pool.every((activity) => activity.category === "看电影" && activity.energy <= 1));
});

test("多个候选时不会立即重复，单候选和空候选仍正常", () => {
  const pool = activities.slice(0, 3);
  const first = pickActivity(pool, null, () => 0);
  const second = pickActivity(pool, first.id, () => 0);
  assert.notEqual(first.id, second.id);
  assert.equal(pickActivity([first], first.id), first);
  assert.equal(pickActivity([], first.id), null);
});

test("实际活动时长不四舍五入，不把 90 分钟写成两小时", () => {
  assert.equal(formatDuration(90), "90 分钟");
  assert.equal(formatDuration(150), "150 分钟");
  assert.equal(formatDuration(60), "1 小时");
  assert.equal(formatDuration(120), "2 小时");
});

test("自定义活动保留文字，整理空白，数值字段可来自表单", () => {
  const activity = createCustomActivity({
    name: "  写一小段日记  ", category: "放松", duration: "15", energy: "1",
    description: "  第一行\n第二行  ",
  });
  assert.match(activity.id, /^custom-/);
  assert.equal(activity.name, "写一小段日记");
  assert.equal(activity.description, "第一行\n第二行");
  assert.equal(activity.duration, 15);
  assert.equal(activity.energy, 1);
  assert.notEqual(activity.id, createCustomActivity(activity).id);
  assert.equal(validateCustomActivity({ ...activity, description: undefined }).description, "");
});

test("错误或过长的自定义活动被拒绝，避免导入后产生异常候选", () => {
  const valid = { name: "自己的活动", category: "学习", duration: 30, energy: 2 };
  for (const name of ["", "   ", "字".repeat(101), null])
    assert.throws(() => validateCustomActivity({ ...valid, name }));
  for (const duration of [0, -1, 601, 1.5, Infinity, NaN, "abc", true, null])
    assert.throws(() => validateCustomActivity({ ...valid, duration }));
  for (const energy of [0, 4, 1.5, "abc", true, null])
    assert.throws(() => validateCustomActivity({ ...valid, energy }));
  assert.throws(() => validateCustomActivity({ ...valid, category: "不存在" }));
  assert.throws(() => validateCustomActivity({ ...valid, description: "字".repeat(301) }));
  assert.throws(() => validateCustomActivity({ ...valid, description: {} }));
  assert.throws(() => validateCustomActivity(null));
  assert.throws(() => validateCustomActivity([]));
  assert.equal(validateCustomActivity({ ...valid, name: "字".repeat(100), duration: 600, description: "字".repeat(300) }).duration, 600);
});

test("自定义活动进入相同筛选池，仍遵循分类、时间与精力", () => {
  const custom = createCustomActivity({ name: "静静做自己的小事", category: "放松", duration: 5, energy: 1 });
  const state = { ...createTonightState(), customActivities: [custom], category: "放松", time: 10, energy: 1 };
  assert.ok(filterActivities(state).some((activity) => activity.id === custom.id));
  state.category = "学习";
  assert.ok(!filterActivities(state).some((activity) => activity.id === custom.id));
  state.category = "放松";
  state.time = 120;
  assert.ok(!filterActivities(state).some((activity) => activity.id === custom.id));
});
