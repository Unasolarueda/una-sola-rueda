from flask_sqlalchemy import SQLAlchemy
from enum import Enum
import datetime


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
    status = db.Column(db.String, nullable=False )
    img_url_prize = db.Column(db.String(200), unique=False, nullable=False)
    img_cloud_id = db.Column(db.String(120), unique=True, nullable=False)
    talonario_id = db.Column(db.String(120), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    ticket = db.relationship("Ticket",back_populates='talonario',cascade='save-update, merge, delete')
    payment = db.relationship("Payment",back_populates='talonario',cascade='save-update, merge, delete')
    

    def __init__(self, **kwargs):
        self.name = kwargs['name']
        self.prize = kwargs['prize']
        self.numbers = kwargs['numbers']
        self.price = kwargs['price']
        self.status = kwargs['status']
        self.img_url_prize = kwargs['img_url_prize']
        self.img_cloud_id = kwargs['img_cloud_id']
        self.talonario_id = kwargs['talonario_id']
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
            "numbers": self.numbers,
            "price": self.price,
            "talonario_id": self.talonario_id,
            "status": self.status,
            "img_url_prize": self.img_url_prize,
            "img_cloud_id": self.img_cloud_id,
            "user_id" : self.user_id
        
            # do not serialize the password, its a security breach
        }

class Payment(db.Model):

    id = db.Column(db.Integer, primary_key=True)
    payment_method = db.Column(db.String(100), unique=False, nullable=False)
    payment_id = db.Column(db.String(200), unique=False, nullable=False)
    number_of_tickets=db.Column(db.Integer, unique=False, nullable=False)
    total = db.Column(db.Float(10), unique=False, nullable=False)
    date = db.Column(db.DateTime(timezone=True), default=datetime.datetime.now)
    status = db.Column(db.String, nullable=False )
    name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.datetime.now, onupdate=datetime.datetime.now)

    talonario_id = db.Column(db.Integer, db.ForeignKey('talonario.id'))
    talonario = db.relationship("Talonario", back_populates="payment")
    
    

    def __init__(self, **kwargs):
        self.payment_method = kwargs['payment_method']
        self.payment_id = kwargs['payment_id']
        self.number_of_tickets = kwargs['number_of_tickets']
        self.total = kwargs['total']
        self.status = "no-aprobado"
        self.name = kwargs['name']
        self.phone = kwargs['phone']
        self.email = kwargs['email']
        self.talonario_id = kwargs['talonario_id']
    
    @classmethod
    def create(cls, **kwargs):
        new_payment = cls(**kwargs)
        db.session.add(new_payment)
        
        try:
            db.session.commit()
            return new_payment
        except Exception as error:
            raise Exception(error.args[0],400)
        
    @classmethod
    def delete(cls,kwargs):
        db.session.delete(kwargs)
        try:
            db.session.commit()
            return {"msg":"el pago fue eliminado correctamente"}
        except Exception as error:
            print("error")
            raise Exception(error.args[0],400)
        
    def serialize(self):
        return {
            "id": self.id,
            "payment_method": self.payment_method,
            "number_of_tickets": self.number_of_tickets,
            "payment_id": self.payment_id,
            "total": self.total,
            "date": self.date,
            "status": self.status,
            "name": self.name,
            "phone": self.phone,
            "email": self.email,
            "talonario_id": self.talonario_id,
        
        } 
    
class Ticket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String, nullable=False )

    talonario_id = db.Column(db.Integer, db.ForeignKey('talonario.id'))
    talonario = db.relationship("Talonario", back_populates="ticket")

    payment_id = db.Column(db.Integer, db.ForeignKey('payment.id'))
    payment = db.relationship("Payment", backref="ticket")
    
    
    

    def __init__(self, **kwargs):
        self.number = kwargs['number']
        self.talonario_id = kwargs['talonario_id']
        self.status = kwargs['status']
        self.payment_id = kwargs['payment_id']
    
    @classmethod
    def create(cls, **kwargs):
        new_ticket = cls(**kwargs)
        db.session.add(new_ticket)
        
        try:
            db.session.commit()
            return new_ticket
        except Exception as error:
            raise Exception(error.args[0],400)
        
    @classmethod
    def delete(cls,kwargs):
        db.session.delete(kwargs)
        try:
            db.session.commit()
            return {"msg":"el ticket fue eliminado correctamente"}
        except Exception as error:
            print("error")
            raise Exception(error.args[0],400)
        
    def serialize(self):
        return {
        "id": self.id,
        "number": self.number,
        "status": self.status,
        "user_name": self.payment.name if self.payment else None,
        "user_phone": self.payment.phone if self.payment else None,
        "user_email": self.payment.email if self.payment else None,
        "talonario_id": self.talonario_id,
        "payment_id": self.payment_id,


        } 
    
