document.querySelectorAll('.header-catalog').forEach((catalog) => {
  const button = catalog.querySelector('.header-catalog-btn');
  const menu = catalog.querySelector('.header-catalog-nav');

  const setOpen = (open) => {
    catalog.classList.toggle('active', open);
    button.setAttribute('aria-expanded', String(open));
    menu.inert = !open;
  };

  setOpen(catalog.classList.contains('active'));

  button.addEventListener('click', () => {
    setOpen(!catalog.classList.contains('active'));
  });

  document.addEventListener('click', (event) => {
    if (!catalog.contains(event.target)) setOpen(false);
  });

  document.addEventListener('focusin', (event) => {
    if (!catalog.contains(event.target)) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && catalog.classList.contains('active')) {
      setOpen(false);
      button.focus();
    }
  });
});

const headerMenu = document.querySelector('.header-menu');
const headerMenuToggle = document.querySelector('.header-menu-toggle');

if (headerMenu && headerMenuToggle) {
  const closeButton = headerMenu.querySelector('.header-menu-close');
  const compactHeader = window.matchMedia('(max-width: 1024px)');
  const headerSearch = document.querySelector('.header-left .header-search-input');
  const menuSearch = headerMenu.querySelector('.header-search-input');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let closeTimer;

  const finishClose = () => {
    clearTimeout(closeTimer);
    if (headerMenu.open) headerMenu.close();
  };

  const closeMenu = () => {
    if (!headerMenu.open || headerMenu.dataset.state === 'closing') return;
    headerMenu.dataset.state = 'closing';
    if (reducedMotion.matches) {
      finishClose();
    } else {
      // Keep the modal and scroll lock until both panel and backdrop fade out.
      closeTimer = setTimeout(finishClose, 300);
    }
  };

  headerMenuToggle.addEventListener('click', () => {
    if (!compactHeader.matches || headerMenu.open) return;
    menuSearch.value = headerSearch.value;
    headerMenu.dataset.state = 'opening';
    headerMenu.showModal();
    // Establish the off-screen position before starting the transition.
    headerMenu.getBoundingClientRect();
    headerMenu.dataset.state = 'open';
    headerMenuToggle.setAttribute('aria-expanded', 'true');
  });

  closeButton.addEventListener('click', closeMenu);

  headerMenu.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeMenu();
  });

  headerMenu.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const controls = [...headerMenu.querySelectorAll('a[href], button, input, summary, [tabindex]')]
      .filter((control) => !control.disabled && control.tabIndex >= 0 && control.getClientRects().length);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // Only a click outside the panel closes the backdrop; its padding stays usable.
  headerMenu.addEventListener('click', (event) => {
    if (event.target !== headerMenu) return;
    const bounds = headerMenu.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) {
      closeMenu();
    }
  });

  headerMenu.addEventListener('close', () => {
    clearTimeout(closeTimer);
    delete headerMenu.dataset.state;
    headerSearch.value = menuSearch.value;
    headerMenuToggle.setAttribute('aria-expanded', 'false');
    if (compactHeader.matches) headerMenuToggle.focus({ preventScroll: true });
  });

  compactHeader.addEventListener('change', (event) => {
    if (!event.matches && headerMenu.open) finishClose();
  });
}
