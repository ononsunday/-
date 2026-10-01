import { newBook, validateBook } from "./model.js";
const CACHE = "hiyori-book-v1";
export const native = !!window.chrome?.webview;
const pending = new Map();
let serial = 0;
if (native)
  window.chrome.webview.addEventListener("message", (event) => {
    const m = event.data;
    if (m.event === "closing") {
      window.dispatchEvent(new Event("native-closing"));
      return;
    }
    const request = pending.get(m.id);
    if (!request) return;
    pending.delete(m.id);
    clearTimeout(request.timer);
    m.error ? request.reject(new Error(m.error)) : request.resolve(m.data);
  });
export function bridge(op, data) {
  return new Promise((resolve, reject) => {
    const id = String(++serial);
    // 导入、导出可能等待用户选择文件，因此不对文件对话框设置短超时。
    const timer = ["import", "export"].includes(op)
      ? null
      : setTimeout(() => {
          pending.delete(id);
          reject(new Error("保存服务暂时没有回应，请稍后重试。"));
        }, 15000);
    pending.set(id, { resolve, reject, timer });
    window.chrome.webview.postMessage({ id, op, data });
  });
}
export async function loadBook() {
  let cached = null,
    cacheFailed = false;
  try {
    cached = localStorage.getItem(CACHE);
  } catch {
    cacheFailed = true;
  }
  const files = native ? await bridge("load") : {};
  const candidates = [files.current, cached, files.backup].filter(
    (v) => v != null,
  );
  const valid = [];
  for (const raw of candidates) {
    try {
      valid.push(validateBook(JSON.parse(raw.replace(/^\uFEFF/, ""))));
    } catch {}
  }
  if (!valid.length && candidates.length)
    throw new Error(
      "记录文件暂时无法读取。为保护原文件，日和没有覆盖它。请使用之前导出的备份恢复，或检查本地 data.json 和 previous.json。",
    );
  valid.sort((a, b) => b.updatedAt - a.updatedAt);
  return {
    book: valid[0] || newBook(),
    recovered: valid.length < candidates.length,
    cacheFailed,
  };
}
// 每次修改先同步存一份浏览器缓存，再按顺序写入本地文件。
// writeChain 防止较早的保存晚于较新的保存完成，覆盖刚输入的内容。
let writeChain = Promise.resolve();
let lastError = null;
export function saveBook(book, status = () => {}) {
  book.updatedAt = Math.max(Date.now(), book.updatedAt + 1);
  const raw = JSON.stringify(book);
  let cacheError = null;
  try {
    localStorage.setItem(CACHE, raw);
  } catch (e) {
    cacheError = e;
  }
  status("正在保存…");
  writeChain = writeChain
    .catch(() => {})
    .then(async () => {
      if (native) await bridge("save", raw);
      else if (cacheError) throw cacheError;
      lastError = null;
      status("已保存到本机");
    })
    .catch((e) => {
      lastError = e;
      status("保存失败，请导出备份");
      window.dispatchEvent(
        new CustomEvent("save-error", { detail: e.message }),
      );
    });
  return writeChain;
}
export async function flush() {
  await writeChain;
  if (lastError) throw lastError;
}
export async function exportBook(book) {
  const raw = JSON.stringify(book, null, 2);
  if (native) return bridge("export", raw);
  const url = URL.createObjectURL(
    new Blob([raw], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `日和备份-${new Date().toLocaleDateString("sv-SE")}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  return true;
}
export async function importBook() {
  let raw;
  if (native) raw = await bridge("import");
  else
    raw = await new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json,application/json";
      input.oncancel = () => resolve(null);
      input.onchange = async () => {
        const file = input.files[0];
        if (file?.size > 16000000) {
          resolve("too large");
          return;
        }
        resolve(file ? await file.text() : null);
      };
      input.click();
    });
  if (raw == null) return null;
  try {
    return validateBook(JSON.parse(raw.replace(/^\uFEFF/, "")));
  } catch (e) {
    throw new Error(
      "无法导入：" +
        (e instanceof SyntaxError ? "文件不是有效的 JSON。" : e.message),
    );
  }
}
