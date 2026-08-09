import re
from datetime import datetime
from functools import wraps

from flask import Flask, jsonify, request, session
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash
from pypdf import PdfReader
from docx import Document

from config import DB_NAME, FRONTEND_ORIGIN, SECRET_KEY
from db import get_db_connection


def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = SECRET_KEY
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False

    CORS(app, supports_credentials=True, origins=[FRONTEND_ORIGIN])

    def execute_query(query, params=None, fetch=False, one=False, commit=False):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params or ())
        result = None
        if fetch:
            result = cursor.fetchone() if one else cursor.fetchall()
        if commit:
            conn.commit()
        cursor.close()
        conn.close()
        return result

    def create_tables():
        execute_query(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """,
            commit=True,
        )
        execute_query(
            """
            CREATE TABLE IF NOT EXISTS applications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                company VARCHAR(255) NOT NULL,
                role VARCHAR(255) NOT NULL,
                status VARCHAR(50) NOT NULL,
                location VARCHAR(255),
                applied_date DATE,
                salary VARCHAR(100),
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """,
            commit=True,
        )
        ensure_applications_user_id_column()

    def get_current_user():
        user_id = session.get('user_id')
        if not user_id:
            return None
        return execute_query('SELECT id, email FROM users WHERE id = %s', (user_id,), fetch=True, one=True)

    def ensure_applications_user_id_column():
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT COUNT(*) AS count FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'applications' AND COLUMN_NAME = 'user_id'",
            (DB_NAME,),
        )
        result = cursor.fetchone()
        cursor.close()
        conn.close()

        if not result or result.get('count', 0) == 0:
            execute_query('ALTER TABLE applications ADD COLUMN user_id INT NULL', commit=True)
            execute_query(
                'ALTER TABLE applications ADD CONSTRAINT fk_applications_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
                commit=True,
            )

    def login_required(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not session.get('user_id'):
                return jsonify({'message': 'Login required'}), 401
            return f(*args, **kwargs)

        return decorated

    def validate_email(email):
        if not email or not isinstance(email, str):
            return False
        return re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email) is not None

    @app.route('/api/register', methods=['POST'])
    def register():
        data = request.get_json() or {}
        email = (data.get('email') or '').strip().lower()
        password = data.get('password', '')
        confirm_password = data.get('confirmPassword', '')

        if not validate_email(email):
            return jsonify({'message': 'Invalid email'}), 400
        if not password:
            return jsonify({'message': 'Password required'}), 400
        if password != confirm_password:
            return jsonify({'message': 'Passwords do not match'}), 400
        if len(password) < 8:
            return jsonify({'message': 'Password must be at least 8 characters'}), 400

        existing = execute_query('SELECT id FROM users WHERE email = %s', (email,), fetch=True, one=True)
        if existing:
            return jsonify({'message': 'Email already registered'}), 409

        password_hash = generate_password_hash(password)
        execute_query(
            'INSERT INTO users (email, password_hash) VALUES (%s, %s)',
            (email, password_hash),
            commit=True,
        )
        return jsonify({'message': 'Registration successful'}), 201

    @app.route('/api/login', methods=['POST'])
    def login():
        data = request.get_json() or {}
        email = (data.get('email') or '').strip().lower()
        password = data.get('password', '')

        if not validate_email(email) or not password:
            return jsonify({'message': 'Invalid email or password'}), 400

        user = execute_query('SELECT id, email, password_hash FROM users WHERE email = %s', (email,), fetch=True, one=True)
        if not user or not check_password_hash(user['password_hash'], password):
            return jsonify({'message': 'Invalid email or password'}), 401

        session.clear()
        session['user_id'] = user['id']
        return jsonify({'message': 'Login successful', 'user': {'id': user['id'], 'email': user['email']}})

    @app.route('/api/logout', methods=['POST'])
    @login_required
    def logout():
        session.clear()
        return jsonify({'message': 'Logout successful'})

    @app.route('/api/me', methods=['GET'])
    def me():
        user = get_current_user()
        if not user:
            return jsonify({'user': None}), 200
        return jsonify({'user': user})

    @app.route('/api/applications', methods=['GET'])
    @login_required
    def list_applications():
        user = get_current_user()
        applications = execute_query(
            'SELECT id, company, role, status, location, DATE_FORMAT(applied_date, "%Y-%m-%d") AS appliedDate, salary FROM applications WHERE user_id = %s ORDER BY created_at DESC',
            (user['id'],),
            fetch=True,
        )
        return jsonify({'applications': applications})

    @app.route('/api/applications', methods=['POST'])
    @login_required
    def create_application():
        user = get_current_user()
        data = request.get_json() or {}
        company = (data.get('company') or '').strip()
        role = (data.get('role') or '').strip()
        status = (data.get('status') or '').strip()
        location = (data.get('location') or '').strip() or None
        applied_date = data.get('appliedDate') or None
        salary = (data.get('salary') or '').strip() or None

        if not company or not role or not status:
            return jsonify({'message': 'Company, role, and status are required'}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            'INSERT INTO applications (user_id, company, role, status, location, applied_date, salary) VALUES (%s, %s, %s, %s, %s, %s, %s)',
            (user['id'], company, role, status, location, applied_date, salary),
        )
        application_id = cursor.lastrowid
        conn.commit()
        cursor.close()
        conn.close()

        application = {
            'id': application_id,
            'company': company,
            'role': role,
            'status': status,
            'location': location,
            'appliedDate': applied_date,
            'salary': salary,
        }
        return jsonify({'application': application}), 201

    @app.route('/api/applications/<int:application_id>', methods=['PUT'])
    @login_required
    def update_application(application_id):
        user = get_current_user()
        data = request.get_json() or {}
        existing = execute_query('SELECT id FROM applications WHERE id = %s AND user_id = %s', (application_id, user['id']), fetch=True, one=True)
        if not existing:
            return jsonify({'message': 'Application not found'}), 404

        company = (data.get('company') or '').strip()
        role = (data.get('role') or '').strip()
        status = (data.get('status') or '').strip()
        location = (data.get('location') or '').strip() or None
        applied_date = data.get('appliedDate') or None
        salary = (data.get('salary') or '').strip() or None

        execute_query(
            'UPDATE applications SET company = %s, role = %s, status = %s, location = %s, applied_date = %s, salary = %s WHERE id = %s AND user_id = %s',
            (company, role, status, location, applied_date, salary, application_id, user['id']),
            commit=True,
        )
        return jsonify({'message': 'Application updated'})

    @app.route('/api/applications/<int:application_id>', methods=['DELETE'])
    @login_required
    def delete_application(application_id):
        user = get_current_user()
        existing = execute_query('SELECT id FROM applications WHERE id = %s AND user_id = %s', (application_id, user['id']), fetch=True, one=True)
        if not existing:
            return jsonify({'message': 'Application not found'}), 404

        execute_query('DELETE FROM applications WHERE id = %s AND user_id = %s', (application_id, user['id']), commit=True)
        return jsonify({'message': 'Application deleted'})
    @app.route('/api/resume/extract', methods=['POST'])
    @login_required
        
    def extract_resume_skills():
        if 'resume' not in request.files:
            return jsonify({
                'message': 'Please upload a resume.'
            }), 400

        file = request.files['resume']

        if not file.filename:
            return jsonify({
                'message': 'Please select a resume file.'
            }), 400

        filename = file.filename.lower()

        if not filename.endswith(('.pdf', '.docx')):
            return jsonify({
                'message': 'Only PDF and DOCX files are supported.'
            }), 400

        try:
            text = ''

            # Read PDF
            if filename.endswith('.pdf'):
                reader = PdfReader(file)

                for page in reader.pages:
                    page_text = page.extract_text() or ''
                    text += page_text + '\n'

            # Read DOCX
            else:
                document = Document(file)

                text = '\n'.join(
                    paragraph.text
                    for paragraph in document.paragraphs
                )

            # Clean extracted text
            print("===== RESUME TEXT =====")
            print(text[:5000])
            print("=======================")
            text = re.sub(r'[ \t]+', ' ', text)
            text = re.sub(r'\n+', '\n', text)

            # Find the Skills section
            skills = []

            lines = text.splitlines()

            inside_skills_section = False

            section_titles = [
                'skills',
                'technical skills',
                'technical skill',
                'key skills',
                'core skills',
                'skills summary',
                'professional skills',
                'areas of expertise',
                'technical expertise'
            ]

            stop_sections = [
                'experience',
                'work experience',
                'education',
                'projects',
                'certifications',
                'certificates',
                'achievements',
                'summary',
                'objective',
                'internship',
                'personal details',
                'declaration',
                'languages'
            ]

            for line in lines:
                clean_line = line.strip()

                if not clean_line:
                    continue

                lower_line = clean_line.lower()

                # Start skills section
                if any(
                    title == lower_line.rstrip(':')
                    for title in section_titles
                ):
                    inside_skills_section = True
                    continue

                # Stop when another resume section starts
                if inside_skills_section and any(
                    lower_line.rstrip(':') == section
                    for section in stop_sections
                ):
                    inside_skills_section = False
                    continue

                if inside_skills_section:
                    # Remove common bullet symbols
                    clean_line = re.sub(
                        r'^[•●▪◦\-–—*]+\s*',
                        '',
                        clean_line
                    )

                    # Split skills separated by commas, pipes or bullets
                    parts = re.split(
                        r'[,|;/•●▪◦]+',
                        clean_line
                    )

                    for part in parts:
                        skill = part.strip()

                        if skill and len(skill) <= 50:
                            skills.append(skill)

            # Remove duplicates
            final_skills = []

            for skill in skills:
                if skill not in final_skills:
                    final_skills.append(skill)

            return jsonify({
                'message': 'Resume analyzed successfully.',
                'skills': final_skills,
                'text': text
            }), 200

        except Exception as error:
            print('Resume analysis error:', error)

            return jsonify({
                'message': 'Unable to analyze the resume.'
            }), 500

    create_tables()
    return app


app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
