import { dateKey } from "../model.js";
import { icon } from "../icons.js";
import { dayStatus, statusDescription } from "./day-status.js";
export function mountCalendar(host, book, openDate, month, onMonthChange) {
  const year = month.getFullYear(),
    index = month.getMonth();
  host.innerHTML = `<section class="view-heading"><span class="eyebrow">LITTLE MARKS, LOVELY DAYS</span><h1>在日历里，翻翻日子</h1><p class="view-description">完成、部分完成，或只是写下几句话，都能在这里看见。</p></section><section class="paper calendar-paper"><div class="calendar-heading"><h2>${year} <span>年</span> ${index + 1} <span>月</span></h2><div><button class="text-button current-month">回到本月</button><button class="icon-button prev-month" aria-label="上个月">${icon("left")}</button><button class="icon-button next-month" aria-label="下个月">${icon("right")}</button></div></div><div class="week-labels">${["一", "二", "三", "四", "五", "六", "日"].map((d) => `<span>${d}</span>`).join("")}</div><div class="calendar-grid" aria-label="${year}年${index + 1}月"></div><div class="calendar-legend"><span class="legend-item"><b class="day-status status-complete" aria-hidden="true">✓</b> 全部完成</span><span class="legend-item"><b class="day-status status-partial" aria-hidden="true">◐</b> 部分完成</span><span class="legend-item"><b class="day-status status-missed" aria-hidden="true">×</b> 未完成</span><span class="legend-item"><b class="day-status status-pending" aria-hidden="true">—</b> 待开始</span><span class="legend-item"><b class="day-status status-recorded" aria-hidden="true">•</b> 仅记录</span></div><p class="calendar-summary"></p></section><div class="calendar-footnote">今天还在继续，未做的计划不会提前记作未完成。<br>点击日期，翻开那一天的计划和日记。</div>`;
  const first = new Date(year, index, 1, 12),
    offset = (first.getDay() + 6) % 7,
    count = new Date(year, index + 1, 0).getDate(),
    grid = host.querySelector(".calendar-grid");
  for (let i = 0; i < offset; i++) {
    const blank = document.createElement("span");
    blank.className = "calendar-blank";
    grid.append(blank);
  }
  const todayKey = dateKey();
  let records = 0;
  for (let d = 1; d <= count; d++) {
    const key = dateKey(new Date(year, index, d, 12)),
      day = book.days[key],
      status = dayStatus(day, key, todayKey),
      has = status.hasRecord,
      today = key === todayKey;
    if (has) records++;
    const b = document.createElement("button");
    b.className = `calendar-day is-${status.kind} ${today ? "is-today" : ""} ${has ? "has-record" : ""}`;
    b.dataset.date = key;
    b.innerHTML = `<span class="calendar-day-number">${d}</span><span class="calendar-status day-status status-${status.kind}" aria-hidden="true">${status.mark}</span>${status.total ? `<small class="calendar-count">${status.completed} / ${status.total}</small>` : ""}`;
    const description = `${year}年${index + 1}月${d}日${today ? "，今天" : ""}，${statusDescription(status)}，点击查看`;
    b.setAttribute(
      "aria-label",
      description,
    );
    b.title = description;
    if (today) b.setAttribute("aria-current", "date");
    b.onclick = () => openDate(key);
    grid.append(b);
  }
  host.querySelector(".calendar-summary").textContent =
    `这个月，记录了 ${records} 天`;
  function move(delta) {
    const next = new Date(year, index + delta, 1, 12);
    if (next.getFullYear() < 1900 || next.getFullYear() > 9999) return;
    onMonthChange(next);
  }
  host.querySelector(".prev-month").onclick = () => move(-1);
  host.querySelector(".next-month").onclick = () => move(1);
  host.querySelector(".current-month").onclick = () =>
    onMonthChange(new Date());
}
