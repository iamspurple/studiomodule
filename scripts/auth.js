const authForm = document.querySelector('.auth-form');

if (authForm) {
  authForm.querySelectorAll('.auth-password-toggle').forEach((toggle) => {
    const password = document.getElementById(toggle.getAttribute('aria-controls'));
    const isConfirmation = password.name === 'password_confirmation';

    toggle.addEventListener('click', () => {
      const isVisible = password.type === 'password';
      password.type = isVisible ? 'text' : 'password';
      toggle.textContent = isVisible ? 'Скрыть' : 'Показать';
      toggle.setAttribute('aria-label', `${isVisible ? 'Скрыть' : 'Показать'} ${isConfirmation ? 'повторный пароль' : 'пароль'}`);
      toggle.setAttribute('aria-pressed', String(isVisible));
    });
  });

  const fields = [...authForm.querySelectorAll('.auth-input')];
  const password = authForm.elements.namedItem('password');
  const confirmation = authForm.elements.namedItem('password_confirmation');
  const isRegistration = authForm.dataset.authMode === 'registration';
  const isReset = authForm.dataset.authMode === 'reset';
  const touched = new Set();
  const status = authForm.querySelector('.auth-status');

  // Preview the notification design without simulating a real email request.
  if (isReset && new URLSearchParams(window.location.search).get('preview') === 'sent') {
    status.textContent = status.dataset.successMessage;
    status.hidden = false;
  }

  // Native validation remains available if JavaScript fails to load.
  authForm.noValidate = true;

  const getError = (field) => {
    const value = field.value;
    switch (field.name) {
      case 'name':
        return value.trim() ? '' : 'Введите корректное имя.';
      case 'phone': {
        const digits = value.replace(/\D/g, '');
        return /^[+\d\s().-]+$/.test(value) && digits.length >= 10 && digits.length <= 15
          ? '' : 'Введите корректный номер телефона.';
      }
      case 'email':
        return value.trim() && !field.validity.typeMismatch ? '' : 'Введите корректный Email.';
      case 'username':
        return value.trim() ? '' : 'Введите имя пользователя или Email.';
      case 'password':
        if (isRegistration) {
          if (!value) return 'Введите пароль. Минимум 8 символов.';
          return value.length >= 8 ? '' : 'Пароль слишком короткий. Минимум 8 символов.';
        }
        return value ? '' : 'Введите пароль.';
      case 'password_confirmation':
        if (!value) return 'Повторите пароль.';
        return value === password.value ? '' : 'Пароли не совпадают.';
      default:
        return '';
    }
  };

  const validateField = (field) => {
    const message = getError(field);
    const error = document.getElementById(`${field.id}-error`);
    const hint = field.closest('.auth-field').querySelector('.auth-hint');
    error.textContent = message;
    error.hidden = !message;
    field.setAttribute('aria-invalid', String(Boolean(message)));
    if (hint) hint.hidden = Boolean(message);
    const description = message ? error.id : hint?.id;
    if (description) field.setAttribute('aria-describedby', description);
    else field.removeAttribute('aria-describedby');
    return !message;
  };

  fields.forEach((field) => {
    field.addEventListener('blur', () => {
      touched.add(field);
      validateField(field);
    });
    field.addEventListener('input', () => {
      status.hidden = true;
      if (touched.has(field)) validateField(field);
      if (field === password && confirmation && touched.has(confirmation)) {
        validateField(confirmation);
      }
    });
  });

  authForm.addEventListener('submit', (event) => {
    event.preventDefault();
    status.hidden = true;
    let firstInvalid;
    fields.forEach((field) => {
      touched.add(field);
      if (!validateField(field) && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }
    status.textContent = isReset
      ? status.dataset.successMessage
      : isRegistration
      ? 'Регистрация пока недоступна. Попробуйте позже.'
      : 'Вход пока недоступен. Попробуйте позже.';
    status.hidden = false;
  });
}
