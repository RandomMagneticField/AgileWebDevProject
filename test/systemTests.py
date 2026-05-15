import os
import tempfile
import threading
import unittest
from urllib.error import URLError
from urllib.request import urlopen

from app.models import User, Note
from app import create_app, db
from datetime import datetime, timezone
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
        self.wait_for_server_ready()
        self.driver.get(self.localHost)

    def tearDown(self):
        self.driver.quit()
        self.server_thread.shutdown()
        self.server_thread.join(timeout=5)

        db.session.remove()
        db.drop_all()
        self.app_context.pop()

        os.unlink(self.temp_db.name)

    # Helper functions

    def wait_for_server_ready(self):
        def server_ready(_):
            try:
                with urlopen(self.localHost, timeout=1):
                    return True
            except URLError:
                return False

        WebDriverWait(self.driver, 5, poll_frequency=0.1).until(server_ready)

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

    def apply_sort(self, sort_value):
        sort_btn = self.driver.find_element(By.ID, "sort-btn")
        sort_btn.click()
        sort_option = WebDriverWait(self.driver, 5).until(
            expected_conditions.element_to_be_clickable(
                (By.CSS_SELECTOR, f"#sort-dropdown .select-option[data-value='{sort_value}']")
            )
        )
        sort_option.click()

    def get_note_titles(self):
        cards = self.driver.find_elements(By.CSS_SELECTOR, ".note-card .note-card-title")
        return [card.text.strip() for card in cards if card.text.strip()]

    def assert_note_order(self, expected_titles, msg):
        def titles_sorted(_):
            filtered_titles = [title for title in self.get_note_titles() if title in expected_titles]
            return filtered_titles == expected_titles

        WebDriverWait(self.driver, 5).until(titles_sorted)
        final_titles = [title for title in self.get_note_titles() if title in expected_titles]
        self.assertEqual(expected_titles, final_titles, msg)

    def get_discover_note_titles(self):
        cards = self.driver.find_elements(By.CSS_SELECTOR, "#notes-grid .note-card .note-card-title")
        return [card.text.strip() for card in cards if card.text.strip()]

    def get_auth_errors(self):
        return [el.text.strip() for el in self.driver.find_elements(By.CSS_SELECTOR, ".errors") if el.text.strip()]

    def wait_for_auth_error(self):
        WebDriverWait(self.driver, 5).until(
            lambda d: len(d.find_elements(By.CSS_SELECTOR, ".errors")) > 0
        )

    def field_is_valid(self, field_id):
        field = self.driver.find_element(By.ID, field_id)
        return self.driver.execute_script("return arguments[0].checkValidity();", field)

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
        self.wait_for_auth_error()

        self.assertEqual(
            self.localHost + "login",
            self.driver.current_url,
            "Expected to stay on login page with invalid username")
        
        # Test case 3 : incorrect password

        self.driver.get(self.localHost + "login")
        
        self.login("alice", "password124")
        self.wait_for_auth_error()

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

        self.driver.get(self.localHost + "logout")
        WebDriverWait(self.driver, 5).until(
            expected_conditions.url_to_be(self.localHost + "login")
        )

        # Email already used

        self.driver.get(self.localHost + "register")

        self.register("john@example.com", "john2004", "as90md09jrsoajm", "as90md09jrsoajm")
        self.wait_for_auth_error()

        self.assertEqual(
            self.localHost + "register",
            self.driver.current_url,
            "Expected to stay on register page as user already exists")

        # Username already used

        self.driver.get(self.localHost + "register")

        self.register("john2004@example.com", "john", "as90md09jrsoajm", "as90md09jrsoajm")
        self.wait_for_auth_error()

        self.assertEqual(
            self.localHost + "register",
            self.driver.current_url,
            "Expected to stay on register page as user already exists")

        # Invalid email
        self.driver.get(self.localHost + "register")

        self.register("john", "john2004", "as90md09jrsoajm", "as90md09jrsoajm")
        self.wait_for_auth_error()

        self.assertEqual(
            self.localHost + "register",
            self.driver.current_url,
            "Expected to stay on register page as email is invalid")

        # Password not long enough
        self.driver.get(self.localHost + "register")

        self.register("john2004@example.com", "john2004", "2sJm8", "2sJm8")
        self.assertFalse(
            self.field_is_valid("password"),
            "Expected password field to fail HTML validity checks for a too-short password"
        )

        self.assertEqual(
            self.localHost + "register",
            self.driver.current_url,
            "Expected to stay on register page as password isn't long enough")

        # Could not confirm password
        self.driver.get(self.localHost + "register")

        self.register("john2004@example.com", "john2004", "as90md09jrsoajm", "as90md09josoajm")
        self.wait_for_auth_error()

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

    # Dashboard loading and sorting test
    def test_dashboard_loading_and_sorting(self):
        n1 = Note(
            title='Agile Web Development',
            user_id=TestUserID.ALICE.value,
            created_at=datetime(2026, 3, 15, tzinfo=timezone.utc),
            updated_at=datetime(2026, 4, 5, tzinfo=timezone.utc),
            accessed_at=datetime(2026, 5, 10, tzinfo=timezone.utc)
        )
        n2 = Note(
            title='Computer Networks',
            user_id=TestUserID.ALICE.value,
            created_at=datetime(2026, 3, 5, tzinfo=timezone.utc),
            updated_at=datetime(2026, 4, 10, tzinfo=timezone.utc),
            accessed_at=datetime(2026, 5, 15, tzinfo=timezone.utc)
        )
        n3 = Note(
            title='Secure Coding',
            user_id=TestUserID.ALICE.value,
            created_at=datetime(2026, 3, 10, tzinfo=timezone.utc),
            updated_at=datetime(2026, 4, 15, tzinfo=timezone.utc),
            accessed_at=datetime(2026, 5, 5, tzinfo=timezone.utc)
        )
        db.session.add_all([n1, n2, n3])
        db.session.commit()

        self.login("alice", "password123")
        WebDriverWait(self.driver, 5).until(
            expected_conditions.url_to_be(self.localHost + "dashboard")
        )

        expected_titles = [n1.title, n2.title, n3.title]
        WebDriverWait(self.driver, 5).until(lambda _: len(self.get_note_titles()) >= 3)
        initial_titles = self.get_note_titles()
        for title in expected_titles:
            self.assertIn(title, initial_titles, f"Expected dashboard to load user's notes")

        self.apply_sort('alpha')
        self.assert_note_order([n1.title, n2.title, n3.title], "Expected correct alphabetical sorting")

        self.apply_sort('created')
        self.assert_note_order([n1.title, n3.title, n2.title], "Expected correct created at sorting")

        self.apply_sort('updated')
        self.assert_note_order([n3.title, n2.title, n1.title], "Expected correct last updated at sorting")

        self.apply_sort('accessed')
        self.assert_note_order([n2.title, n1.title, n3.title], "Expected correct last accessed at sorting")

    # Test note private and public
    def test_note_visibility(self):
        alice_note_title = 'Alice Note 1'
        alice_note_editor_url = self.localHost + f"dashboard/note_editor?id={TestNoteID.ALICE_NOTE_1.value}"

        # Assumes all testseed notes are private
        self.login("alice", "password123")
        WebDriverWait(self.driver, 5).until(
            expected_conditions.url_to_be(self.localHost + "dashboard")
        )

        self.driver.get(self.localHost + "discover")
        WebDriverWait(self.driver, 5).until(
            expected_conditions.url_to_be(self.localHost + "discover")
        )
        self.assertEqual(
            [],
            self.get_discover_note_titles(),
            "Expected no discover notes since all notes are private"
        )

        # Switch note to public and save
        self.driver.get(alice_note_editor_url)
        WebDriverWait(self.driver, 5).until(
            expected_conditions.url_to_be(alice_note_editor_url)
        )
        public_btn = WebDriverWait(self.driver, 5).until(
            expected_conditions.element_to_be_clickable((By.ID, "vis-public"))
        )
        public_btn.click()
        save_btn = self.driver.find_element(By.ID, "btn-save")
        save_btn.click()
        WebDriverWait(self.driver, 5).until(
            lambda _: "unsaved" not in save_btn.get_attribute("class")
        )

        # Verify visibility in discover as Bob, as discover excludes own notes
        self.driver.get(self.localHost + "logout")
        WebDriverWait(self.driver, 5).until(
            expected_conditions.url_to_be(self.localHost + "login")
        )
        self.login("bob", "ap23km2oso38r4j4s731sj")
        WebDriverWait(self.driver, 5).until(
            expected_conditions.url_to_be(self.localHost + "dashboard")
        )

        self.driver.get(self.localHost + "discover")
        WebDriverWait(self.driver, 5).until(
            lambda _: alice_note_title in self.get_discover_note_titles()
        )
        self.assertIn(
            alice_note_title,
            self.get_discover_note_titles(),
            "Expected note to appear in discover after setting it from private to public"
        )

        # Switch note back to private
        self.driver.get(self.localHost + "logout")
        WebDriverWait(self.driver, 5).until(
            expected_conditions.url_to_be(self.localHost + "login")
        )
        self.login("alice", "password123")
        WebDriverWait(self.driver, 5).until(
            expected_conditions.url_to_be(self.localHost + "dashboard")
        )

        self.driver.get(alice_note_editor_url)
        WebDriverWait(self.driver, 5).until(
            expected_conditions.url_to_be(alice_note_editor_url)
        )
        private_btn = WebDriverWait(self.driver, 5).until(
            expected_conditions.element_to_be_clickable((By.ID, "vis-private"))
        )
        private_btn.click()
        save_btn = self.driver.find_element(By.ID, "btn-save")
        save_btn.click()
        WebDriverWait(self.driver, 5).until(
            lambda _: "unsaved" not in save_btn.get_attribute("class")
        )

        # Verify note is hidden again
        self.driver.get(self.localHost + "logout")
        WebDriverWait(self.driver, 5).until(
            expected_conditions.url_to_be(self.localHost + "login")
        )
        self.login("bob", "ap23km2oso38r4j4s731sj")
        WebDriverWait(self.driver, 5).until(
            expected_conditions.url_to_be(self.localHost + "dashboard")
        )

        self.driver.get(self.localHost + "discover")
        WebDriverWait(self.driver, 5).until(
            lambda _: alice_note_title not in self.get_discover_note_titles()
        )
        self.assertNotIn(
            alice_note_title,
            self.get_discover_note_titles(),
            "Expected note to be hidden from discover after setting it from public to private"
        )
        