"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Talonario
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
                    return jsonify(user_delete),200
        
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
def get_talonarios():
    if request.method == 'GET':
        talonarios = Talonario.query.all()

        return (list(map(lambda talonario: talonario.serialize(),talonarios ))),200


@api.route('/talonario', methods=['POST'])
def  create_talonario():
    if request.method == 'POST':
        body = request.json

        name = body.get('name', None)
        prize = body.get('prize', None)
        numbers= body.get('numbers',None)
        price = body.get('price', None)
        img_prize = body.get('img_prize', False)
        date = body.get('date', None)
        payment_method = body.get('payment_method', None)
        user_id = body.get('user_id', None)

        if name is None or prize is None or numbers is None or price is None or img_prize is None or date is None or payment_method is None or user_id is None:
            return jsonify({"message": "incomplete data"})
        else:
            try:
                new_talonario = Talonario.create(**body)
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

#endpoints ticket     

 
        

