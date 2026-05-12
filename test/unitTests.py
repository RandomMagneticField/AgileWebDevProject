import unittest

from app.controllers import extract_correct_answer, extract_quiz_question_options
# from app.models import User
from app import create_app, db
from app.config import TestConfig

class someTests(unittest.TestCase):
    # Essential functions

    def setUp(self):
        testApplication = create_app(TestConfig)
        self.app_context = testApplication.app_context()
        self.app_context.push()
        db.create_all()
        # Add test data to db

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

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