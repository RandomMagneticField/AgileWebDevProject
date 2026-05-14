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

    def login(self, username, password):
        self.driver.get(self.localHost + "login")

        username_field = self.driver.find_element(By.ID, "username")
        password_field = self.driver.find_element(By.ID, "password")
        submit_btn = self.driver.find_element(By.ID, "submit")

        username_field.clear()
        password_field.clear()
        username_field.send_keys(username)
        password_field.send_keys(password)
        submit_btn.click()

    def register(self, email, username, password, confirm_password):
        email_field = self.driver.find_element(By.ID, "email")
        username_field = self.driver.find_element(By.ID, "username")
        password_field = self.driver.find_element(By.ID, "password")
        confirm_field = self.driver.find_element(By.ID, "confirm_password")
        submit_btn = self.driver.find_element(By.ID, "submit")

        email_field.send_keys(email)
        username_field.send_keys(username)
        password_field.send_keys(password)
        confirm_field.send_keys(confirm_password)
        
        submit_btn.click()

    # Test login page

    def test_login_page(self):
        # Test case 1 : user exists

        self.driver.get(self.localHost + "login")

        self.login("alice", "password123")

        WebDriverWait(self.driver, 5).until(
            expected_conditions.url_to_be(self.localHost + "dashboard")
        )

        self.assertEqual(
            self.localHost + "dashboard",
            self.driver.current_url,
            "Expected to be redirected to localHost/dashboard")
        
        # Test case 2 : user does not exist

        self.driver.get(self.localHost + "login")
        
        self.login("myname", "security456")
        time.sleep(1)

        self.assertEqual(
            self.localHost + "login",
            self.driver.current_url,
            "Expected to stay on login page with invalid username")
        
        # Test case 3 : incorrect password

        self.driver.get(self.localHost + "login")
        
        self.login("alice", "password124")
        time.sleep(1)

        self.assertEqual(
            self.localHost + "login",
            self.driver.current_url,
            "Expected to stay on login page with invalid password")

    # Test signup page

    def test_signup_page(self):
        # Register user

        self.driver.get(self.localHost + "register")

        self.register("john@example.com", "john", "as90md09jrsoajm", "as90md09jrsoajm")

        WebDriverWait(self.driver, 5).until(
            expected_conditions.url_to_be(self.localHost + "dashboard")
        )

        self.assertEqual(
            self.localHost + "dashboard",
            self.driver.current_url,
            "Expected to be redirected to localHost/dashboard")

        # Email already used

        self.driver.get(self.localHost + "register")

        self.register("john@example.com", "john2004", "as90md09jrsoajm", "as90md09jrsoajm")
        time.sleep(1)

        self.assertEqual(
            self.localHost + "register",
            self.driver.current_url,
            "Expected to stay on register page as user already exists")

        # Username already used

        self.driver.get(self.localHost + "register")

        self.register("john2004@example.com", "john", "as90md09jrsoajm", "as90md09jrsoajm")
        time.sleep(1)

        self.assertEqual(
            self.localHost + "register",
            self.driver.current_url,
            "Expected to stay on register page as user already exists")

        # Invalid email
        self.driver.get(self.localHost + "register")

        self.register("john", "john2004", "as90md09jrsoajm", "as90md09jrsoajm")
        time.sleep(1)

        self.assertEqual(
            self.localHost + "register",
            self.driver.current_url,
            "Expected to stay on register page as email is invalid")

        # Password not long enough
        self.driver.get(self.localHost + "register")

        self.register("john2004@example.com", "john2004", "2sJm8", "2sJm8")
        time.sleep(1)

        self.assertEqual(
            self.localHost + "register",
            self.driver.current_url,
            "Expected to stay on register page as password isn't long enough")

        # Could not confirm password
        self.driver.get(self.localHost + "register")

        self.register("john2004@example.com", "john2004", "as90md09jrsoajm", "as90md09josoajm")
        time.sleep(1)

        self.assertEqual(
            self.localHost + "register",
            self.driver.current_url,
            "Expected to stay on register page due to incorrect confirmation password")
        
    # Test forbidden access of note

    def test_forbidden_access_of_note(self):
        alice_note_url = self.localHost + f"dashboard/note_editor?id={TestNoteID.ALICE_NOTE_1.value}"

        self.login("alice", "password123")
        WebDriverWait(self.driver, 5).until(
            expected_conditions.url_to_be(self.localHost + "dashboard")
        )

        self.driver.get(alice_note_url)
        WebDriverWait(self.driver, 5).until(
            expected_conditions.url_to_be(alice_note_url)
        )

        self.assertEqual(
            alice_note_url,
            self.driver.current_url,
            "Expected user to be able to load their own note editor page"
        )

        self.driver.get(self.localHost + "logout")
        WebDriverWait(self.driver, 5).until(
            expected_conditions.url_to_be(self.localHost + "login")
        )

        self.login("bob", "ap23km2oso38r4j4s731sj")
        WebDriverWait(self.driver, 5).until(
            expected_conditions.url_to_be(self.localHost + "dashboard")
        )

        self.driver.get(alice_note_url)
        WebDriverWait(self.driver, 5).until(
            expected_conditions.url_to_be(self.localHost + "dashboard")
        )

        self.assertEqual(
            self.localHost + "dashboard",
            self.driver.current_url,
            "Expected user to be redirected to dashboard when attempting to access another user's note"
        )

    