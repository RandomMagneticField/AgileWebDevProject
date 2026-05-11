from app import db , login_manager
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# ── Junction tables (many-to-many) ──

note_tags = db.Table('note_tags',
    db.Column('note_id', db.Integer, db.ForeignKey('notes.note_id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.tag_id'), primary_key=True)
)

deck_tags = db.Table('deck_tags',
    db.Column('deck_id', db.Integer, db.ForeignKey('decks.deck_id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.tag_id'), primary_key=True)
)

note_likes = db.Table('note_likes',
    db.Column('user_id', db.Integer, db.ForeignKey('users.user_id'), primary_key=True),
    db.Column('note_id', db.Integer, db.ForeignKey('notes.note_id'), primary_key=True)
)

deck_likes = db.Table('deck_likes',
    db.Column('user_id', db.Integer, db.ForeignKey('users.user_id'), primary_key=True),
    db.Column('deck_id', db.Integer, db.ForeignKey('decks.deck_id'), primary_key=True)
)


# ── Models ──

class User(db.Model, UserMixin):
    __tablename__ = 'users'

    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password_hash = db.Column(db.String(256), nullable=False)
    pfp_filepath = db.Column(db.String(256), nullable=True)
    user_tier = db.Column(db.String(10), nullable=False, default='free')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # relationships
    notes = db.relationship('Note', back_populates='user', foreign_keys='Note.user_id')
    decks = db.relationship('Deck', back_populates='user', foreign_keys='Deck.user_id')
    flashcard_results = db.relationship('FlashcardResult', back_populates='user')
    password_resets = db.relationship('PasswordReset', back_populates='user')

    def __repr__(self):
        return f'<User {self.username}>'
    
    def get_id(self):
        return str(self.user_id)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Note(db.Model):
    __tablename__ = 'notes'

    note_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    copied_from = db.Column(db.Integer, db.ForeignKey('notes.note_id'), nullable=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(256), nullable=True)
    content_md = db.Column(db.Text, nullable=True)
    is_public = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    accessed_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # relationships
    user = db.relationship('User', back_populates='notes', foreign_keys=[user_id])
    original = db.relationship('Note', remote_side='Note.note_id', foreign_keys=[copied_from])
    tags = db.relationship('Tag', secondary=note_tags, back_populates='notes')
    likes = db.relationship('User', secondary=note_likes, backref='liked_notes')
    quizzes = db.relationship('Quiz', back_populates='note')

    def __repr__(self):
        return f'<Note {self.title}>'


class Tag(db.Model):
    __tablename__ = 'tags'

    tag_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)

    # relationships
    notes = db.relationship('Note', secondary=note_tags, back_populates='tags')
    decks = db.relationship('Deck', secondary=deck_tags, back_populates='tags')

    def __repr__(self):
        return f'<Tag {self.name}>'


class Deck(db.Model):
    __tablename__ = 'decks'

    deck_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    copied_from = db.Column(db.Integer, db.ForeignKey('decks.deck_id'), nullable=True)
    title = db.Column(db.String(100), nullable=False)
    is_public = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    accessed_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # relationships
    user = db.relationship('User', back_populates='decks', foreign_keys=[user_id])
    original = db.relationship('Deck', remote_side='Deck.deck_id', foreign_keys=[copied_from])
    tags = db.relationship('Tag', secondary=deck_tags, back_populates='decks')
    likes = db.relationship('User', secondary=deck_likes, backref='liked_decks')
    flashcards = db.relationship('Flashcard', back_populates='deck')

    def __repr__(self):
        return f'<Deck {self.title}>'


class Flashcard(db.Model):
    __tablename__ = 'flashcards'

    flashcard_id = db.Column(db.Integer, primary_key=True)
    deck_id = db.Column(db.Integer, db.ForeignKey('decks.deck_id'), nullable=False)
    front = db.Column(db.Text, nullable=False)
    back = db.Column(db.Text, nullable=False)
    order_index = db.Column(db.Integer, nullable=False, default=0)

    # relationships
    deck = db.relationship('Deck', back_populates='flashcards')
    results = db.relationship('FlashcardResult', back_populates='flashcard')

    def __repr__(self):
        return f'<Flashcard {self.flashcard_id}>'


class Quiz(db.Model):
    __tablename__ = 'quizzes'

    quiz_id = db.Column(db.Integer, primary_key=True)
    note_id = db.Column(db.Integer, db.ForeignKey('notes.note_id'), nullable=False)
    name = db.Column(db.String(30), nullable=False)
    total_questions = db.Column(db.Integer, nullable=False, default=0)
    total_correct = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    last_accessed = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    is_completed = db.Column(db.Boolean, nullable=False, default=False)

    # relationships
    note = db.relationship('Note', back_populates='quizzes')
    questions = db.relationship('QuizQuestion', back_populates='quiz')

    def __repr__(self):
        return f'<Quiz {self.quiz_id}>'


class QuizQuestion(db.Model):
    __tablename__ = 'quiz_questions'

    question_id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.quiz_id'), nullable=False)
    question_type = db.Column(db.String(10), nullable=False, default='mcq')
    question_text = db.Column(db.Text, nullable=False)
    option_a = db.Column(db.String(256), nullable=True)
    option_b = db.Column(db.String(256), nullable=True)
    option_c = db.Column(db.String(256), nullable=True)
    option_d = db.Column(db.String(256), nullable=True)
    correct_answer = db.Column(db.String(256), nullable=False)
    user_answer = db.Column(db.String(256), nullable=True)
    order_index = db.Column(db.Integer, nullable=False, default=0)

    # relationships
    quiz = db.relationship('Quiz', back_populates='questions')

    def __repr__(self):
        return f'<QuizQuestion {self.question_id}>'


class FlashcardResult(db.Model):
    __tablename__ = 'flashcard_results'

    results_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    flashcard_id = db.Column(db.Integer, db.ForeignKey('flashcards.flashcard_id'), nullable=False)
    is_correct = db.Column(db.Boolean, nullable=False)
    attempted_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # relationships
    user = db.relationship('User', back_populates='flashcard_results')
    flashcard = db.relationship('Flashcard', back_populates='results')

    def __repr__(self):
        return f'<FlashcardResult {self.results_id}>'


class PasswordReset(db.Model):
    __tablename__ = 'password_resets'

    pw_reset_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    token_hash = db.Column(db.Text, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=True)
    used_at = db.Column(db.DateTime, nullable=True)

    # relationships
    user = db.relationship('User', back_populates='password_resets')

    def __repr__(self):
        return f'<PasswordReset {self.pw_reset_id}>'
    


class DeckProgress(db.Model):
    __tablename__ = 'deck_progress'
    
    progress_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    deck_id = db.Column(db.Integer, db.ForeignKey('decks.deck_id'), nullable=False)
    current_index = db.Column(db.Integer, nullable=False, default=0)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', backref='deck_progress')
    deck = db.relationship('Deck', backref='progress')

    def __repr__(self):
        return f'<DeckProgress {self.progress_id}>'
    
class SessionAnswer(db.Model):
    __tablename__ = 'session_answers'

    answer_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    deck_id = db.Column(db.Integer, db.ForeignKey('decks.deck_id'), nullable=False)
    flashcard_id = db.Column(db.Integer, db.ForeignKey('flashcards.flashcard_id'), nullable=False)
    is_correct = db.Column(db.Boolean, nullable=False)
    answered_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', backref='session_answers')
    deck = db.relationship('Deck', backref='session_answers')
    flashcard = db.relationship('Flashcard', backref='session_answers')