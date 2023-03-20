"""empty message

Revision ID: f83e98230836
Revises: f038d166b22d
Create Date: 2023-03-15 20:09:44.980206

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f83e98230836'
down_revision = 'f038d166b22d'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('payment', schema=None) as batch_op:
        batch_op.add_column(sa.Column('status', sa.String(), nullable=False))
        batch_op.alter_column('total',
               existing_type=sa.REAL(),
               type_=sa.Float(precision=10),
               existing_nullable=False)

    with op.batch_alter_table('talonario', schema=None) as batch_op:
        batch_op.alter_column('price',
               existing_type=sa.REAL(),
               type_=sa.Float(precision=10),
               existing_nullable=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('talonario', schema=None) as batch_op:
        batch_op.alter_column('price',
               existing_type=sa.Float(precision=10),
               type_=sa.REAL(),
               existing_nullable=False)

    with op.batch_alter_table('payment', schema=None) as batch_op:
        batch_op.alter_column('total',
               existing_type=sa.Float(precision=10),
               type_=sa.REAL(),
               existing_nullable=False)
        batch_op.drop_column('status')

    # ### end Alembic commands ###