"""replace_is_superset_with_set_type

Revision ID: f1c223420a66
Revises: 43930607f3a8
Create Date: 2026-04-11 11:00:55.983834

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f1c223420a66'
down_revision: Union[str, Sequence[str], None] = '43930607f3a8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column("sets", "is_superset")
    op.add_column("sets", sa.Column("set_type", sa.String(), nullable=True, server_default="normal"))


def downgrade() -> None:
    op.drop_column("sets", "set_type")
    op.add_column("sets", sa.Column("is_superset", sa.Boolean(), nullable=True))
