import { icon } from "../icons.js";
import { taskAdd, taskMove } from "../model.js";
export function mountTasks(host, day, onChange, notify = () => {}) {
  host.innerHTML = `<div class="section-heading"><div><span class="eyebrow">A LITTLE EVERY DAY</span><h2>今日计划 <span class="small-count"></span></h2></div><span class="section-note">给今天，留一点期待</span></div><div class="progress-wrap"><div class="progress-info"><span id="progress-label"></span><span class="progress-percent"></span></div><div class="progress-track"><div class="progress-fill"></div></div></div><div class="task-list"></div><form class="add-task"><span>${icon("plus")}</span><input id="new-task" maxlength="300" placeholder="今天，想做些什么？" aria-label="添加计划" autocomplete="off"><button class="add-button" type="submit" aria-label="添加计划">添加 ${icon("arrow")}</button></form><p class="task-hint">点击文字修改 · 拖动左侧调整顺序</p>`;
  const list = host.querySelector(".task-list");
  function draw(animateId) {
    // FLIP 动画：记录旧位置，重绘后从旧位置平滑移动到新位置。
    const before = new Map(
      [...list.children].map((row) => [
        row.dataset.id,
        row.getBoundingClientRect().top,
      ]),
    );
    list.replaceChildren();
    host.querySelector(".small-count").textContent = String(
      day.tasks.length,
    ).padStart(2, "0");
    const done = day.tasks.filter((t) => t.done).length,
      percent = day.tasks.length
        ? Math.round((done / day.tasks.length) * 100)
        : 0;
    host.querySelector("#progress-label").textContent =
      `今日完成 ${done} / ${day.tasks.length}`;
    host.querySelector(".progress-percent").textContent = `${percent}%`;
    host.querySelector(".progress-fill").style.width = `${percent}%`;
    if (!day.tasks.length) {
      const empty = document.createElement("p");
      empty.className = "task-empty";
      empty.textContent = "从一件小事开始，就很好。";
      list.append(empty);
    }
    day.tasks.forEach((task, index) => {
      const row = document.createElement("div");
      row.className = `task-row ${task.done ? "completed" : ""}`;
      row.dataset.id = task.id;
      row.innerHTML = `<button class="drag-handle icon-button" draggable="true" title="拖动排序；也可用 Alt + 上下方向键" aria-label="拖动计划排序">${icon("grip")}</button><button class="check-box" role="checkbox" aria-checked="${task.done}" aria-label="标记完成">${icon("check")}</button><input class="task-text" aria-label="修改计划" maxlength="300"><div class="row-actions"><button class="icon-button move-up" aria-label="上移计划" title="上移" ${index === 0 ? "disabled" : ""}>${icon("up")}</button><button class="icon-button move-down" aria-label="下移计划" title="下移" ${index === day.tasks.length - 1 ? "disabled" : ""}>${icon("down")}</button><button class="icon-button delete" aria-label="删除计划" title="删除">${icon("trash")}</button></div>`;
      row.querySelector(".task-text").value = task.text;
      row.querySelector(".check-box").onclick = () => {
        task.done = !task.done;
        onChange();
        draw(task.id);
        list.querySelector(`[data-id="${task.id}"] .check-box`).focus();
      };
      const input = row.querySelector(".task-text");
      input.oninput = () => {
        if (input.value.trim()) {
          task.text = input.value.trim();
          onChange();
        }
      };
      input.onblur = () => {
        input.value = task.text;
      };
      input.onkeydown = (e) => {
        if (e.key === "Enter" && !e.isComposing) input.blur();
        if (e.key === "Escape") {
          input.value = task.text;
          input.blur();
        }
      };
      row.querySelector(".delete").onclick = () => {
        const removed = day.tasks.splice(index, 1)[0];
        onChange();
        draw();
        notify("计划已删除", () => {
          day.tasks.splice(Math.min(index, day.tasks.length), 0, removed);
          onChange();
          if (host.isConnected) draw();
        });
      };
      const move = (delta) => {
        if (taskMove(day, task.id, delta)) {
          onChange();
          draw(task.id);
          list.querySelector(`[data-id="${task.id}"] .drag-handle`).focus();
        }
      };
      row.querySelector(".move-up").onclick = () => move(-1);
      row.querySelector(".move-down").onclick = () => move(1);
      row.querySelector(".drag-handle").onkeydown = (e) => {
        if (e.altKey && ["ArrowUp", "ArrowDown"].includes(e.key)) {
          e.preventDefault();
          move(e.key === "ArrowUp" ? -1 : 1);
        }
      };
      row.querySelector(".drag-handle").ondragstart = (e) => {
        e.dataTransfer.setData("text/plain", task.id);
        e.dataTransfer.effectAllowed = "move";
        row.classList.add("dragging");
      };
      row.ondragend = () => row.classList.remove("dragging");
      row.ondragover = (e) => {
        e.preventDefault();
        row.classList.add("drop-target");
      };
      row.ondragleave = () => row.classList.remove("drop-target");
      row.ondrop = (e) => {
        e.preventDefault();
        const from = day.tasks.findIndex(
          (t) => t.id === e.dataTransfer.getData("text/plain"),
        );
        if (from >= 0 && from !== index) {
          taskMove(day, day.tasks[from].id, index - from);
          onChange();
        }
        draw(task.id);
      };
      if (task.id === animateId && !before.has(task.id))
        row.classList.add("just-changed");
      list.append(row);
    });
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const row of list.querySelectorAll(".task-row")) {
        if (before.has(row.dataset.id)) {
          const dy =
            before.get(row.dataset.id) - row.getBoundingClientRect().top;
          if (dy)
            row.animate(
              [
                { transform: `translateY(${dy}px)` },
                { transform: "translateY(0)" },
              ],
              { duration: 320, easing: "cubic-bezier(.22,1,.36,1)" },
            );
        }
      }
      const checked = list.querySelector(
        `[data-id="${animateId}"] .check-box[aria-checked="true"]`,
      );
      if (checked)
        checked.animate(
          [
            { transform: "scale(.8)" },
            { transform: "scale(1.14)" },
            { transform: "scale(1)" },
          ],
          { duration: 320, easing: "ease-out" },
        );
    }
  }
  host.querySelector("form").onsubmit = (e) => {
    e.preventDefault();
    const input = host.querySelector("#new-task");
    if (taskAdd(day, input.value)) {
      input.value = "";
      onChange();
      draw(day.tasks.at(-1).id);
      input.focus();
    }
  };
  draw();
}
