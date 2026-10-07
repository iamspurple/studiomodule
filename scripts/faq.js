document.querySelectorAll('.faq-item').forEach((item) => {
  const title = item.querySelector('.faq-item-title');
  const answer = item.querySelector('.faq-item-wrapper');
  let expanded = item.open;
  let animation;

  item.dataset.expanded = String(expanded);

  title.addEventListener('click', (event) => {
    event.preventDefault();

    // Read the current frame before cancelling so rapid clicks stay smooth.
    const startHeight = item.open ? answer.getBoundingClientRect().height : 0;
    const startOpacity = item.open ? Number(getComputedStyle(answer).opacity) : 0;
    const startPadding = item.open ? getComputedStyle(answer).paddingBottom : '0px';
    if (animation) {
      animation.onfinish = null;
      animation.cancel();
    }

    expanded = !expanded;
    item.dataset.expanded = String(expanded);
    item.open = true;

    animation = answer.animate(
      [
        { height: `${startHeight}px`, opacity: startOpacity, paddingBottom: startPadding },
        { height: `${expanded ? answer.scrollHeight : 0}px`, opacity: expanded ? 1 : 0, paddingBottom: expanded ? '22px' : '0px' },
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
