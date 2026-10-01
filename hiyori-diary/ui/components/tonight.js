import { icon, escapeHtml } from "../icons.js";
import {
  activities,
  categories,
  energyLabels,
  createTonightState,
  filterActivities,
  pickActivity,
  formatDuration,
  createCustomActivity,
} from "../activities.js";

/**
 * onAdd(activity) 由 app.js 把活动写进“今天”的计划；返回 false 表示已经有了。
 * state 由 app.js 保留，切换到其他页再回来时，筛选和抽到的活动不会丢。
 * onCustomChange(next) 由 app.js 保存自定义活动列表，可以返回 Promise。
 * 这里不保存日记，也不读取旧“今晚做什么”的浏览器数据。
 */
export function mountTonight(host, onAdd, notify = () => {}, state = createTonightState(), onCustomChange = () => {}) {
  state.addedIds ??= [];
  state.customActivities ??= [];
  host.innerHTML = `<section class="tonight-view">
    <header class="view-heading tonight-heading">
      <span class="eyebrow">A LITTLE SERENDIPITY</span>
      <h1>今晚做什么</h1>
      <p class="view-description">留一小段时间，做件喜欢的小事。</p>
    </header>
    <div class="tonight-layout">
      <section class="tonight-controls" aria-label="选择活动范围">
        <div class="tonight-filter-heading"><h2>今晚想做点什么？</h2><span class="tonight-pool-count"></span></div>
        <div class="tonight-category-list" role="group" aria-label="活动分类">
          ${["all", ...categories].map((category) => `<button type="button" class="tonight-category" data-category="${escapeHtml(category)}" aria-pressed="false">${category === "all" ? "随心" : escapeHtml(category)}</button>`).join("")}
        </div>
        <div class="tonight-selects">
          <label class="tonight-select-label">留多少时间？<select class="tonight-time" aria-label="活动时长">
            <option value="0">不限时长</option><option value="10">约 10 分钟</option>
            <option value="30">约 30 分钟</option><option value="60">约 1 小时</option>
            <option value="120">约 2 小时及以上</option>
          </select></label>
          <label class="tonight-select-label">现在的精力<select class="tonight-energy" aria-label="现在的精力">
            <option value="3">还有精神</option><option value="2">有点累</option><option value="1">很累，想轻松点</option>
          </select></label>
        </div>
        <p class="tonight-filter-note">时长是大致范围，不用计时完成。</p>
        <div class="tonight-custom">
          <button type="button" class="text-button tonight-custom-toggle" aria-haspopup="dialog" aria-expanded="false" aria-controls="tonight-custom-dialog">${icon("plus")} 添加自己的活动</button>
          <dialog id="tonight-custom-dialog" class="tonight-custom-dialog" aria-labelledby="tonight-dialog-title">
            <div class="tonight-dialog-heading"><div><span class="eyebrow">YOUR LITTLE IDEA</span><h2 id="tonight-dialog-title">添加自己的活动</h2></div><button class="icon-button tonight-dialog-close" type="button" aria-label="关闭添加活动">×</button></div>
          <form id="tonight-custom-form" class="tonight-custom-form">
            <label class="tonight-custom-label">活动名称<input name="name" maxlength="100" required autocomplete="off" placeholder="例如：整理今天的课堂笔记"></label>
            <div class="tonight-custom-fields">
              <label class="tonight-custom-label">分类<select name="category">${categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("")}</select></label>
              <label class="tonight-custom-label">时长（分钟）<input name="duration" type="number" min="1" max="600" step="1" value="30" required></label>
              <label class="tonight-custom-label">需要的精力<select name="energy"><option value="1">轻松就能做</option><option value="2" selected>需要一点精力</option><option value="3">适合有精神时</option></select></label>
            </div>
            <label class="tonight-custom-label">说明（可不填）<textarea name="description" maxlength="300" rows="2" placeholder="留一句提醒自己的话"></textarea></label>
            <p class="tonight-custom-error" role="alert" hidden></p>
            <div class="tonight-custom-actions"><button class="primary-button tonight-custom-submit" type="submit">保存活动</button><button class="text-button tonight-custom-cancel" type="button">取消</button></div>
          </form>
          </dialog>
        </div>
      </section>
      <section class="paper tonight-card" aria-label="今晚的活动推荐">
        <div class="tonight-card-kicker"><span class="eyebrow">TONIGHT'S LITTLE DRAW</span><span class="tonight-card-mark" aria-hidden="true">${icon("moon")}</span></div>
        <div class="tonight-result" aria-live="polite" aria-atomic="true">
          <span class="tonight-result-category"></span>
          <h2 class="tonight-result-name"></h2>
          <p class="tonight-result-description"></p>
        </div>
        <p class="tonight-result-meta" aria-live="polite"></p>
        <div class="tonight-actions">
          <button type="button" class="primary-button tonight-draw">抽一个活动 ${icon("arrow")}</button>
          <button type="button" class="secondary-button tonight-add" hidden>加入今日计划 ${icon("plus")}</button>
        </div>
        <p class="tonight-card-note">不喜欢就换一个，今晚由你决定。</p>
      </section>
    </div>
    <p class="tonight-footnote"></p>
  </section>`;

  const categoryList = host.querySelector(".tonight-category-list"),
    time = host.querySelector(".tonight-time"),
    energy = host.querySelector(".tonight-energy"),
    result = host.querySelector(".tonight-result"),
    drawButton = host.querySelector(".tonight-draw"),
    addButton = host.querySelector(".tonight-add"),
    customToggle = host.querySelector(".tonight-custom-toggle"),
    customDialog = host.querySelector(".tonight-custom-dialog"),
    customClose = host.querySelector(".tonight-dialog-close"),
    customForm = host.querySelector(".tonight-custom-form"),
    customSubmit = host.querySelector(".tonight-custom-submit"),
    customCancel = host.querySelector(".tonight-custom-cancel"),
    customError = host.querySelector(".tonight-custom-error");
  let pool, current, adding = false, savingCustom = false;

  function syncFilters() {
    time.value = String(state.time);
    energy.value = String(state.energy);
    categoryList.querySelectorAll("button").forEach((button) => {
      const selected = button.dataset.category === state.category;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    pool = filterActivities(state);
    host.querySelector(".tonight-pool-count").textContent = `${pool.length} 件可选`;
    host.querySelector(".tonight-footnote").textContent = `${categories.length} 个分类 · ${activities.length + state.customActivities.length} 件小事 · 加入计划后会保存到本机`;
    drawButton.disabled = !pool.length;
    current = pool.find((activity) => activity.id === state.currentId) || null;
    if (!current) state.currentId = null;
    renderResult();
  }

  function renderResult() {
    // 活动文字只写到 textContent；整张卡和按钮保留，更新时不会突然换位。
    host.querySelector(".tonight-result-category").textContent = current?.category || "今晚的一点偶然";
    host.querySelector(".tonight-result-name").textContent = current
      ? current.name
      : pool.length ? "从一件小事开始" : "换个范围试试吧";
    host.querySelector(".tonight-result-description").textContent = current
      ? current.description
      : pool.length
        ? "轻轻点一下，看看今晚有什么值得期待。"
        : "这个分类里暂时没有符合时长和精力的活动。可以放宽一个筛选条件。";
    host.querySelector(".tonight-result-meta").textContent = current
      ? `${formatDuration(current.duration)} · ${energyLabels[current.energy]}`
      : "";
    drawButton.innerHTML = `${current ? "换一个" : "抽一个活动"} ${icon("arrow")}`;
    addButton.hidden = !current;
    const added = current && state.addedIds.includes(current.id);
    addButton.disabled = !current || added || adding;
    addButton.innerHTML = added
      ? `已加入今日计划 ${icon("check")}`
      : `加入今日计划 ${icon("plus")}`;
    host.querySelector(".tonight-card").classList.toggle("has-result", !!current);
  }

  categoryList.onclick = (event) => {
    const button = event.target.closest("button[data-category]");
    if (!button) return;
    state.category = button.dataset.category;
    syncFilters();
  };
  time.onchange = () => {
    state.time = Number(time.value);
    syncFilters();
  };
  energy.onchange = () => {
    state.energy = Number(energy.value);
    syncFilters();
  };
  drawButton.onclick = () => {
    current = pickActivity(pool, state.currentId);
    state.currentId = current?.id || null;
    renderResult();
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
      result.animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: 340, easing: "ease-out" });
  };
  addButton.onclick = async () => {
    if (!current || adding || state.addedIds.includes(current.id)) return;
    const activity = current;
    adding = true;
    renderResult();
    try {
      const added = await onAdd(activity);
      state.addedIds.push(activity.id);
      notify(added === false ? "今日计划里已经有这件事了。" : "已加入今日计划，慢慢来就好。");
    } catch (error) {
      notify("暂时没有加入计划：" + error.message);
    } finally {
      adding = false;
      // onAdd 可以触发切页；组件卸载后不再操作另一个页面的 DOM。
      if (host.contains(addButton)) renderResult();
    }
  };

  function showCustomForm(show) {
    if (savingCustom) return;
    if (show) {
      if (customDialog.open) return;
      customError.hidden = true;
      // 原生 dialog 负责键盘焦点范围，背景页面不会被 Tab 或滚轮误操作。
      customDialog.showModal();
      customToggle.setAttribute("aria-expanded", "true");
      customForm.elements.name.focus({ preventScroll: true });
    } else {
      customDialog.close();
    }
  }
  customToggle.onclick = () => showCustomForm(true);
  customCancel.onclick = () => showCustomForm(false);
  customClose.onclick = () => showCustomForm(false);
  customDialog.oncancel = (event) => {
    event.preventDefault();
    showCustomForm(false);
  };
  customDialog.onkeydown = (event) => {
    if (event.key !== "Tab") return;
    // 在原生对话框内循环首尾控件，避免 Tab 最后走向浏览器工具栏。
    const controls = [...customDialog.querySelectorAll("button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled)")]
      .filter((control) => control.tabIndex >= 0 && control.getClientRects().length);
    const first = controls[0], last = controls.at(-1);
    if (!first) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  };
  customDialog.onclose = () => {
    customToggle.setAttribute("aria-expanded", "false");
    // Esc 或关闭时保留草稿；成功保存后才清空。焦点回到原来的打开按钮。
    if (host.contains(customToggle)) customToggle.focus({ preventScroll: true });
  };
  customDialog.onclick = (event) => {
    if (event.target !== customDialog) return;
    const rect = customDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)
      showCustomForm(false);
  };
  customForm.onsubmit = async (event) => {
    event.preventDefault();
    if (savingCustom) return;
    customError.hidden = true;
    try {
      const values = Object.fromEntries(new FormData(customForm));
      const activity = createCustomActivity(values);
      const next = [...state.customActivities, activity];
      savingCustom = true;
      customSubmit.disabled = true;
      customCancel.disabled = true;
      customToggle.disabled = true;
      customClose.disabled = true;
      // app.js 负责保存。保存失败时保留填写的文字，用户可以直接重试。
      await onCustomChange(next);
      state.customActivities = next;
      notify("自己的活动已经加入抽签。");
      savingCustom = false;
      if (host.contains(customForm)) {
        customForm.reset();
        showCustomForm(false);
        syncFilters();
      }
    } catch (error) {
      if (host.contains(customForm)) {
        customError.textContent = error.message || "活动暂时没有保存成功，请再试一次。";
        customError.hidden = false;
      }
    } finally {
      savingCustom = false;
      customSubmit.disabled = false;
      customCancel.disabled = false;
      customToggle.disabled = false;
      customClose.disabled = false;
    }
  };
  syncFilters();
  return state;
}
