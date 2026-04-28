from flask import Blueprint, render_template, redirect, url_for, flash, session
from app import db
from app.models import User
from app.forms import RegisterForm, LoginForm
from functools import wraps

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('main.login'))
        return f(*args, **kwargs)
    return decorated_function

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
@login_required
def dashboard():
    return render_template('dashboard/index.html', active='dashboard')

@main.route('/dashboard/note_editor')
@login_required
def note_editor():
    return render_template('dashboard/note_editor.html', active='dashboard')

@main.route('/dashboard/flashcard_editor')
@login_required
def flashcard_editor():
    return render_template('dashboard/flashcard_editor.html', active='dashboard')

@main.route('/dashboard/flashcard')
@login_required
def flashcard():
    return render_template('dashboard/flashcard_play.html', active='dashboard')

@main.route('/discover')
@login_required
def discover():
    return render_template('discover/index.html', active='discover')

@main.route('/quiz/active')
@login_required
def quiz_active():
    return render_template('quiz/active.html' , active='dashboard')

@main.route('/quiz/history')
@login_required
def quiz_history():
    return render_template('quiz/history.html' , active='dashboard')

@main.route('/quiz/results')
@login_required
def quiz_results():
    return render_template('quiz/results.html' , active='dashboard')

@main.route('/profile')
@login_required
def profile():
    return render_template('profile.html' , active='profile')

@main.route('/change_password')
@login_required
def change_password():
    return render_template('change_password.html' , active='profile')

@main.route('/info')
@login_required
def info():
    return render_template('info.html', active='info')