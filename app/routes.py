from flask import Blueprint, render_template, redirect, url_for, flash, session, jsonify, request
from app import db
from app.models import User
from app.forms import RegisterForm, LoginForm
from functools import wraps
from app.models import User, Note, Deck, Tag
from datetime import datetime, timezone


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('main.login'))
        return f(*args, **kwargs)
    return decorated_function

main = Blueprint('main', __name__)

@main.route('/')
def home():
    return render_template('intro.html')

# @main.route('/login')
# def login():
#     return render_template('auth/login.html')

# @main.route('/signup')
# def signup():
#     return render_template('auth/signuppage.html')

@main.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        session['user_id'] = user.user_id
        return redirect(url_for('main.dashboard'))
    return render_template('auth/signuppage.html', form=form)

@main.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and user.check_password(form.password.data):
            session['user_id'] = user.user_id
            return redirect(url_for('main.dashboard'))
        flash('Invalid username or password')
    return render_template('auth/login.html', form=form)

@main.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('main.login'))

@main.route('/dashboard')
@login_required
def dashboard():
    user = User.query.get(session['user_id'])
    return render_template('dashboard/index.html', active='dashboard', user=user)

@main.route('/api/dashboard')
@login_required
def dashboard_data():
    user = User.query.get(session['user_id'])
    notes = Note.query.filter_by(user_id=user.user_id).order_by(Note.created_at.desc()).all()
    decks = Deck.query.filter_by(user_id=user.user_id).order_by(Deck.created_at.desc()).all()
    
    return jsonify({
        'notes': [{
            'id': n.note_id,
            'title': n.title,
            'body': n.description or '',
            'tags': [t.name for t in n.tags],
            'date': n.created_at.strftime('%d %b')
        } for n in notes],
        'decks': [{
            'id': d.deck_id,
            'title': d.title,
            'count': len(d.flashcards),
            'lastScore': 0,
            'lastTotal': len(d.flashcards),
            'tags': [t.name for t in d.tags],
            'date': d.created_at.strftime('%d %b')
        } for d in decks]
    })

@main.route('/dashboard/note_editor')
@login_required
def note_editor():
    note_id = request.args.get('id', type=int)
    if note_id:
        note = Note.query.get(note_id)
        if note is None or note.user_id != session['user_id']:
            return redirect(url_for('main.dashboard'))
    else:
        note = None
    return render_template('dashboard/note_editor.html', active='dashboard', note=note)

# Get a single note
@main.route('/api/notes/<int:note_id>', methods=['GET'])
@login_required
def get_note(note_id):
    note = Note.query.get_or_404(note_id)
    if note.user_id != session['user_id']:
        return jsonify({'error': 'Unauthorised'}), 403
    return jsonify({
        'id': note.note_id,
        'title': note.title,
        'content': note.content_md or '',
        'description': note.description or '',
        'is_public': note.is_public,
        'tags': [t.name for t in note.tags]
    })

# Save/update a note
@main.route('/api/notes/<int:note_id>', methods=['POST'])
@login_required
def save_note(note_id):
    note = Note.query.get_or_404(note_id)
    if note.user_id != session['user_id']:
        return jsonify({'error': 'Unauthorised'}), 403
    data = request.get_json()
    note.title = data.get('title', note.title)
    note.content_md = data.get('content', note.content_md)
    note.description = data.get('description', note.description)
    note.is_public = data.get('is_public', note.is_public)
    note.updated_at = datetime.now(timezone.utc)

    # handle tags
    if 'tags' in data:
        tag_names = data['tags']
        tags = []
        for name in tag_names:
            tag = Tag.query.filter_by(name=name).first()
            if not tag:
                tag = Tag(name=name)
                db.session.add(tag)
            tags.append(tag)
        note.tags = tags

    db.session.commit()
    return jsonify({'success': True})

@main.route('/api/notes/<int:note_id>', methods=['DELETE'])
@login_required
def delete_note(note_id):
    from app.models import QuizSession, QuizQuestion
    note = Note.query.get_or_404(note_id)
    if note.user_id != session['user_id']:
        return jsonify({'error': 'Unauthorised'}), 403
    
    # delete related quiz sessions and questions first
    for quiz in note.quiz_sessions:
        for question in quiz.questions:
            db.session.delete(question)
        db.session.delete(quiz)
    
    db.session.delete(note)
    db.session.commit()
    return jsonify({'success': True})

@main.route('/api/notes', methods=['POST'])
@login_required
def create_note():
    data = request.get_json()
    user = User.query.get(session['user_id'])
    note = Note(
        title=data.get('title', 'Untitled'),
        content_md='',
        user_id=user.user_id
    )
    db.session.add(note)
    db.session.commit()
    return jsonify({'id': note.note_id})

@main.route('/api/search')
@login_required
def search():
    # q is URL param, and returns '' if not present
    query = request.args.get('q', '').strip()
    user = User.query.get(session['user_id'])
    
    if not query:
        return jsonify({'notes': [], 'decks': []})
    
    notes = Note.query.filter(
        Note.user_id == user.user_id,
        # ilike is case insensitive version of SQLs LIKE operator
        Note.title.ilike(f'%{query}%')
    ).order_by(Note.created_at.desc()).all()
    
    decks = Deck.query.filter(
        Deck.user_id == user.user_id,
        Deck.title.ilike(f'%{query}%')
    ).order_by(Deck.created_at.desc()).all()
    
    return jsonify({
        'notes': [{
            'id': n.note_id,
            'title': n.title,
            'body': n.description or '',
            'tags': [t.name for t in n.tags],
            'date': n.created_at.strftime('%d %b')
        } for n in notes],
        'decks': [{
            'id': d.deck_id,
            'title': d.title,
            'count': len(d.flashcards),
            'lastScore': 0,
            'lastTotal': len(d.flashcards),
            'tags': [t.name for t in d.tags],
            'date': d.created_at.strftime('%d %b')
        } for d in decks]
    })

@main.route('/dashboard/flashcard_editor')
@login_required
def flashcard_editor():
    return render_template('dashboard/flashcard_editor.html', active='dashboard')

@main.route('/dashboard/flashcard')
@login_required
def flashcard():
    return render_template('dashboard/flashcard_play.html', active='dashboard')

@main.route('/discover')
@login_required
def discover():
    return render_template('discover/index.html', active='discover')

@main.route('/quiz/active')
@login_required
def quiz_active():
    return render_template('quiz/active.html' , active='dashboard')

@main.route('/quiz/history')
@login_required
def quiz_history():
    return render_template('quiz/history.html' , active='dashboard')

@main.route('/quiz/results')
@login_required
def quiz_results():
    return render_template('quiz/results.html' , active='dashboard')

@main.route('/profile')
@login_required
def profile():
    return render_template('profile.html' , active='profile')

@main.route('/change_password')
@login_required
def change_password():
    user = User.query.get(session['user_id'])
    return render_template('change_password.html' , active='profile', user=user)

@main.route('/info')
@login_required
def info():
    return render_template('info.html', active='info')