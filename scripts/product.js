const productImage = document.querySelector('.product-main-image');
const thumbnails = [...document.querySelectorAll('.product-thumbnail')];
thumbnails.forEach((button, index) => {
  button.addEventListener('click', () => {
    productImage.src = button.dataset.image;
    productImage.alt = `Studio Module HSD-61 — студийный стол, ракурс ${index + 1}`;
    thumbnails.forEach((thumbnail) => thumbnail.setAttribute('aria-pressed', String(thumbnail === button)));
  });
});

const tabs = [...document.querySelectorAll('.product-tabs [role="tab"]')];
function selectTab(selected) {
  tabs.forEach((tab) => {
    const active = tab === selected;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
  });
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (event) => {
    let next;
    if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
    if (event.key === 'ArrowLeft') next = tabs[(index + tabs.length - 1) % tabs.length];
    if (event.key === 'Home') next = tabs[0];
    if (event.key === 'End') next = tabs[tabs.length - 1];
    if (!next) return;
    event.preventDefault();
    selectTab(next);
    next.focus();
  });
});

const order = document.querySelector('.product-order');
const quantity = order.elements.quantity;
const decrease = order.querySelector('[data-quantity="decrease"]');
const increase = order.querySelector('[data-quantity="increase"]');
function updateQuantity(value) {
  quantity.value = Math.max(1, Math.min(99, Math.floor(Number(value) || 1)));
  decrease.disabled = Number(quantity.value) === 1;
  increase.disabled = Number(quantity.value) === 99;
}
decrease.addEventListener('click', () => updateQuantity(Number(quantity.value) - 1));
increase.addEventListener('click', () => updateQuantity(Number(quantity.value) + 1));
quantity.addEventListener('change', () => updateQuantity(quantity.value));
order.querySelectorAll('input[type="radio"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    order.querySelector(`[data-color-label="${radio.name}"]`).textContent = radio.value;
  });
});
order.addEventListener('submit', (event) => {
  event.preventDefault();
  updateQuantity(quantity.value);
  const status = order.querySelector('.product-order-status');
  try {
    const stored = JSON.parse(localStorage.getItem('studioModuleCart') || '[]');
    const cart = Array.isArray(stored) ? stored : [];
    const wood = order.elements.wood.value;
    const metal = order.elements.metal.value;
    const existing = cart.find((item) => item.id === 'hsd-61' && item.wood === wood && item.metal === metal);
    if (existing) existing.quantity = (Number(existing.quantity) || 0) + Number(quantity.value);
    else cart.push({ id: 'hsd-61', title: 'Studio Module HSD-61', price: 45000, wood, metal, quantity: Number(quantity.value) });
    localStorage.setItem('studioModuleCart', JSON.stringify(cart));
    const badge = document.querySelector('.header-cart-quantity');
    if (badge) badge.textContent = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    status.textContent = `Добавлено в корзину: ${quantity.value} шт. Корпус: ${wood}, металл: ${metal}.`;
  } catch {
    status.textContent = 'Не удалось сохранить товар в браузере. Попробуйте ещё раз.';
  }
});
