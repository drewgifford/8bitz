from flask import Flask, redirect, url_for, render_template, request, session
from cryptography.fernet import Fernet
import sqlite3
import random
import smtplib, ssl
from uuid import uuid4
import email.message

key = b'alerr8icGEY6tbt3qvLWg5hJU6C_BIeCIQ5_zZzwWOM='
cipher_suite = Fernet(key)

app = Flask(__name__)
app.secret_key = 'Testing'
@app.route("/")
def home():
    db = sqlite3.connect('main.db')
    cursor = db.cursor()
    cursor.execute("SELECT * FROM song_data")
    result = cursor.fetchall()
    cursor.close()
    db.close()
    if request.method == "POST":
        return render_template("home.html")
    else:
        if "email" in session:
            return render_template("home.html", data=result, email=session["email"], username=session["user"])
        else:
            return render_template("home.html", data=result)

@app.route("/editor")
def editor():
    return render_template("editor.html")
    if request.method == "POST":
        # Probably want to handle creation of songs here
        return render_template("editor.html")
        
    else:
        if "email" in session:
            return render_template("editor.html", email=session["email"], username=session["user"])
        else:
            return redirect("/login/")

@app.route("/play/<song_id>")
def play(song_id):
    db = sqlite3.connect('main.db')
    cursor = db.cursor()
    cursor.execute("SELECT * FROM song_data WHERE song_id = '{}'".format(song_id))
    result = cursor.fetchone()
    cursor.close()
    db.close()
    return render_template("player.html", song_data=result)

@app.route("/login/", methods=["POST", "GET"])
def login():
    if request.method == "POST":
        em = request.form['lem']
        pas = request.form['lpas']
        db = sqlite3.connect('main.db')
        cursor = db.cursor()
        cursor.execute("SELECT email, username, password, verified FROM account_details WHERE email = '{}'".format(em))
        result = cursor.fetchone()
        pass_check = (cipher_suite.decrypt(result[2]))
        if result is None:
            return render_template("login.html", invalid=True)
        elif bytes(pas, encoding='utf8') != pass_check:
            return render_template("login.html", invalid=True)
        else:
            if int(result[3]) == 1:
                session["user"] = str(result[1])
                session["email"] = str(result[0])
                return redirect(url_for("home"))
            else:
                return render_template('need_confirmed.html')
    else:
        if "user" in session:
            return redirect(url_for("home"))
        return render_template("login.html")

@app.route("/signup/", methods=["POST", "GET"])
def signup():
    if request.method == "POST":
        pas = request.form['pas']
        pasc = request.form['pasc']
        em = request.form['em']
        usr = request.form['usr']
        db = sqlite3.connect('main.db')
        cursor = db.cursor()
        cursor.execute("SELECT email FROM account_details WHERE email = '{}'".format(em))
        result = cursor.fetchone()
        if result is not None:
            return render_template("signup.html", invalid=True)
        elif pas == pasc:
            auth_token = uuid4()
            accountID = random.randint(1111,9999)
            ciphered_text = cipher_suite.encrypt(bytes(pas, encoding='utf8'))
            sql = ("INSERT INTO account_details(email, password, username, account_id, verification_token, verified) VALUES(?,?,?,?,?,?)")
            val = (str(em), ciphered_text, str(usr), accountID, str(auth_token), 0)
            cursor.execute(sql, val)
            db.commit()
            session["user"] = usr
            session["email"] = em

            context = ssl.create_default_context()
            with smtplib.SMTP_SSL("mail.privateemail.com", 465, context=context) as server:
                server.login("support@fivebit.xyz", "4gqkeawg")
                m = email.message.Message()
                m['from'] = "FiveBit Support <support@fivebit.xyz>"
                m['to'] = str(em)
                m['subject'] = "FiveBit Account Confirmation"
                m.set_payload(f"Thank you for creating an account! Please confirm your account by clicking on this link: http://www.fivebit.xyz/confirm/{auth_token}")
                server.sendmail("support@fivebit.xyz", f'{em}', m.as_string())
                server.quit()

            return render_template('registered.html')
        else:
            return render_template("signup.html")
        cursor.close()
        db.close()
    else:
        return render_template("signup.html")

@app.route("/confirm/<token>")
def confirm_email(token):
    db = sqlite3.connect('main.db')
    cursor = db.cursor()
    cursor.execute("SELECT verification_token, verified FROM account_details WHERE verification_token = '{}'".format(token))
    result = cursor.fetchone()
    if result is None:
        return redirect(url_for('login'))
    else:
        sql = ("UPDATE account_details SET verified = ? WHERE verification_token = ?")
        val = (1, token)
        cursor.execute(sql, val)
        db.commit()
        return render_template("confirm.html")
    cursor.close()
    db.close()

@app.route("/logout/")
def logout():
    session.pop("user", None)
    session.pop("email", None)
    return redirect(url_for("login"))

if __name__ == "__main__":
    app.run(debug=True)