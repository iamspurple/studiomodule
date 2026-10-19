const catalogGrid = document.querySelector('.catalog-grid');
const catalogSort = document.getElementById('catalog-sort');
const catalogCards = [...catalogGrid.querySelectorAll('.catalog-card')];

const sortCatalog = () => {
  const cards = [...catalogCards];
  cards.sort((a, b) => {
    switch (catalogSort.value) {
      case 'price-asc': return Number(a.dataset.price) - Number(b.dataset.price);
      case 'price-desc': return Number(b.dataset.price) - Number(a.dataset.price);
      // Пока у демотоваров нет этих показателей, сохраняем исходный порядок.
      case 'popularity':
      case 'rating':
        return Number(b.dataset[catalogSort.value] || 0) - Number(a.dataset[catalogSort.value] || 0)
          || Number(a.dataset.position) - Number(b.dataset.position);
      default: return Number(a.dataset.position) - Number(b.dataset.position);
    }
  });
  catalogGrid.append(...cards);
};

catalogSort.addEventListener('change', () => {
  sortCatalog();
  document.querySelector('.catalog-status').textContent = `Сортировка: ${catalogSort.selectedOptions[0].textContent}. Показано товаров: ${catalogCards.length}.`;
});

const sortControl = document.createElement('div');
sortControl.className = 'catalog-sort-control';
const sortTrigger = document.createElement('button');
sortTrigger.type = 'button';
sortTrigger.id = 'catalog-sort-trigger';
sortTrigger.className = 'catalog-sort-trigger';
sortTrigger.setAttribute('aria-haspopup', 'listbox');
sortTrigger.setAttribute('aria-expanded', 'false');
sortTrigger.setAttribute('aria-controls', 'catalog-sort-list');
sortTrigger.setAttribute('aria-labelledby', 'catalog-sort-label catalog-sort-trigger');
sortTrigger.textContent = catalogSort.selectedOptions[0].textContent;
const sortLabel = document.querySelector('label[for="catalog-sort"]');
sortLabel.id = 'catalog-sort-label';
sortLabel.htmlFor = sortTrigger.id;

const sortList = document.createElement('ul');
sortList.id = 'catalog-sort-list';
sortList.className = 'catalog-sort-list';
sortList.setAttribute('role', 'listbox');
sortList.setAttribute('aria-labelledby', sortLabel.id);
sortList.hidden = true;

const closeSort = (restoreFocus = false) => {
  sortList.hidden = true;
  sortTrigger.setAttribute('aria-expanded', 'false');
  if (restoreFocus) sortTrigger.focus();
};

const sortOptions = [...catalogSort.options].map((option) => {
  const item = document.createElement('li');
  item.className = 'catalog-sort-option';
  item.textContent = option.textContent;
  item.setAttribute('role', 'option');
  item.setAttribute('aria-selected', String(option.selected));
  item.tabIndex = -1;
  item.addEventListener('click', () => {
    catalogSort.value = option.value;
    catalogSort.dispatchEvent(new Event('change', { bubbles: true }));
    closeSort(true);
  });
  sortList.append(item);
  return item;
});

const openSort = () => {
  sortList.hidden = false;
  sortTrigger.setAttribute('aria-expanded', 'true');
  sortOptions[catalogSort.selectedIndex].focus();
};

sortTrigger.addEventListener('click', () => {
  if (sortList.hidden) openSort();
  else closeSort();
});
sortTrigger.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    openSort();
  }
});
sortList.addEventListener('keydown', (event) => {
  const index = sortOptions.indexOf(document.activeElement);
  let nextIndex;
  switch (event.key) {
    case 'ArrowDown': nextIndex = (index + 1) % sortOptions.length; break;
    case 'ArrowUp': nextIndex = (index - 1 + sortOptions.length) % sortOptions.length; break;
    case 'Home': nextIndex = 0; break;
    case 'End': nextIndex = sortOptions.length - 1; break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      sortOptions[index]?.click();
      return;
    case 'Escape':
      event.preventDefault();
      closeSort(true);
      return;
    case 'Tab':
      // Сначала возвращаем фокус, затем браузер переводит его дальше по странице.
      closeSort(true);
      return;
    default: return;
  }
  event.preventDefault();
  sortOptions[nextIndex].focus();
});
document.addEventListener('click', (event) => {
  if (!sortControl.contains(event.target)) closeSort();
});
sortControl.addEventListener('focusout', (event) => {
  if (!sortControl.contains(event.relatedTarget)) closeSort();
});
catalogSort.addEventListener('change', () => {
  sortTrigger.textContent = catalogSort.selectedOptions[0].textContent;
  sortOptions.forEach((item, index) => {
    item.setAttribute('aria-selected', String(index === catalogSort.selectedIndex));
  });
});
sortControl.append(sortTrigger, sortList);
catalogSort.after(sortControl);
catalogSort.hidden = true;

sortCatalog();
