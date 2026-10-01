import { wordCount } from "../model.js";
export function mountDiary(host, day, onChange) {
  host.innerHTML = `<div class="section-heading"><div><span class="eyebrow">DEAR DIARY</span><h2>今日日记</h2></div><span class="section-note">写几句就好，留给以后的自己</span></div><textarea id="diary-text" aria-label="今日日记" maxlength="200000" placeholder="今天有什么想记住的小事吗？&#10;开心的、烦恼的，或者只是平平常常的一天。"></textarea><div class="diary-bottom"><span class="diary-saved">随手写下，自动保存</span><span class="word-count"></span></div>`;
  const input = host.querySelector("textarea"),
    count = host.querySelector(".word-count");
  input.value = day.diary;
  function update() {
    count.textContent = `今日已写 ${wordCount(input.value)} 字`;
    input.style.height = "auto";
    input.style.height = `${Math.max(140, input.scrollHeight)}px`;
  }
  input.oninput = () => {
    day.diary = input.value;
    update();
    onChange();
  };
  update();
}
