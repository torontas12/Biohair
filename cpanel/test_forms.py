"""Local HTTP security/adapter tests. Delivery is mocked, never sent externally."""
import importlib.util
import json
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path
from unittest.mock import patch

spec=importlib.util.spec_from_file_location('staging',Path(__file__).parent/'serve.py')
app=importlib.util.module_from_spec(spec);spec.loader.exec_module(app)

class FormTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server=app.ThreadingHTTPServer(('127.0.0.1',0),app.Handler)
        cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start()
        cls.origin=f'http://127.0.0.1:{cls.server.server_port}'

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown();cls.server.server_close();cls.thread.join()

    def setUp(self):
        app.SESSIONS.clear();app.ATTEMPTS.clear()
        self.environment=patch.dict(app.os.environ,{'PATIENT_FORM_DESTINATION':'','PHYSICIAN_FORM_DESTINATION':'','CALENDAR_URL':'','PRIVACY_POLICY_APPROVED':'false'})
        self.environment.start();self.addCleanup(self.environment.stop)
        with urllib.request.urlopen(self.origin+'/api/form-session') as r:
            self.session=json.load(r);self.cookie=r.headers['Set-Cookie'].split(';')[0]
        sid=self.cookie.split('=',1)[1];token,created=app.SESSIONS[sid];app.SESSIONS[sid]=(token,created-3)
        self.patient={'full_name':'QA Example','email':'qa@example.invalid','phone':'+1 202 555 0100','privacy_acknowledgment':'acknowledged'}
        self.physician={'physician_name':'QA Physician','clinic':'QA Clinic','email':'qa@example.invalid','phone':'+1 202 555 0100'}

    def post(self,kind='patient',data=None,**headers):
        request=urllib.request.Request(self.origin+'/api/forms/'+kind,data=json.dumps(self.patient if data is None else data).encode(),headers={'Content-Type':'application/json','Origin':self.origin,'Cookie':self.cookie,'X-CSRF-Token':self.session['token'],**headers},method='POST')
        try:r=urllib.request.urlopen(request)
        except urllib.error.HTTPError as error:r=error
        with r:return r.status,json.load(r)

    def test_unconfigured_fails_closed(self):
        self.assertEqual(self.post()[0],503)

    def test_origin_and_csrf_rejected(self):
        self.assertEqual(self.post(Origin='https://unrelated.example.invalid')[0],403)
        self.assertEqual(self.post(**{'X-CSRF-Token':'wrong'})[0],403)
        sid=self.cookie.split('=',1)[1]
        app.SESSIONS[sid]=(self.session['token'],app.time.monotonic()-1801)
        self.assertEqual(self.post()[0],403)

    def test_validation_rejects_bad_and_extra_fields(self):
        for data in [dict(self.patient,email='bad'),dict(self.patient,phone='abc1234'),dict(self.patient,medical_history='not allowed'),dict(self.patient,privacy_acknowledgment='no')]:
            self.assertEqual(self.post(data=data)[0],422)

    def test_physician_exact_four_fields(self):
        self.assertEqual(self.post('physician',self.physician)[0],503)
        self.assertEqual(self.post('physician',dict(self.physician,message='extra'))[0],422)

    def test_rate_limit(self):
        for _ in range(5):self.assertEqual(self.post()[0],503)
        self.assertEqual(self.post()[0],429)

    def test_oversize_rejected(self):
        self.assertEqual(self.post(data=dict(self.patient,full_name='x'*9000))[0],422)

    def test_same_destination_and_unapproved_privacy_block(self):
        with patch.dict(app.os.environ,{'PATIENT_FORM_DESTINATION':'https://example.invalid/same','PHYSICIAN_FORM_DESTINATION':'https://example.invalid/same','CALENDAR_URL':'https://calendar.google.com/calendar/appointments/example-test','PRIVACY_POLICY_APPROVED':'true'}):
            self.assertEqual(self.post()[0],503)
        with patch.dict(app.os.environ,{'PATIENT_FORM_DESTINATION':'https://example.invalid/patient','PHYSICIAN_FORM_DESTINATION':'https://example.invalid/physician'}):
            self.assertEqual(self.post()[0],503)

    def test_secure_destination_and_calendar_validation(self):
        for url in ['http://example.invalid/inbox','https://localhost/inbox','https://127.0.0.1/inbox','https://user:secret@example.invalid/inbox']:
            with patch.dict(app.os.environ,{'PATIENT_FORM_DESTINATION':url}):self.assertEqual(app.endpoint('patient'),'')
        for url in ['https://example.invalid/calendar','javascript:alert(1)']:
            with patch.dict(app.os.environ,{'CALENDAR_URL':url}):self.assertEqual(app.calendar(),'')
        with patch.dict(app.os.environ,{'CALENDAR_URL':'https://calendar.google.com/calendar/appointments/example-test'}):
            self.assertTrue(app.calendar().startswith('https://calendar.google.com/'))

    def test_adapters_use_distinct_destinations_and_single_use_token(self):
        received=[]
        class Response:
            status=202
            def __enter__(self):return self
            def __exit__(self,*args):pass
        class Opener:
            def open(self,request,timeout):received.append((request.full_url,json.loads(request.data)));return Response()
        with patch.dict(app.os.environ,{'PATIENT_FORM_DESTINATION':'https://example.invalid/patient','PHYSICIAN_FORM_DESTINATION':'https://example.invalid/physician','CALENDAR_URL':'https://calendar.google.com/calendar/appointments/example-test','PRIVACY_POLICY_APPROVED':'true'}),patch.object(app.urllib.request,'build_opener',return_value=Opener()):
            self.assertEqual(self.post()[0],200)
            self.assertEqual(received[0][0],'https://example.invalid/patient')
            self.assertEqual(received[0][1]['kind'],'patient')
            self.assertEqual(self.post()[0],403)
            self.cookie='bh_session=qa-second-form'
            app.SESSIONS['qa-second-form']=(self.session['token'],app.time.monotonic()-3)
            self.assertEqual(self.post('physician',self.physician)[0],200)
            self.assertEqual(received[1][0],'https://example.invalid/physician')
            self.assertEqual(received[1][1]['kind'],'physician')

    def test_delivery_failure_never_reports_success(self):
        class Opener:
            def open(self,*args,**kwargs):raise urllib.error.URLError('simulated adapter outage')
        with patch.dict(app.os.environ,{'PATIENT_FORM_DESTINATION':'https://example.invalid/patient','PHYSICIAN_FORM_DESTINATION':'https://example.invalid/physician','CALENDAR_URL':'https://calendar.google.com/calendar/appointments/example-test','PRIVACY_POLICY_APPROVED':'true'}),patch.object(app.urllib.request,'build_opener',return_value=Opener()):
            status,result=self.post();self.assertEqual(status,502);self.assertIn('could not be confirmed',result['message'])

    def test_indexing_disabled_and_security_headers(self):
        with urllib.request.urlopen(self.origin+'/index.html') as r:
            self.assertIn('noindex',r.headers['X-Robots-Tag'])
            self.assertIn("frame-ancestors 'none'",r.headers['Content-Security-Policy'])
            self.assertEqual(r.headers['Cache-Control'],'no-store')

if __name__=='__main__':unittest.main(verbosity=2)
