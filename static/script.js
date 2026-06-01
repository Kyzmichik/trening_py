const title = document.querySelector('h1');
const button = document.querySelector('#change-title');

button.addEventListener('click', function() {
    if (title.textContent === 'Неймовірний сайт') {
        title.textContent = 'Мій Python блог';
    } else {
        title.textContent = 'Неймовірний сайт';
    }
})

const darkBtn = document.querySelector('#dark-mode');

darkBtn.addEventListener('click', function() {
    document.body.classList.toggle('dark-theme');
    
    // Змінюємо текст кнопки
    if (document.body.classList.contains('dark-theme')) {
        darkBtn.textContent = '☀️ Світла тема';
    } else {
        darkBtn.textContent = '🌙 Темна тема';
    }
});

// для зберігання статей
const addBtn = document.querySelector('#add-btn');
const articleTitle = document.querySelector('#article-title');
const articleText = document.querySelector('#article-text');
const articlesList = document.querySelector('#articles-list');

// Завантажуємо статті з сервера при старті
addBtn.addEventListener('click', function() {
    const titleValue = articleTitle.value;
    const textValue = articleText.value;

    if (titleValue === '' || textValue === '') {
        alert('Заповни всі поля!');
        return;
    }

    const article = {
        title: titleValue,
        text: textValue,
        date: new Date().toLocaleDateString('uk-UA')
    };

    // Перевіряємо — це редагування чи нова стаття?
    const editId = addBtn.dataset.editId;

    if (editId) {
        // Редагування — відправляємо PUT запит
        fetch('/articles/' + editId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(article)
        })
        .then(response => response.json())
        .then(() => {
            // Оновлюємо сторінку
            articlesList.innerHTML = '';
            loadArticles();

            // Повертаємо кнопку назад
            addBtn.textContent = 'Додати статтю';
            delete addBtn.dataset.editId;

            articleTitle.value = '';
            articleText.value = '';
        });
    } else {
        // Нова стаття — POST запит
        fetch('/articles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(article)
        })
        .then(response => response.json())
        .then(data => {
            renderArticle(data);
            articleTitle.value = '';
            articleText.value = '';
        });
    }
});

function renderArticle(article) {
    const newArticle = document.createElement('article');
    newArticle.dataset.id = article.id;
    newArticle.innerHTML = `
        <h3>${article.title}</h3>
        <p>${article.text}</p>
        <small>Опубліковано: ${article.date}</small>
        <button class="edit-btn">✏️ Редагувати</button>
        <button class="delete-btn">🗑 Видалити</button>
    `;

    const deleteBtn = newArticle.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', function() {
        fetch('/articles/' + article.id, {
            method: 'DELETE'
        })
        .then(() => newArticle.remove());
    });

    const editBtn = newArticle.querySelector('.edit-btn');
    editBtn.addEventListener('click', function() {
        // Заповнюємо форму даними статті
        articleTitle.value = article.title;
        articleText.value = article.text;

        // Змінюємо кнопку "Додати" на "Зберегти"
        addBtn.textContent = 'Зберегти зміни';
        addBtn.dataset.editId = article.id;

        // Скролимо до форми
        document.querySelector('#add-article').scrollIntoView();
    });

    articlesList.appendChild(newArticle);
}

function loadArticles() {
    fetch('/articles')
        .then(response => response.json())
        .then(data => {
            data.forEach(article => renderArticle(article));
        });
}

loadArticles();