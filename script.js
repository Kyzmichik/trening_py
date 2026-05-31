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

const addBtn = document.querySelector('#add-btn');
const articleTitle = document.querySelector('#article-title');
const articleText = document.querySelector('#article-text');
const articlesList = document.querySelector('#articles-list');

// Завантажуємо збережені статті при старті
loadArticles();

addBtn.addEventListener('click', function() {
    const titleValue = articleTitle.value;
    const textValue = articleText.value;

    if (titleValue === '' || textValue === '') {
        alert('Заповни всі поля!');
        return;
    }

    // Створюємо об'єкт статті
    const article = {
    id: Date.now(), // унікальний номер
    title: titleValue,
    text: textValue,
    date: new Date().toLocaleDateString('uk-UA')
    };

    // Зберігаємо в localStorage
    saveArticle(article);

    // Відображаємо на сторінці
    renderArticle(article);

    articleTitle.value = '';
    articleText.value = '';
});

function saveArticle(article) {
    // Зчитуємо існуючі статті
    const articles = JSON.parse(localStorage.getItem('articles') || '[]');
    articles.push(article);
    localStorage.setItem('articles', JSON.stringify(articles));
}

function renderArticle(article) {
    const newArticle = document.createElement('article');
    newArticle.dataset.id = article.id;
    newArticle.innerHTML = `
        <h3>${article.title}</h3>
        <p>${article.text}</p>
        <small>Опубліковано: ${article.date}</small>
        <button class="delete-btn">🗑 Видалити</button>
    `;

    const deleteBtn = newArticle.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', function() {
        // Видаляємо зі сторінки
        newArticle.remove();
        // Видаляємо з localStorage
        deleteArticle(article.id);
    })

    articlesList.appendChild(newArticle);
}

function loadArticles() {
    const articles = JSON.parse(localStorage.getItem('articles') || '[]');
    articles.forEach(function(article) {
        renderArticle(article);
    });
}

function deleteArticle(id) {
    let articles = JSON.parse(localStorage.getItem('articles') || '[]');
    articles = articles.filter(function(a) {
        return a.id !== id;
    });
    localStorage.setItem('articles', JSON.stringify(articles))};