from flask import Blueprint, render_template, redirect, url_for, flash, session, jsonify, request
from app import db
from app.models import User
from app.forms import RegisterForm, LoginForm
from functools import wraps
from app.models import User, Note, Deck, Tag, QuizSession
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

from app.models import FlashcardResult
def get_last_score(deck, user_id):
    correct = 0
    total = 0
    for card in deck.flashcards:
        latest = FlashcardResult.query.filter_by(
            flashcard_id = card.flashcard_id,
            user_id = user_id
        ).order_by(FlashcardResult.attempted_at.desc()).first()

        if latest:
            total += 1
            if latest.is_correct:
                correct += 1
    return correct, total

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
            'lastScore': get_last_score(d, user.user_id)[0],
            'lastTotal': get_last_score(d, user.user_id)[1],
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
            'lastScore': get_last_score(d, user.user_id)[0],
            'lastTotal': get_last_score(d, user.user_id)[1],
            'tags': [t.name for t in d.tags],
            'date': d.created_at.strftime('%d %b')
        } for d in decks]
    })

@main.route('/dashboard/flashcard_editor')
@login_required
def flashcard_editor():
    deck_id = request.args.get('id', type= int)
    if deck_id:
        deck = Deck.query.get(deck_id)
        if deck is None or deck.user_id != session['user_id']:
            return redirect(url_for('main.dashboard'))
    else:
        deck = None
    return render_template('dashboard/flashcard_editor.html', active='dashboard', deck = deck)

@main.route('/api/decks', methods=['POST'])
@login_required
def create_deck():
    data = request.get_json()
    user = User.query.get(session['user_id'])
    deck = Deck(
        title = data.get('title', 'Untitle'),
        user_id = user.user_id
    )
    db.session.add(deck)
    db.session.commit()
    return jsonify({'id': deck.deck_id})

@main.route('/api/decks/<int:deck_id>', methods=['GET'])
@login_required
def get_deck(deck_id):
    deck = Deck.query.get_or_404(deck_id)
    if deck.user_id != session['user_id']:
        return jsonify({'error': 'Unauthorised'}), 403
    return jsonify({
        'id': deck.deck_id,
        'title': deck.title,
        'cards':[{'id' : c.flashcard_id, 'front': c.front, 'back': c.back} for c in deck.flashcards],
        'is_public': deck.is_public,
        'tags': [t.name for t in deck.tags]
    })

@main.route('/api/decks/<int:deck_id>', methods=['POST'])
@login_required
def save_deck(deck_id):
    deck = Deck.query.get_or_404(deck_id)
    if deck.user_id != session['user_id']:
        return jsonify({'error': 'Unauthorised'}), 403
    data = request.get_json()
    deck.title = data.get('title', deck.title)
    deck.is_public = data.get('is_public', deck.is_public)
    
    from app.models import Flashcard, FlashcardResult
    #delete reuslts of cards that are removed only
    if 'cards' in data:
        incoming_ids = set(c['id'] for c in data['cards'] if c.get('id'))

        for card in deck.flashcards:
            if card.flashcard_id not in incoming_ids:
                FlashcardResult.query.filter_by(flashcard_id=card.flashcard_id).delete()
                db.session.delete(card)
        db.session.flush()
        for i, c in enumerate(data['cards']):
            if c.get('id'):
                #update existing card
                card = Flashcard.query.get(c['id'])
                if card:
                    card.front = c['front']
                    card.back = c['back']
                    card.order_index = i
            else:
                #handles new card
                card = Flashcard(front=c['front'], back=c['back'], deck_id=deck.deck_id, order_index=i)
                db.session.add(card)

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
        deck.tags = tags

    #reset progress when the deck is updated and saved
    from app.models import DeckProgress
    progress = DeckProgress.query.filter_by(
        deck_id = deck_id,
        user_id = session['user_id']
    ).first()
    if progress:
        progress.current_index = 0
        progress.updated_at = datetime.now(timezone.utc)

    #delete the previous flashcard play session
    from app.models import SessionAnswer
    SessionAnswer.query.filter_by(
        deck_id = deck_id,
        user_id = session['user_id']
    ).delete()
    db.session.commit()
    return jsonify({'success': True})

@main.route('/api/decks/<int:deck_id>', methods=['DELETE'])
@login_required
def delete_deck(deck_id):
    from app.models import DeckProgress, SessionAnswer
    deck = Deck.query.get_or_404(deck_id)
    if deck.user_id != session['user_id']:
        return jsonify({'error': 'Unauthorised'}), 403
    
    #delete progress and session answers
    DeckProgress.query.filter_by(deck_id = deck_id).delete()
    SessionAnswer.query.filter_by(deck_id = deck_id).delete()

    #delete flashcard results and flashcards
    for card in deck.flashcards:
        FlashcardResult.query.filter_by(flashcard_id = card.flashcard_id).delete()
        db.session.delete(card)

    db.session.delete(deck)
    db.session.commit()
    return jsonify({'success': True})

@main.route('/api/decks/<int:deck_id>/session_answers', methods = ['POST'])
@login_required
def save_session_answer(deck_id):
    from app.models import SessionAnswer
    data = request.get_json()
    answer = SessionAnswer(
        user_id = session['user_id'],
        deck_id = deck_id,
        flashcard_id = data['flashcard_id'],
        is_correct = data['is_correct']
    )
    db.session.add(answer)
    db.session.commit()
    return jsonify({'success': True})

@main.route('/api/decks/<int:deck_id>/session_answers', methods = ['GET'])
@login_required
def get_session_answers(deck_id):
    from app.models import SessionAnswer
    answers = SessionAnswer.query.filter_by(
        deck_id = deck_id,
        user_id = session['user_id']
    ).order_by(SessionAnswer.answered_at).all()
    return jsonify({'answers': [{
        'flashcard_id': a.flashcard_id,
        'is_correct': a.is_correct
    }for a in answers]})

@main.route('/api/decks/<int:deck_id>/session_answers', methods=['DELETE'])
@login_required
def clear_session_answers(deck_id):
    from app.models import SessionAnswer
    SessionAnswer.query.filter_by(
        deck_id = deck_id,
        user_id= session['user_id']
    ).delete()
    db.session.commit()
    return jsonify({'success': True})

@main.route('/dashboard/flashcard')
@login_required
def flashcard():
    deck_id = request.args.get('id', type = int)
    if deck_id:
        deck = Deck.query.get(deck_id)
        if deck is None or deck.user_id != session['user_id']:
            return redirect(url_for('main.dashboard'))
    else:
        deck = None
    return render_template('dashboard/flashcard_play.html', active='dashboard', deck = deck)

@main.route('/api/decks/<int:deck_id>/results', methods=["POST"])
@login_required
def save_flashcard_result(deck_id):
    from app.models import FlashcardResult
    data = request.get_json() or {}
    results = data.get('results', [])
    correct_ans = 0
    wrong_ans = 0
    for ans in results:
        correct = ans.get('is_correct', False)
        flashcard_id = ans.get('flashcard_id')
        if correct:
            correct_ans += 1
        else:
            wrong_ans += 1
        result = FlashcardResult(
            user_id=session['user_id'],
            flashcard_id=flashcard_id,
            is_correct=correct
        )
        db.session.add(result)
    db.session.commit()
    total = correct_ans + wrong_ans
    score = correct_ans / total if total > 0 else 0
    return jsonify({
        'success': True,
        'correct': correct_ans,
        'wrong': wrong_ans,
        'score': score
    })

#saving flashcard play progress
@main.route('/api/decks/<int:deck_id>/progress', methods=['GET'])
@login_required
def get_progress(deck_id):
    from app.models import DeckProgress
    progress = DeckProgress.query.filter_by(
        deck_id = deck_id,
        user_id = session['user_id']
    ).first()
    return jsonify({'current_index': progress.current_index if progress else 0})

@main.route('/api/decks/<int:deck_id>/progress', methods=['POST'])
@login_required
def save_progress(deck_id):
    from app.models import DeckProgress
    data = request.get_json()
    progress = DeckProgress.query.filter_by(
        deck_id = deck_id,
        user_id = session['user_id']
    ).first()
    if progress:
        progress.current_index = data['current_index']
        progress.updated_at = datetime.now(timezone.utc)
    else:
        progress = DeckProgress(
            user_id = session['user_id'],
            deck_id = deck_id,
            current_index = data['current_index']
        )
        db.session.add(progress)
    db.session.commit()
    return jsonify({'success' : True})

@main.route('/discover')
@login_required
def discover():
    return render_template('discover/index.html', active='discover')

@main.route('/api/discover')
@login_required
def discover_data():
    user = User.query.get(session['user_id'])
    notes = Note.query.filter_by(is_public=True).order_by(Note.created_at.desc()).all()
    decks = Deck.query.filter_by(is_public=True).order_by(Deck.created_at.desc()).all()

    return jsonify({
        'notes':[{
            'id': n.note_id,
            'title': n.title,
            'body': n.description or '',
            'tags': [t.name for t in n.tags],
            'date': n.created_at.strftime('%d %b %Y'),
            'likes': len(n.likes),
            'liked': user in n.likes
        }for n in notes],
        'decks': [{
            'id': d.deck_id,
            'title': d.title,
            'count': len(d.flashcards),
            'tags': [t.name for t in d.tags],
            'date': d.created_at.strftime('%d %b %Y'),
            'likes': len(d.likes),
            'liked': user in d.likes
        } for d in decks]
    })

@main.route('/api/notes/<int:note_id>/like', methods=['POST'])
@login_required
def toggle_note_like(note_id):
    note = Note.query.get_or_404(note_id)
    user = User.query.get(session['user_id'])
    if user in note.likes:
        note.likes.remove(user)
        liked = False
    else:
        note.likes.append(user)
        liked = True
    db.session.commit()
    return jsonify({'success': True, 'liked': liked, 'likes': len(note.likes)})

@main.route('/api/decks/<int:deck_id>/like', methods=['POST'])
@login_required
def toggle_deck_like(deck_id):
    deck = Deck.query.get_or_404(deck_id)
    user = User.query.get(session['user_id'])
    if user in deck.likes:
        deck.likes.remove(user)
        liked = False
    else:
        deck.likes.append(user)
        liked = True
    db.session.commit()
    return jsonify({'success': True, 'liked': liked, 'likes': len(deck.likes)})

@main.route('/api/notes/<int:note_id>/copy', methods=['POST'])
@login_required
def copy_note(note_id):
    original = Note.query.get_or_404(note_id)
    if not original.is_public:
        return jsonify({'error': 'Note is not public'}), 403
    user = User.query.get(session['user_id'])
    new_note = Note(
        title = original.title,
        description = original.description,
        content_md = original.content_md,
        user_id = user.user_id,
        copied_from = original.note_id
    )
    db.session.add(new_note)
    db.session.commit()
    return jsonify({'success': True, 'id': new_note.note_id})

@main.route('/api/decks/<int:deck_id>/copy', methods=['POST'])
@login_required
def copy_deck(deck_id):
    from app.models import Flashcard
    original = Deck.query.get_or_404(deck_id)
    if not original.is_public:
        return jsonify({'error': 'Deck is not public'}), 403
    user = User.query.get(session['user_id'])
    new_deck = Deck(
        title = original.title,
        user_id = user.user_id,
        copied_from = original.deck_id
    )
    db.session.add(new_deck)
    db.session.flush()
    for card in original.flashcards:
        new_card = Flashcard(
            front = card.front,
            back = card.back,
            deck_id = new_deck.deck_id,
            order_index = card.order_index
        )
        db.session.add(new_card)
    db.session.commit()
    return jsonify({'success': True, 'id': new_deck.deck_id})
    

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
    user = User.query.get(session['user_id'])
    note_count = Note.query.filter_by(user_id=user.user_id).count()
    public_note_count = Note.query.filter_by(user_id=user.user_id, is_public=True).count()
    deck_count = Deck.query.filter_by(user_id=user.user_id).count()
    public_deck_count = Deck.query.filter_by(user_id=user.user_id, is_public=True).count()

    quiz_count = QuizSession.query.filter_by(user_id=user.user_id, is_saved=True).count()
    
    # avg quiz score
    quizzes = QuizSession.query.filter_by(user_id=user.user_id, is_saved=True).all()
    if quizzes:
        avg_score = str(round(sum(q.score / q.total * 100 for q in quizzes if q.total > 0) / len(quizzes))) + '%'
    else:
        avg_score = 'N/A'

    return render_template('profile.html', active='profile', user=user,
        note_count=note_count, public_note_count=public_note_count,
        deck_count=deck_count, public_deck_count=public_deck_count,
        quiz_count=quiz_count, avg_score=avg_score)


@main.route('/api/profile/update', methods=['POST'])
@login_required
def update_profile():
    data = request.get_json()
    user = User.query.get(session['user_id'])
    
    new_username = data.get('username', '').strip()
    new_email = data.get('email', '').strip()
    
    if not new_username or not new_email:
        return jsonify({'error': 'Username and email cannot be empty'}), 400
    
    if new_username != user.username and User.query.filter_by(username=new_username).first():
        return jsonify({'error': 'Username already taken'}), 400
    
    if new_email != user.email and User.query.filter_by(email=new_email).first():
        return jsonify({'error': 'Email already in use'}), 400
    
    user.username = new_username
    user.email = new_email
    db.session.commit()
    
    return jsonify({'success': True})

@main.route('/change_password')
@login_required
def change_password():
    user = User.query.get(session['user_id'])
    return render_template('change_password.html' , active='profile', user=user)

@main.route('/api/change_password', methods=['POST'])
@login_required
def change_password_api():
    data = request.get_json()
    user = User.query.get(session['user_id'])
    
    if not user.check_password(data.get('current_password', '')):
        return jsonify({'error': 'Current password is incorrect'}), 400
    
    new_password = data.get('new_password', '')
    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters'}), 400
    
    user.set_password(new_password)
    db.session.commit()
    return jsonify({'success': True})

@main.route('/api/delete_account', methods=['DELETE'])
@login_required
def delete_account():
    user = User.query.get(session['user_id'])
    
    # delete quiz questions and sessions
    for quiz in user.quiz_sessions:
        for question in quiz.questions:
            db.session.delete(question)
        db.session.delete(quiz)
    
    # delete flashcard results
    for result in user.flashcard_results:
        db.session.delete(result)
    
    # delete flashcards and decks
    for deck in user.decks:
        for card in deck.flashcards:
            db.session.delete(card)
        db.session.delete(deck)
    
    # delete notes (note_tags junction rows removed automatically)
    for note in user.notes:
        db.session.delete(note)
    
    # delete password resets
    for reset in user.password_resets:
        db.session.delete(reset)
    
    db.session.delete(user)
    db.session.commit()
    
    session.pop('user_id', None)
    return jsonify({'success': True})

@main.route('/info')
@login_required
def info():
    return render_template('info.html', active='info')