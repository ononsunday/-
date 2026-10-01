// 视觉反馈不读取日记。人物位置由 CSS 固定，不跟着鼠标或抽签跳动。
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const nav = document.querySelector(".bottom-nav");
const marker = document.createElement("span");
marker.className = "nav-marker";
marker.setAttribute("aria-hidden", "true");
nav.prepend(marker);
function syncNavigation() {
  const active = nav.querySelector("button.active");
  if (!active) return;
  marker.style.width = `${active.offsetWidth}px`;
  marker.style.height = `${active.offsetHeight}px`;
  marker.style.transform = `translateX(${active.offsetLeft}px)`;
}
new MutationObserver(syncNavigation).observe(nav, {
  attributes: true, attributeFilter: ["class"], childList: true, subtree: true,
});
new ResizeObserver(syncNavigation).observe(nav);
document.fonts.ready.then(syncNavigation);
syncNavigation();
document.addEventListener("click", (event) => {
  const button = event.target.closest(".add-button,.primary-button,.secondary-button");
  if (!button || button.disabled || reducedMotion.matches) return;
  const bounds = button.getBoundingClientRect();
  const bloom = document.createElement("span");
  bloom.className = "click-bloom";
  bloom.setAttribute("aria-hidden", "true");
  bloom.style.left = `${event.detail ? event.clientX - bounds.left : bounds.width / 2}px`;
  bloom.style.top = `${event.detail ? event.clientY - bounds.top : bounds.height / 2}px`;
  button.append(bloom);
  bloom.addEventListener("animationend", () => bloom.remove(), { once: true });
  setTimeout(() => bloom.remove(), 800);
});
// 写字时暂停装饰动效。离开输入框后继续，不重新播放整段场景。
function syncWriting() {
  document.body.classList.toggle("is-writing", document.activeElement.matches("input,textarea"));
}
document.addEventListener("focusin", syncWriting);
document.addEventListener("focusout", () => requestAnimationFrame(syncWriting));
