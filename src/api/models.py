from flask_sqlalchemy import SQLAlchemy
from enum import Enum

db = SQLAlchemy()

class Role(Enum):
    super_admin = "super_admin"
    admin = "admin"
    raffler = "raffler"


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), unique=False, nullable=False)
    role = db.Column(db.Enum(Role), nullable=False, default="raffler")

    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "role": self.role
            # do not serialize the password, its a security breach
        }