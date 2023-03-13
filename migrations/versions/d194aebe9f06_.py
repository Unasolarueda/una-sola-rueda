"""empty message

Revision ID: d194aebe9f06
Revises: a2b7de5023b9
Create Date: 2023-03-09 19:19:28.424860

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd194aebe9f06'
down_revision = 'a2b7de5023b9'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('payment', schema=None) as batch_op:
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

    # ### end Alembic commands ###