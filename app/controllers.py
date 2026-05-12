from flask import jsonify


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


def extract_correct_answer(question, options):
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
        correct = extract_correct_answer(question, options)
        if correct is None:
            return jsonify({'error': f'Question at index {i} has invalid correct_index; expected integer 0-3'}), 400

    return jsonify(quiz_json), 200
