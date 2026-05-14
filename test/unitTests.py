import unittest

from app.controllers import extract_correct_answer, extract_quiz_question_options, delete_quizzes_for_note, delete_flashcards_for_deck
from app.models import User, Note, Quiz, QuizQuestion, Flashcard, FlashcardResult, Deck
from app import create_app, db
from app.config import TestConfig

from test.testseed import test_seed, TestUserID, TestNoteID, TestDeckID

class UnitTests(unittest.TestCase):
    # Essential functions

    def setUp(self):
        testApplication = create_app(TestConfig)
        self.app_context = testApplication.app_context()
        self.app_context.push()
        db.create_all()
        test_seed(db)

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    # Helper functions
    def addUser(self, test_username='myname', test_password="123", test_email='myname@test.com'):
        user = User(username=test_username, email=test_email)
        user.set_password(test_password)
        db.session.add(user)
        db.session.commit()
        return user

    # Test quiz correct answer extraction

    def test_extract_correct_answer(self):
        question_dict_1 = {
            "question": "What is 4 + 7?",
            "options": ["9", "10", "11", "12"],
            "correct_index": 2
        }
        question_dict_2 = {
            "question": "What is 4 + 7?",
            "options": ['9', '10', '11', '12'],
            "correct_index": 4
        }

        self.assertEqual(
            'c',
            extract_correct_answer(question_dict_1),
            'Expected to return character `c`'
        )
        self.assertIsNone(
            extract_correct_answer(question_dict_2),
            'Expected to return None'
        )
    
    # Test quiz options extraction

    def test_extract_options(self):
        question_dict_1 = {
            "question": "What is 4 + 7?",
            "options": ['9', '10', '11', '12'],
            "correct_index": 2
        }
        self.assertEqual(
            ['9', '10', '11', '12'],
            extract_quiz_question_options(question_dict_1),
            'Expected to return an array [`9`, `10`, `11`, `12`]'
        )

        question_dict_2 = {
            "question": "What is 4 + 7?",
            "options": ['10', '11', '12', '12'],
            "correct_index": 2
        }
        self.assertIsNone(
            extract_quiz_question_options(question_dict_2),
            'Expected to return None due to non distinct options'
        )

        question_dict_3 = {
            "question": "What is 4 + 7?",
            "correct_index": 2
        }
        self.assertIsNone(
            extract_quiz_question_options(question_dict_3),
            'Expected to return None due to no question key-value pair present in passed dict'
        )

        question_dict_4 = {
            "question": "What is 4 + 7?",
            "options": ['9', '10', '', '11'],
            "correct_index": 2
        }
        self.assertIsNone(
            extract_quiz_question_options(question_dict_4),
            'Expected to return None due to empty option'
        )

        question_dict_5 = {
            "question": "What is 4 + 7?",
            "options": ['9', '10', '11', '1' * 121],
            "correct_index": 2
        }
        self.assertIsNone(
            extract_quiz_question_options(question_dict_5),
            'Expected to return None due to an option exceeding the character limit of 120'
        )

        question_dict_6 = {
            "question": "What is 4 + 7?",
            "options": ['9', '10', '11', 12],
            "correct_index": 2
        }
        self.assertIsNone(
            extract_quiz_question_options(question_dict_6),
            'Expected to return None due to an option not being of type string'
        )

        question_dict_7 = {
            "question": "What is 4 + 7?",
            "options": ['9', '10', '11', '12', '13'],
            "correct_index": 2
        }
        self.assertIsNone(
            extract_quiz_question_options(question_dict_7),
            'Expected to return None due to there not being 4 options'
        )

    # Test quiz/question cascade delete

    def test_quiz_question_cascade_delete(self):
        q1 = Quiz(quiz_id=1, note_id=TestNoteID.ALICE_NOTE_1.value, name='Quiz 1')
        q2 = Quiz(quiz_id=2, note_id=TestNoteID.ALICE_NOTE_1.value, name='Quiz 2')
        q3 = Quiz(quiz_id=3, note_id=TestNoteID.ALICE_NOTE_2.value, name='Quiz 3')
        q4 = Quiz(quiz_id=4, note_id=TestNoteID.BOB_NOTE_1.value, name='Quiz 4')
        db.session.add_all([q1, q2, q3, q4])
        db.session.commit()

        qq1 = QuizQuestion(question_id=1, quiz_id=1, question_text='Question 1.1', correct_answer='a')
        qq2 = QuizQuestion(question_id=2, quiz_id=1, question_text='Question 2.1', correct_answer='a')
        qq3 = QuizQuestion(question_id=3, quiz_id=2, question_text='Question 2.2', correct_answer='a')
        qq4 = QuizQuestion(question_id=4, quiz_id=3, question_text='Question 3.1', correct_answer='a')
        qq5 = QuizQuestion(question_id=5, quiz_id=4, question_text='Question 4.1', correct_answer='a')
        db.session.add_all([qq1, qq2, qq3, qq4, qq5])
        db.session.commit()

        note = Note.query.get(TestNoteID.ALICE_NOTE_1.value)
        delete_quizzes_for_note(note)

        self.assertIsNone(Quiz.query.get(1), 'Quiz belonging to passed note should have been deleted')
        self.assertIsNone(Quiz.query.get(2), 'Quiz belonging to passed note should have been deleted')

        self.assertIsNotNone(Quiz.query.get(3), 'Quiz not belonging to passed note should not have been deleted')
        self.assertIsNotNone(Quiz.query.get(4), 'Quiz not belonging to passed note should not have been deleted')

        self.assertIsNone(QuizQuestion.query.get(1), 'Question belonging to a deleted quiz from passed note should have been deleted')
        self.assertIsNone(QuizQuestion.query.get(2), 'Question belonging to a deleted quiz from passed note should have been deleted')
        self.assertIsNone(QuizQuestion.query.get(3), 'Question belonging to a deleted quiz from passed note should have been deleted')

        self.assertIsNotNone(QuizQuestion.query.get(4), 'Question not belonging to a deleted quiz from passed note should not have been deleted')
        self.assertIsNotNone(QuizQuestion.query.get(5), 'Question not belonging to a deleted quiz from passed note should not have been deleted')

    # Test deck/flashcard cascade delete

    def test_deck_flashcard_cascade_delete(self):
        fc1 = Flashcard(flashcard_id=1, deck_id=TestDeckID.ALICE_DECK_1.value, front='Front 1', back='Back 1')
        fc2 = Flashcard(flashcard_id=2, deck_id=TestDeckID.ALICE_DECK_1.value, front='Front 2', back='Back 2')
        fc3 = Flashcard(flashcard_id=3, deck_id=TestDeckID.ALICE_DECK_2.value, front='Front 3', back='Back 3')
        fc4 = Flashcard(flashcard_id=4, deck_id=TestDeckID.BOB_DECK_1.value, front='Front 4', back='Back 4')
        db.session.add_all([fc1, fc2, fc3, fc4])
        db.session.commit()

        fr1 = FlashcardResult(results_id=1, user_id=TestUserID.ALICE.value, flashcard_id=1, is_correct=True)
        fr2 = FlashcardResult(results_id=2, user_id=TestUserID.ALICE.value, flashcard_id=2, is_correct=False)
        fr3 = FlashcardResult(results_id=3, user_id=TestUserID.ALICE.value, flashcard_id=3, is_correct=True)
        fr4 = FlashcardResult(results_id=4, user_id=TestUserID.BOB.value, flashcard_id=4, is_correct=True)
        db.session.add_all([fr1, fr2, fr3, fr4])
        db.session.commit()

        deck = Deck.query.get(TestDeckID.ALICE_DECK_1.value)
        delete_flashcards_for_deck(deck)

        self.assertIsNone(Flashcard.query.get(1), 'Flashcard belonging to passed deck should have been deleted')
        self.assertIsNone(Flashcard.query.get(2), 'Flashcard belonging to passed deck should have been deleted')

        self.assertIsNotNone(Flashcard.query.get(3), 'Flashcard not belonging to passed deck should not have been deleted')
        self.assertIsNotNone(Flashcard.query.get(4), 'Flashcard not belonging to passed deck should not have been deleted')

        self.assertIsNone(FlashcardResult.query.get(1), 'FlashcardResult belonging to a deleted flashcard from passed deck should have been deleted')
        self.assertIsNone(FlashcardResult.query.get(2), 'FlashcardResult belonging to a deleted flashcard from passed deck should have been deleted')

        self.assertIsNotNone(FlashcardResult.query.get(3), 'FlashcardResult belonging to a deleted flashcard from passed deck should have been deleted')
        self.assertIsNotNone(FlashcardResult.query.get(4), 'FlashcardResult belonging to a deleted flashcard from passed deck should have been deleted')

    # Test tag processing
