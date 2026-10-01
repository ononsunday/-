import { dateKey, hasRecord, parseDate } from "../model.js";
import { moods, moodSticker } from "./mood.js";
import { icon } from "../icons.js";
import { dayStatus, statusDescription } from "./day-status.js";
export function mountHistory(host, book, openDate) {
  const keys = Object.keys(book.days)
    .filter((k) => hasRecord(book.days[k]))
    .sort()
    .reverse();
  host.innerHTML = `<section class="view-heading"><span class="eyebrow">PAGES OF YOUR LIFE</span><h1>日子的小记</h1><p class="view-description">${keys.length ? `已经留下 ${keys.length} 天的记录，偶尔回来翻一翻。` : "每一页，都会好好留在这里。"}</p></section><div class="history-list"></div>`;
  const list = host.querySelector(".history-list");
  if (!keys.length) {
    list.innerHTML = `<div class="empty-state">${icon("book")}<h2>故事从今天开始</h2><p>写下第一件计划，或留一小段日记。<br>它们会在这里，慢慢积成日常。</p><button class="primary-button">去记录今天 ${icon("arrow")}</button></div>`;
    list.querySelector("button").onclick = () => openDate();
    return;
  }
  const todayKey = dateKey();
  let group = "";
  keys.forEach((key) => {
    const date = parseDate(key),
      month = key.slice(0, 7),
      day = book.days[key],
      mood = moods.find((m) => m.id === day.mood),
      status = dayStatus(day, key, todayKey);
    if (month !== group) {
      group = month;
      const h = document.createElement("h3");
      h.className = "month-label";
      h.textContent = `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`;
      list.append(h);
    }
    const button = document.createElement("button");
    button.className = "history-card";
    const description = `查看 ${key} 的记录，${statusDescription(status)}${mood ? `，心情${mood.label}` : ""}`;
    button.setAttribute("aria-label", description);
    button.title = description;
    button.innerHTML = `<div class="history-date"><strong>${String(date.getDate()).padStart(2, "0")}</strong><span>${new Intl.DateTimeFormat("zh-CN", { weekday: "short" }).format(date)}</span></div><div class="history-content"><div class="history-meta"><span class="history-status day-status status-${status.kind}"><b aria-hidden="true">${status.mark}</b> ${status.label}</span><span>计划完成 ${status.completed} / ${status.total}</span><span class="history-mood">${mood ? `${moodSticker(mood)} ${mood.label}` : "未记录心情"}</span></div><p class="history-preview"></p></div><span class="history-arrow">${icon("right")}</span>`;
    button.querySelector(".history-preview").textContent =
      day.diary.trim() || "这一天，留下了一点生活的痕迹。";
    button.onclick = () => openDate(key);
    list.append(button);
  });
}
