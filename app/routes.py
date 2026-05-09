from flask import Blueprint, render_template, redirect, url_for, flash, session, jsonify, request
from app import db
from app.models import User
from app.forms import RegisterForm, LoginForm, QuizSubmissionForm
from functools import wraps
from app.models import User, Note, Deck, Tag, Quiz, QuizQuestion
from datetime import datetime, timezone
import random


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
    note = Note.query.get_or_404(note_id)
    if note.user_id != session['user_id']:
        return jsonify({'error': 'Unauthorised'}), 403
    
    # delete related quizzes and questions first
    for quiz in note.quizzes:
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

@main.route('/api/quizzes/generate', methods=['POST'])
@login_required
def generate_quiz():
    data = request.get_json()
    note_id = data.get('note_id') if data else None
    
    if note_id is None:
        return jsonify({'error': 'note_id is required'}), 400
    
    note = Note.query.get(note_id)
    if note is None:
        return jsonify({'error': 'Note not found'}), 404
    
    if note.user_id != session['user_id']:
        return jsonify({'error': 'Unauthorised'}), 403

    # Determine the next quiz name number for this user's quizzes using this note title prefix.
    quiz_name_prefix = f"{note.title} Quiz "
    existing_quizzes = (
        Quiz.query
        .join(Note, Quiz.note_id == Note.note_id)
        .filter(Note.user_id == session['user_id'])
        .filter(Quiz.name.like(f"{quiz_name_prefix}%"))
        .all()
    )

    max_suffix = 0
    for existing_quiz in existing_quizzes:
        suffix = existing_quiz.name.replace(quiz_name_prefix, "", 1).strip()
        if suffix.isdigit():
            max_suffix = max(max_suffix, int(suffix))

    quiz_name = f"{quiz_name_prefix}{max_suffix + 1}"

    # Generate quiz (dummy for now)

    question_count = random.randint(3, 6)
    generated_questions = []
    option_letters = ['a', 'b', 'c', 'd']

    for _ in range(question_count):
        left_operand = random.randint(0, 20)
        right_operand = random.randint(0, 20)
        correct_value = left_operand + right_operand

        incorrect_values = set()
        while len(incorrect_values) < 3:
            delta = random.randint(1, 5)
            candidate = correct_value + random.choice([-delta, delta])
            if candidate < 0 or candidate == correct_value:
                continue
            incorrect_values.add(candidate)

        option_values = [correct_value] + list(incorrect_values)
        random.shuffle(option_values)

        correct_index = option_values.index(correct_value)
        correct_letter = option_letters[correct_index]

        generated_questions.append({
            'question_text': f"What is {left_operand} + {right_operand}?",
            'option_A': str(option_values[0]),
            'option_B': str(option_values[1]),
            'option_C': str(option_values[2]),
            'option_D': str(option_values[3]),
            'correct_answer': correct_letter,
        })

    generated_quiz_data = {
        'name': quiz_name,
        'questions': generated_questions,
    }

    # Save into database

    quiz = Quiz(
        note_id=note.note_id,
        name=generated_quiz_data['name'],
        total_questions=len(generated_quiz_data['questions']),
        total_correct=0,
    )
    db.session.add(quiz)
    db.session.flush()

    quiz_questions = []
    for index, question in enumerate(generated_quiz_data['questions']):
        quiz_questions.append(
            QuizQuestion(
                quiz_id=quiz.quiz_id,
                question_text=question['question_text'],
                option_a=question['option_A'],
                option_b=question['option_B'],
                option_c=question['option_C'],
                option_d=question['option_D'],
                correct_answer=question['correct_answer'],
                user_answer=None,
                order_index=index,
            )
        )

    db.session.add_all(quiz_questions)
    db.session.commit()

    return jsonify({'quiz_id': quiz.quiz_id}), 201

@main.route('/quiz/active', methods=['GET', 'POST'])
@login_required
def quiz_active():
    quiz_id = request.args.get('id', type=int)
    if quiz_id is None:
        return redirect(url_for('main.dashboard'))
    
    quiz = Quiz.query.get(quiz_id)
    if quiz is None or quiz.note_id is None:
        return redirect(url_for('main.dashboard'))
    
    # Check if the quiz's note belongs to the user
    note = Note.query.get(quiz.note_id)
    if note is None or note.user_id != session['user_id']:
        return redirect(url_for('main.dashboard'))

    form = QuizSubmissionForm()
    if form.validate_on_submit():
        # Validate MCQ answers are either 'a','b','c','d' or unanswered (None)
        allowed_letters = {'a', 'b', 'c', 'd'}

        for question in quiz.questions:
            if question.question_type == 'mcq':
                raw = request.form.get(f'answer-{question.question_id}', '')
                submitted = raw.strip().lower() if raw is not None else ''
                submitted_val = submitted or None
                if submitted_val is not None and submitted_val not in allowed_letters:
                    # flash('Malformed submission: invalid answer provided for a multiple-choice question.')
                    return redirect(url_for('main.quiz_active', id=quiz.quiz_id))

        # All answers validated — persist them and compute score
        total_correct = 0
        for question in quiz.questions:
            answer = request.form.get(f'answer-{question.question_id}', '').strip().lower() or None
            question.user_answer = answer
            if answer and answer == question.correct_answer:
                total_correct += 1

        quiz.total_questions = len(quiz.questions)
        quiz.total_correct = total_correct
        quiz.last_accessed = datetime.now(timezone.utc)
        quiz.is_completed = True
        db.session.commit()

        return redirect(url_for('main.quiz_results', id=quiz.quiz_id))

    return render_template('quiz/active.html', active='dashboard', quiz=quiz, form=form)

@main.route('/quiz/retake')
@login_required
def quiz_retake():
    quiz_id = request.args.get('id', type=int)
    if quiz_id is None:
        return redirect(url_for('main.dashboard'))
    
    quiz = Quiz.query.get(quiz_id)
    if quiz is None or quiz.note_id is None:
        return redirect(url_for('main.dashboard'))
    
    # Check if the quiz's note belongs to the user
    note = Note.query.get(quiz.note_id)
    if note is None or note.user_id != session['user_id']:
        return redirect(url_for('main.dashboard'))
    
    # Reset quiz for retake
    quiz.is_completed = False
    for question in quiz.questions:
        question.user_answer = None
    db.session.commit()
    
    return redirect(url_for('main.quiz_active', id=quiz_id))

@main.route('/quiz/history')
@login_required
def quiz_history():
    return render_template('quiz/history.html' , active='dashboard')

@main.route('/quiz/results')
@login_required
def quiz_results():
    quiz_id = request.args.get('id', type=int)
    if quiz_id is None:
        return redirect(url_for('main.dashboard'))
    
    quiz = Quiz.query.get(quiz_id)
    if quiz is None or quiz.note_id is None:
        return redirect(url_for('main.dashboard'))
    
    # Check if the quiz's note belongs to the user
    note = Note.query.get(quiz.note_id)
    if note is None or note.user_id != session['user_id']:
        return redirect(url_for('main.dashboard'))

    total_questions = len(quiz.questions)
    correct_count = sum(
        1
        for question in quiz.questions
        if question.user_answer and question.user_answer == question.correct_answer
    )
    unanswered_count = sum(1 for question in quiz.questions if not question.user_answer)
    incorrect_count = total_questions - correct_count - unanswered_count
    score_percentage = round((correct_count / total_questions) * 100) if total_questions else 0

    results_summary = {
        'score_percentage': score_percentage,
        'correct': correct_count,
        'incorrect': incorrect_count,
        'unanswered': unanswered_count,
        'total': total_questions,
    }

    return render_template('quiz/results.html', active='dashboard', quiz=quiz, results_summary=results_summary)

@main.route('/profile')
@login_required
def profile():
    user = User.query.get(session['user_id'])
    
    all_notes = Note.query.filter_by(user_id=user.user_id).all()
    public_notes = [n for n in all_notes if n.is_public]
    
    note_count = len(all_notes)
    public_note_count = len(public_notes)
    
    deck_count = Deck.query.filter_by(user_id=user.user_id).count()
    public_deck_count = Deck.query.filter_by(user_id=user.user_id, is_public=True).count()

    # Calculate average quiz score from user's quizzes
    all_quizzes = [quiz for note in all_notes for quiz in note.quizzes]
    quiz_count = len(all_quizzes)
    
    if all_quizzes:
        avg_score = str(round(sum(q.total_correct / q.total_questions * 100 for q in all_quizzes if q.total_questions > 0) / len(all_quizzes))) + '%'
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
    
    # delete quizzes and questions related to user's notes
    for note in user.notes:
        for quiz in note.quizzes:
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

@main.route('/api/quiz/<int:quiz_id>/name', methods=['POST'])
@login_required
def update_quiz_name(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if quiz is None:
        return jsonify({'error': 'Quiz not found'}), 404
    
    # Check if the quiz's note belongs to the user
    note = Note.query.get(quiz.note_id)
    if note is None or note.user_id != session['user_id']:
        return jsonify({'error': 'Unauthorised'}), 403
    
    data = request.get_json()
    new_name = data.get('name', '').strip()
    
    if not new_name:
        return jsonify({'error': 'Quiz name cannot be empty'}), 400
    
    if len(new_name) > 30:
        return jsonify({'error': 'Quiz name must be 30 characters or less'}), 400
    
    quiz.name = new_name
    db.session.commit()
    
    return jsonify({'success': True, 'name': quiz.name}), 200

@main.route('/api/quiz/<int:quiz_id>', methods=['DELETE'])
@login_required
def delete_quiz(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if quiz is None:
        return jsonify({'error': 'Quiz not found'}), 404
    
    # Check if the quiz's note belongs to the user
    note = Note.query.get(quiz.note_id)
    if note is None or note.user_id != session['user_id']:
        return jsonify({'error': 'Unauthorised'}), 403
    
    note_id = quiz.note_id
    
    # Delete all questions in the quiz
    for question in quiz.questions:
        db.session.delete(question)
    
    # Delete the quiz
    db.session.delete(quiz)
    db.session.commit()
    
    return jsonify({'success': True, 'note_id': note_id}), 200

@main.route('/info')
@login_required
def info():
    return render_template('info.html', active='info')