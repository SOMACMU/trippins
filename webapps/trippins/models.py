from django.db import models
from django.db.models import Max
from django.utils import timezone
from django.contrib.auth.models import User

# Create your models here.

class TripUser(models.Model):
    user = models.OneToOneField(User)
    followings = models.ManyToManyField('self', symmetrical=False)
    avatar = models.ImageField(upload_to='media/avatars', default="media/avatars/default.png")
    bio = models.TextField(default="I am too busy pinning to say anything here:(")

    def __unicode__(self):
        return u'%s %s' % (self.user.username, self.bio)


class tempPin(models.Model):
    user = models.ForeignKey(TripUser)
    longtitude = models.CharField(max_length=20)
    latitude = models.CharField(max_length=20)
    date = models.DateTimeField(default=timezone.now())
    photos = models.TextField()

    def __unicode__(self):
        return u'%s %s ' % (self.id, self.date)


class Pin(models.Model):
    user = models.ForeignKey(TripUser)
    longtitude = models.CharField(max_length=20)
    latitude = models.CharField(max_length=20)
    description = models.CharField(max_length=100)
    date = models.DateTimeField(default=timezone.now())
    likes = models.ManyToManyField(TripUser, related_name='likes')
    rating = models.FloatField(default=0.0)
    private = models.BooleanField(default=False)

    def __unicode__(self):
        return u'%s %s' % (self.id, self.date)

    @staticmethod
    def get_max_id():
        return Pin.objects.all().aggregate(Max('id'))['id__max'] or 0

class Photo(models.Model):
    image = models.FileField(upload_to='album')
    pin = models.ForeignKey(Pin, blank=True, null=True)
    comment = models.TextField()

    def __unicode__(self):
        return u'%s = %s' % (self.image, self.pin)


class Comment(models.Model):
    pin = models.ForeignKey(Pin)
    user = models.ForeignKey(TripUser)
    content = models.CharField(max_length=420)
    date = models.DateTimeField(default=timezone.now())


class Rate(models.Model):
    user = models.ForeignKey(TripUser)
    pin = models.ForeignKey(Pin)
    score = models.IntegerField()

    class Meta:
        unique_together = ('user', 'pin',)


#class InviteCode(models.Model):
#    code = models.CharField(max_length=20)
#
#    def __unicode__(self):
#        return self.code
