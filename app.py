from flask import Flask, render_template, jsonify, request, redirect, url_for, session
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3

app = Flask(__name__)
app.secret_key = 'my_secret_key_123'

def get_db():
    conn = sqlite3.connect('articles.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    # Таблиця статей
    conn.execute('''
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            text TEXT NOT NULL,
            date TEXT NOT NULL
        )
    ''')
    # Таблиця користувачів
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# ── Авторизація ──

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.get_json()
        username = data['username']
        password = generate_password_hash(data['password'])
        try:
            conn = get_db()
            conn.execute(
                'INSERT INTO users (username, password) VALUES (?, ?)',
                (username, password)
            )
            conn.commit()
            conn.close()
            return jsonify({'ok': True})
        except:
            return jsonify({'error': 'Користувач вже існує'}), 400

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        conn = get_db()
        user = conn.execute(
            'SELECT * FROM users WHERE username = ?',
            (data['username'],)
        ).fetchone()
        conn.close()

        if user and check_password_hash(user['password'], data['password']):
            session['user_id'] = user['id']
            session['username'] = user['username']
            return jsonify({'ok': True})
        return jsonify({'error': 'Невірний логін або пароль'}), 401

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

# ── Статті ──

@app.route('/')
def home():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('index.html', username=session['username'])

@app.route('/articles', methods=['GET'])
def get_articles():
    conn = get_db()
    articles = conn.execute('SELECT * FROM articles').fetchall()
    conn.close()
    return jsonify([dict(a) for a in articles])

@app.route('/articles', methods=['POST'])
def add_article():
    if 'user_id' not in session:
        return jsonify({'error': 'Не авторизований'}), 401
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
    if 'user_id' not in session:
        return jsonify({'error': 'Не авторизований'}), 401
    conn = get_db()
    conn.execute('DELETE FROM articles WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

@app.route('/articles/<int:id>', methods=['PUT'])
def edit_article(id):
    if 'user_id' not in session:
        return jsonify({'error': 'Не авторизований'}), 401
    data = request.get_json()
    conn = get_db()
    conn.execute(
        'UPDATE articles SET title = ?, text = ?, date = ? WHERE id = ?',
        (data['title'], data['text'], data['date'], id)
    )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
