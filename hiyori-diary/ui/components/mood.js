export const moods = [
  { id: "happy", label: "开心", sheet: "143", left: 55 },
  { id: "good", label: "还不错", sheet: "143", left: 350 },
  { id: "neutral", label: "普通", sheet: "193", left: 55 },
  { id: "low", label: "有点低落", sheet: "193", left: 650 },
  { id: "tired", label: "很累", sheet: "143", left: 950 },
];

// 像给原图开一扇小窗：只展示第一排的一个表情，不重画或拉伸人物。
// 两张原图均为 1260 × 2800；选择区是 260 × 260。历史页共用此函数。
export function moodSticker(mood) {
  return `<svg class="mood-sticker" data-mood="${mood.id}" viewBox="${mood.left} 1055 260 260" aria-hidden="true" focusable="false"><image href="assets/moods/pack-${mood.sheet}.jpg" width="1260" height="2800" /></svg>`;
}

export function mountMood(host, day, onChange) {
  host.innerHTML = `<div class="mood-intro"><span class="eyebrow">HOW DO YOU FEEL?</span><h2>此刻的心情</h2></div><div class="mood-options" role="group" aria-label="选择今天的心情，再次点击可取消"></div>`;
  const options = host.querySelector(".mood-options");
  moods.forEach((mood) => {
    const button = document.createElement("button");
    button.className = "mood-button";
    button.setAttribute("aria-label", mood.label);
    button.setAttribute("aria-pressed", String(day.mood === mood.id));
    button.innerHTML = `<span class="mood-emoji">${moodSticker(mood)}</span><span>${mood.label}</span>`;
    button.onclick = () => {
      day.mood = day.mood === mood.id ? null : mood.id;
      options
        .querySelectorAll("button")
        .forEach((b) => b.setAttribute("aria-pressed", "false"));
      button.setAttribute("aria-pressed", String(day.mood === mood.id));
      button.classList.remove("mood-pop");
      void button.offsetWidth;
      button.classList.add("mood-pop");
      onChange();
    };
    options.append(button);
  });
}
