document.querySelectorAll('.article-comment-form').forEach((form) => {
  const status = form.querySelector('.article-comment-status');
  const remember = form.elements.remember;
  const storageKey = 'studio-module-comment-author';

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved) {
      ['name', 'email'].forEach((name) => {
        form.elements[name].value = saved[name] || '';
      });
      remember.checked = true;
    }
  } catch {
    // Форма доступна и при заблокированном хранилище браузера.
  }

  remember.addEventListener('change', () => {
    if (!remember.checked) {
      try { localStorage.removeItem(storageKey); } catch { /* Хранилище недоступно. */ }
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    try {
      if (remember.checked) {
        const author = Object.fromEntries(['name', 'email'].map((name) => [name, form.elements[name].value]));
        localStorage.setItem(storageKey, JSON.stringify(author));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch { /* Не мешаем работе формы при недоступном хранилище. */ }
    status.textContent = 'Это демонстрационная форма. Комментарий не отправлен: отправка станет доступна после подключения сайта к серверу.';
  });
});
