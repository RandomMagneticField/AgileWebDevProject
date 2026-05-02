from app import create_app, db
from app.models import User, Note, Tag, Deck, Flashcard, QuizSession, QuizQuestion

app = create_app()

with app.app_context():
    # Clear existing data 
    db.drop_all()
    db.create_all()

    # users
    alice = User(username='alice', email='alice@test.com')
    alice.set_password('password123')

    bob = User(username='bob', email='bob@test.com')
    bob.set_password('password123')

    charlie = User(username='charlie', email='charlie@test.com')
    charlie.set_password('password123')

    db.session.add_all([alice, bob, charlie])
    db.session.commit()

    # tags
    t_cits = Tag(name='CITS3403')
    t_week1 = Tag(name='week-1')
    t_flask = Tag(name='flask')
    t_db = Tag(name='database')
    t_js = Tag(name='javascript')

    db.session.add_all([t_cits, t_week1, t_flask, t_db, t_js])
    db.session.commit()

    # notes
    n1 = Note(
        title='Flask Basics',
        description='Introduction to Flask framework',
        content_md='# Flask Basics\n\nFlask is a micro-framework for Python.\n\n## Routes\n\nUse `@app.route()` to define routes.',
        is_public=True,
        user_id=alice.user_id
    )
    n1.tags = [t_flask, t_cits]

    n2 = Note(
        title='SQLAlchemy Notes',
        description='ORM concepts and usage',
        content_md='# SQLAlchemy\n\nSQLAlchemy is an ORM for Python.\n\n## Models\n\nDefine models by subclassing `db.Model`.',
        is_public=False,
        user_id=alice.user_id
    )
    n2.tags = [t_db, t_cits]

    n3 = Note(
        title='My Private Note',
        description='Personal notes',
        content_md='# Private\n\nThis is a private note.',
        is_public=False,
        user_id=alice.user_id
    )

    n4 = Note(
        title='JavaScript Tips',
        description='Useful JS tips and tricks',
        content_md='# JavaScript Tips\n\n## Promises\n\nUse `async/await` for cleaner async code.',
        is_public=True,
        user_id=bob.user_id
    )
    n4.tags = [t_js, t_week1]

    n5 = Note(
        title='HTTP Methods',
        description='GET, POST, PUT, DELETE explained',
        content_md='# HTTP Methods\n\n- GET: retrieve data\n- POST: send data\n- PUT: update data\n- DELETE: remove data',
        is_public=True,
        user_id=bob.user_id
    )
    n5.tags = [t_cits]

    n6 = Note(
        title='My First Note',
        description='Just getting started',
        content_md='# Hello\n\nThis is my first note.',
        is_public=False,
        user_id=charlie.user_id
    )

    db.session.add_all([n1, n2, n3, n4, n5, n6])
    db.session.commit()

    # decks
    d1 = Deck(
        title='Web Dev Flashcards',
        is_public=True,
        user_id=alice.user_id
    )
    d1.tags = [t_flask, t_cits]

    d2 = Deck(
        title='Python Basics',
        is_public=True,
        user_id=bob.user_id
    )
    d2.tags = [t_week1]

    db.session.add_all([d1, d2])
    db.session.commit()

    # flashcards
    f1 = Flashcard(deck_id=d1.deck_id, front='What is Flask?', back='A Python micro-framework for web development.', order_index=0)
    f2 = Flashcard(deck_id=d1.deck_id, front='What is a route?', back='A URL pattern mapped to a function using @app.route().', order_index=1)
    f3 = Flashcard(deck_id=d1.deck_id, front='What is Jinja?', back='A templating engine built into Flask.', order_index=2)

    f4 = Flashcard(deck_id=d2.deck_id, front='What is a list in Python?', back='An ordered, mutable collection of items.', order_index=0)
    f5 = Flashcard(deck_id=d2.deck_id, front='What is a dictionary in Python?', back='A collection of key-value pairs.', order_index=1)

    db.session.add_all([f1, f2, f3, f4, f5])
    db.session.commit()

    #quiz session
    qs1 = QuizSession(
        user_id=alice.user_id,
        note_id=n1.note_id,
        score=1,
        total=2,
        is_saved=True,
        is_retake=False
    )
    db.session.add(qs1)
    db.session.commit()

    # quiz q
    qq1 = QuizQuestion(
        session_id=qs1.quiz_id,
        question_text='What is Flask?',
        option_a='A database ORM',
        option_b='A Python micro-framework',
        option_c='A JavaScript library',
        option_d='A CSS framework',
        correct_option='b',
        user_answer='b',
        is_correct=True,
        order_index=0
    )
    qq2 = QuizQuestion(
        session_id=qs1.quiz_id,
        question_text='What decorator is used to define a route in Flask?',
        option_a='@app.url()',
        option_b='@app.path()',
        option_c='@app.route()',
        option_d='@app.endpoint()',
        correct_option='c',
        user_answer='a',
        is_correct=False,
        order_index=1
    )

    db.session.add_all([qq1, qq2])
    db.session.commit()

    print('Database seeded successfully!')
    print(f'Users: alice, bob, charlie (password: password123)')
    print(f'Notes: {Note.query.count()} notes created')
    print(f'Decks: {Deck.query.count()} decks created')
    print(f'Flashcards: {Flashcard.query.count()} flashcards created')
    print(f'Quiz sessions: {QuizSession.query.count()} sessions created')