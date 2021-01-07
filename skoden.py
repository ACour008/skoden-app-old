from flask import Flask, send_file, render_template, request, jsonify
from flask_mail import Message, Mail
import soundcloud
import urllib
import json
import cgi
import re
import sys
import os

app = Flask(__name__)
app.config.from_pyfile('config.cfg')
mail = Mail(app)

@app.route('/download-track', methods=['POST'])
def download_track():
	return "%s/?client_id=%s" % (request.data.decode('UTF-8'), app.config['SOUNDCLOUD_CLIENT_KEY'])

@app.route('/get-tracks', methods=['GET'])
def get_tracks():
	url = "https://api.soundcloud.com/users/%s/tracks?client_id=%s" % (app.config['SOUNDCLOUD_USER_ID'], app.config['SOUNDCLOUD_CLIENT_KEY'])
	obj = urllib.request.urlopen(url).read()
	return jsonify(obj), 200

@app.route('/download-playlist')
def get_playlist():
	return "This is where you download a playlist."

@app.route('/get-all-playlists')
def get_all_playists():
	return "This is where you get all playlists from."

@app.route('/get-player', methods=['GET'])
def get_player():
	client = soundcloud.Client(client_id=app.config['SOUNDCLOUD_CLIENT_KEY'])
	track_url = "#"

	embed_info = client.get('/oembed', url=track_url)
	return jsonify(embed_info.obj), 200

@app.route("/get-news", methods=["GET"])
def get_news():
	filename = os.path.join(app.static_folder, "posts.json")
	with open(filename) as posts:
		data = json.load(posts)
	return jsonify(data), 200

@app.route('/', methods=['GET', 'POST'])
def home():
	if request.method == 'POST':
		response = {'errors': {}}
		# Check for email. Its required
		if 'email' in request.json:
			email = cgi.escape(request.json['email'])
			if not re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', email):
				response['errors'].update({'email': "Not an email format"})
		else:
			response['errors'].udpate({'email': "No email exists."})
		# name not required. replace with email if nonexistent
		if "name" in request.json:
			name = cgi.escape(request.json['name'])
		else:
			name = email
		# Parse recipient to add to subject line
		if request.json['recipient']['label'] == "general":
			subject = "[%s]" % request.json['recipient']['value']
		else:
			subject = "[ATTN: %s]" % request.json['recipient']['label']
		if "subject" in request.json:
			subject = subject + " " + cgi.escape(request.json['subject'])
		else:
			subject = subject + " A new message from the SC Website"
		# Check for errors in message
		if "message" in request.json:
			message = cgi.escape(request.json['message'])
			if len(message) > 2700:
				response['errors'].update({'message': 'Please ensure your message is less than 2700 characters.'})
		else:
			response['errors'].update({'message': 'Please ensure your message is between more than one character...'})

		if (not response['errors']):
			response['success'] = "Thank you for your email! We will contact you shortly."
			msg = Message(subject, sender=email, recipients=[app.config['MAIL_USERNAME']])
			msg.body = "From: %s <%s>\r\r%s""" % (name, email, message) 
			mail.send(msg)
			return jsonify(response), 200
		else:
			return jsonify(response), 400

	return send_file("templates/layout.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0")
