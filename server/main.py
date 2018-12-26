import json
import time
import datetime
import hashlib
import argparse
import threading
from httplib2 import Http
from googleapiclient.discovery import build
from oauth2client import file, client, tools
from google.oauth2 import service_account
from flask import Flask, jsonify

CHECKSUM = ""
SERVICE_ACCOUNT_FILE = ''
SCOPES = ['https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.readonly']
CALENDAR_ID = 'ceq39hilh8ajrrfmb9dl4plsdc@group.calendar.google.com'

app = Flask(__name__)


parser = argparse.ArgumentParser()
parser.add_argument("--host", default="", type=str, help="host that the server should bind to")
parser.add_argument("--port", default=9000, type=int, help="port that the server should bind to")
parser.add_argument("--conf_path", default="./calendar-sa.json", type=str, help="path to the service account credentials for google calendar api")
parser.add_argument("--debug", default=False, help="enable debugging mode", action="store_true")


class Poller(object):
    def __init__(self, interval=1):
        self.interval = interval
        thread = threading.Thread(target=self.run, args=())
        thread.daemon = True
        thread.start()

    def run(self):
        while True:
            print('Polling for events')
            get_events()
            time.sleep(self.interval)

def get_events():
    """
    get_events returns a list of events from the hackathon google calendar
    """
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    service = build(serviceName='calendar', version='v3', credentials=creds)
    now = datetime.datetime.utcnow().isoformat() + 'Z' # 'Z' indicates UTC time
    print('Getting the upcoming 10 events from {}'.format(now))
    events_result = service.events().list(calendarId=CALENDAR_ID, timeMin=now,
                                        maxResults=100, singleEvents=True,
                                        orderBy='startTime').execute()
    events = events_result.get('items', [])
    parsed_events = []
    if not events:
        return parsed_events
    for event in events:
        # print(json.dumps(event, indent=4))
        e = {'eventName': event['summary'],
             'startTime': event['start'].get('dateTime', event['start'].get('date')),
             'endTime': event['end'].get('dateTime', event['end'].get('date')),
             'location': event.get('location', ''),
             'description': event.get('description', '')}
        parsed_events.append(e)

    # Update the checksum
    global CHECKSUM
    CHECKSUM = str(hashlib.sha256(json.dumps(parsed_events, indent=4)).hexdigest())
    print("{}".format(CHECKSUM))

    return parsed_events


@app.route("/")
def root():
    return jsonify({'version': 'v1.0'})

@app.route("/healthz")
def healthz():
    return 'ok'

@app.route("/readyz", methods=["GET"])
def readyz():
    return 'ok'

@app.route("/events", methods=["GET"])
def events():
    return jsonify({'events': get_events(), 'checksum': CHECKSUM})

@app.route("/checksum", methods=["GET"])
def checksum():
    return jsonify({'checksum': CHECKSUM})

def main():
    args = parser.parse_args()
    if args.host == "":
        host = "127.0.0.1"
    else:
        host = args.host
    global SERVICE_ACCOUNT_FILE
    SERVICE_ACCOUNT_FILE = args.conf_path
    p = Poller(interval=30)
    app.run(host=host, port=args.port, debug=args.debug)

if __name__ == '__main__':
    main()
