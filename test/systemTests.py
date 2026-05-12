import time
import unittest
import multiprocessing

from app.controllers import extract_correct_answer, extract_quiz_question_options
from app.models import User
from app import create_app, db
from app.config import TestConfig

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions

localHost = "http://127.0.0.1:5000/"

class SystemTests(unittest.TestCase):
    # Essential functions

    def setUp(self):
        testApplication = create_app(TestConfig)
        self.app_context = testApplication.app_context()
        self.app_context.push()
        db.create_all()
        # Add test data to db

        self.server_thread = multiprocessing.Process(target=testApplication.run)
        self.server_thread.start()

        options = webdriver.ChromeOptions()
        options.add_argument("--headless=new")
        self.driver = webdriver.Chrome(options=options)

        # self.driver.get(localHost)

    def tearDown(self):
        self.server_thread.terminate()
        self.driver.close()

        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    # Helper functions

    def addUser(self, test_username='myname', test_password="123"):
        user = User(username=test_username)
        user.set_password(test_password)
        db.session.add(user)
        db.session.commit()
        return user

    # Test login page

    def test_login_page(self):
        student1 = self.addUser("myname", "123")

        self.driver.get(localHost + "login")

        username_field = self.driver.find_element(By.ID, "username")
        password_field = self.driver.find_element(By.ID, "password")
        submit_btn = self.driver.find_element(By.ID, "submit")

        username_field.send_keys("myname")
        password_field.send_keys("123")
        
        submit_btn.click()

        WebDriverWait(self.driver, 5).until(
            expected_conditions.url_changes(localHost)
        )

        self.assertEqual(
            localHost + "dashboard",
            self.driver.current_url,
            "Expected to be redirected to localHost/dashboard")

    # Test signup page
