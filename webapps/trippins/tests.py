from django.test import TestCase
from django.contrib.auth import SESSION_KEY
from django.core.urlresolvers import reverse
from trippins.models import *

class AccountManagementTest(TestCase):
    def create_tmp_user(self):
        user = User(username="test-use")
        user.set_password('123')
        user.save()
        t_user = TripUser(user=user)
        t_user.save()

    def test_register(self):
        registration = {}
        registration['username'] = 'test-use'
        registration['email'] = 'test@trippins.us'
        registration['first_name'] = 'Test'
        registration['last_name'] = 'Test'
        registration['password1'] = '123'
        registration['password2'] = '123'
        resp = self.client.post(reverse('registration'),registration)
        self.assertEqual(
                len(User.objects.filter(username=registration['username'])), 1
            )
        user = User.objects.get(username=registration['username'])
        self.assertEqual(
                len(TripUser.objects.filter(user=user)), 1
            )
        self.assertRedirects(resp, reverse('index'))

    def test_legal_login(self):
        self.create_tmp_user()
        login = {}
        login['username'] = 'test-use'
        login['password'] = '123'
        self.client.post(reverse('login'), login)
        self.assertTrue(SESSION_KEY in self.client.session)

    def test_illegal_login(self):
        self.create_tmp_user()
        login = {}
        login['username'] = 'test-use'
        login['password'] = '12345'
        self.client.post(reverse('login'), login)
        self.assertFalse(SESSION_KEY in self.client.session)


class PinManagementTest(TestCase):
    username = 'do-not-touch-it'
    password = '1234'
    def create_tmp_user(self):
        user = User(username=self.username)
        user.set_password(self.password)
        user.save()
        self.user = user
        t_user = TripUser(user=user)
        t_user.save()
        self.t_user = t_user

    def login_helper(self):
        self.create_tmp_user()
        self.client.login(username=self.username, password=self.password)

    def temp_pin_helper(self):
        tPin = tempPin(user=self.t_user, photos='[]')
        tPin.save()
        return tPin

    def pin_helper(self):
        pin = Pin(user=self.t_user)
        pin.save()
        return pin

    def test_temp_pin_creation(self):
        self.login_helper()
        pin_info = {}
        pin_info['longtitude'] = 123
        pin_info['latitude'] = 123
        resp = self.client.post(reverse('create_temp_pin'), pin_info)
        self.assertEquals(len(tempPin.objects.filter(id=resp.content)), 1)

    def test_pin_creation(self):
        self.login_helper()
        tPin = self.temp_pin_helper()
        pin_info = {}
        pin_info['private'] = 'true'
        pin_info['desc'] = ""
        resp = self.client.post(reverse('create_pin', kwargs={'pid':tPin.id}), pin_info)
        self.assertEquals(len(tempPin.objects.filter(id=tPin.id)), 0)
        self.assertEquals(len(Pin.objects.filter(id=resp.content)), 1)

    def test_temp_pin_deletion(self):
        self.login_helper()
        tPin = self.temp_pin_helper()
        self.client.get(reverse('cancel_pin', kwargs={'pid':tPin.id}))
        self.assertEquals(len(tempPin.objects.filter(id=tPin.id)), 0)

    def test_pin_deletion(self):
        self.login_helper()
        pin = self.pin_helper()
        self.client.get(reverse('delete_pin', kwargs={'pid': pin.id}))
        self.assertEquals(len(Pin.objects.filter(id=pin.id)), 0)
