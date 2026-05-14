import os
import tempfile
import threading
import time
import unittest

from app.controllers import extract_correct_answer, extract_quiz_question_options
from app.models import User
from app import create_app, db
from app.config import TestConfig

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions
from werkzeug.serving import make_server

from test.testseed import test_seed, TestUserID, TestNoteID, TestDeckID

class ServerThread(threading.Thread):
    def __init__(self, app):
        super().__init__(daemon=True)
        self.server = make_server("127.0.0.1", 0, app)

    def run(self):
        self.server.serve_forever()

    def shutdown(self):
        self.server.shutdown()

class SystemTests(unittest.TestCase):
    # Essential functions

    def setUp(self):
        testApplication = create_app(TestConfig)
        self.temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        self.temp_db.close()
        testApplication.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{self.temp_db.name}"

        self.app_context = testApplication.app_context()
        self.app_context.push()
        db.create_all()
        test_seed(db)

        self.server_thread = ServerThread(testApplication)
        self.server_thread.start()

        options = webdriver.ChromeOptions()
        #options.add_argument("--headless=new")
        #self.driver = webdriver.Chrome(options=options)
        self.driver = webdriver.Chrome()

        self.localHost = f"http://127.0.0.1:{self.server_thread.server.server_port}/"

        # Wait briefly for the server to accept connections.
        deadline = time.time() + 5
        while time.time() < deadline:
            try:
                self.driver.get(self.localHost)
                break
            except Exception:
                time.sleep(0.1)
        else:
            raise RuntimeError("Test server did not start in time")

    def tearDown(self):
        self.driver.quit()
        self.server_thread.shutdown()
        self.server_thread.join(timeout=5)

        db.session.remove()
        db.drop_all()
        self.app_context.pop()

        os.unlink(self.temp_db.name)

    # Helper functions

    def addUser(self, test_username='myname', test_password="123", test_email='myname@test.com'):
        user = User(username=test_username, email=test_email)
        user.set_password(test_password)
        db.session.add(user)
        db.session.commit()
        return user

    # Test login page

    def test_login_page(self):
        # Test case 1 : user exists

        self.driver.get(self.localHost + "login")

        username_field = self.driver.find_element(By.ID, "username")
        password_field = self.driver.find_element(By.ID, "password")
        submit_btn = self.driver.find_element(By.ID, "submit")

        username_field.send_keys("alice")
        password_field.send_keys("password123")
        
        submit_btn.click()

        WebDriverWait(self.driver, 5).until(
            expected_conditions.url_to_be(self.localHost + "dashboard")
        )

        self.assertEqual(
            self.localHost + "dashboard",
            self.driver.current_url,
            "Expected to be redirected to localHost/dashboard")
        
        # Test case 2 : user does not exist

        self.driver.get(self.localHost + "login")

        username_field = self.driver.find_element(By.ID, "username")
        password_field = self.driver.find_element(By.ID, "password")
        submit_btn = self.driver.find_element(By.ID, "submit")

        username_field.send_keys("myname2")
        password_field.send_keys("123")
        
        submit_btn.click()
        time.sleep(1)

        self.assertEqual(
            self.localHost + "login",
            self.driver.current_url,
            "Expected to stay on login page with invalid credentials")

    # Test signup page