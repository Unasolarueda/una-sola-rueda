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
    
    @classmethod
    def delete_user(cls,kwargs):
        db.session.delete(kwargs)
        try:
            db.session.commit()
            return {"msg":"el usuario fue eliminado correctamente"}
        except Exception as error:
            print("error")
            raise Exception(error.args[0],400)
       


    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "role": self.role.value
            # do not serialize the password, its a security breach
        }
    
class Talonario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), unique=False, nullable=False)
    prize = db.Column(db.String(200), unique=False, nullable=False)
    numbers = db.Column(db.Integer, unique=False, nullable=False)
    price = db.Column(db.Float(10), unique=False, nullable=False)
    img_prize = db.Column(db.String(200), unique=False, nullable=False)
    date = db.Column(db.Date, nullable=False)
    payment_method = db.Column(db.String(100), unique=False, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    def __init__(self, **kwargs):
        self.name = kwargs['name']
        self.prize = kwargs['prize']
        self.numbers = kwargs['numbers']
        self.price = kwargs['price']
        self.img_prize = kwargs['img_prize']
        self.date = kwargs['date']
        self.payment_method = kwargs['payment_method']
        self.user_id = kwargs['user_id']

    @classmethod
    def create(cls, **kwargs):
        new_talonario = cls(**kwargs)
        db.session.add(new_talonario)

        try:
            db.session.commit()
            return new_talonario
        except Exception as error:
            raise Exception(error.args[0], 400)
    @classmethod
    def delete_talonario(cls,kwargs):
        db.session.delete(kwargs)
        try:
            db.session.commit()
            return {"msg":"el talonario fue eliminado correctamente"}
        except Exception as error:
            print("error")
            raise Exception(error.args[0],400)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "prize": self.prize,
            "price": self.price,
            "img_prize": self.img_prize,
            "date": self.date,
            "payment_method": self.payment_method,
            "user_id" : self.user_id
        
            # do not serialize the password, its a security breach
        }