document.querySelectorAll('.cart-coupon').forEach((item) => {
  const title = item.querySelector('summary');
  const content = item.querySelector('.cart-coupon-wrapper');
  let expanded = item.open;
  let animation;

  item.dataset.expanded = String(expanded);

  title.addEventListener('click', (event) => {
    event.preventDefault();

    // Preserve the current frame when the direction changes mid-animation.
    const startHeight = item.open ? content.getBoundingClientRect().height : 0;
    const startOpacity = item.open ? Number(getComputedStyle(content).opacity) : 0;
    if (animation) {
      animation.onfinish = null;
      animation.cancel();
    }

    expanded = !expanded;
    item.dataset.expanded = String(expanded);
    item.open = true;

    animation = content.animate(
      [
        { height: `${startHeight}px`, opacity: startOpacity },
        { height: `${expanded ? content.scrollHeight : 0}px`, opacity: expanded ? 1 : 0 },
      ],
      {
        duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 280,
        easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
    );

    animation.onfinish = () => {
      item.open = expanded;
      animation = null;
    };
  });
});
