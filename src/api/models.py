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
    password = db.Column(db.String(120), unique=False, nullable=False)
    salt = db.Column(db.String(80), unique=False, nullable=False)
    role = db.Column(db.Enum(Role), nullable=False)

    def __init__(self,**kwargs):
        self.email = kwargs['email']
        self.password = kwargs['password']
        self.salt = kwargs['salt']
        self.role = kwargs['role']
    
    def __repr__(self):
        return f'<User {self.email}>'

    @classmethod
    def create(cls, **kwargs):
        new_user = cls(**kwargs)
        db.session.add(new_user)

        try:
            db.session.commit()
            return new_user
        except Exception as error:
            db.session.rollback()
            raise Exception(error.args[0],400)


    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "role": self.role.value
            # do not serialize the password, its a security breach
        }