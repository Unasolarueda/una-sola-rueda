"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Talonario, Payment, Ticket
from api.utils import generate_sitemap, APIException
from werkzeug.security import generate_password_hash, check_password_hash
from base64 import b64encode
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, decode_token
import cloudinary.uploader as uploader
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import datetime

api = Blueprint('api', __name__)

def set_password(password, salt):
    return generate_password_hash(f"{password}{salt}")

def check_password(hash_password, password, salt):
    return check_password_hash(hash_password, f"{password}{salt}")

def number_to_string(numeros, length):
    longitud = len(str(length)) - 1
    numeros_con_ceros = [str(numero).zfill(longitud) for numero in numeros]

    return numeros_con_ceros

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

@api.route('/talonario/<talonario_id>', methods=['GET'])
def get_talonario(talonario_id):
    if request.method == 'GET':
        talonario = Talonario.query.filter_by(id = talonario_id).first()


        return (talonario.serialize()),200


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
        status = "activa"

        if name is None or prize is None or numbers is None or price is None or img_url_prize is None or img_cloud_id is None:
            return jsonify({"message": "incomplete data"}),400
        else:
            try:
                new_talonario = Talonario.create(**body, talonario_id = talonario_id, user_id = user_id, status = status)
                return jsonify(new_talonario.serialize()),201
            except Exception as error: 
                db.session.rollback()
                return jsonify({"message": f"Error: {error.args[0]}"}),error.args[1]

@api.route('/talonario/<int:talonario_id>', methods=['PUT'])
def  update_talonario(talonario_id):      
     if request.method == 'PUT': 
         talonario = Talonario.query.filter_by(id = talonario_id).first()

         if talonario is None:
             return jsonify({"message": "Talonario no encontrado"}),404
         else:
             talonario.status = "finalizada"
             try:
                db.session.commit()
                return jsonify({"message":"Talonario updated"}),200
             except Exception as error: 
                return jsonify({"message": f"Error: {error.args[0]}"}),error.args[1]

@api.route('/talonario/<int:talonario_id>', methods=['DELETE'])
def  delete_talonario(talonario_id):      
     if request.method == 'DELETE': 
         talonario = Talonario.query.get(talonario_id)

         if talonario is None:
             return jsonify({"message": "Talonario no encontrado"}),404
         else:
             try:
                cloudinary_delete_response = uploader.destroy(talonario.img_cloud_id)

                if cloudinary_delete_response["result"] != "ok":
                    return jsonify({"message":"Cloudinary delete error"}),400
                
                db.session.delete(talonario)
                db.session.commit()
                return jsonify({"msg", "Talonario eliminado"}),204
             except Exception as error: 
                db.session.rollback()
                return jsonify({"message": f"Error: {error.args[0]}"})


#enpoinst ticket     
@api.route('/ticket', methods=['POST'])
def create_ticket():

    if request.method == "POST":
        body = request.json
        numbers=body.get("numbers", None)
        #number=body.get("number", None)
        status= body.get("status",None)
        talonario_id = body.get("talonario_id", None)
        payment_id = body.get("payment_id", None)

        if numbers is None or status is None or talonario_id is None or payment_id is None:
            return jsonify({"message": "missing data"}),400

        try:
            for number in numbers:
                Ticket.create(number=number, status = status, talonario_id= talonario_id, payment_id = payment_id)

            return jsonify({"message": "Tickets creados"}), 201
        
        except Exception as error:
            return jsonify({"message": f"Error: {error.args[0]}"}),error.args[1]
 
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
        payment_id=body.get("payment_id", None)
        number_of_tickets= body.get("number_of_tickets",None)
        total = body.get("total", None)
        date = body.get("date", None)
        name=body.get("name", None)
        phone= body.get("phone",None)
        email = body.get("email", None)
        talonario_id = body.get("talonario_id", None)

        if payment_method is None or payment_id is None or number_of_tickets is None or total is None or date is None or name is None or phone is None or email is None or talonario_id is None:
            return jsonify({"message": "missing data"}),400

        try:
            new_payment = Payment.create(**body)
            return jsonify(new_payment.serialize()), 201
        
        except Exception as error:
            return jsonify({"message": f"Error: {error.args[0]}"}),error.args[1]

@api.route('/payment/<int:talonario_id>', methods=['GET'])
def get_all_payments(talonario_id):
    if request.method == "GET":
        payments = Payment.query.filter_by(talonario_id = talonario_id)
        payments_dictionaries = []
        for payment in payments :
            payments_dictionaries.append(payment.serialize())

        return jsonify(payments_dictionaries)
    
@api.route('/payment/<int:payment_id>', methods=['PUT'])
def update_payment(payment_id):
    if request.method == "PUT":
        payment = Payment.query.filter_by(id = payment_id).first()

        if payment is None:
             return jsonify({"message": "payment not found"}),404
        else:
            payment.status = "aprobado"
            try:
                db.session.commit()
                return jsonify({"message":"Payment updated"}),200
            except Exception as error:
                return jsonify({"message": f"Error: {error.args[0]}"}),error.args[1]
            


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

#endpoint emails
@api.route('/verify-pay/<int:payment_id>', methods = ['POST'])
def verify_pay(payment_id):
    if request.method == "POST":
        

        sender = "dmlord17@gmail.com"
        receptor = "dmlord17@gmail.com"

        data_payment = Payment.query.filter_by(id = payment_id).first()

        message = MIMEMultipart('alternatives')
        message['Subject'] = "Unasolarueda.com - Orden 155878"
        message['From'] = sender
        message['To'] = receptor

        text = ""
        style = """* {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
        }

        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
        }

        #MessageViewBody a {
            color: inherit;
            text-decoration: none;
        }

        p {
            line-height: inherit
        }

        .desktop_hide,
        .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
        }

        .image_block img+div {
            display: none;
        }

        @media (max-width:700px) {

            .desktop_hide table.icons-inner,
            .social_block.desktop_hide .social-table {
                display: inline-block !important;
            }

            .icons-inner {
                text-align: center;
            }

            .icons-inner td {
                margin: 0 auto;
            }

            .row-content {
                width: 100% !important;
            }

            .mobile_hide {
                display: none;
            }

            .stack .column {
                width: 100%;
                display: block;
            }

            .mobile_hide {
                min-height: 0;
                max-height: 0;
                max-width: 0;
                overflow: hidden;
                font-size: 0px;
            }

            .desktop_hide,
            .desktop_hide table {
                display: table !important;
                max-height: none !important;
            }
        }"""
        
        html = f"""<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

<head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
    <style>
        {style}
    </style>
</head>

<body style="background-color: #f9f9f9; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
    <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f9f9f9;">
        <tbody>
            <tr>
                <td>
                    <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #dc3545; color: #000000; width: 680px;" width="680">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr>
                                                            <td class="pad" style="padding-bottom:10px;padding-top:10px;width:100%;padding-right:0px;padding-left:0px;">
                                                                <div class="alignment" align="center" style="line-height:10px"><img src="https://07a63a082d.imgdist.com/public/users/Integrators/BeeProAgency/980722_965375/editor_images/fdf03091-0723-41d5-b432-5fbfc3c81f63.png" style="display: block; height: auto; border: 0; width: 200px; max-width: 100%;" width="200" alt="Yourlogo Light" title="Yourlogo Light"></div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #454454; color: #000000; width: 680px;" width="680">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 20px; padding-top: 20px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <div class="spacer_block block-1" style="height:70px;line-height:70px;font-size:1px;">&#8202;</div>
                                                    <table class="image_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr>
                                                            <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                <div class="alignment" align="center" style="line-height:10px"><img src="https://d1oco4z2z1fhwp.cloudfront.net/templates/default/4971/check-icon.png" style="display: block; height: auto; border: 0; width: 93px; max-width: 100%;" width="93" alt="Check Icon" title="Check Icon"></div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <table class="text_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                        <tr>
                                                            <td class="pad" style="padding-bottom:25px;padding-left:20px;padding-right:20px;padding-top:10px;">
                                                                <div style="font-family: Georgia, 'Times New Roman', serif">
                                                                    <div class style="font-size: 14px; font-family: Georgia, Times, 'Times New Roman', serif; mso-line-height-alt: 16.8px; color: #2f2f2f; line-height: 1.2;">
                                                                        <p style="margin: 0; font-size: 14px; text-align: center; mso-line-height-alt: 16.8px;"><span style="font-size:42px;color:#ffffff;">Pago Recibido</span></p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <table class="text_block block-4" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                        <tr>
                                                            <td class="pad" style="padding-bottom:10px;padding-left:30px;padding-right:30px;padding-top:10px;">
                                                                <div style="font-family: sans-serif">
                                                                    <div class style="font-size: 14px; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 21px; color: #2f2f2f; line-height: 1.5;">
                                                                        <p style="margin: 0; font-size: 14px; text-align: center; mso-line-height-alt: 24px;"><span style="font-size:16px;color:#ffffff;">Hola <strong><u>{data_payment.name}</u></strong>,</span></p>
                                                                        <p style="margin: 0; font-size: 14px; text-align: center; mso-line-height-alt: 21px;">&nbsp;</p>
                                                                        <p style="margin: 0; font-size: 14px; text-align: center; mso-line-height-alt: 24px;"><span style="font-size:16px;color:#ffffff;">Gracias por tu pago de <strong><span style>${data_payment.total}</span></strong> el <strong><span style>{data_payment.date}</span></strong></span></p>
                                                                        <p style="margin: 0; font-size: 14px; text-align: center; mso-line-height-alt: 24px;"><span style="font-size:16px;color:#ffffff;">utilizando <strong><span style>{data_payment.payment_method}</span></strong></span></p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 680px;" width="680">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <table class="text_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                        <tr>
                                                            <td class="pad" style="padding-bottom:20px;padding-left:20px;padding-right:20px;padding-top:50px;">
                                                                <div style="font-family: sans-serif">
                                                                    <div class style="font-size: 14px; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 16.8px; color: #2f2f2f; line-height: 1.2;">
                                                                        <p style="margin: 0; text-align: center; mso-line-height-alt: 16.8px; letter-spacing: 1px;"><strong><span style="font-size:18px;">DETALLES DE PAGO</span></strong></p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 680px;" width="680">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="50%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <table class="text_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                        <tr>
                                                            <td class="pad" style="padding-bottom:10px;padding-left:10px;padding-right:20px;padding-top:10px;">
                                                                <div style="font-family: sans-serif">
                                                                    <div class style="font-size: 14px; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 28px; color: #393d47; line-height: 2;">
                                                                        <p style="margin: 0; font-size: 16px; text-align: right; mso-line-height-alt: 32px;"><span style="color:#000000;"><strong><span style="font-size:16px;"><span style># Tickets</span></span></strong></span></p>
                                                                        <p style="margin: 0; font-size: 16px; text-align: right; mso-line-height-alt: 32px;"><span style="color:#000000;"><strong><span style="font-size:16px;"><span style>Total</span></span></strong></span></p>
                                                                        <p style="margin: 0; font-size: 16px; text-align: right; mso-line-height-alt: 32px;"><span style="color:#000000;"><strong><span style="font-size:16px;"><span style>Fecha</span></span></strong></span></p>
                                                                        <p style="margin: 0; font-size: 16px; text-align: right; mso-line-height-alt: 32px;"><span style="color:#000000;"><strong><span style="font-size:16px;"><span style>Método de Pago</span></span></strong></span></p>
                                                                        <p style="margin: 0; font-size: 16px; text-align: right; mso-line-height-alt: 32px;"><span style="color:#000000;"><strong><span style="font-size:16px;"><span style>Confirmación</span></span></strong></span></p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                                <td class="column column-2" width="50%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <table class="text_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                        <tr>
                                                            <td class="pad" style="padding-bottom:10px;padding-left:20px;padding-right:10px;padding-top:10px;">
                                                                <div style="font-family: sans-serif">
                                                                    <div class style="font-size: 14px; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 28px; color: #2f2f2f; line-height: 2;">
                                                                    <p style="margin: 0; font-size: 16px; text-align: left; mso-line-height-alt: 32px;"><span style="font-size:16px;">{data_payment.number_of_tickets}</span></p>
                                                                        <p style="margin: 0; font-size: 16px; text-align: left; mso-line-height-alt: 32px;"><span style="font-size:16px;">${data_payment.total}</span></p>
                                                                        <p style="margin: 0; font-size: 16px; text-align: left; mso-line-height-alt: 32px;"><span style="font-size:16px;">{data_payment.date}</span></p>
                                                                        <p style="margin: 0; font-size: 16px; text-align: left; mso-line-height-alt: 32px;">{data_payment.payment_method}</p>
                                                                        <p style="margin: 0; font-size: 16px; text-align: left; mso-line-height-alt: 32px;">{data_payment.payment_id}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-5" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #dc3545; color: #000000; width: 680px;" width="680">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <div class="spacer_block block-1" style="height:20px;line-height:20px;font-size:1px;">&#8202;</div>
                                                    <table class="image_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr>
                                                            <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                <div class="alignment" align="center" style="line-height:10px"><img src="https://res.cloudinary.com/drcuplwe7/image/upload/v1680654977/STICKERS_CRUZANGELO_k8nf24.png" style="display: block; height: auto; border: 0; width: 204px; max-width: 100%;" width="204" alt="Yourlogo Light" title="Yourlogo Light"></div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <table class="social_block block-3" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr>
                                                            <td class="pad">
                                                                <div class="alignment" align="center">
                                                                    <table class="social-table" width="108px" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block;">
                                                                        <tr>
                                                                            <td style="padding:0 2px 0 2px;"><a href="https://www.facebook.com/" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-circle-white/facebook@2x.png" width="32" height="32" alt="Facebook" title="Facebook" style="display: block; height: auto; border: 0;"></a></td>
                                                                            <td style="padding:0 2px 0 2px;"><a href="https://twitter.com/" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-circle-white/twitter@2x.png" width="32" height="32" alt="Twitter" title="Twitter" style="display: block; height: auto; border: 0;"></a></td>
                                                                            <td style="padding:0 2px 0 2px;"><a href="https://instagram.com/" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-circle-white/instagram@2x.png" width="32" height="32" alt="Instagram" title="Instagram" style="display: block; height: auto; border: 0;"></a></td>
                                                                        </tr>
                                                                    </table>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-6" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #dc3545; color: #000000; width: 680px;" width="680">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 20px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                        <tr>
                                                            <td class="pad">
                                                                <div style="font-family: sans-serif">
                                                                    <div class style="font-size: 12px; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 14.399999999999999px; color: #cfceca; line-height: 1.2;">
                                                                        <p style="margin: 0; font-size: 14px; text-align: center; mso-line-height-alt: 16.8px;"><span style="font-size:12px;">2021 © All Rights Reserved</span></p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    
                </td>
            </tr>
        </tbody>
    </table><!-- End -->
</body>

</html>"""
        
        message.attach(MIMEText(text,'plain'))
        message.attach(MIMEText(html,'html'))

        try:
            server = smtplib.SMTP("smtp.gmail.com",587)
            server.starttls()
            server.login("dmlord17@gmail.com","ihdclnptddsmyqfs")
            server.sendmail("dmlord17@gmail.com","dmlord17@gmail.com",message.as_string())
            server.quit()
            print("Email send")
            return jsonify({"message": "Email send succesfull"}),200
        except Exception as error:
            print(error)
            print("Email not sending, error")
            return jsonify({"message":"Error, try again, later"}),500

@api.route('/verified-payment/<int:payment_id>', methods = ['POST'])
def verified_payment(payment_id):
    if request.method == "POST":
        body = request.json

        numbers=body.get("numbers", None)

        data_payment = Payment.query.filter_by(id = payment_id).first()
        data_talonario = Talonario.query.filter_by(id = data_payment.talonario_id).first()
        numbers_div = ""
        new_numbers = number_to_string(numbers, data_talonario.numbers)
        
        for number in new_numbers:
            numbers_div = numbers_div + f"<span style='margin-right: 20px' ><strong>{number}</strong></span>"
        
        sender = "dmlord17@gmail.com"
        receptor = data_payment.email
       
        message = MIMEMultipart('alternatives')
        message['Subject'] = f"Unasolarueda.com - Orden {data_payment.id}"
        message['From'] = sender
        message['To'] = receptor


        text = ""
        style = """* {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
        }

        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
        }

        #MessageViewBody a {
            color: inherit;
            text-decoration: none;
        }

        p {
            line-height: inherit
        }

        .desktop_hide,
        .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
        }

        .image_block img+div {
            display: none;
        }

        @media (max-width:700px) {

            .desktop_hide table.icons-inner,
            .social_block.desktop_hide .social-table {
                display: inline-block !important;
            }

            .icons-inner {
                text-align: center;
            }

            .icons-inner td {
                margin: 0 auto;
            }

            .row-content {
                width: 100% !important;
            }

            .mobile_hide {
                display: none;
            }

            .stack .column {
                width: 100%;
                display: block;
            }

            .mobile_hide {
                min-height: 0;
                max-height: 0;
                max-width: 0;
                overflow: hidden;
                font-size: 0px;
            }

            .desktop_hide,
            .desktop_hide table {
                display: table !important;
                max-height: none !important;
            }
        }"""
        
        html = f"""<!DOCTYPE html>
            <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

            <head>
                <title></title>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
                <style>
                    {style}
                </style>
            </head>

            <body style="background-color: #f9f9f9; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
                <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f9f9f9;">
                    <tbody>
                        <tr>
                            <td>
                                <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                    <tbody>
                                        <tr>
                                            <td>
                                                <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #dc3545; color: #000000; width: 680px;" width="680">
                                                    <tbody>
                                                        <tr>
                                                            <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                    <tr>
                                                                        <td class="pad" style="padding-bottom:10px;padding-top:10px;width:100%;padding-right:0px;padding-left:0px;">
                                                                            <div class="alignment" align="center" style="line-height:10px"><img src="https://07a63a082d.imgdist.com/public/users/Integrators/BeeProAgency/980722_965375/editor_images/fdf03091-0723-41d5-b432-5fbfc3c81f63.png" style="display: block; height: auto; border: 0; width: 200px; max-width: 100%;" width="200" alt="Yourlogo Light" title="Yourlogo Light"></div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                    <tbody>
                                        <tr>
                                            <td>
                                                <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #454454; color: #000000; width: 680px;" width="680">
                                                    <tbody>
                                                        <tr>
                                                            <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 20px; padding-top: 20px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                <div class="spacer_block block-1" style="height:70px;line-height:70px;font-size:1px;">&#8202;</div>
                                                                <table class="image_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                    <tr>
                                                                        <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                            <div class="alignment" align="center" style="line-height:10px"><img src="https://d1oco4z2z1fhwp.cloudfront.net/templates/default/4971/check-icon.png" style="display: block; height: auto; border: 0; width: 93px; max-width: 100%;" width="93" alt="Check Icon" title="Check Icon"></div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                                <table class="text_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                    <tr>
                                                                        <td class="pad" style="padding-bottom:25px;padding-left:20px;padding-right:20px;padding-top:10px;">
                                                                            <div style="font-family: Georgia, 'Times New Roman', serif">
                                                                                <div class style="font-size: 14px; font-family: Georgia, Times, 'Times New Roman', serif; mso-line-height-alt: 16.8px; color: #2f2f2f; line-height: 1.2;">
                                                                                    <p style="margin: 0; font-size: 14px; text-align: center; mso-line-height-alt: 16.8px;"><span style="font-size:42px;color:#ffffff;">Pago Verificado</span></p>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                                <table class="text_block block-4" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                    <tr>
                                                                        <td class="pad" style="padding-bottom:10px;padding-left:30px;padding-right:30px;padding-top:10px;">
                                                                            <div style="font-family: sans-serif">
                                                                                <div class style="font-size: 14px; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 21px; color: #2f2f2f; line-height: 1.5;">
                                                                                    <p style="margin: 0; font-size: 14px; text-align: center; mso-line-height-alt: 24px;"><span style="font-size:16px;color:#ffffff;">Hola <strong><u>{data_payment.name}</u></strong>,</span></p>
                                                                                    <p style="margin: 0; font-size: 14px; text-align: center; mso-line-height-alt: 21px;">&nbsp;</p>
                                                                                    <p style="margin: 0; font-size: 14px; text-align: center; mso-line-height-alt: 24px;"><span style="font-size:16px;color:#ffffff;">Gracias por tu pago de <strong><span style>${data_payment.total}</span></strong> el <strong><span style>{data_payment.date}</span></strong></span></p>
                                                                                    <p style="margin: 0; font-size: 14px; text-align: center; mso-line-height-alt: 24px;"><span style="font-size:16px;color:#ffffff;">utilizando <strong><span style>{data_payment.payment_method}</span></strong></span></p>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                    <tbody>
                                        <tr>
                                            <td>
                                                <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 680px;" width="680">
                                                    <tbody>
                                                        <tr>
                                                            <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                <table class="text_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                    <tr>
                                                                        <td class="pad" style="padding-bottom:20px;padding-left:20px;padding-right:20px;padding-top:50px;">
                                                                            <div style="font-family: sans-serif">
                                                                                <div class style="font-size: 14px; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 16.8px; color: #2f2f2f; line-height: 1.2;">
                                                                                    <p style="margin: 0; text-align: center; mso-line-height-alt: 16.8px; letter-spacing: 1px;"><strong><span style="font-size:18px;">DETALLES DE PAGO</span></strong></p>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                    <tbody>
                                        <tr>
                                            <td>
                                                <table class="row-content" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 680px;" width="680">
                                                    <tbody>
                                                        <tr>
                                                            <td class="column column-1" width="50%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                <table class="text_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                    <tr>
                                                                        <td class="pad" style="padding-bottom:10px;padding-left:10px;padding-right:20px;padding-top:10px;">
                                                                            <div style="font-family: sans-serif">
                                                                                <div class style="font-size: 14px; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 28px; color: #393d47; line-height: 2;">
                                                                                <p style="margin: 0; font-size: 16px; text-align: right; mso-line-height-alt: 32px;"><span style="color:#000000;"><strong><span style="font-size:16px;"><span style># Tickets</span></span></strong></span></p>
                                                                                    <p style="margin: 0; font-size: 16px; text-align: right; mso-line-height-alt: 32px;"><span style="color:#000000;"><strong><span style="font-size:16px;"><span style>Total</span></span></strong></span></p>
                                                                                    <p style="margin: 0; font-size: 16px; text-align: right; mso-line-height-alt: 32px;"><span style="color:#000000;"><strong><span style="font-size:16px;"><span style>Fecha</span></span></strong></span></p>
                                                                                    <p style="margin: 0; font-size: 16px; text-align: right; mso-line-height-alt: 32px;"><span style="color:#000000;"><strong><span style="font-size:16px;"><span style>Método de Pago</span></span></strong></span></p>
                                                                                    <p style="margin: 0; font-size: 16px; text-align: right; mso-line-height-alt: 32px;"><span style="color:#000000;"><strong><span style="font-size:16px;"><span style># Confirmación</span></span></strong></span></p>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                            <td class="column column-2" width="50%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                <table class="text_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                    <tr>
                                                                        <td class="pad" style="padding-bottom:10px;padding-left:20px;padding-right:10px;padding-top:10px;">
                                                                            <div style="font-family: sans-serif">
                                                                                <div class style="font-size: 14px; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 28px; color: #2f2f2f; line-height: 2;">
                                                                                <p style="margin: 0; font-size: 16px; text-align: left; mso-line-height-alt: 32px;"><span style="font-size:16px;">{data_payment.number_of_tickets}</span></p>
                                                                                    <p style="margin: 0; font-size: 16px; text-align: left; mso-line-height-alt: 32px;"><span style="font-size:16px;">${data_payment.total}</span></p>
                                                                                    <p style="margin: 0; font-size: 16px; text-align: left; mso-line-height-alt: 32px;"><span style="font-size:16px;">{data_payment.date}</span></p>
                                                                                    <p style="margin: 0; font-size: 16px; text-align: left; mso-line-height-alt: 32px;">{data_payment.payment_method}</p>
                                                                                    <p style="margin: 0; font-size: 16px; text-align: left; mso-line-height-alt: 32px;">{data_payment.payment_id}</p>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table class="row row-5" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                    <tbody>
                                        <tr>
                                            <td>
                                                <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; border-radius: 0; width: 680px;" width="680">
                                                    <tbody>
                                                        <tr>
                                                            <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                <table class="html_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                    <tr>
                                                                        <td class="pad">
                                                                            <div style="font-family:Arial, Helvetica Neue, Helvetica, sans-serif;text-align:center;" align="center"><div class="our-class">
                                                                                <h3>SUS NÚMEROS</h3>
                                                                                
                                                                                    {numbers_div}
                                                                                
                                                                            </div> 
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                                <table class="divider_block block-2" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                    <tr>
                                                                        <td class="pad">
                                                                            <div class="alignment" align="center">
                                                                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                    <tr>
                                                                                        <td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 1px solid #FFF;"><span>&#8202;</span></td>
                                                                                    </tr>
                                                                                </table>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table class="row row-6" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                    <tbody>
                                        <tr>
                                            <td>
                                                <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #dc3545; color: #000000; width: 680px;" width="680">
                                                    <tbody>
                                                        <tr>
                                                            <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                <div class="spacer_block block-1" style="height:20px;line-height:20px;font-size:1px;">&#8202;</div>
                                                                <table class="image_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                    <tr>
                                                                        <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                            <div class="alignment" align="center" style="line-height:10px"><img src="https://res.cloudinary.com/drcuplwe7/image/upload/v1680654977/STICKERS_CRUZANGELO_k8nf24.png" style="display: block; height: auto; border: 0; width: 204px; max-width: 100%;" width="204" alt="Yourlogo Light" title="Yourlogo Light"></div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                                <table class="social_block block-3" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                    <tr>
                                                                        <td class="pad">
                                                                            <div class="alignment" align="center">
                                                                                <table class="social-table" width="108px" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block;">
                                                                                    <tr>
                                                                                        <td style="padding:0 2px 0 2px;"><a href="https://www.facebook.com/" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-circle-white/facebook@2x.png" width="32" height="32" alt="Facebook" title="Facebook" style="display: block; height: auto; border: 0;"></a></td>
                                                                                        <td style="padding:0 2px 0 2px;"><a href="https://twitter.com/" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-circle-white/twitter@2x.png" width="32" height="32" alt="Twitter" title="Twitter" style="display: block; height: auto; border: 0;"></a></td>
                                                                                        <td style="padding:0 2px 0 2px;"><a href="https://instagram.com/" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-circle-white/instagram@2x.png" width="32" height="32" alt="Instagram" title="Instagram" style="display: block; height: auto; border: 0;"></a></td>
                                                                                    </tr>
                                                                                </table>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table class="row row-7" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                    <tbody>
                                        <tr>
                                            <td>
                                                <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #dc3545; color: #000000; width: 680px;" width="680">
                                                    <tbody>
                                                        <tr>
                                                            <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 20px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                    <tr>
                                                                        <td class="pad">
                                                                            <div style="font-family: sans-serif">
                                                                                <div class style="font-size: 12px; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 14.399999999999999px; color: #cfceca; line-height: 1.2;">
                                                                                    <p style="margin: 0; font-size: 14px; text-align: center; mso-line-height-alt: 16.8px;"><span style="font-size:12px;">2021 © All Rights Reserved</span></p>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table class="row row-8" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                    <tbody>
                                        <tr>
                                            <td>
                                                <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 680px;" width="680">
                                                    <tbody>
                                                        <tr>
                                                            <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                <table class="icons_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                    <tr>
                                                                        <td class="pad" style="vertical-align: middle; color: #9d9d9d; font-family: inherit; font-size: 15px; padding-bottom: 5px; padding-top: 5px; text-align: center;">
                                                                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                <tr>
                                                                                    <td class="alignment" style="vertical-align: middle; text-align: center;"><!--[if vml]><table align="left" cellpadding="0" cellspacing="0" role="presentation" style="display:inline-block;padding-left:0px;padding-right:0px;mso-table-lspace: 0pt;mso-table-rspace: 0pt;"><![endif]-->
                                                                                        <!--[if !vml]><!-->
                                                                                        
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table><!-- End -->
            </body>

            </html>"""
        
        message.attach(MIMEText(text,'plain'))
        message.attach(MIMEText(html,'html'))

        try:
            server = smtplib.SMTP("smtp.hostinger.com",465)
            server.starttls()
            server.login("info@unasolarueda.com","P*ul24a$")
            server.sendmail("info@unasolarueda.com",receptor,message.as_string())
            server.quit()
            print("Email send")
            return jsonify({"message": "Email send succesfull"}),200
        except Exception as error:
            print(error)
            print("Email not sending, error")
            return jsonify({"message":"Error, try again, later"}),500
        