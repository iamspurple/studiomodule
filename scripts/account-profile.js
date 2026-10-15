const personalForm = document.getElementById('personal-form');
const passwordForm = document.getElementById('password-form');

document.querySelectorAll('.profile-password-toggle').forEach((button) => {
  const input = document.getElementById(button.getAttribute('aria-controls'));
  const label = input.closest('.profile-field').querySelector('label').textContent.toLowerCase();
  button.addEventListener('click', () => {
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    button.textContent = show ? 'Скрыть' : 'Показать';
    button.setAttribute('aria-pressed', String(show));
    button.setAttribute('aria-label', `${show ? 'Скрыть' : 'Показать'} пароль: ${label}`);
  });
});

const getProfileError = (field) => {
  const value = field.value;
  if (field.form === personalForm) {
    if (!value.trim()) return 'Заполните это поле.';
    if (field.type === 'email' && field.validity.typeMismatch) return 'Введите корректный Email.';
    return '';
  }
  if (!value) return 'Введите пароль.';
  const newPassword = passwordForm.elements.namedItem('newPassword').value;
  if (field.name === 'newPassword') {
    if (value.length < 8) return 'Пароль должен содержать не менее 8 символов.';
    if (value === passwordForm.elements.namedItem('currentPassword').value) return 'Новый пароль должен отличаться от действующего.';
  }
  if (field.name === 'confirmPassword' && value !== newPassword) return 'Пароли не совпадают.';
  return '';
};

const validateProfileField = (field) => {
  const error = document.getElementById(`${field.id}-error`);
  const message = getProfileError(field);
  error.textContent = message;
  error.hidden = !message;
  field.setAttribute('aria-invalid', String(Boolean(message)));
  const hint = field.closest('.profile-field').querySelector('.profile-hint');
  const descriptions = [message ? error.id : '', hint?.id || '', field.id === 'password-new' ? 'profile-password-hint' : ''].filter(Boolean);
  if (descriptions.length) field.setAttribute('aria-describedby', descriptions.join(' '));
  else field.removeAttribute('aria-describedby');
  return !message;
};

[personalForm, passwordForm].forEach((form) => {
  form.noValidate = true;
  const fields = [...form.querySelectorAll('input')];
  const status = form.querySelector('.profile-status');
  const touched = new Set();

  fields.forEach((field) => {
    field.addEventListener('blur', () => {
      touched.add(field);
      validateProfileField(field);
    });
    field.addEventListener('input', () => {
      status.hidden = true;
      fields.forEach((item) => {
        if (touched.has(item)) validateProfileField(item);
      });
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    status.hidden = true;
    let firstInvalid;
    fields.forEach((field) => {
      touched.add(field);
      if (!validateProfileField(field) && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }
    if (form === personalForm) {
      fields.forEach((field) => { field.value = field.value.trim(); });
      status.textContent = 'Личные данные сохранены.';
    } else {
      // Demo validation only: passwords are never sent, stored, or logged.
      status.textContent = 'Данные проверены. Смена пароля станет доступна после подключения личного кабинета.';
      fields.forEach((field) => {
        field.value = '';
        field.type = 'password';
        field.removeAttribute('aria-invalid');
      });
      form.querySelectorAll('.profile-password-toggle').forEach((button) => {
        const input = document.getElementById(button.getAttribute('aria-controls'));
        const label = input.closest('.profile-field').querySelector('label').textContent.toLowerCase();
        button.textContent = 'Показать';
        button.setAttribute('aria-pressed', 'false');
        button.setAttribute('aria-label', `Показать пароль: ${label}`);
      });
      touched.clear();
    }
    status.hidden = false;
  });
});
