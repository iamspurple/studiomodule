const addressDialog = document.getElementById('address-dialog');
const addressForm = addressDialog.querySelector('.address-form');
const addressDialogTitle = document.getElementById('address-dialog-title');
const addressStatus = document.querySelector('.address-status');
const addressFields = [...addressForm.querySelectorAll('input')];

// Demo state is kept only for the current page visit, without sending personal data.
const addresses = {
  billing: null,
  shipping: {
    recipient: 'Алексей Иванов',
    phone: '+7 (900) 000-00-00',
    country: 'Россия',
    city: 'Москва',
    postcode: '123100',
    street: 'Примерная',
    house: '12',
    apartment: '34',
  },
};
const addressLabels = {
  billing: { add: 'Добавить платёжный адрес', edit: 'Изменить платёжный адрес' },
  shipping: { add: 'Добавить адрес доставки', edit: 'Изменить адрес доставки' },
};
let activeAddress;

const renderAddress = (type) => {
  const card = document.querySelector(`[data-address="${type}"]`);
  const value = addresses[type];
  const preview = card.querySelector('.address-preview');
  const edit = card.querySelector('[data-address-edit]');
  preview.replaceChildren();
  preview.hidden = !value;
  card.querySelector('.address-empty').hidden = Boolean(value);
  card.querySelector('[data-address-delete]').hidden = !value;
  edit.textContent = value ? 'Изменить' : addressLabels[type].add;
  edit.setAttribute('aria-label', addressLabels[type][value ? 'edit' : 'add']);
  if (!value) return;

  const lines = [
    [value.recipient, 'address-recipient'],
    [`${value.country}, ${value.postcode}, г. ${value.city}`, ''],
    [`ул. ${value.street}, д. ${value.house}${value.apartment ? `, кв. / офис ${value.apartment}` : ''}`, ''],
    [value.phone, 'address-phone'],
  ];
  lines.forEach(([text, className]) => {
    const line = document.createElement('p');
    line.textContent = text;
    if (className) line.className = className;
    preview.append(line);
  });
};

document.querySelectorAll('[data-address-edit]').forEach((button) => {
  button.addEventListener('click', () => {
    activeAddress = button.dataset.addressEdit;
    const value = addresses[activeAddress];
    addressForm.reset();
    addressFields.forEach((field) => {
      field.setCustomValidity('');
      field.value = value?.[field.name] ?? (field.name === 'country' ? 'Россия' : '');
    });
    addressDialogTitle.textContent = addressLabels[activeAddress][value ? 'edit' : 'add'];
    addressStatus.textContent = '';
    addressDialog.showModal();
  });
});

document.querySelectorAll('[data-address-delete]').forEach((button) => {
  button.addEventListener('click', () => {
    const type = button.dataset.addressDelete;
    addresses[type] = null;
    renderAddress(type);
    addressStatus.textContent = type === 'billing' ? 'Платёжный адрес удалён.' : 'Адрес доставки удалён.';
    document.querySelector(`[data-address-edit="${type}"]`).focus();
  });
});

const validateAddressField = (field) => {
  let message = '';
  if (field.required && !field.value.trim()) message = 'Заполните это поле.';
  if (field.name === 'phone' && field.value.trim()) {
    const digits = field.value.replace(/\D/g, '');
    if (!/^[+\d\s()-]+$/.test(field.value) || digits.length < 10 || digits.length > 15) {
      message = 'Введите корректный номер телефона.';
    }
  }
  field.setCustomValidity(message);
};

addressFields.forEach((field) => {
  field.addEventListener('input', () => validateAddressField(field));
});

addressForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addressFields.forEach(validateAddressField);
  if (!addressForm.reportValidity()) return;
  addresses[activeAddress] = Object.fromEntries(addressFields.map((field) => [field.name, field.value.trim()]));
  renderAddress(activeAddress);
  addressDialog.close();
  addressStatus.textContent = activeAddress === 'billing' ? 'Платёжный адрес сохранён.' : 'Адрес доставки сохранён.';
});

addressDialog.querySelectorAll('.address-close, .address-cancel').forEach((button) => {
  button.addEventListener('click', () => addressDialog.close());
});

addressDialog.addEventListener('click', (event) => {
  if (event.target !== addressDialog) return;
  const rect = addressDialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom) addressDialog.close();
});

Object.keys(addresses).forEach(renderAddress);
