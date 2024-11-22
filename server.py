from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

def get_db_connection():
    conn = sqlite3.connect('dbms_project.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required'}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Query to check if email and password match
        cursor.execute('''
            SELECT club_id, club_name, club_email_id, club_description, club_logo_image 
            FROM clubs 
            WHERE club_email_id = ? AND password = ?
        ''', (email, password))
        
        club = cursor.fetchone()
        conn.close()
        
        if club:
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'club': dict(club)
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Invalid email or password'
            }), 401
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'An error occurred during login'
        }), 500

@app.route('/api/club/<int:club_id>', methods=['GET'])
def get_club_details(club_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT club_id, club_name, club_description, club_logo_image 
            FROM clubs 
            WHERE club_id = ?
        ''', (club_id,))
        
        club = cursor.fetchone()
        conn.close()
        
        if club:
            return jsonify({
                'success': True,
                'club': dict(club)
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Club not found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'An error occurred while fetching club details'
        }), 500

@app.route('/api/events/<int:club_id>', methods=['GET'])
def get_club_events(club_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if table exists first
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='events'")
        if not cursor.fetchone():
            return jsonify({
                'success': False,
                'message': 'Events table does not exist'
            }), 500
        
        cursor.execute('''
            SELECT 
            e.event_id, 
            e.event_name, 
            e.event_image, 
            e.event_date, 
            e.event_time, 
            e.event_venue, 
            c.club_name 
        FROM 
            events e
        JOIN 
            clubs c 
        ON 
            e.club_id = c.club_id
        WHERE 
            e.club_id = ?;

        ''', (club_id,))
        
        events = cursor.fetchall()
        conn.close()
        
        # Convert events to list of dictionaries
        column_names = ['event_id', 'event_name', 'event_image', 'event_date', 'event_time', 'event_venue']
        events = [dict(zip(column_names, event)) for event in events]
        
        return jsonify({
            'success': True,
            'events': events
        })
            
    except Exception as e:
        print(f"Error fetching events: {str(e)}")  # Log the actual error
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500
    
@app.route('/api/recruitment/create', methods=['POST'])
def create_recruitment_form():
    data = request.json
    club_id = data.get('clubId')
    club_name = data.get('clubName')
    fields = data.get('fields')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Remove existing recruitment form if it exists
        table_name = f"{club_name.lower().replace(' ', '_')}_recruitments"
        cursor.execute(f"DROP TABLE IF EXISTS {table_name}")

        # Create dynamic table based on fields
        create_table_query = f"CREATE TABLE {table_name} (id INTEGER PRIMARY KEY AUTOINCREMENT"
        for field in fields:
            field_type = 'TEXT'
            if field['type'] == 'number':
                field_type = 'REAL'
            elif field['type'] == 'email':
                field_type = 'TEXT'
            
            create_table_query += f", {field['label'].lower().replace(' ', '_')} {field_type} {'NOT NULL' if field['required'] else ''}"
        
        create_table_query += ")"
        
        cursor.execute(create_table_query)
        conn.commit()
        conn.close()

        return jsonify({'success': True, 'message': 'Recruitment form created successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/recruitment/status/<int:club_id>', methods=['GET'])
def check_recruitment_status(club_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Get club name for table name generation
        cursor.execute('SELECT club_name FROM clubs WHERE club_id = ?', (club_id,))
        club = cursor.fetchone()
        
        if not club:
            return jsonify({'success': False, 'message': 'Club not found'}), 404

        table_name = f"{club['club_name'].lower().replace(' ', '_')}_recruitments"

        # Check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
        exists = cursor.fetchone() is not None
        
        conn.close()
        return jsonify({'success': True, 'exists': exists})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/recruitment/responses/<int:club_id>', methods=['GET'])
def get_recruitment_responses(club_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Get club name for table name generation
        cursor.execute('SELECT club_name FROM clubs WHERE club_id = ?', (club_id,))
        club = cursor.fetchone()
        
        if not club:
            return jsonify({'success': False, 'message': 'Club not found'}), 404

        table_name = f"{club['club_name'].lower().replace(' ', '_')}_recruitments"

        # Dynamically fetch all rows from the applications table
        cursor.execute(f"SELECT * FROM {table_name}")
        responses = cursor.fetchall()
        
        # Convert responses to dictionary
        if responses:
            column_names = [description[0] for description in cursor.description]
            responses = [dict(zip(column_names, response)) for response in responses]
        
        conn.close()
        return jsonify({'success': True, 'responses': responses})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/events/create', methods=['POST'])
def create_event():
    data = request.json
    club_id = data.get('clubId')
    event_name = data.get('eventName')
    event_image = data.get('eventImage')
    event_date = data.get('eventDate')
    event_time = data.get('eventTime')
    event_venue = data.get('eventVenue')
    event_description = data.get('eventDescription')
    event_fields = data.get('eventFields', [])

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert event into events table
        cursor.execute('''
            INSERT INTO events (club_id, event_name, event_description, event_date, event_image, event_time, event_venue) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (club_id, event_name, event_description, event_date, event_image, event_time, event_venue))
        event_id = cursor.lastrowid

        # Create dynamic event application table
        table_name = f"{event_name.lower().replace(' ', '_')}_applications"
        cursor.execute(f"DROP TABLE IF EXISTS {table_name}")

        # Create table for event applications
        create_table_query = f"CREATE TABLE {table_name} (id INTEGER PRIMARY KEY AUTOINCREMENT"
        for field in event_fields:
            field_type = 'TEXT'
            if field['type'] == 'number':
                field_type = 'REAL'
            elif field['type'] == 'email':
                field_type = 'TEXT'
            
            create_table_query += f", {field['label'].lower().replace(' ', '_')} {field_type} {'NOT NULL' if field['required'] else ''}"
        
        create_table_query += ")"
        
        cursor.execute(create_table_query)
        conn.commit()
        conn.close()

        return jsonify({
            'success': True, 
            'message': 'Event created successfully', 
            'eventId': event_id
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/events/application/<int:event_id>', methods=['GET'])
def get_event_application_status(event_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Get event name for table name generation
        cursor.execute('SELECT event_name FROM events WHERE event_id = ?', (event_id,))
        event = cursor.fetchone()
        
        if not event:
            return jsonify({'success': False, 'message': 'Event not found'}), 404

        table_name = f"{event['event_name'].lower().replace(' ', '_')}_applications"

        # Check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
        exists = cursor.fetchone() is not None
        
        conn.close()
        return jsonify({'success': True, 'exists': exists})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/events/application/responses/<int:event_id>', methods=['GET'])
def get_event_application_responses(event_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Get event name for table name generation
        cursor.execute('SELECT event_name FROM events WHERE event_id = ?', (event_id,))
        event = cursor.fetchone()
        
        if not event:
            return jsonify({'success': False, 'message': 'Event not found'}), 404

        table_name = f"{event['event_name'].lower().replace(' ', '_')}_applications"

        # Dynamically fetch all rows from the applications table
        cursor.execute(f"SELECT * FROM {table_name}")
        responses = cursor.fetchall()
        
        # Convert responses to dictionary
        if responses:
            column_names = [description[0] for description in cursor.description]
            responses = [dict(zip(column_names, response)) for response in responses]
        
        conn.close()
        return jsonify({'success': True, 'responses': responses})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/events/details/<int:event_id>', methods=['GET'])
def get_event_details(event_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT event_id, event_name, event_description, event_image, event_date, event_time, event_venue 
            FROM events 
            WHERE event_id = ?
        ''', (event_id,))
        
        event = cursor.fetchone()
        conn.close()
        
        if event:
            # Convert event to dictionary with column names
            column_names = ['event_id', 'event_name', 'event_description', 'event_image', 'event_date', 'event_time', 'event_venue']
            event_dict = dict(zip(column_names, event))
            
            return jsonify({
                'success': True,
                'event': event_dict
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Event not found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'An error occurred while fetching event details: {str(e)}'
        }), 500
    
@app.route('/api/clubs', methods=['GET'])
def get_all_clubs():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Fetch all clubs
        cursor.execute('''
            SELECT club_id, club_name, club_description, club_logo_image 
            FROM clubs 
        ''')
        
        clubs = cursor.fetchall()
        conn.close()
        
        # Convert clubs to list of dictionaries
        column_names = ['club_id', 'club_name', 'club_description', 'club_logo_image']
        clubs = [dict(zip(column_names, club)) for club in clubs]
        
        return jsonify({
            'success': True,
            'clubs': clubs
        })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'An error occurred while fetching clubs'
        }), 500

@app.route('/api/events', methods=['GET'])
def get_all_events():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if table exists first
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='events'")
        if not cursor.fetchone():
            return jsonify({
                'success': False,
                'message': 'Events table does not exist'
            }), 500
        
        # Fetch all events with club name
        cursor.execute('''
            SELECT 
                events.event_id, 
                events.event_name, 
                events.event_image, 
                events.event_date, 
                events.event_time, 
                events.event_venue,
                clubs.club_name
            FROM events 
            JOIN clubs ON events.club_id = clubs.club_id
        ''')
        
        events = cursor.fetchall()
        conn.close()
        
        # Convert events to list of dictionaries
        column_names = [
            'event_id', 
            'event_name', 
            'event_image', 
            'event_date', 
            'event_time', 
            'event_venue',
            'club_name'
        ]
        events = [dict(zip(column_names, event)) for event in events]
        
        return jsonify({
            'success': True,
            'events': events
        })
            
    except Exception as e:
        print(f"Error fetching events: {str(e)}")  # Log the actual error
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500
    
def create_registration_trigger(cursor, event_name):
    """Create or replace trigger for registration limit"""
    table_name = f"{event_name.lower().replace(' ', '_')}_applications"
    trigger_name = f"check_registration_limit_{table_name}"
    
    # Drop existing trigger if it exists
    cursor.execute(f"""
        DROP TRIGGER IF EXISTS {trigger_name};
    """)
    
    # Create new trigger
    cursor.execute(f"""
        CREATE TRIGGER {trigger_name}
        BEFORE INSERT ON {table_name}
        BEGIN
            SELECT
                CASE
                    WHEN (SELECT COUNT(*) FROM {table_name}) >= 3
                    THEN RAISE(ABORT, 'Registration limit reached. Maximum 3 applications allowed.')
                END;
        END;
    """)

@app.route('/api/events/apply/<int:event_id>', methods=['POST'])
def submit_event_application(event_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get event name for table name generation
        cursor.execute('SELECT event_name FROM events WHERE event_id = ?', (event_id,))
        event = cursor.fetchone()
        
        if not event:
            return jsonify({'success': False, 'message': 'Event not found'}), 404

        # Generate table name based on event name
        table_name = f"{event['event_name'].lower().replace(' ', '_')}_applications"
        
        # Ensure trigger exists
        create_registration_trigger(cursor, event['event_name'])
        
        # Get application data from request
        data = request.json
        
        try:
            # Dynamically build insert query
            columns = list(data.keys())
            placeholders = ','.join(['?' for _ in columns])
            values = [data[col] for col in columns]
            
            query = f"INSERT INTO {table_name} ({','.join(columns)}) VALUES ({placeholders})"
            
            cursor.execute(query, values)
            conn.commit()
            
            return jsonify({
                'success': True,
                'message': 'Application submitted successfully'
            })
            
        except sqlite3.IntegrityError as e:
            if 'Registration limit reached' in str(e):
                return jsonify({
                    'success': False,
                    'message': 'Registration limit reached. Maximum 100 applications allowed.'
                }), 400
            raise e
            
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

# Update event details route to include application form fields
@app.route('/api/events_student/details/<int:event_id>', methods=['GET'])
def get_event_details_student(event_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Fetch event details
        cursor.execute('''
            SELECT event_id, event_name, event_description, event_image, 
                   event_date, event_time, event_venue, club_id
            FROM events 
            WHERE event_id = ?
        ''', (event_id,))
        
        event = cursor.fetchone()
        
        if not event:
            return jsonify({
                'success': False,
                'message': 'Event not found'
            }), 404
        
        # Generate table name for event applications
        table_name = f"{event[1].lower().replace(' ', '_')}_applications"
        print(table_name)
        
        # Check if applications table exists and get its columns
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        
        # Convert columns to form fields
        form_fields = []
        for column in columns[1:]:  # Skip the first column (id)
            field_name = column[1]
            form_fields.append({
                'label': ' '.join(word.capitalize() for word in field_name.split('_')),
                'name': field_name,
                'type': 'text'  # You might want to enhance this logic based on column type
            })
        
        conn.close()
        
        # Convert event to dictionary with column names
        column_names = ['event_id', 'event_name', 'event_description', 'event_image', 
                        'event_date', 'event_time', 'event_venue', 'club_id']
        event_dict = dict(zip(column_names, event))
        print(form_fields)
        
        return jsonify({
            'success': True,
            'event': event_dict,
            'applicationFields': form_fields
        })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'An error occurred while fetching event details: {str(e)}'
        }), 500

@app.route('/api/recruiting-clubs', methods=['GET'])
def get_recruiting_clubs():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Find clubs with recruitment tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        
        recruiting_clubs = []
        for table in tables:
            table_name = table[0]
            if table_name.endswith('_recruitments'):
                # Extract club name from table name
                club_name = ' '.join(table_name.split('_')[:-1]).title()
                
                # Fetch club details
                cursor.execute('''
                    SELECT club_id, club_name, club_logo_image 
                    FROM clubs 
                    WHERE club_name = ?
                ''', (club_name,))
                
                club = cursor.fetchone()
                if club:
                    recruiting_clubs.append(dict(zip(
                        ['club_id', 'club_name', 'club_logo_image'], 
                        club
                    )))
        
        conn.close()
        
        return jsonify({
            'success': True,
            'clubs': recruiting_clubs
        })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500

@app.route('/api/recruitment/details/<int:club_id>', methods=['GET'])
def get_recruitment_form_details(club_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Get club name for table name generation
        cursor.execute('SELECT club_name FROM clubs WHERE club_id = ?', (club_id,))
        club = cursor.fetchone()
        
        if not club:
            return jsonify({'success': False, 'message': 'Club not found'}), 404

        table_name = f"{club['club_name'].lower().replace(' ', '_')}_recruitments"

        # Check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
        exists = cursor.fetchone()
        
        if not exists:
            return jsonify({'success': False, 'message': 'No recruitment form found'}), 404

        # Get table columns
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        
        # Convert columns to form fields
        form_fields = []
        for column in columns[1:]:  # Skip the first column (id)
            field_name = column[1]
            field_type = 'text'  # Default to text
            if 'real' in column[2].lower():
                field_type = 'number'
            elif 'email' in field_name.lower():
                field_type = 'email'
            
            form_fields.append({
                'label': ' '.join(word.capitalize() for word in field_name.split('_')),
                'name': field_name,
                'type': field_type,
                'required': 'notnull' in column[2].lower()
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'fields': form_fields
        })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500

@app.route('/api/recruitment/apply/<int:club_id>', methods=['POST'])
def submit_recruitment_application(club_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Get club name for table name generation
        cursor.execute('SELECT club_name FROM clubs WHERE club_id = ?', (club_id,))
        club = cursor.fetchone()
        
        if not club:
            return jsonify({'success': False, 'message': 'Club not found'}), 404

        # Generate table name based on club name
        table_name = f"{club['club_name'].lower().replace(' ', '_')}_recruitments"

        # Get application data from request
        data = request.json
        
        # Dynamically build insert query
        columns = list(data.keys())
        placeholders = ','.join(['?' for _ in columns])
        values = [data[col] for col in columns]
        
        query = f"INSERT INTO {table_name} ({','.join(columns)}) VALUES ({placeholders})"
        
        cursor.execute(query, values)
        conn.commit()
        conn.close()

        return jsonify({
            'success': True, 
            'message': 'Application submitted successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    
# Add these imports at the top of the file
import csv
import io
from flask import send_file

# Add these new routes to the existing Flask app

@app.route('/api/events/close_registrations/<int:event_id>', methods=['POST'])
def close_event_registrations(event_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Get event name for table name generation
        cursor.execute('SELECT event_name FROM events WHERE event_id = ?', (event_id,))
        event = cursor.fetchone()
        
        if not event:
            return jsonify({'success': False, 'message': 'Event not found'}), 404

        # Generate table name based on event name
        table_name = f"{event['event_name'].lower().replace(' ', '_')}_applications"

        # Drop the applications table
        cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
        conn.commit()
        conn.close()

        return jsonify({
            'success': True, 
            'message': 'Event registrations closed successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/events/download_responses/<int:event_id>', methods=['GET'])
def download_event_responses(event_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Get event name for table name generation
        cursor.execute('SELECT event_name FROM events WHERE event_id = ?', (event_id,))
        event = cursor.fetchone()
        
        if not event:
            return jsonify({'success': False, 'message': 'Event not found'}), 404

        # Generate table name based on event name
        table_name = f"{event['event_name'].lower().replace(' ', '_')}_applications"

        # Fetch all rows from the applications table
        cursor.execute(f"SELECT * FROM {table_name}")
        responses = cursor.fetchall()
        
        # Get column names
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        column_names = [column[1] for column in columns]
        conn.close()

        # Create a CSV file in memory
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        writer.writerow(column_names)
        
        # Write data rows
        for response in responses:
            writer.writerow(response)
        
        # Create a file-like object from the CSV content
        output.seek(0)
        mem_file = io.BytesIO(output.getvalue().encode('utf-8'))
        
        return send_file(
            mem_file, 
            mimetype='text/csv', 
            as_attachment=True, 
            download_name=f"{event['event_name']}_responses.csv"
        )
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/recruitment/close/<int:club_id>', methods=['POST'])
def close_club_recruitments(club_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Get club name for table name generation
        cursor.execute('SELECT club_name FROM clubs WHERE club_id = ?', (club_id,))
        club = cursor.fetchone()
        
        if not club:
            return jsonify({'success': False, 'message': 'Club not found'}), 404

        # Generate table name based on club name
        table_name = f"{club['club_name'].lower().replace(' ', '_')}_recruitments"

        # Drop the recruitments table
        cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
        conn.commit()
        conn.close()

        return jsonify({
            'success': True, 
            'message': 'Club recruitments closed successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/recruitment/download_responses/<int:club_id>', methods=['GET'])
def download_club_recruitment_responses(club_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Get club name for table name generation
        cursor.execute('SELECT club_name FROM clubs WHERE club_id = ?', (club_id,))
        club = cursor.fetchone()
        
        if not club:
            return jsonify({'success': False, 'message': 'Club not found'}), 404

        # Generate table name based on club name
        table_name = f"{club['club_name'].lower().replace(' ', '_')}_recruitments"

        # Fetch all rows from the recruitments table
        cursor.execute(f"SELECT * FROM {table_name}")
        responses = cursor.fetchall()
        
        # Get column names
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        column_names = [column[1] for column in columns]
        conn.close()

        # Create a CSV file in memory
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        writer.writerow(column_names)
        
        # Write data rows
        for response in responses:
            writer.writerow(response)
        
        # Create a file-like object from the CSV content
        output.seek(0)
        mem_file = io.BytesIO(output.getvalue().encode('utf-8'))
        
        return send_file(
            mem_file, 
            mimetype='text/csv', 
            as_attachment=True, 
            download_name=f"{club['club_name']}_recruitment_responses.csv"
        )
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    
if __name__ == '__main__':
    app.run(debug=True)