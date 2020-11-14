
import smtplib, ssl

port = 465  # For SSL
password = "4gqkeawg"

# Create a secure SSL context
context = ssl.create_default_context()

with smtplib.SMTP_SSL("mail.privateemail.com", port, context=context) as server:
    server.login("support@fivebit.xyz", password)
    message = """From: From Jared <support@fivebit.xyz>
To: To Jared Galyan <galyanja@gmail.com>
Subject: SMTP e-mail test

This is a test e-mail message.
"""
    server.sendmail("support@fivebit.xyz", 'galyanja@gmail.com', message)

