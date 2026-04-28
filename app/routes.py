from flask import Blueprint, render_template, redirect, url_for, flash, session
from app import db
from app.models import User
from app.forms import RegisterForm, LoginForm

main = Blueprint('main', __name__)

@main.route('/')
def home():
    return render_template('intro.html')

# @main.route('/login')
# def login():
#     return render_template('auth/login.html')

# @main.route('/signup')
# def signup():
#     return render_template('auth/signuppage.html')

@main.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        session['user_id'] = user.user_id
        return redirect(url_for('main.dashboard'))
    return render_template('auth/signuppage.html', form=form)

@main.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and user.check_password(form.password.data):
            session['user_id'] = user.user_id
            return redirect(url_for('main.dashboard'))
        flash('Invalid username or password')
    return render_template('auth/login.html', form=form)

@main.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('main.login'))

@main.route('/dashboard')
def dashboard():
    return render_template('dashboard/index.html')

@main.route('/dashboard/note_editor')
def note_editor():
    return render_template('dashboard/note_editor.html')

@main.route('/dashboard/flashcard_editor')
def flashcard_editor():
    return render_template('dashboard/flashcard_editor.html')

@main.route('/dashboard/flashcard')
def flashcard():
    return render_template('dashboard/flashcard_play.html')

@main.route('/discover')
def discover():
    return render_template('discover/index.html')

@main.route('/quiz/active')
def quiz_active():
    return render_template('quiz/active.html')

@main.route('/quiz/history')
def quiz_history():
    return render_template('quiz/history.html')

@main.route('/quiz/results')
def quiz_results():
    return render_template('quiz/results.html')

@main.route('/profile')
def profile():
    return render_template('profile.html')

@main.route('/change_password')
def change_password():
    return render_template('change_password.html')

@main.route('/info')
def info():
    return render_template('info.html')