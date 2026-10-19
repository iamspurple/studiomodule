const checkoutForm = document.getElementById('checkout-form');
const checkoutStatus = checkoutForm.querySelector('.checkout-status');
const checkoutFields = [...checkoutForm.querySelectorAll('[data-validate]')];
const checkoutTouched = new Set();

// Match the existing FAQ/cart animation, including direction changes mid-animation.
document.querySelectorAll('.checkout-disclosure').forEach((item) => {
  const title = item.querySelector('summary');
  const content = item.querySelector('.checkout-disclosure-content');
  let expanded = item.open;
  let animation;

  item.dataset.expanded = String(expanded);
  content.inert = !expanded;
  title.setAttribute('aria-expanded', String(expanded));

  title.addEventListener('click', (event) => {
    event.preventDefault();
    const startHeight = item.open ? content.getBoundingClientRect().height : 0;
    const startOpacity = item.open ? Number(getComputedStyle(content).opacity) : 0;
    if (animation) {
      animation.onfinish = null;
      animation.cancel();
    }

    expanded = !expanded;
    item.dataset.expanded = String(expanded);
    title.setAttribute('aria-expanded', String(expanded));
    content.inert = !expanded;
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

const createAccount = checkoutForm.elements.namedItem('create-account');
const accountFields = document.getElementById('checkout-account-fields');
const accountPassword = document.getElementById('checkout-password');
createAccount.addEventListener('change', () => {
  accountFields.hidden = !createAccount.checked;
  accountPassword.disabled = !createAccount.checked;
  accountPassword.required = createAccount.checked;
  createAccount.setAttribute('aria-expanded', String(createAccount.checked));
  if (!createAccount.checked) {
    accountPassword.value = '';
    checkoutTouched.delete(accountPassword);
    accountPassword.removeAttribute('aria-invalid');
    document.getElementById('checkout-password-error').hidden = true;
  }
  checkoutStatus.hidden = true;
});

const formatCheckoutMoney = (value) => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
const checkoutSubtotal = 6560;
let checkoutDiscount = 0;

const updateCheckoutTotals = () => {
  const shipping = Number(checkoutForm.querySelector('[name="shipping"]:checked').dataset.price);
  checkoutForm.querySelector('[data-checkout-shipping]').textContent = formatCheckoutMoney(shipping);
  checkoutForm.querySelector('[data-checkout-total]').textContent = formatCheckoutMoney(checkoutSubtotal + shipping - checkoutDiscount);
  checkoutForm.querySelector('.checkout-discount').hidden = checkoutDiscount === 0;
  checkoutForm.querySelector('[data-checkout-discount]').textContent = `−${formatCheckoutMoney(checkoutDiscount)}`;
};

checkoutForm.querySelectorAll('[name="shipping"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    updateCheckoutTotals();
    checkoutStatus.hidden = true;
  });
});

const checkoutCoupon = document.getElementById('checkout-coupon');
const couponStatus = checkoutForm.querySelector('.checkout-coupon-status');
const applyCheckoutCoupon = () => {
  const code = checkoutCoupon.value.trim().toUpperCase();
  const valid = code === 'MODULE10'; // Demo coupon: 10% off products, excluding delivery.
  couponStatus.hidden = false;
  couponStatus.dataset.error = String(!valid);
  checkoutCoupon.setAttribute('aria-invalid', String(!valid));
  checkoutCoupon.setAttribute('aria-describedby', 'checkout-coupon-status');
  if (!valid) {
    couponStatus.textContent = code ? 'Купон не найден.' : 'Введите код купона.';
    return;
  }
  checkoutDiscount = Math.round(checkoutSubtotal * 0.1);
  couponStatus.textContent = 'Купон применён. Скидка 10% на товары.';
  updateCheckoutTotals();
  checkoutStatus.hidden = true;
};
couponStatus.id = 'checkout-coupon-status';
checkoutForm.querySelector('.checkout-coupon-apply').addEventListener('click', applyCheckoutCoupon);
checkoutCoupon.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    applyCheckoutCoupon();
  }
});

const getCheckoutError = (field) => {
  if (field.disabled) return '';
  if (field.type === 'checkbox') return field.required && !field.checked ? 'Подтвердите согласие с правилами и политикой конфиденциальности.' : '';
  const value = field.value.trim();
  if (field.required && !value) return 'Заполните это поле.';
  if (!value) return '';
  if (field.type === 'email' && field.validity.typeMismatch) return 'Введите корректный Email.';
  if (field.type === 'tel') {
    const digits = value.replace(/\D/g, '');
    if (!/^[+\d\s().-]+$/.test(value) || digits.length < 10 || digits.length > 15) return 'Введите корректный номер телефона.';
  }
  if (field.type === 'password' && field.value.length < 8) return 'Пароль должен содержать не менее 8 символов.';
  return '';
};

const validateCheckoutField = (field) => {
  const error = document.getElementById(`${field.id}-error`);
  const message = getCheckoutError(field);
  error.textContent = message;
  error.hidden = !message;
  field.setAttribute('aria-invalid', String(Boolean(message)));
  const descriptions = [message ? error.id : '', field === accountPassword ? 'checkout-password-hint' : ''].filter(Boolean);
  if (descriptions.length) field.setAttribute('aria-describedby', descriptions.join(' '));
  else field.removeAttribute('aria-describedby');
  return !message;
};

checkoutForm.noValidate = true;
checkoutFields.forEach((field) => {
  field.addEventListener('blur', () => {
    checkoutTouched.add(field);
    validateCheckoutField(field);
  });
  field.addEventListener(field.type === 'checkbox' ? 'change' : 'input', () => {
    checkoutStatus.hidden = true;
    if (checkoutTouched.has(field)) validateCheckoutField(field);
  });
});

checkoutForm.addEventListener('submit', (event) => {
  event.preventDefault();
  checkoutStatus.hidden = true;
  let firstInvalid;
  checkoutFields.forEach((field) => {
    if (field.disabled) return;
    checkoutTouched.add(field);
    if (!validateCheckoutField(field) && !firstInvalid) firstInvalid = field;
  });
  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }
  // Layout preview only: no order, account, payment, or personal data is sent.
  checkoutStatus.textContent = 'Данные заполнены корректно. Оформление и оплата будут доступны после подключения магазина.';
  checkoutStatus.hidden = false;
});

updateCheckoutTotals();
