from app.models import User, Note, Deck
from enum import Enum

class TestUserID(Enum):
    ALICE = 1
    BOB = 2

class TestNoteID(Enum):
    ALICE_NOTE_1 = 1
    ALICE_NOTE_2 = 2
    BOB_NOTE_1 = 3

class TestDeckID(Enum):
    ALICE_DECK_1 = 1
    ALICE_DECK_2 = 2
    BOB_DECK_1 = 3

def test_seed(db):
    # This just makes users, notes, and decks.
    # Lots of other models depend on these,
    # so these will be seeded as 'base essentials'

    # Users

    alice = User(user_id=TestUserID.ALICE.value, username='alice', email='alice@test.com')
    alice.set_password('password123')
    bob = User(user_id=TestUserID.BOB.value, username='bob', email='bob@test.com')
    bob.set_password('ap23km2oso38r4j4s731sj')
    db.session.add_all([alice, bob])
    db.session.commit()

    # Notes

    note0 = Note(
        note_id=TestNoteID.ALICE_NOTE_1.value,
        title='Alice Note 1',
        user_id=alice.user_id
    )
    note1 = Note(
        note_id=TestNoteID.ALICE_NOTE_2.value,
        title='Alice Note 2',
        user_id=alice.user_id
    )
    note2 = Note(
        note_id=TestNoteID.BOB_NOTE_1.value,
        title='Bob Note 1',
        user_id=bob.user_id
    )
    db.session.add_all([note0, note1, note2])
    db.session.commit()

    # Decks

    deck0 = Deck(
        deck_id=TestDeckID.ALICE_DECK_1.value,
        title='Alice Deck 1',
        user_id=alice.user_id
    )
    deck1 = Deck(
        deck_id=TestDeckID.ALICE_DECK_2.value,
        title='Alice Deck 2',
        user_id=alice.user_id
    )
    deck2 = Deck(
        deck_id=TestDeckID.BOB_DECK_1.value,
        title='Bob Deck 1',
        user_id=bob.user_id
    )
    db.session.add_all([deck0, deck1, deck2])
    db.session.commit()