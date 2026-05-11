"""merge migration heads of quiz and flashcards branches

Revision ID: 2dbfa7f66637
Revises: ed457ff3faf4, d5ca6f9b0d2e
Create Date: 2026-05-11 03:48:46.088866

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2dbfa7f66637'
down_revision = ('ed457ff3faf4', 'd5ca6f9b0d2e')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
