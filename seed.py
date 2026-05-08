from app import create_app, db
from app.models import User, Note, Tag, Deck, Flashcard, Quiz, QuizQuestion

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

    #quiz
    q1 = Quiz(
        note_id=n1.note_id,
        name='Flask Basics Quiz',
        total_questions=2,
        total_correct=1
    )
    db.session.add(q1)
    db.session.commit()

    # quiz questions
    qq1 = QuizQuestion(
        quiz_id=q1.quiz_id,
        question_text='What is Flask?',
        option_a='A database ORM',
        option_b='A Python micro-framework',
        option_c='A JavaScript library',
        option_d='A CSS framework',
        correct_answer='b',
        user_answer='b',
        order_index=0
    )
    qq2 = QuizQuestion(
        quiz_id=q1.quiz_id,
        question_text='What decorator is used to define a route in Flask?',
        option_a='@app.url()',
        option_b='@app.path()',
        option_c='@app.route()',
        option_d='@app.endpoint()',
        correct_answer='c',
        user_answer='a',
        order_index=1
    )

    db.session.add_all([qq1, qq2])
    db.session.commit()

    # Dummy quiz questions ported over from quiz.js frontend

    q2 = Quiz(
        note_id=n4.note_id,
        name='Untitled Quiz',
        total_questions=8,
        total_correct=5
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
    print(f'Quizzes: {Quiz.query.count()} quizzes created')