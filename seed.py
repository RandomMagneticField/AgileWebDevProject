from app import create_app, db
from app.models import User, Note, Tag, Deck, Flashcard, Quiz, QuizQuestion
from datetime import datetime, timezone

app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()

    # ── Users ──
    alice = User(username='alice', email='alice@test.com')
    alice.set_password('password123')
    bob = User(username='bob', email='bob@test.com')
    bob.set_password('password123')
    charlie = User(username='charlie', email='charlie@test.com')
    charlie.set_password('password123')
    db.session.add_all([alice, bob, charlie])
    db.session.commit()

    # ── Tags ──
    t_cits = Tag(name='CITS3403')
    t_flask = Tag(name='flask')
    t_db = Tag(name='database')
    t_js = Tag(name='javascript')
    t_css = Tag(name='css')
    t_python = Tag(name='python')
    t_html = Tag(name='html')
    t_security = Tag(name='security')
    t_agile = Tag(name='agile')
    t_week1 = Tag(name='week-1')
    t_week2 = Tag(name='week-2')
    t_week3 = Tag(name='week-3')
    t_week4 = Tag(name='week-4')
    t_week5 = Tag(name='week-5')
    db.session.add_all([t_cits, t_flask, t_db, t_js, t_css, t_python, t_html, t_security, t_agile, t_week1, t_week2, t_week3, t_week4, t_week5])
    db.session.commit()

    # ── Alice's Notes ──
    n1 = Note(
        title='Flask Fundamentals',
        description='Complete guide to Flask framework basics including routing, templates, and request handling',
        content_md='''# Flask Fundamentals

Flask is a lightweight WSGI web application framework written in Python. It is designed to make getting started quick and easy, with the ability to scale up to complex applications.

## What is Flask?

Flask is a **micro-framework** — it provides the core tools needed to build a web app but leaves most other decisions up to the developer. Unlike Django, Flask does not include:
- An ORM (database layer)
- Form validation
- Authentication system

These can be added via extensions.

## Installing Flask

```bash
pip install flask
```

## Your First Flask App

```python
from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return 'Hello, World!'

if __name__ == '__main__':
    app.run(debug=True)
```

## Routing

Routes map URLs to Python functions using the `@app.route()` decorator.

```python
@app.route('/about')
def about():
    return 'About page'

@app.route('/user/<username>')
def user_profile(username):
    return f'Profile of {username}'

@app.route('/post/<int:post_id>')
def post(post_id):
    return f'Post {post_id}'
```

## HTTP Methods

```python
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # handle form submission
        pass
    return render_template('login.html')
```

## Request Object

```python
from flask import request

@app.route('/search')
def search():
    query = request.args.get('q')  # GET params
    return f'Searching for {query}'
```

## Templates with Jinja2

Flask uses Jinja2 as its templating engine.

```html
<!-- templates/index.html -->
<h1>Hello, {{ name }}!</h1>
{% if logged_in %}
    <p>Welcome back!</p>
{% endif %}
{% for item in items %}
    <li>{{ item }}</li>
{% endfor %}
```

```python
from flask import render_template

@app.route('/')
def home():
    return render_template('index.html', name='Alice', items=['a', 'b', 'c'])
```

## URL Building

```python
from flask import url_for

url_for('home')          # returns '/'
url_for('user_profile', username='alice')  # returns '/user/alice'
```

## Redirects and Errors

```python
from flask import redirect, abort

@app.route('/old')
def old():
    return redirect(url_for('home'))

@app.route('/secret')
def secret():
    abort(403)
```

## Configuration

```python
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['DEBUG'] = True
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
```

## Blueprints

Blueprints allow you to organise routes into modules.

```python
# auth/routes.py
from flask import Blueprint

auth = Blueprint('auth', __name__)

@auth.route('/login')
def login():
    return 'Login page'
```

```python
# app/__init__.py
from auth.routes import auth
app.register_blueprint(auth, url_prefix='/auth')
```
''',
        is_public=True,
        user_id=alice.user_id,
        created_at=datetime(2026, 3, 5, tzinfo=timezone.utc),
        updated_at=datetime(2026, 3, 5, tzinfo=timezone.utc),
        accessed_at=datetime(2026, 3, 5, tzinfo=timezone.utc)
    )
    n1.tags = [t_flask, t_cits, t_week1]

    n2 = Note(
        title='SQLAlchemy ORM Guide',
        description='Deep dive into SQLAlchemy models, relationships, and querying',
        content_md='''# SQLAlchemy ORM Guide

SQLAlchemy is the most popular Python ORM (Object Relational Mapper). It allows you to interact with a database using Python objects instead of raw SQL.

## What is an ORM?

An ORM maps database tables to Python classes and rows to instances of those classes. Instead of writing:

```sql
SELECT * FROM users WHERE id = 1;
```

You write:

```python
User.query.get(1)
```

## Setting Up SQLAlchemy with Flask

```bash
pip install flask-sqlalchemy
```

```python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
db = SQLAlchemy(app)
```

## Defining Models

```python
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    email = db.Column(db.String(120), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<User {self.username}>'
```

## Column Types

| Type | Python | SQL |
|------|--------|-----|
| `db.Integer` | int | INTEGER |
| `db.String(n)` | str | VARCHAR(n) |
| `db.Text` | str | TEXT |
| `db.Boolean` | bool | BOOLEAN |
| `db.DateTime` | datetime | DATETIME |
| `db.Float` | float | FLOAT |

## Relationships

### One-to-Many

```python
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    posts = db.relationship('Post', back_populates='user')

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', back_populates='posts')
```

### Many-to-Many

```python
post_tags = db.Table('post_tags',
    db.Column('post_id', db.Integer, db.ForeignKey('post.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tags = db.relationship('Tag', secondary=post_tags, back_populates='posts')
```

## CRUD Operations

### Create

```python
user = User(username='alice', email='alice@test.com')
db.session.add(user)
db.session.commit()
```

### Read

```python
# get by primary key
user = User.query.get(1)

# filter
user = User.query.filter_by(username='alice').first()

# multiple results
users = User.query.all()
users = User.query.filter(User.created_at > some_date).all()
```

### Update

```python
user = User.query.get(1)
user.username = 'alice_new'
db.session.commit()
```

### Delete

```python
user = User.query.get(1)
db.session.delete(user)
db.session.commit()
```

## Querying

```python
# order by
User.query.order_by(User.username.asc()).all()
User.query.order_by(User.created_at.desc()).all()

# limit and offset
User.query.limit(10).offset(20).all()

# count
User.query.count()

# filter with operators
User.query.filter(User.username.like('%alice%')).all()
User.query.filter(User.username.ilike('%alice%')).all()  # case insensitive
User.query.filter(User.id.in_([1, 2, 3])).all()
```

## Migrations with Flask-Migrate

```bash
pip install flask-migrate
```

```python
from flask_migrate import Migrate
migrate = Migrate(app, db)
```

```bash
flask db init       # initialise migrations folder
flask db migrate -m "add users table"
flask db upgrade    # apply migrations
flask db downgrade  # revert last migration
```
''',
        is_public=True,
        user_id=alice.user_id,
        created_at=datetime(2026, 3, 12, tzinfo=timezone.utc),
        updated_at=datetime(2026, 3, 20, tzinfo=timezone.utc),
        accessed_at=datetime(2026, 3, 22, tzinfo=timezone.utc)
    )
    n2.tags = [t_db, t_cits, t_python, t_week2]

    n3 = Note(
        title='Web Security Essentials',
        description='Key web security concepts including CSRF, XSS, SQL injection, and authentication',
        content_md='''# Web Security Essentials

Security is a critical concern for any web application. This note covers the most common attack vectors and how to defend against them.

## Password Security

### Never store plain text passwords

Instead, store a salted hash:

```python
from werkzeug.security import generate_password_hash, check_password_hash

# storing password
hash = generate_password_hash('mypassword')

# verifying password
check_password_hash(hash, 'mypassword')  # True
check_password_hash(hash, 'wrongpassword')  # False
```

### Why salting?

Without a salt, attackers can use **rainbow tables** — precomputed tables of hashes for common passwords. A unique random salt per user means the same password produces different hashes, making rainbow tables useless.

## CSRF (Cross-Site Request Forgery)

### How it works

1. User logs into bank.com and has an active session cookie
2. User visits malicious.com which contains a hidden form that POSTs to bank.com/transfer
3. Browser automatically sends the session cookie with the request
4. Bank processes the transfer thinking it came from the user

### Defence

Include a secret CSRF token in every form. The server validates the token on submission.

```html
<!-- WTForms automatically adds this -->
<form method="POST">
    {{ form.hidden_tag() }}
    ...
</form>
```

## XSS (Cross-Site Scripting)

### How it works

Attacker injects malicious JavaScript into a page that gets executed in other users' browsers.

```html
<!-- If user input is rendered unsanitised -->
<p>Hello, <script>document.cookie</script></p>
```

### Defence

- **Escape all user input** before rendering — Jinja2 does this automatically with `{{ variable }}`
- Use `{{ variable | safe }}` only when you trust the content
- Use SQLAlchemy queries instead of raw SQL to prevent SQL injection

## SQL Injection

```python
# DANGEROUS - never do this
query = f"SELECT * FROM users WHERE username = '{username}'"

# SAFE - SQLAlchemy escapes automatically
User.query.filter_by(username=username).first()
```

## Session Security

- Always set a strong, random `SECRET_KEY`
- Use HTTPS in production to prevent session hijacking
- Set session timeouts for sensitive operations

## HTTPS

- Encrypts all traffic between client and server
- Prevents man-in-the-middle attacks
- Required for modern browsers to trust your site
- Use Let's Encrypt for free SSL certificates in production
''',
        is_public=False,
        user_id=alice.user_id,
        created_at=datetime(2026, 3, 18, tzinfo=timezone.utc),
        updated_at=datetime(2026, 3, 25, tzinfo=timezone.utc),
        accessed_at=datetime(2026, 4, 1, tzinfo=timezone.utc)
    )
    n3.tags = [t_security, t_cits, t_week5]

    # ── Bob's Notes ──
    n4 = Note(
        title='JavaScript ES6+ Features',
        description='Modern JavaScript features including arrow functions, destructuring, promises, and async/await',
        content_md='''# JavaScript ES6+ Features

ES6 (ECMAScript 2015) and later versions introduced many powerful features that make JavaScript cleaner and more expressive.

## Arrow Functions

```javascript
// Traditional function
function add(a, b) {
    return a + b;
}

// Arrow function
const add = (a, b) => a + b;

// With block body
const greet = (name) => {
    const message = `Hello, ${name}!`;
    return message;
};
```

## Destructuring

```javascript
// Array destructuring
const [first, second, ...rest] = [1, 2, 3, 4, 5];
console.log(first);  // 1
console.log(rest);   // [3, 4, 5]

// Object destructuring
const { name, age, city = 'Perth' } = user;

// In function parameters
function greet({ name, age }) {
    return `${name} is ${age}`;
}
```

## Template Literals

```javascript
const name = 'Alice';
const greeting = `Hello, ${name}! Today is ${new Date().toDateString()}.`;

// Multi-line strings
const html = `
    <div>
        <h1>${title}</h1>
        <p>${body}</p>
    </div>
`;
```

## Spread and Rest

```javascript
// Spread - expand array/object
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];  // [1, 2, 3, 4, 5]

const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 };  // { a: 1, b: 2, c: 3 }

// Rest - collect remaining arguments
function sum(...numbers) {
    return numbers.reduce((acc, n) => acc + n, 0);
}
```

## Promises

```javascript
// Creating a promise
const fetchData = () => new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('data');
    }, 1000);
});

// Using a promise
fetchData()
    .then(data => console.log(data))
    .catch(err => console.error(err))
    .finally(() => console.log('done'));
```

## Async/Await

```javascript
// Cleaner syntax for promises
async function loadUser(id) {
    try {
        const response = await fetch(`/api/users/${id}`);
        const user = await response.json();
        return user;
    } catch (error) {
        console.error('Failed to load user:', error);
    }
}
```

## Modules

```javascript
// export
export const PI = 3.14159;
export function double(n) { return n * 2; }
export default class Calculator { ... }

// import
import Calculator, { PI, double } from './math.js';
```

## Array Methods

```javascript
const numbers = [1, 2, 3, 4, 5];

numbers.map(n => n * 2);           // [2, 4, 6, 8, 10]
numbers.filter(n => n % 2 === 0);  // [2, 4]
numbers.reduce((acc, n) => acc + n, 0);  // 15
numbers.find(n => n > 3);          // 4
numbers.every(n => n > 0);         // true
numbers.some(n => n > 4);          // true
```

## Optional Chaining and Nullish Coalescing

```javascript
// Optional chaining - safely access nested properties
const city = user?.address?.city;

// Nullish coalescing - default value for null/undefined
const name = user.name ?? 'Anonymous';
```
''',
        is_public=True,
        user_id=bob.user_id,
        created_at=datetime(2026, 3, 8, tzinfo=timezone.utc),
        updated_at=datetime(2026, 3, 15, tzinfo=timezone.utc),
        accessed_at=datetime(2026, 3, 20, tzinfo=timezone.utc)
    )
    n4.tags = [t_js, t_cits, t_week3]

    n5 = Note(
        title='CSS Flexbox and Grid',
        description='Complete reference for CSS Flexbox and Grid layout systems',
        content_md='''# CSS Flexbox and Grid

Modern CSS provides two powerful layout systems: Flexbox for one-dimensional layouts and Grid for two-dimensional layouts.

## Flexbox

Flexbox is designed for laying out items in a single row or column.

### Container Properties

```css
.container {
    display: flex;
    
    /* Direction */
    flex-direction: row;          /* default - left to right */
    flex-direction: row-reverse;  /* right to left */
    flex-direction: column;       /* top to bottom */
    flex-direction: column-reverse;
    
    /* Wrapping */
    flex-wrap: nowrap;   /* default */
    flex-wrap: wrap;     /* items wrap to next line */
    
    /* Main axis alignment */
    justify-content: flex-start;    /* default */
    justify-content: flex-end;
    justify-content: center;
    justify-content: space-between; /* equal space between items */
    justify-content: space-around;  /* equal space around items */
    justify-content: space-evenly;
    
    /* Cross axis alignment */
    align-items: stretch;    /* default */
    align-items: flex-start;
    align-items: flex-end;
    align-items: center;
    align-items: baseline;
    
    /* Gap between items */
    gap: 16px;
    row-gap: 16px;
    column-gap: 8px;
}
```

### Item Properties

```css
.item {
    /* Grow to fill available space */
    flex-grow: 1;
    
    /* Shrink if not enough space */
    flex-shrink: 1;
    
    /* Base size */
    flex-basis: 200px;
    
    /* Shorthand */
    flex: 1;           /* flex-grow: 1, flex-shrink: 1, flex-basis: 0 */
    flex: 0 0 200px;   /* don't grow or shrink, 200px wide */
    
    /* Override container's align-items */
    align-self: center;
    
    /* Order (default 0, lower = earlier) */
    order: -1;
}
```

## CSS Grid

Grid is designed for two-dimensional layouts — rows and columns simultaneously.

### Container Properties

```css
.grid {
    display: grid;
    
    /* Define columns */
    grid-template-columns: 200px 200px 200px;
    grid-template-columns: 1fr 1fr 1fr;        /* equal thirds */
    grid-template-columns: repeat(3, 1fr);      /* same as above */
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* responsive */
    
    /* Define rows */
    grid-template-rows: 100px auto 100px;
    
    /* Gap */
    gap: 16px;
    row-gap: 16px;
    column-gap: 8px;
    
    /* Alignment */
    justify-items: stretch;   /* horizontal alignment of items */
    align-items: stretch;     /* vertical alignment of items */
}
```

### Item Placement

```css
.item {
    /* Span columns */
    grid-column: 1 / 3;       /* from line 1 to line 3 */
    grid-column: span 2;       /* span 2 columns */
    
    /* Span rows */
    grid-row: 1 / 3;
    grid-row: span 2;
    
    /* Shorthand */
    grid-area: 1 / 1 / 3 / 3; /* row-start / col-start / row-end / col-end */
}
```

## When to Use Each

| Flexbox | Grid |
|---------|------|
| Navigation bars | Page layouts |
| Card rows | Dashboard grids |
| Centering content | Magazine layouts |
| Single direction | Two dimensions |

## Common Patterns

### Centering

```css
/* Flexbox centering */
.center {
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Grid centering */
.center {
    display: grid;
    place-items: center;
}
```

### Responsive Grid

```css
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
}
```
''',
        is_public=True,
        user_id=bob.user_id,
        created_at=datetime(2026, 3, 22, tzinfo=timezone.utc),
        updated_at=datetime(2026, 3, 22, tzinfo=timezone.utc),
        accessed_at=datetime(2026, 3, 22, tzinfo=timezone.utc)
    )
    n5.tags = [t_css, t_cits, t_week3, t_html]

    n6 = Note(
        title='Agile Development Methodology',
        description='Overview of Agile principles, Scrum framework, and sprint planning',
        content_md='''# Agile Development Methodology

Agile is an iterative approach to software development that emphasises flexibility, collaboration, and delivering working software frequently.

## The Agile Manifesto

The Agile Manifesto values:

1. **Individuals and interactions** over processes and tools
2. **Working software** over comprehensive documentation
3. **Customer collaboration** over contract negotiation
4. **Responding to change** over following a plan

## Key Principles

- Deliver working software frequently (weeks rather than months)
- Welcome changing requirements, even late in development
- Business people and developers work together daily
- Build projects around motivated individuals
- Face-to-face conversation is the most efficient communication
- Working software is the primary measure of progress
- Sustainable development pace
- Continuous attention to technical excellence
- Simplicity — maximising the amount of work NOT done

## Scrum Framework

Scrum is the most popular Agile framework.

### Roles

| Role | Responsibility |
|------|---------------|
| **Product Owner** | Defines what to build, prioritises backlog |
| **Scrum Master** | Facilitates process, removes obstacles |
| **Development Team** | Builds the product, self-organising |

### Artifacts

**Product Backlog** — An ordered list of everything that might be needed in the product. Maintained by the Product Owner.

**Sprint Backlog** — The set of items selected for the current sprint, plus a plan for delivering them.

**Increment** — The sum of all completed backlog items at the end of a sprint. Must be in a useable condition.

### Sprint Ceremonies

**Sprint Planning** (start of sprint)
- Team selects items from product backlog
- Breaks items into tasks
- Estimates effort

**Daily Standup** (every day, 15 mins)
- What did I do yesterday?
- What will I do today?
- Are there any blockers?

**Sprint Review** (end of sprint)
- Demo working software to stakeholders
- Get feedback
- Update backlog

**Sprint Retrospective** (end of sprint)
- What went well?
- What could be improved?
- What will we commit to improving next sprint?

## User Stories

User stories capture requirements from the user's perspective:

```
As a [type of user],
I want [some goal],
So that [some reason].
```

**Example:**
```
As a student,
I want to create private notes,
So that I can study without sharing my work.
```

### Acceptance Criteria

Each user story should have clear acceptance criteria that define when it's "done":

```
Given [context],
When [action],
Then [expected outcome].
```

## Kanban Board

A Kanban board tracks work visually:

| Backlog | In Progress | Review | Done |
|---------|-------------|--------|------|
| Task A  | Task C      | Task E | Task F |
| Task B  | Task D      |        | Task G |
''',
        is_public=True,
        user_id=bob.user_id,
        created_at=datetime(2026, 4, 2, tzinfo=timezone.utc),
        updated_at=datetime(2026, 4, 2, tzinfo=timezone.utc),
        accessed_at=datetime(2026, 4, 2, tzinfo=timezone.utc)
    )
    n6.tags = [t_agile, t_cits, t_week1]

    # ── Charlie's Notes ──
    n7 = Note(
        title='HTML5 Fundamentals',
        description='Core HTML5 elements, semantic markup, forms, and accessibility',
        content_md='''# HTML5 Fundamentals

HTML (HyperText Markup Language) is the standard markup language for creating web pages.

## Document Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Page Title</title>
    <link rel="stylesheet" href="style.css"/>
</head>
<body>
    <h1>Hello World</h1>
    <script src="app.js"></script>
</body>
</html>
```

## Semantic Elements

Semantic elements describe their meaning to the browser and developer.

```html
<header>   <!-- site or section header -->
<nav>      <!-- navigation links -->
<main>     <!-- main content -->
<article>  <!-- self-contained content -->
<section>  <!-- thematic grouping -->
<aside>    <!-- sidebar content -->
<footer>   <!-- site or section footer -->
```

## Headings and Text

```html
<h1>Main heading</h1>
<h2>Subheading</h2>
<h3>Sub-subheading</h3>

<p>Paragraph text</p>
<strong>Bold important text</strong>
<em>Italic emphasised text</em>
<mark>Highlighted text</mark>
<code>Inline code</code>
<pre><code>Code block</code></pre>
```

## Links and Images

```html
<!-- Links -->
<a href="https://example.com">External link</a>
<a href="/about">Internal link</a>
<a href="#section">Anchor link</a>
<a href="mailto:alice@test.com">Email link</a>

<!-- Images -->
<img src="photo.jpg" alt="Description of image" width="300" height="200"/>
```

## Lists

```html
<!-- Unordered -->
<ul>
    <li>Item one</li>
    <li>Item two</li>
</ul>

<!-- Ordered -->
<ol>
    <li>First step</li>
    <li>Second step</li>
</ol>

<!-- Description list -->
<dl>
    <dt>Term</dt>
    <dd>Definition</dd>
</dl>
```

## Forms

```html
<form method="POST" action="/submit">
    <label for="username">Username</label>
    <input type="text" id="username" name="username" required/>

    <label for="email">Email</label>
    <input type="email" id="email" name="email"/>

    <label for="password">Password</label>
    <input type="password" id="password" name="password" minlength="8"/>

    <label for="bio">Bio</label>
    <textarea id="bio" name="bio" rows="4"></textarea>

    <label for="role">Role</label>
    <select id="role" name="role">
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
    </select>

    <input type="checkbox" id="agree" name="agree"/>
    <label for="agree">I agree to the terms</label>

    <button type="submit">Submit</button>
</form>
```

## Tables

```html
<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Age</th>
            <th>City</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Alice</td>
            <td>22</td>
            <td>Perth</td>
        </tr>
    </tbody>
</table>
```

## Data Attributes

```html
<div id="note" data-note-id="42" data-user="alice">
    Note content
</div>
```

```javascript
const el = document.getElementById('note');
console.log(el.dataset.noteId);  // "42"
console.log(el.dataset.user);    // "alice"
```
''',
        is_public=True,
        user_id=charlie.user_id,
        created_at=datetime(2026, 3, 10, tzinfo=timezone.utc),
        updated_at=datetime(2026, 3, 10, tzinfo=timezone.utc),
        accessed_at=datetime(2026, 3, 10, tzinfo=timezone.utc)
    )
    n7.tags = [t_html, t_cits, t_week2]

    n8 = Note(
        title='Python Data Structures',
        description='Lists, tuples, dictionaries, sets, and when to use each',
        content_md='''# Python Data Structures

Python has four built-in data structures: lists, tuples, dictionaries, and sets.

## Lists

Lists are ordered, mutable sequences.

```python
# Creating
fruits = ['apple', 'banana', 'cherry']
numbers = list(range(10))

# Accessing
fruits[0]    # 'apple'
fruits[-1]   # 'cherry'
fruits[1:3]  # ['banana', 'cherry']

# Modifying
fruits.append('date')
fruits.insert(1, 'avocado')
fruits.remove('banana')
fruits.pop()          # removes last item
fruits.pop(0)         # removes first item

# Useful methods
fruits.sort()
fruits.reverse()
len(fruits)
fruits.count('apple')
fruits.index('cherry')

# List comprehensions
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]
```

## Tuples

Tuples are ordered, immutable sequences.

```python
# Creating
point = (3, 4)
coordinates = (10.5, 20.3, 5.0)
single = (42,)  # note the comma

# Accessing (same as lists)
point[0]   # 3
point[-1]  # 4

# Unpacking
x, y = point
a, b, *rest = (1, 2, 3, 4, 5)

# Named tuples
from collections import namedtuple
Point = namedtuple('Point', ['x', 'y'])
p = Point(3, 4)
p.x  # 3
```

## Dictionaries

Dictionaries are unordered key-value pairs.

```python
# Creating
user = {'name': 'Alice', 'age': 22, 'city': 'Perth'}
empty = {}
from_keys = dict.fromkeys(['a', 'b', 'c'], 0)

# Accessing
user['name']              # 'Alice'
user.get('email')         # None (no KeyError)
user.get('email', 'N/A')  # 'N/A'

# Modifying
user['email'] = 'alice@test.com'
user.update({'age': 23, 'country': 'AU'})
del user['city']
user.pop('age')

# Iterating
for key in user:
    print(key)
for value in user.values():
    print(value)
for key, value in user.items():
    print(f'{key}: {value}')

# Dictionary comprehensions
squares = {x: x**2 for x in range(10)}

# Useful methods
user.keys()
user.values()
user.items()
'name' in user  # True
```

## Sets

Sets are unordered collections of unique items.

```python
# Creating
colours = {'red', 'green', 'blue'}
empty = set()
from_list = set([1, 2, 2, 3, 3, 3])  # {1, 2, 3}

# Operations
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

a | b   # union: {1, 2, 3, 4, 5, 6}
a & b   # intersection: {3, 4}
a - b   # difference: {1, 2}
a ^ b   # symmetric difference: {1, 2, 5, 6}

# Modifying
colours.add('yellow')
colours.remove('red')     # KeyError if not found
colours.discard('purple') # no error if not found

# Membership testing (O(1) - very fast)
'red' in colours
```

## When to Use Each

| Structure | Use When |
|-----------|----------|
| List | Ordered, need to modify, allow duplicates |
| Tuple | Ordered, immutable, fixed structure |
| Dictionary | Key-value pairs, fast lookup by key |
| Set | Unique items, fast membership testing |
''',
        is_public=False,
        user_id=charlie.user_id,
        created_at=datetime(2026, 3, 28, tzinfo=timezone.utc),
        updated_at=datetime(2026, 3, 28, tzinfo=timezone.utc),
        accessed_at=datetime(2026, 3, 28, tzinfo=timezone.utc)
    )
    n8.tags = [t_python, t_week4]

    db.session.add_all([n1, n2, n3, n4, n5, n6, n7, n8])
    db.session.commit()

    # ── Decks ──
    d1 = Deck(
        title='Flask & SQLAlchemy',
        is_public=True,
        user_id=alice.user_id,
        created_at=datetime(2026, 3, 10, tzinfo=timezone.utc),
        accessed_at=datetime(2026, 3, 10, tzinfo=timezone.utc)
    )
    d1.tags = [t_flask, t_db, t_cits]

    d2 = Deck(
        title='JavaScript Concepts',
        is_public=True,
        user_id=bob.user_id,
        created_at=datetime(2026, 3, 15, tzinfo=timezone.utc),
        accessed_at=datetime(2026, 3, 15, tzinfo=timezone.utc)
    )
    d2.tags = [t_js, t_cits]

    d3 = Deck(
        title='Web Security',
        is_public=False,
        user_id=alice.user_id,
        created_at=datetime(2026, 3, 20, tzinfo=timezone.utc),
        accessed_at=datetime(2026, 3, 20, tzinfo=timezone.utc)
    )
    d3.tags = [t_security, t_cits]

    d4 = Deck(
        title='HTML & CSS Basics',
        is_public=True,
        user_id=charlie.user_id,
        created_at=datetime(2026, 3, 25, tzinfo=timezone.utc),
        accessed_at=datetime(2026, 3, 25, tzinfo=timezone.utc)
    )
    d4.tags = [t_html, t_css, t_cits]

    d5 = Deck(
        title='Python Fundamentals',
        is_public=True,
        user_id=charlie.user_id,
        created_at=datetime(2026, 4, 1, tzinfo=timezone.utc),
        accessed_at=datetime(2026, 4, 1, tzinfo=timezone.utc)
    )
    d5.tags = [t_python]

    db.session.add_all([d1, d2, d3, d4, d5])
    db.session.commit()

    # ── Flashcards ──
    # d1 - Flask & SQLAlchemy
    fc = [
        Flashcard(deck_id=d1.deck_id, front='What is Flask?', back='A lightweight Python micro-framework for building web applications. It provides routing, templating with Jinja2, and a development server, but leaves database and other decisions to the developer.', order_index=0),
        Flashcard(deck_id=d1.deck_id, front='What does @app.route() do?', back='It is a decorator that maps a URL pattern to a Python function. When a request matches the URL, Flask calls the associated function and returns its response.', order_index=1),
        Flashcard(deck_id=d1.deck_id, front='What is Jinja2?', back='The templating engine built into Flask. It allows you to embed Python expressions in HTML using {{ variable }}, {% if %}, {% for %}, and {% block %} tags.', order_index=2),
        Flashcard(deck_id=d1.deck_id, front='What is an ORM?', back='Object Relational Mapper — a tool that maps database tables to Python classes, allowing you to interact with the database using Python objects instead of writing raw SQL.', order_index=3),
        Flashcard(deck_id=d1.deck_id, front='How do you define a model in SQLAlchemy?', back='Create a class that inherits from db.Model. Define columns using db.Column() with a type like db.Integer, db.String, db.Boolean. Set primary_key=True on the ID column.', order_index=4),
        Flashcard(deck_id=d1.deck_id, front='What is db.session.commit()?', back='Saves all pending changes to the database. Changes made to models are tracked in the session and only written to the database when commit() is called.', order_index=5),
        Flashcard(deck_id=d1.deck_id, front='What is a ForeignKey in SQLAlchemy?', back='A column that references the primary key of another table, creating a relationship between tables. Defined as db.Column(db.Integer, db.ForeignKey("table.column")).', order_index=6),
        Flashcard(deck_id=d1.deck_id, front='What is db.relationship()?', back='Defines a relationship between two models, allowing you to access related objects via Python attributes. Used with back_populates to define both sides of the relationship.', order_index=7),
        Flashcard(deck_id=d1.deck_id, front='What is Flask-Migrate used for?', back='It handles database migrations — tracking changes to models over time and applying those changes to the database using Alembic. Commands: flask db migrate, flask db upgrade.', order_index=8),
        Flashcard(deck_id=d1.deck_id, front='What is ilike() in SQLAlchemy?', back='A case-insensitive version of the LIKE operator for string pattern matching. Example: User.query.filter(User.name.ilike("%alice%")) matches "Alice", "ALICE", "alice".', order_index=9),
    ]

    # d2 - JavaScript Concepts
    fc += [
        Flashcard(deck_id=d2.deck_id, front='What is a Promise in JavaScript?', back='An object representing the eventual completion or failure of an asynchronous operation. It can be in one of three states: pending, fulfilled, or rejected. Use .then() to handle success and .catch() for errors.', order_index=0),
        Flashcard(deck_id=d2.deck_id, front='What is async/await?', back='Syntactic sugar over Promises that makes asynchronous code look synchronous. Use async before a function declaration and await before a Promise inside it. Must be used inside an async function.', order_index=1),
        Flashcard(deck_id=d2.deck_id, front='What is destructuring?', back='A syntax to unpack values from arrays or properties from objects into variables. Array: const [a, b] = [1, 2]. Object: const { name, age } = user.', order_index=2),
        Flashcard(deck_id=d2.deck_id, front='What is the spread operator?', back='Three dots (...) that expand an iterable (array or object) into individual elements. Used to copy arrays/objects, merge them, or pass array elements as function arguments.', order_index=3),
        Flashcard(deck_id=d2.deck_id, front='What is fetch()?', back='A browser API for making HTTP requests. Returns a Promise that resolves with a Response object. Use .json() to parse the response body as JSON. Replaces the older XMLHttpRequest.', order_index=4),
        Flashcard(deck_id=d2.deck_id, front='What is AJAX?', back='Asynchronous JavaScript and XML — a technique for making HTTP requests from the browser without reloading the page. Uses fetch() or XMLHttpRequest to send/receive data and update the DOM dynamically.', order_index=5),
        Flashcard(deck_id=d2.deck_id, front='What is the difference between == and ===?', back='== checks equality with type coercion (1 == "1" is true). === checks strict equality with no type coercion (1 === "1" is false). Always prefer === to avoid unexpected behaviour.', order_index=6),
        Flashcard(deck_id=d2.deck_id, front='What is event.preventDefault()?', back='Stops the default browser behaviour for an event. For example, calling it on a form submit event stops the form from actually submitting and reloading the page.', order_index=7),
    ]

    # d3 - Web Security
    fc += [
        Flashcard(deck_id=d3.deck_id, front='What is a CSRF attack?', back='Cross-Site Request Forgery — an attack where a malicious site tricks an authenticated user\'s browser into making unwanted requests to another site where they are logged in. Prevented by CSRF tokens in forms.', order_index=0),
        Flashcard(deck_id=d3.deck_id, front='What is an XSS attack?', back='Cross-Site Scripting — an attack where malicious JavaScript is injected into a web page and executed in other users\' browsers. Prevented by escaping all user input before rendering it in HTML.', order_index=1),
        Flashcard(deck_id=d3.deck_id, front='What is SQL injection?', back='An attack where malicious SQL is inserted into user input that gets executed against the database. Prevented by using parameterised queries or an ORM like SQLAlchemy which automatically escapes input.', order_index=2),
        Flashcard(deck_id=d3.deck_id, front='What is password salting?', back='Adding a unique random string (salt) to a password before hashing it. This ensures the same password produces different hashes for different users, preventing rainbow table attacks.', order_index=3),
        Flashcard(deck_id=d3.deck_id, front='What is HTTPS?', back='HTTP Secure — HTTP transmitted over TLS/SSL encryption. It encrypts all traffic between the client and server, preventing man-in-the-middle attacks and eavesdropping.', order_index=4),
        Flashcard(deck_id=d3.deck_id, front='What is session-based authentication?', back='The server creates a session record when a user logs in and sends a session ID in a cookie. On each request, the server looks up the session ID to identify the user. State is stored server-side.', order_index=5),
    ]

    # d4 - HTML & CSS
    fc += [
        Flashcard(deck_id=d4.deck_id, front='What is the difference between id and class in HTML?', back='id is unique — only one element per page should have a given id. class can be shared by multiple elements. Use id for JavaScript targeting and unique elements, class for styling groups of elements.', order_index=0),
        Flashcard(deck_id=d4.deck_id, front='What is Flexbox used for?', back='A one-dimensional CSS layout system for distributing space and aligning items in a row or column. Set display: flex on the container, then use justify-content, align-items, and flex properties on children.', order_index=1),
        Flashcard(deck_id=d4.deck_id, front='What is CSS Grid used for?', back='A two-dimensional CSS layout system for creating grid-based layouts with rows and columns simultaneously. Set display: grid on the container and use grid-template-columns and grid-template-rows to define the structure.', order_index=2),
        Flashcard(deck_id=d4.deck_id, front='What is the CSS box model?', back='Every element is a rectangular box with: content (actual text/image), padding (space inside border), border (line around padding), and margin (space outside border). box-sizing: border-box includes padding and border in the element\'s width.', order_index=3),
        Flashcard(deck_id=d4.deck_id, front='What is a CSS custom property (variable)?', back='A reusable value defined with -- prefix under :root or another selector. Defined as --primary-color: #336699; and used as color: var(--primary-color);. Useful for consistent theming.', order_index=4),
        Flashcard(deck_id=d4.deck_id, front='What are semantic HTML elements?', back='Elements that describe their meaning rather than just their appearance. Examples: <header>, <nav>, <main>, <article>, <section>, <aside>, <footer>. They improve accessibility and SEO.', order_index=5),
    ]

    # d5 - Python Fundamentals
    fc += [
        Flashcard(deck_id=d5.deck_id, front='What is the difference between a list and a tuple?', back='Lists are mutable (can be changed after creation) and use square brackets []. Tuples are immutable (cannot be changed) and use parentheses (). Use tuples for fixed data like coordinates, lists for collections that change.', order_index=0),
        Flashcard(deck_id=d5.deck_id, front='What is a Python dictionary?', back='An unordered collection of key-value pairs. Keys must be unique and hashable (strings, numbers, tuples). Access values with dict[key] or dict.get(key). Defined with curly braces {}.', order_index=1),
        Flashcard(deck_id=d5.deck_id, front='What is a list comprehension?', back='A concise way to create a list: [expression for item in iterable if condition]. Example: [x**2 for x in range(10) if x % 2 == 0] creates a list of even squares.', order_index=2),
        Flashcard(deck_id=d5.deck_id, front='What is a Python decorator?', back='A function that wraps another function to add behaviour before or after it runs. Applied with @decorator_name syntax. Common uses: @login_required, @app.route(), @property.', order_index=3),
        Flashcard(deck_id=d5.deck_id, front='What is *args and **kwargs?', back='*args collects extra positional arguments as a tuple. **kwargs collects extra keyword arguments as a dictionary. Used in function definitions to accept a variable number of arguments.', order_index=4),
        Flashcard(deck_id=d5.deck_id, front='What is the difference between is and ==?', back='== checks value equality (are the values the same?). is checks identity (are they the exact same object in memory?). Use == for value comparison, is only for checking None (if x is None).', order_index=5),
    ]

    db.session.add_all(fc)
    db.session.commit()

    # ── Quiz Sessions ──
    # Alice - Flask quiz
    qs1 = QuizSession(user_id=alice.user_id, note_id=n1.note_id, score=4, total=5, is_saved=True, is_retake=False, taken_at=datetime(2026, 3, 15, tzinfo=timezone.utc))
    # Alice - SQLAlchemy quiz
    qs2 = QuizSession(user_id=alice.user_id, note_id=n2.note_id, score=3, total=5, is_saved=True, is_retake=False, taken_at=datetime(2026, 3, 22, tzinfo=timezone.utc))
    # Alice - retake Flask quiz
    qs3 = QuizSession(user_id=alice.user_id, note_id=n1.note_id, score=5, total=5, is_saved=True, is_retake=True, taken_at=datetime(2026, 3, 20, tzinfo=timezone.utc))
    # Bob - JS quiz
    qs4 = QuizSession(user_id=bob.user_id, note_id=n4.note_id, score=3, total=5, is_saved=True, is_retake=False, taken_at=datetime(2026, 3, 18, tzinfo=timezone.utc))
    # Bob - Agile quiz
    qs5 = QuizSession(user_id=bob.user_id, note_id=n6.note_id, score=4, total=5, is_saved=True, is_retake=False, taken_at=datetime(2026, 4, 5, tzinfo=timezone.utc))
    # Charlie - HTML quiz
    qs6 = QuizSession(user_id=charlie.user_id, note_id=n7.note_id, score=2, total=5, is_saved=True, is_retake=False, taken_at=datetime(2026, 3, 15, tzinfo=timezone.utc))

    db.session.add_all([qs1, qs2, qs3, qs4, qs5, qs6])
    db.session.commit()

    # ── Quiz Questions ──
    # qs1 - Flask quiz
    questions = [
        QuizQuestion(session_id=qs1.quiz_id, question_text='What type of framework is Flask?', option_a='Full-stack framework', option_b='Micro-framework', option_c='Frontend framework', option_d='Testing framework', correct_option='b', user_answer='b', is_correct=True, order_index=0),
        QuizQuestion(session_id=qs1.quiz_id, question_text='Which decorator is used to define a route in Flask?', option_a='@flask.route()', option_b='@main.url()', option_c='@app.route()', option_d='@route.map()', correct_option='c', user_answer='c', is_correct=True, order_index=1),
        QuizQuestion(session_id=qs1.quiz_id, question_text='What templating engine does Flask use?', option_a='Handlebars', option_b='Mustache', option_c='Jinja2', option_d='Pug', correct_option='c', user_answer='c', is_correct=True, order_index=2),
        QuizQuestion(session_id=qs1.quiz_id, question_text='What does url_for() do in Flask?', option_a='Fetches a URL from the internet', option_b='Generates a URL for a given endpoint', option_c='Validates a URL format', option_d='Redirects to a URL', correct_option='b', user_answer='a', is_correct=False, order_index=3),
        QuizQuestion(session_id=qs1.quiz_id, question_text='What is a Blueprint in Flask?', option_a='A database schema diagram', option_b='A way to organise routes into modules', option_c='A type of HTML template', option_d='A configuration file format', correct_option='b', user_answer='b', is_correct=True, order_index=4),

        # qs2 - SQLAlchemy quiz
        QuizQuestion(session_id=qs2.quiz_id, question_text='What does ORM stand for?', option_a='Object Request Manager', option_b='Online Resource Mapper', option_c='Object Relational Mapper', option_d='Organised Relational Model', correct_option='c', user_answer='c', is_correct=True, order_index=0),
        QuizQuestion(session_id=qs2.quiz_id, question_text='How do you retrieve all records from a model?', option_a='Model.query.get()', option_b='Model.query.all()', option_c='Model.fetch.all()', option_d='Model.select()', correct_option='b', user_answer='b', is_correct=True, order_index=1),
        QuizQuestion(session_id=qs2.quiz_id, question_text='What does db.session.commit() do?', option_a='Creates a new database', option_b='Rolls back all changes', option_c='Saves pending changes to the database', option_d='Closes the database connection', correct_option='c', user_answer='a', is_correct=False, order_index=2),
        QuizQuestion(session_id=qs2.quiz_id, question_text='Which method performs a case-insensitive search?', option_a='like()', option_b='ilike()', option_c='search()', option_d='contains()', correct_option='b', user_answer='b', is_correct=True, order_index=3),
        QuizQuestion(session_id=qs2.quiz_id, question_text='What is a ForeignKey used for?', option_a='Encrypting data', option_b='Creating indexes', option_c='Linking records between tables', option_d='Generating primary keys', correct_option='c', user_answer='a', is_correct=False, order_index=4),

        # qs3 - Flask retake
        QuizQuestion(session_id=qs3.quiz_id, question_text='What type of framework is Flask?', option_a='Full-stack framework', option_b='Micro-framework', option_c='Frontend framework', option_d='Testing framework', correct_option='b', user_answer='b', is_correct=True, order_index=0),
        QuizQuestion(session_id=qs3.quiz_id, question_text='Which decorator is used to define a route in Flask?', option_a='@flask.route()', option_b='@main.url()', option_c='@app.route()', option_d='@route.map()', correct_option='c', user_answer='c', is_correct=True, order_index=1),
        QuizQuestion(session_id=qs3.quiz_id, question_text='What templating engine does Flask use?', option_a='Handlebars', option_b='Mustache', option_c='Jinja2', option_d='Pug', correct_option='c', user_answer='c', is_correct=True, order_index=2),
        QuizQuestion(session_id=qs3.quiz_id, question_text='What does url_for() do in Flask?', option_a='Fetches a URL from the internet', option_b='Generates a URL for a given endpoint', option_c='Validates a URL format', option_d='Redirects to a URL', correct_option='b', user_answer='b', is_correct=True, order_index=3),
        QuizQuestion(session_id=qs3.quiz_id, question_text='What is a Blueprint in Flask?', option_a='A database schema diagram', option_b='A way to organise routes into modules', option_c='A type of HTML template', option_d='A configuration file format', correct_option='b', user_answer='b', is_correct=True, order_index=4),

        # qs4 - JS quiz
        QuizQuestion(session_id=qs4.quiz_id, question_text='What does async/await do in JavaScript?', option_a='Runs code in parallel threads', option_b='Makes asynchronous code look synchronous', option_c='Prevents code from running', option_d='Caches function results', correct_option='b', user_answer='b', is_correct=True, order_index=0),
        QuizQuestion(session_id=qs4.quiz_id, question_text='What does the spread operator (...) do?', option_a='Creates a new thread', option_b='Deletes array elements', option_c='Expands an iterable into individual elements', option_d='Compresses data', correct_option='c', user_answer='c', is_correct=True, order_index=1),
        QuizQuestion(session_id=qs4.quiz_id, question_text='What is a Promise?', option_a='A function that always returns true', option_b='An object representing eventual completion of async operation', option_c='A type of loop', option_d='A way to store data', correct_option='b', user_answer='a', is_correct=False, order_index=2),
        QuizQuestion(session_id=qs4.quiz_id, question_text='What does fetch() return?', option_a='The response data directly', option_b='A Promise', option_c='An HTML element', option_d='A JSON object', correct_option='b', user_answer='b', is_correct=True, order_index=3),
        QuizQuestion(session_id=qs4.quiz_id, question_text='What is the difference between == and ===?', option_a='No difference', option_b='=== is slower', option_c='=== checks value and type, == only checks value', option_d='== checks value and type, === only checks value', correct_option='c', user_answer='d', is_correct=False, order_index=4),

        # qs5 - Agile quiz
        QuizQuestion(session_id=qs5.quiz_id, question_text='What does the Agile Manifesto value over processes and tools?', option_a='Documentation', option_b='Individuals and interactions', option_c='Contract negotiation', option_d='Following a plan', correct_option='b', user_answer='b', is_correct=True, order_index=0),
        QuizQuestion(session_id=qs5.quiz_id, question_text='What is the role of the Product Owner in Scrum?', option_a='Writing code', option_b='Facilitating the process', option_c='Defining and prioritising the product backlog', option_d='Testing the product', correct_option='c', user_answer='c', is_correct=True, order_index=1),
        QuizQuestion(session_id=qs5.quiz_id, question_text='How long is a Daily Standup?', option_a='1 hour', option_b='30 minutes', option_c='15 minutes', option_d='5 minutes', correct_option='c', user_answer='c', is_correct=True, order_index=2),
        QuizQuestion(session_id=qs5.quiz_id, question_text='What is a Sprint Retrospective?', option_a='A demo of working software', option_b='A meeting to reflect on the process and improve', option_c='Planning the next sprint', option_d='A daily check-in', correct_option='b', user_answer='a', is_correct=False, order_index=3),
        QuizQuestion(session_id=qs5.quiz_id, question_text='What format does a user story follow?', option_a='As a developer, I need to...', option_b='The system shall...', option_c='As a [user], I want [goal], so that [reason]', option_d='Feature: [name], Scenario: [case]', correct_option='c', user_answer='c', is_correct=True, order_index=4),

        # qs6 - HTML quiz
        QuizQuestion(session_id=qs6.quiz_id, question_text='What does DOCTYPE html declare?', option_a='The CSS version being used', option_b='The JavaScript version being used', option_c='That the document is HTML5', option_d='The server type', correct_option='c', user_answer='a', is_correct=False, order_index=0),
        QuizQuestion(session_id=qs6.quiz_id, question_text='Which element is used for the main content of a page?', option_a='<content>', option_b='<main>', option_c='<body>', option_d='<article>', correct_option='b', user_answer='b', is_correct=True, order_index=1),
        QuizQuestion(session_id=qs6.quiz_id, question_text='What attribute is required on <img> for accessibility?', option_a='title', option_b='src', option_c='alt', option_d='id', correct_option='c', user_answer='a', is_correct=False, order_index=2),
        QuizQuestion(session_id=qs6.quiz_id, question_text='What does data-* attribute allow you to do?', option_a='Style elements with CSS', option_b='Store custom data on HTML elements', option_c='Link to external resources', option_d='Define element behaviour', correct_option='b', user_answer='b', is_correct=True, order_index=3),
        QuizQuestion(session_id=qs6.quiz_id, question_text='Which form method sends data in the URL?', option_a='POST', option_b='PUT', option_c='GET', option_d='DELETE', correct_option='c', user_answer='d', is_correct=False, order_index=4),
    ]

    db.session.add_all(questions)
    db.session.commit()

    # Dummy quiz questions ported over from quiz.js frontend

    q2 = Quiz(
        note_id=n4.note_id,
        name='Just a bit of everything',
        total_questions=8,
        total_correct=5,
        is_completed=True
    )
    db.session.add(q2)
    db.session.commit()

    qq3 = QuizQuestion(
        quiz_id=q2.quiz_id,
        question_text='What is the derivative of 6e^3x ?',
        option_a='6e^3x',
        option_b='18xe^3x',
        option_c='18e^3x',
        option_d='18e^3',
        correct_answer='c',
        user_answer='c',
        order_index=0
    )
    qq4 = QuizQuestion(
        quiz_id=q2.quiz_id,
        question_text='What is NOT a difference between the Internet and the WWW (World Wide Web)?',
        option_a='The Internet is the global network infrastructure, while the WWW is a service that runs on top of it',
        option_b='The WWW uses HTTP/HTTPS, while the Internet includes many different protocols',
        option_c='The Internet is a subset of the WWW used only for websites',
        option_d='The WWW consists of web pages and browsers, while the Internet includes physical connections and routing',
        correct_answer='c',
        user_answer='c',
        order_index=1
    )
    qq5 = QuizQuestion(
        quiz_id=q2.quiz_id,
        question_text='Which layer in the TCP/IP model uses MAC addresses?',
        option_a='Application layer',
        option_b='Transport layer',
        option_c='Internet layer',
        option_d='Network Access layer',
        correct_answer='d',
        user_answer=None,
        order_index=2
    )
    qq6 = QuizQuestion(
        quiz_id=q2.quiz_id,
        question_text="A car starts from rest and accelerates uniformly at 2 m/s^2 for 10 seconds along a straight road. It then continues at constant velocity for another 5 seconds. What is the total distance travelled by the car over the entire 15 seconds?",
        option_a='100 m',
        option_b='200 m',
        option_c='250 m',
        option_d='300 m',
        correct_answer='c',
        user_answer='a',
        order_index=3
    )
    qq7 = QuizQuestion(
        quiz_id=q2.quiz_id,
        question_text='Which of these best describes the difference between dynamic and static analyzers?',
        option_a='Static analyzers examine source code without executing it, identifying potential issues like syntax errors or unsafe patterns. Dynamic analyzers run the program and observe its behaviour during execution to detect runtime issues such as memory leaks or crashes.',
        option_b='Dynamic analyzers only check code formatting and style rules, while static analyzers simulate execution in real time and detect runtime bugs by executing compiled binaries.',
        option_c='Static analyzers require compiled binaries and monitor memory usage during execution, while dynamic analyzers only read source files and provide compile-time warnings.',
        option_d='There is no meaningful difference; both static and dynamic analyzers perform identical checks on code at compile time without execution.',
        correct_answer='a',
        user_answer='a',
        order_index=4
    )
    qq8 = QuizQuestion(
        quiz_id=q2.quiz_id,
        question_text='Which of these are a correct listing of the main pillars of cybersecurity?',
        option_a='Authentication, Authorization, Accounting',
        option_b='Confidentiality, Integrity, Availability',
        option_c='Encryption, Decryption, Hashing',
        option_d='Prevention, Detection, Response',
        correct_answer='b',
        user_answer='b',
        order_index=5
    )
    qq9 = QuizQuestion(
        quiz_id=q2.quiz_id,
        question_text='Which of these best describes the difference between pure ALOHA and slotted ALOHA?',
        option_a='Pure ALOHA allows transmission at any time, which leads to higher collision probability. Slotted ALOHA restricts transmissions to discrete time slots, reducing collisions and improving efficiency.',
        option_b='Slotted ALOHA allows devices to transmit at any time, increasing throughput, while pure ALOHA forces devices to wait for fixed time intervals before sending data.',
        option_c='Pure ALOHA eliminates collisions entirely by using acknowledgements, while slotted ALOHA introduces random transmission delays to reduce efficiency.',
        option_d='There is no difference between pure and slotted ALOHA; both operate identically with continuous transmission and equal collision probability.',
        correct_answer='a',
        user_answer='a',
        order_index=6
    )
    qq10 = QuizQuestion(
        quiz_id=q2.quiz_id,
        question_text="Which of these HTML code correctly forms a link to an element with id of 'MyTitle'?",
        option_a='<a href="MyTitle">Go to title</a>',
        option_b='<a href="#MyTitle">Go to title</a>',
        option_c='<link href="#MyTitle">Go to title</link>',
        option_d='<a link="#MyTitle">Go to title</a>',
        correct_answer='b',
        user_answer='d',
        order_index=7
    )

    db.session.add_all([qq3, qq4, qq5, qq6, qq7, qq8, qq9, qq10])
    db.session.commit()

    print('Database seeded successfully!')
    print(f'Users: alice, bob, charlie (password: password123)')
    print(f'Notes: {Note.query.count()} notes created')
    print(f'Decks: {Deck.query.count()} decks created')
    print(f'Flashcards: {Flashcard.query.count()} flashcards created')
    print(f'Quiz sessions: {QuizSession.query.count()} sessions created')
    print(f'Quiz questions: {QuizQuestion.query.count()} questions created')
