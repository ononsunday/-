import { exportBook, importBook, bridge, native, flush } from "../storage.js";
import { hasRecord } from "../model.js";
import { icon } from "../icons.js";
function confirmImport(count) {
  return new Promise((resolve) => {
    const dialog = document.querySelector("#confirm-dialog");
    dialog.innerHTML = `<span class="eyebrow">RESTORE YOUR PAGES</span><h2>恢复这份备份？</h2><p>备份中有 ${count} 天的记录。导入后，它会替换当前的全部记录和设置。</p><p>当前记录会先保留一份在本机。若想自行保管，也可以取消后先导出。</p><div class="dialog-actions"><button class="secondary-button" data-choice="cancel">取消</button><button class="primary-button" data-choice="restore">恢复备份</button></div>`;
    dialog.oncancel = (e) => {
      e.preventDefault();
      dialog.close();
      resolve(false);
    };
    dialog.querySelector('[data-choice="cancel"]').onclick = () => {
      dialog.close();
      resolve(false);
    };
    dialog.querySelector('[data-choice="restore"]').onclick = () => {
      dialog.close();
      resolve(true);
    };
    dialog.showModal();
    dialog.querySelector('[data-choice="cancel"]').focus();
  });
}
export function mountSettings(host, book, onChange, onRestore, notify) {
  host.innerHTML = `<section class="view-heading"><span class="eyebrow">MAKE YOURSELF AT HOME</span><h1>按喜欢的方式，记录</h1><p class="view-description">一点小调整，让这里更像自己的角落。</p></section><section class="paper settings-paper"><h2>外观与记录</h2><div class="settings-options"></div></section><section class="paper settings-paper"><h2>好好保管你的日常</h2><p class="settings-description">记录保存在这台电脑上。换电脑前，可以导出一份备份。</p><div class="backup-actions"><button class="secondary-button export-button">${icon("download")}导出数据</button><button class="secondary-button import-button">${icon("upload")}导入数据</button></div><p class="data-location"></p></section><div class="about-note"><span class="brand-mark">日</span><p>日和 <span>1.2.1</span></p><small>每一天，都可以从一件小事开始。</small></div>`;
  const options = host.querySelector(".settings-options");
  [
    ["dark", "moon", "深色模式", "夜晚，让眼睛轻松一点"],
    ["progress", "check", "显示完成进度", "看看今天已经完成的小事"],
    ["quote", "leaf", "显示每日一句", "给今天留一句温柔的话"],
  ].forEach(([key, symbol, title, subtitle]) => {
    const row = document.createElement("div");
    row.className = "setting-row";
    row.innerHTML = `<span class="setting-icon">${icon(symbol)}</span><div><h3>${title}</h3><p>${subtitle}</p></div><button class="switch" role="switch" aria-label="${title}" aria-checked="${book.settings[key]}"><span></span></button>`;
    row.querySelector("button").onclick = () => {
      book.settings[key] = !book.settings[key];
      row
        .querySelector("button")
        .setAttribute("aria-checked", String(book.settings[key]));
      onChange();
    };
    options.append(row);
  });
  const buttons = host.querySelectorAll(".backup-actions button");
  function busy(value) {
    buttons.forEach((b) => (b.disabled = value));
  }
  host.querySelector(".export-button").onclick = async () => {
    busy(true);
    try {
      if (await exportBook(book)) notify("备份已导出，记得好好保管。");
    } catch (e) {
      notify("导出失败：" + e.message);
    } finally {
      busy(false);
    }
  };
  host.querySelector(".import-button").onclick = async () => {
    busy(true);
    try {
      const incoming = await importBook();
      if (!incoming) return;
      const count = Object.values(incoming.days).filter(hasRecord).length;
      if (!(await confirmImport(count))) return;
      await flush();
      if (native) await bridge("archive");
      else localStorage.setItem("hiyori-before-import", JSON.stringify(book));
      await onRestore(incoming);
      notify("备份已恢复。");
    } catch (e) {
      notify(e.message);
    } finally {
      busy(false);
    }
  };
  if (native)
    bridge("info")
      .then((info) => {
        host.querySelector(".data-location").textContent =
          "保存位置：" + info.dataRoot;
      })
      .catch(() => {});
  else
    host.querySelector(".data-location").textContent =
      "网页预览模式：记录保存在当前浏览器中。";
}
