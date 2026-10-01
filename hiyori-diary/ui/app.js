import { dayFor, dateKey, parseDate, taskAdd } from "./model.js";
import {
  loadBook,
  saveBook,
  flush,
  bridge,
  native,
  importBook,
} from "./storage.js";
import { mountTasks } from "./components/tasks.js";
import { icon } from "./icons.js";
import { mountDiary } from "./components/diary.js";
import { mountMood } from "./components/mood.js";
import { mountHistory } from "./components/history.js";
import { mountCalendar } from "./components/calendar.js";
import { mountSettings } from "./components/settings.js";
import { mountTonight } from "./components/tonight.js";
import { createTonightState } from "./activities.js";
import { dayStatus } from "./components/day-status.js";
import { dailyQuote } from "./quotes.js";
const tonightState = createTonightState();
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let renderVersion = 0;
let quoteLayoutObserver;
let calendarMonth = new Date();
let book,
  route = "today",
  selected = dateKey(),
  toastTimer,
  lastToday = dateKey();
const main = document.querySelector("#main"),
  status = document.querySelector(".save-status");
export function toast(message, undo) {
  clearTimeout(toastTimer);
  const el = document.querySelector(".toast");
  el.replaceChildren();
  el.hidden = false;
  const span = document.createElement("span");
  span.textContent = message;
  el.append(span);
  if (undo) {
    const b = document.createElement("button");
    b.textContent = "撤销";
    b.onclick = () => {
      undo();
      el.hidden = true;
    };
    el.append(b);
  }
  toastTimer = setTimeout(() => (el.hidden = true), undo ? 8000 : 4500);
}
function save() {
  saveBook(book, (text) => (status.textContent = text));
}
function applySettings() {
  document.documentElement.dataset.theme = book.settings.dark
    ? "dark"
    : "light";
  document.body.classList.toggle("hide-progress", !book.settings.progress);
  document.body.classList.toggle("hide-quote", !book.settings.quote);
  if (native) bridge("theme", book.settings.dark).catch(() => {});
}
function openDate(key = dateKey()) {
  selected = key;
  route = "today";
  render();
}
function todayView() {
  const key = selected,
    day = dayFor(book, key),
    date = parseDate(key),
    isToday = key === dateKey();
  // 仅浏览空日期不写入记录；第一次编辑后才放进 days。
  const change = () => {
    book.days[key] = day;
    save();
  };
  main.innerHTML = `<div class="today-view"><section class="today-opening"><div class="day-scenery" aria-hidden="true"><img class="day-background" src="assets/scenes/today-background.webp" width="3840" height="2160" alt=""><div class="scene-light"></div></div><section class="date-header"><p class="eyebrow">A NEW PAGE, AT YOUR OWN PACE</p><div class="date-title"><h1>${new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", day: "numeric" }).format(date)}</h1><span class="day-tag">${isToday ? "今天" : "那一天"}</span></div><p class="date-sub">${new Intl.DateTimeFormat("zh-CN", { weekday: "long" }).format(date)}</p><p class="daily-quote">今天也慢慢来吧。</p><div class="date-controls"><button class="icon-button" id="prev-day" aria-label="前一天">${icon("left")}</button><button class="icon-button" id="next-day" aria-label="后一天">${icon("right")}</button>${isToday ? "" : '<button class="text-button" id="back-today">回到今天</button>'}</div></section><img class="day-foreground" src="assets/scenes/today-foreground.webp" width="3840" height="2160" alt="清夏里的人物与轻轻垂下的发丝"><span class="scene-caption" aria-hidden="true">清夏 · 把日子慢慢写下来</span></section><div class="journal-paper"><div class="paper-spine" aria-hidden="true"></div><div class="journal-columns"><div class="plan-column"><section class="tasks-paper" id="tasks"></section><section class="mood-section" id="mood"></section></div><section class="diary-paper" id="diary"></section></div><p class="journal-end">这一页，属于你。<span class="today-status"></span></p></div></div>`;
  const quote = dailyQuote(key), quoteElement = document.createElement("figure");
  quoteElement.className = "daily-quote";
  quoteElement.lang = quote.language === "zh" ? "zh-CN" : "en";
  quoteElement.dataset.quoteId = quote.id;
  quoteElement.title = `${quote.author} · ${quote.work}\n${quote.sourceUrl}`;
  const quoteText = document.createElement("blockquote"), source = document.createElement("figcaption");
  quoteText.className = "quote-text";
  quoteText.textContent = quote.text;
  source.className = "quote-source";
  source.textContent = `— ${quote.author} · ${quote.work}`;
  quoteElement.append(quoteText, source);
  main.querySelector(".daily-quote").replaceWith(quoteElement);
  const opening = main.querySelector(".today-opening"), header = main.querySelector(".date-header");
  // 中英文长短不同；让页首随正文变高，背景与人物使用相同高度，保持重合。
  const sizeOpening = () => opening.style.setProperty("--quote-content-size", `${Math.ceil(header.getBoundingClientRect().height + 12)}px`);
  sizeOpening();
  quoteLayoutObserver = new ResizeObserver(sizeOpening);
  quoteLayoutObserver.observe(header);
  mountTasks(main.querySelector("#tasks"), day, change, toast);
  mountMood(main.querySelector("#mood"), day, change);
  mountDiary(main.querySelector("#diary"), day, change);
  const updateSummary = () => {
    const summary = dayStatus(day, key, dateKey());
    main.querySelector(".today-status").textContent = summary.total
      ? `计划完成 ${summary.completed} / ${summary.total}` : "随手记录，自动保存";
  };
  main.querySelector(".journal-paper").addEventListener("input", updateSummary);
  main.querySelector(".journal-paper").addEventListener("click", updateSummary);
  updateSummary();
  function shift(delta) {
    const next = parseDate(key);
    next.setDate(next.getDate() + delta);
    if (next.getFullYear() < 1900 || next.getFullYear() > 9999) return;
    openDate(dateKey(next));
  }
  main.querySelector("#prev-day").onclick = () => shift(-1);
  main.querySelector("#next-day").onclick = () => shift(1);
  main
    .querySelector("#back-today")
    ?.addEventListener("click", () => openDate());
  if (!isToday) {
    main.querySelector("#tasks h2").childNodes[0].textContent = "当日计划 ";
    main.querySelector("#diary h2").textContent = "当日日记";
  }
}
async function render() {
  const version = ++renderVersion;
  // 先柔和退场，再画下一页。只改变透明度，不把人物从一边突然挪到另一边。
  if (main.hasChildNodes() && !reducedMotion.matches) {
    const exit = main.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: "ease-out", fill: "forwards" });
    await exit.finished.catch(() => {});
    exit.cancel();
    if (version !== renderVersion) return;
  }
  quoteLayoutObserver?.disconnect();
  applySettings();
  main.dataset.page = route;
  document.body.dataset.page = route;
  if (route === "today") todayView();
  else if (route === "history") mountHistory(main, book, openDate);
  else if (route === "calendar")
    mountCalendar(main, book, openDate, calendarMonth, (next) => {
      calendarMonth = next;
      render();
    });
  else if (route === "tonight") {
    if (tonightState.day !== dateKey()) {
      tonightState.day = dateKey();
      tonightState.addedIds = [];
    }
    tonightState.customActivities = book.customActivities;
    mountTonight(main, async (activity) => {
      const key = dateKey(), day = dayFor(book, key);
      const text = `${activity.name} · ${activity.duration}分钟`;
      if (day.tasks.some((task) => task.text === text)) return false;
      if (!taskAdd(day, text)) return false;
      book.days[key] = day;
      save();
      await flush();
      return true;
    }, toast, tonightState, async (activities) => {
      if (activities.length > 1000) throw new Error("最多保存 1000 条自己的活动。");
      book.customActivities = activities;
      save();
      await flush();
    });
    const scenery = document.createElement("div");
    scenery.className = "night-scenery";
    scenery.setAttribute("aria-hidden", "true");
    scenery.innerHTML = '<img class="night-background" src="assets/scenes/tonight-sky.webp" width="3840" height="2160" alt=""><img class="night-foreground" src="assets/scenes/tonight-character.webp" width="815" height="1579" alt=""><img class="night-grass" src="assets/scenes/tonight-grass.webp" width="3840" height="2160" alt=""><div class="night-stars"><i></i><i></i><i></i><i></i><i></i></div>';
    main.querySelector(".tonight-view").prepend(scenery);
  }
  else if (route === "settings")
    mountSettings(
      main,
      book,
      () => {
        applySettings();
        save();
      },
      async (incoming) => {
        book = incoming;
        save();
        render();
        await flush();
      },
      toast,
    );
  document.querySelectorAll(".bottom-nav button").forEach((b) => {
    b.classList.toggle("active", b.dataset.route === route);
    if (b.dataset.route === route) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
  if (route === "history") {
    const records = document.createElement("div");
    records.className = "history-records";
    records.append(...main.childNodes);
    const layout = document.createElement("div");
    layout.className = "history-view";
    const portrait = document.createElement("aside");
    portrait.className = "history-portrait";
    portrait.setAttribute("aria-hidden", "true");
    const art = document.createElement("img");
    art.className = "history-art";
    art.src = "assets/scenes/history-cover.webp";
    art.alt = "利兹与青鸟的两位少女";
    portrait.append(art);
    layout.append(portrait, records);
    main.replaceChildren(layout);
  }
  if (!reducedMotion.matches) main.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: "ease-out" });
  window.scrollTo({ top: 0, behavior: "instant" });
}
document.querySelector(".bottom-nav").innerHTML = [
  ["today", "sun", "今天"],
  ["calendar", "calendar", "日历"],
  ["history", "book", "历史"],
  ["tonight", "moon", "今晚"],
  ["settings", "settings", "设置"],
]
  .map(
    ([r, i, label]) =>
      `<button data-route="${r}">${icon(i)}<span>${label}</span></button>`,
  )
  .join("");
document.querySelector(".bottom-nav").onclick = (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  route = b.dataset.route;
  if (route === "today") selected = dateKey();
  render();
};
document.querySelector(".brand").onclick = (e) => {
  e.preventDefault();
  openDate();
};
window.addEventListener("save-error", (e) => toast("保存失败：" + e.detail));
window.addEventListener("native-closing", async () => {
  try {
    await flush();
    await bridge("close");
  } catch (e) {
    const dialog = document.querySelector("#confirm-dialog");
    if (dialog.open) dialog.close();
    dialog.innerHTML = `<h2>还有修改没有保存成功</h2><p>可以继续编辑，并在设置里导出备份。仍然关闭的话，尚未保存的内容可能丢失。</p><div class="dialog-actions"><button class="secondary-button keep-editing">继续编辑</button><button class="primary-button close-anyway">仍然关闭</button></div>`;
    dialog.oncancel = () => {};
    dialog.querySelector(".keep-editing").onclick = () => dialog.close();
    dialog.querySelector(".close-anyway").onclick = () => bridge("close");
    dialog.showModal();
    dialog.querySelector(".keep-editing").focus();
  }
});
try {
  const loaded = await loadBook();
  book = loaded.book;
  render();
  status.textContent = "已保存到本机";
  if (loaded.recovered) toast("已从本机备份恢复记录。");
} catch (e) {
  main.innerHTML =
    '<section class="empty-state"><h1>记录暂时无法打开</h1><p class="load-error"></p><button class="primary-button recover-button">从备份恢复</button><p>选择有效备份后恢复。当前文件会先另存一份。</p></section>';
  main.querySelector(".load-error").textContent = e.message;
  status.textContent = "未覆盖原文件";
  document.querySelector(".bottom-nav").hidden = true;
  document.querySelector(".brand").onclick = (e) => e.preventDefault();
  main.querySelector(".recover-button").onclick = async () => {
    try {
      const incoming = await importBook();
      if (!incoming) return;
      if (native) await bridge("archive");
      else
        localStorage.setItem(
          "hiyori-before-import",
          localStorage.getItem("hiyori-book-v1") || "",
        );
      book = incoming;
      save();
      await flush();
      location.reload();
    } catch (error) {
      toast(error.message);
    }
  };
}
// 跨午夜不把正在写的内容移到第二天；用户点“今天”即可翻页。
setInterval(() => {
  const now = dateKey();
  if (now !== lastToday) {
    lastToday = now;
    toast("新的一天开始了，点击底部“今天”翻到新的一页。");
    const tag = main.querySelector(".day-tag");
    if (tag) tag.textContent = selected === now ? "今天" : "那一天";
  }
}, 30000);
