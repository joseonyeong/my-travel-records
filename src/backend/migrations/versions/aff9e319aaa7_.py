"""empty message

Revision ID: aff9e319aaa7
Revises: 
Create Date: 2025-06-02 20:40:38.247651

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aff9e319aaa7'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('map',
    sa.Column('district_code', sa.String(length=50), nullable=False),
    sa.Column('district_name', sa.String(length=50), nullable=False),
    sa.Column('coordinate', sa.String(length=100), nullable=True),
    sa.PrimaryKeyConstraint('district_code')
    )
    op.create_table('user',
    sa.Column('user_num', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('id', sa.String(length=50), nullable=False),
    sa.Column('pw', sa.String(length=100), nullable=True),
    sa.Column('profile_img', sa.String(length=255), nullable=True),
    sa.Column('register_date', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('user_num'),
    sa.UniqueConstraint('id')
    )
    op.create_table('board',
    sa.Column('board_id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('user_num', sa.Integer(), nullable=True),
    sa.Column('content', sa.Text(), nullable=True),
    sa.Column('title', sa.String(length=255), nullable=True),
    sa.Column('district_code', sa.String(length=50), nullable=True),
    sa.Column('writer_date', sa.DateTime(), nullable=True),
    sa.Column('update_date', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['district_code'], ['map.district_code'], ),
    sa.ForeignKeyConstraint(['user_num'], ['user.user_num'], ),
    sa.PrimaryKeyConstraint('board_id')
    )
    op.create_table('board_img',
    sa.Column('img_id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('board_id', sa.Integer(), nullable=True),
    sa.Column('img_url', sa.String(length=255), nullable=True),
    sa.ForeignKeyConstraint(['board_id'], ['board.board_id'], ),
    sa.PrimaryKeyConstraint('img_id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('board_img')
    op.drop_table('board')
    op.drop_table('user')
    op.drop_table('map')
    # ### end Alembic commands ###
