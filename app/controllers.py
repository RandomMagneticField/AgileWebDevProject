from flask import jsonify
from app import db
from app.models import FlashcardResult, Tag, Quiz, Note, Deck, Flashcard


def build_quiz_content(note):
    parts = [
        f"Title: {note.title}" if note.title else '',
        f"Description: {note.description}" if note.description else '',
        note.content_md or '',
    ]
    content = '\n\n'.join(part for part in parts if part).strip()
    return content


def extract_quiz_question_options(question):
    # Standardized schema: `options` must be a list of 4 option strings
    options = question.get('options')
    if not isinstance(options, list) or len(options) != 4:
        return None

    clean_opts = []
    for opt in options:
        if not isinstance(opt, str):
            return None
        txt = opt.strip()
        if not txt or len(txt) > 120:
            return None
        clean_opts.append(txt)

    # ensure all options are distinct
    if len(set(clean_opts)) != 4:
        return None

    return clean_opts


def extract_correct_answer(question):
    # Expect `correct_index` as integer 0-3
    correct_index = question.get('correct_index')
    if correct_index is None:
        return None

    if isinstance(correct_index, int):
        if 0 <= correct_index < 4:
            return ['a', 'b', 'c', 'd'][correct_index]
        return None

    # allow numeric strings like '0', '1'
    if isinstance(correct_index, str) and correct_index.isdigit():
        idx = int(correct_index)
        if 0 <= idx < 4:
            return ['a', 'b', 'c', 'd'][idx]

    return None


def validate_quiz(quiz_json):
    questions = quiz_json.get('questions') if isinstance(quiz_json, dict) else None

    if not isinstance(questions, list):
        return jsonify({'error': 'Quiz must contain a questions array'}), 400

    if len(questions) < 5:
        return jsonify({'error': 'Quiz must contain at least 5 questions'}), 400

    if len(questions) > 15:
        return jsonify({'error': 'Quiz cannot contain more than 15 questions'}), 400

    for i, question in enumerate(questions):
        if not isinstance(question, dict):
            return jsonify({'error': f'Invalid quiz question format at index {i}'}), 400

        # question text
        q_text = question.get('question')
        if not isinstance(q_text, str) or not q_text.strip():
            return jsonify({'error': f'Question text is required at index {i}'}), 400
        if len(q_text.strip()) > 300:
            return jsonify({'error': f'Question at index {i} exceeds 300 characters'}), 400

        # options
        options = extract_quiz_question_options(question)
        if options is None:
            return jsonify({'error': f'Each question must have exactly 4 distinct options (index {i}) and each option must be <=120 chars'}), 400

        # correct index
        correct = extract_correct_answer(question)
        if correct is None:
            return jsonify({'error': f'Question at index {i} has invalid correct_index; expected integer 0-3'}), 400

    return jsonify(quiz_json), 200

def delete_quizzes_for_note(note):
    for quiz in note.quizzes:
        for question in quiz.questions:
            db.session.delete(question)
        db.session.delete(quiz)

def delete_flashcards_for_deck(deck):
    # Also includes deleting results
    flashcard_ids = [card.flashcard_id for card in deck.flashcards]
    
    for flashcard_id in flashcard_ids:
        FlashcardResult.query.filter_by(flashcard_id=flashcard_id).delete()
    
    Flashcard.query.filter_by(deck_id=deck.deck_id).delete()


def process_tags(tag_names):
    tags = []
    for name in tag_names:
        tag = Tag.query.filter_by(name=name).first()
        if not tag:
            tag = Tag(name=name)
            db.session.add(tag)
        tags.append(tag)
    return tags


def get_last_score(deck, user_id):
    correct = 0
    total = 0
    for card in deck.flashcards:
        latest = FlashcardResult.query.filter_by(
            flashcard_id=card.flashcard_id,
            user_id=user_id,
        ).order_by(FlashcardResult.attempted_at.desc()).first()

        if latest:
            total += 1
            if latest.is_correct:
                correct += 1
    return correct, total


def get_next_quiz_name(note, user_id):
    quiz_name_prefix = f"{note.title} Quiz "
    existing_quizzes = (
        Quiz.query
        .join(Note, Quiz.note_id == Note.note_id)
        .filter(Note.user_id == user_id)
        .filter(Quiz.name.like(f"{quiz_name_prefix}%"))
        .all()
    )

    max_suffix = 0
    for existing_quiz in existing_quizzes:
        suffix = existing_quiz.name.replace(quiz_name_prefix, "", 1).strip()
        if suffix.isdigit():
            max_suffix = max(max_suffix, int(suffix))

    return f"{quiz_name_prefix}{max_suffix + 1}"