"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Talonario, User_ticket, Payment, Ticket
from api.utils import generate_sitemap, APIException
from werkzeug.security import generate_password_hash, check_password_hash
from base64 import b64encode
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

api = Blueprint('api', __name__)

def set_password(password, salt):
    return generate_password_hash(f"{password}{salt}")

def check_password(hash_password, password, salt):
    return check_password_hash(hash_password, f"{password}{salt}")

#endpoints user
@api.route('/user', methods=['POST'])
def add_user():
    if request.method == 'POST':
        body = request.json
        email = body.get("email", None)
        password= body.get("password",None)
        role= body.get("role","raffler")
       
        if email is None or password is None:
            return "you need an email and a password",400
        else:
            salt = b64encode(os.urandom(32)).decode('utf-8')
            password = set_password(password, salt)
            try:
                user = User.create(email = email, password = password, salt=salt, role=role)
                return jsonify({"message": "User created"}),201
                
            except Exception as error: 
                print(error.args)
                db.session.rollback()
                return jsonify({"message": f"Error: {error.args[0]}"}),error.args[1]
            
@api.route('/user', methods=['GET'])
@jwt_required()
def gell_all_user():
    if request.method == 'GET':
        all_users = User.query.all()
        user_id = User.query.get(get_jwt_identity())
        
        if(user_id.role.value == "admin" or user_id.role.value == "super_admin"):
            return jsonify(list(map(lambda user: user.serialize(), all_users))),200          
        else:
            return jsonify([]),200
        
@api.route('/user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id=None):
    if request.method == "DELETE":
        if user_id is None:
            return jsonify({"message": "Bad request"})
        if user_id is not None:
            user = User.query.get(user_id)

            if user is None:
                return jsonify({"message": "user not found"}),404
            else:
                try:
                    user_delete = User.delete_user(user)
                    return jsonify(user_delete),204
        
                except Exception as error:
                    return jsonify({"message": f"Error: {error.args[0]}"}),error.args[1]
                    
       

@api.route('/user/login', methods=['POST'])
def handle_login():
     if request.method == 'POST':
         body = request.json 
         email = body.get('email', None)
         password = body.get('password', None)

        
         if email is None or password is None:
             return "you need an email and a password", 400
         else:
            login = User.query.filter_by(email=email).one_or_none()
            if login is None:
                return jsonify({"message":"bad credentials"}), 400
            else:
                 if check_password(login.password, password, login.salt):
                     token = create_access_token(identity=login.id)
                     return jsonify({"token": token, "role": login.role.value}),200
                 else:
                     return jsonify({"message":"bad credentials"}), 400

#endpoints talonario
@api.route('/talonario', methods=['GET'])
@jwt_required()
def get_talonarios():
    if request.method == 'GET':
        user_id = get_jwt_identity()
        talonarios = Talonario.query.filter_by(user_id = user_id)

        return (list(map(lambda talonario: talonario.serialize(),talonarios ))),200


@api.route('/talonario', methods=['POST'])
@jwt_required()
def  create_talonario():
    if request.method == 'POST':
        body = request.json
        user_id = get_jwt_identity()

        name = body.get('name', None)
        prize = body.get('prize', None)
        numbers= body.get('numbers',None)
        price = body.get('price', None)
        img_url_prize = body.get('img_url_prize', False)
        img_cloud_id = body.get('img_cloud_id', None)
        talonario_id = b64encode(os.urandom(32)).decode('utf-8')

        if name is None or prize is None or numbers is None or price is None or img_url_prize is None or img_cloud_id is None:
            return jsonify({"message": "incomplete data"}),400
        else:
            try:
                new_talonario = Talonario.create(**body, talonario_id = talonario_id, user_id = user_id)
                return jsonify(new_talonario.serialize()),201
            except Exception as error: 
                db.session.rollback()
                return jsonify({"message": f"Error: {error.args[0]}"}),error.args[1]

@api.route('/talonario/<int:talonario_id>', methods=['DELETE'])
def  delete_talonario(talonario_id):      
     if request.method == 'DELETE': 
         talonario = Talonario.query.get(talonario_id)

         if talonario is None:
             return jsonify({"message": "Talonario no encontrado"}),404
         else:
             try:
                talonario_to_delete = Talonario.delete_talonario(talonario)
                return jsonify(talonario_to_delete)
             except Exception as error: 
                db.session.rollback()
                return jsonify({"message": f"Error: {error.args[0]}"}),error.args[1]

#endpoints user_ticket
@api.route('/user-ticket', methods=['POST'])
def add_user_ticket():
    if request.method == 'POST':

        body = request.json
        name=body.get("name", None)
        phone= body.get("phone",None)
        email = body.get("email", None)

       
        if name is None or phone is None or email is None:
            return "you need an name and a phone and a email",400
        else:
            try:
                User_ticket.create(name = name, phone = phone, email=email)
                return jsonify({"message": "User created"}),201
                
            except Exception as error: 
                db.session.rollback()
                return jsonify({"message": f"Error: {error.args[0]}"}),error.args[1]
            
@api.route('/user-ticket', methods=['GET'])
def gell_all_user_ticket():
    if request.method == 'GET':
        all_users = User_ticket.query.all()
        
        return jsonify(list(map(lambda user: user.serialize(), all_users))),200          

       
        
@api.route('/user-ticket/<int:user_id>', methods=['DELETE'])
def delete_user_ticket(user_id=None):
    if request.method == "DELETE":
        if user_id is not None:
            user = User_ticket.query.get(user_id)

            if user is None:
                return jsonify({"message": "user not found"}),404
            else:
                try:
                    user_delete = User_ticket.delete_user(user)
                    return jsonify(user_delete),204
        
                except Exception as error:
                    return jsonify({"message": f"Error: {error.args[0]}"}),error.args[1]
                    
      
#endpoints user_ticket
@api.route('/ticket', methods=['POST'])
def create_ticket():

    if request.method == "POST":
        body = request.json
        number=body.get("number", None)
        status= body.get("status",None)
        talonario_id = body.get("talonario_id", None)
        user_ticket_id = body.get("talonario_id", None)

        if number is None or status is None or talonario_id is None or user_ticket_id is None:
            return jsonify({"message": "missing data"}),400

        try:
            new_ticket = Ticket.create(**body)
            return jsonify(new_ticket.serialize()), 201
        
        except Exception as error:
            return jsonify({"message": f"Error: {error.args[0]}"}),error.args[1]
 
#enpoinst ticket     
@api.route('/ticket', methods=['GET'])
def get_all_ticket():
    if request.method == "GET":
        tickets = Ticket.query.all()
        tickets_dictionaries = []
        for ticket in tickets :
            tickets_dictionaries.append(ticket.serialize())
        
        return jsonify(tickets_dictionaries)

@api.route('/ticket/<int:talonario_id>', methods=['GET'])
def get_ticket(talonario_id):
    if request.method == "GET":
        tickets = Ticket.query.filter_by(talonario_id = talonario_id)
        tickets_dictionaries = []
        for ticket in tickets :
            tickets_dictionaries.append(ticket.serialize())
        
        return jsonify(tickets_dictionaries)

@api.route('/ticket/<int:number>/<int:talonario_id>', methods=['GET'])
def get_one_ticket(number, talonario_id):
    if request.method == "GET":
        ticket = Ticket.query.filter_by(talonario_id = talonario_id, number = number).one_or_none()
        
        if ticket is None:
            return jsonify({"message": "the ticket not found"}),400
        else:
            return jsonify(ticket.serialize())

@api.route('/ticket/<int:ticket_id>', methods=['DELETE'])
def delete_ticket(ticket_id=None):
    if request.method == "DELETE":
        if ticket_id is not None:
            ticket = Ticket.query.get(ticket_id)
            

            if ticket is None:
                return jsonify({"message": "ticket not found"}),404
            else:
                try:
                    ticket_delete = Ticket.delete(ticket)
                    return jsonify(ticket_delete),204
        
                except Exception as error:
                    return jsonify({"message": f"Error: {error.args[0]}"}),error.args[1]
                
#endpoints payments
@api.route('/payment', methods=['POST'])
def create_payment():

    if request.method == "POST":
        body = request.json
        payment_method=body.get("payment_method", None)
        number_of_tickets= body.get("number_of_tickets",None)
        total = body.get("total", None)
        date = body.get("date", None)
        talonario_id = body.get("talonario_id", None)
        user_ticket_id = body.get("user_ticket_id", None)

        if payment_method is None or number_of_tickets is None or total is None or date is None or talonario_id is None or user_ticket_id is None:
            return jsonify({"message": "missing data"}),400

        try:
            new_payment = Payment.create(**body)
            return jsonify(new_payment.serialize()), 201
        
        except Exception as error:
            return jsonify({"message": f"Error: {error.args[0]}"}),error.args[1]

@api.route('/payment', methods=['GET'])
def get_all_payments():
    if request.method == "GET":
        payments = Payment.query.all()
        payments_dictionaries = []
        for payment in payments :
            payments_dictionaries.append(payment.serialize())

        return jsonify(payments_dictionaries)

@api.route('/payment/<int:payment_id>', methods=['DELETE'])
def delete_payment(payment_id=None):
    if request.method == "DELETE":
        if payment_id is not None:
            payment = Payment.query.get(payment_id)
            

            if payment is None:
                return jsonify({"message": "payment not found"}),404
            else:
                try:
                    payment_delete = Ticket.delete(payment)
                    return jsonify(payment_delete),204
        
                except Exception as error:
                    return jsonify({"message": f"Error: {error.args[0]}"}),error.args[1]