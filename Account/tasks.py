import random
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from celery import shared_task

def random_otp():
    return random.randint(1000, 9999)


@shared_task
def send_wellcome_email(email):
    subject = 'Welcome to Our Website'
    html_content = '''
    <h1>Welcome to Our Website</h1>
    <p>Thank you for registering with us</p>
    <p>Your account has been created successfully</p>
    <p>Thank you</p>
    '''
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [email]
    
    msg = EmailMultiAlternatives(subject, "Welcome to Our Website", email_from, recipient_list)
    msg.attach_alternative(html_content, "text/html")
    msg.send(fail_silently=False)
    

@shared_task
def send_otp_email(email, otp):
    subject = 'Your OTP for Verification'
    html_content = f'''
    <h1>Your OTP for Verification</h1>
    <p>Your OTP is: {otp}</p>
    <p>This OTP will expire in 10 minutes</p>
    <p>Thank you</p>
    '''
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [email]
    
    msg = EmailMultiAlternatives(subject, f"Your OTP is: {otp}", email_from, recipient_list)
    msg.attach_alternative(html_content, "text/html")
    msg.send(fail_silently=False)

    
@shared_task
def Partner_Join_With_Us(email, partner_id):
    subject = 'Congratulation For Your Partner ID'
    html_content = f'''
    <h1>Auto Generated Partner Id</h1>
    <p>Your Partner id Is : {partner_id}</p>
    <p>Dont Share This Id With Anyone</p>
    <p>Thank you</p>
    '''
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [email]
    
    msg = EmailMultiAlternatives(subject, f"Your Partner ID is: {partner_id}", email_from, recipient_list)
    msg.attach_alternative(html_content, "text/html")
    msg.send(fail_silently=False)