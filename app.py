from flask import Flask, render_template, jsonify, request
import sqlite3

app = Flask(__name__)

# Підключення до бази даних
def get_db():
    conn = sqlite3.connect('articles.db')
    conn.row_factory = sqlite3.Row
    return conn

# Створюємо таблицю якщо не існує
def init_db():
    conn = get_db()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            text TEXT NOT NULL,
            date TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/articles', methods=['GET'])
def get_articles():
    conn = get_db()
    articles = conn.execute('SELECT * FROM articles').fetchall()
    conn.close()
    return jsonify([dict(a) for a in articles])

@app.route('/articles', methods=['POST'])
def add_article():
    data = request.get_json()
    conn = get_db()
    conn.execute(
        'INSERT INTO articles (title, text, date) VALUES (?, ?, ?)',
        (data['title'], data['text'], data['date'])
    )
    conn.commit()
    article_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
    conn.close()
    return jsonify({'id': article_id, **data}), 201

@app.route('/articles/<int:id>', methods=['DELETE'])
def delete_article(id):
    conn = get_db()
    conn.execute('DELETE FROM articles WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

@app.route('/articles/<int:id>', methods=['PUT'])  # ← сюди
def edit_article(id):
    data = request.get_json()
    conn = get_db()
    conn.execute(
        'UPDATE articles SET title = ?, text = ?, date = ? WHERE id = ?',
        (data['title'], data['text'], data['date'], id)
    )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

if __name__ == '__main__':  # ← це завжди останнє
    init_db()
    app.run(debug=True)

