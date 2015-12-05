import os
import json
from django.conf import settings
from django.core.urlresolvers import reverse
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, Http404, JsonResponse
from django.views.decorators.http import require_POST
from django.shortcuts import render, redirect, get_object_or_404
from django.template import RequestContext
from django.utils import timezone
from django.db.models import Avg, Q
from trippins.forms import *
from trippins.models import *
from jfu.http import upload_receive, UploadResponse, JFUResponse

from feeds import getMaxFeedPid

# Create your views here.
@login_required
def index(request):
    context = {}
    pins = None
    if Pin.objects.filter(private=False).count()<10:
        pins = Pin.objects.all().filter(private=False).order_by('-rating')
    else:
        pins = list(Pin.objects.all().filter(private=False).order_by('-rating'))
        pins = pins[-10:]
    pin_with_cover = []
    for pin in pins:
        album = {}
        album['pin'] = pin
        photos = Photo.objects.filter(pin=pin.id)
        if len(photos)==0:
            continue
        album['cover'] = photos[0]
        pin_with_cover.append(album)
    context['pins'] = pin_with_cover
    return render(request, "index.html", context)


@login_required
def album(request, pid):
    context = {}
    try:
        photos = Photo.objects.filter(pin=pid)
        pin = Pin.objects.get(id=pid)
    except Exception as err:
        print err
        raise Http404("Please behave yourself!")
    trip_user = pin.user
    context['pid'] = pid
    context['description'] = Pin.objects.get(pk=pid).description
    context['photos'] = photos
    context['userid'] = trip_user.user.id
    context['author'] = trip_user.user.username
    me_user = User.objects.get(username=request.user)
    me_user = TripUser.objects.get(user=me_user)
    context['avatar'] = me_user.avatar.url

    return render(request, "album.html", context)


@login_required
def map(request):
    context = {}
    context['form'] = PinCreateForm()
    return render(request, 'map.html', context)

@login_required
def profile(request, uid=None):
    context = {}
    context['form'] = PinCreateForm()
    if uid==None:
        context['user'] = request.user
    else:
        context['user'] = User.objects.get(id=uid)
        if TripUser.objects.filter(followings__user__id=uid).exists():
            context['follow'] = "UnFollow"
        else:
            context['follow'] = "Follow"
    user = User.objects.get(username = context['user'])
    t_user = TripUser.objects.get(user=user)
    context['avatar'] = t_user.avatar
    return render(request, 'profile.html', context)


'''
Functions to do CUDR operations
- create_pin(): create pin object from form
- get_photo(pid): JSON with list of path to photos
'''


@login_required
def create_temp_pin(request):
    user = TripUser.objects.get(user=request.user)

    long = request.POST['longtitude']
    lat = request.POST['latitude']

    pin = tempPin(user=user, longtitude=long, latitude=lat, date=timezone.now())
    pin.photos = json.dumps([]);
    pin.save()

    context = RequestContext(request)
    context['pid'] = pin.id
    # return pin
    return HttpResponse(pin.id)


@login_required
def upload_photo(request, pid=None):
    file = upload_receive( request )
    # Save photo
    photo = Photo(image = file)
    photo.save()
    # Attach photo id to the temporary pin
    tPin = tempPin.objects.get(id=pid)
    list_of_photos = json.loads(tPin.photos)
    list_of_photos.append(photo.id)
    tPin.photos = json.dumps(list_of_photos)
    tPin.save()

    basename = os.path.basename( photo.image.url )
    newURL = os.path.join(settings.MEDIA_URL, "album", basename)
    # TODO: fix 'deleteUrl' [currently save images to webapps/trippins/media/profile-image/]
    try:
        file_dict = {
            'name': basename,
            'size': file.size,
            'url': newURL,
            'thumbnailUrl': newURL,
            'photoid': photo.id,
            'deleteUrl': reverse('jfu_delete', kwargs = { 'pk': photo.id, 'pid':pid }),
            'deleteType': 'POST',
        }
    except Exception as error:
        print error
    return UploadResponse( request, file_dict )


@login_required
def upload_delete(request, pk, pid):
    success = True
    try:
        instance = Photo.objects.get( id = pk )
        instance.delete()
        tPin = tempPin.objects.get(id=pid)
        list_of_photos = json.loads(tPin.photos)
        list_of_photos.remove(int(pk))
        tPin.photos = json.dumps(list_of_photos)
        tPin.save()
    except Exception as err:
        success = False
        print err
    return JFUResponse( request, success )


@login_required
def delete_pin(request, pid):
    if len(Pin.objects.filter(id=pid)) == 0:
        print 'pinID not exist'
        return HttpResponse()
    pin = Pin.objects.get(id=pid)
    if request.user.id!=pin.user.user.id:
        return HttpResponse("This Pin doesn't belong to you!")
    for p in Photo.objects.filter(pin=pin):
        p.delete()
    pin.delete()
    return HttpResponse()


@login_required
def cancel_pin(request, pid):
    if len(tempPin.objects.filter(id=pid)) == 0:
        print 'pinID not exist'
        return HttpResponse()
    pin = tempPin.objects.get(id=pid)
    list_of_photos = json.loads(pin.photos)
    for photo_id in list_of_photos:
        if len(Photo.objects.filter(id=photo_id)) != 0:
            photo = Photo.objects.get(id=photo_id)
            photo.delete()
    pin.delete()
    return HttpResponse()


@login_required
def get_photo(request, pid):
    context = {}
    photos = Photo.objects.filter(pin=pid)
    pin = Pin.objects.get(id=pid)

    context['pid'] = pid
    context['uid'] = pin.user.user.id
    context['author'] = pin.user.user.username
    context['description'] = Pin.objects.get(pk=pid).description
    context['photos'] = photos
    context['time'] = pin.date.strftime("%A. %d-%m-%Y")
    return render(request, 'photos.json', context, content_type='application/json')

@login_required
def get_comments(request, pid):
    print pid
    if len(Pin.objects.filter(id=pid))==0:
        print "Pin id cann't be found"
        return render(request, 'comments.json', {}, content_type='application/json')
    pin = Pin.objects.get(id=pid)
    comments = Comment.objects.filter(pin=pin)
    context = {'comments':comments}
    return render(request, 'comments.json', context, content_type='application/json')

@login_required
def add_comment(request, photoid):
    photo = Photo.objects.get(id=photoid)
    pin = photo.pin
    user = request.user.username
    user = User.objects.get(username=user)
    user = TripUser.objects.get(user=user)
    comment = Comment(pin=pin, user=user, content=request.POST['content'])
    comment.save()
    return HttpResponse()


@login_required
def create_pin(request, pid):
    tPin = tempPin.objects.get(id=pid)
    pin = Pin(user=tPin.user, longtitude=tPin.longtitude,
        latitude=tPin.latitude, date=tPin.date,
        description=request.POST['desc'])
    if request.POST['private']=='true':
        pin.private = True
    pin.save()
    print "Pin has been created"
    # attach photos with this pin
    try:
        list_of_photos = json.loads(tPin.photos)
        for photo_id in list_of_photos:
            photo = Photo.objects.get(id=photo_id)
            photo.pin = pin
            photo.save()
        tPin.delete()
    except Exception as err:
        print err
    print "temp Pin has been deleted"
    return HttpResponse(pin.id)


@login_required
def render_pin_box(request, pid):
    context = {'pinid':pid}
    return render(request, 'createpin.html', context)


@login_required
def get_pins(request):
    if request.method == 'GET':
        result = []
        pins = list(Pin.objects.filter(private=False))
        user = TripUser.objects.get(user=request.user)
        private_pins = list(Pin.objects.filter(private=True, user=user))
        pins.extend(private_pins)
        for p in pins:
            result.append({"pid": p.pk, "longtitude": p.longtitude, "latitude": p.latitude})
        return HttpResponse(json.dumps(result), content_type="application/json")
    return HttpResponse(503)


@login_required
def get_personal_pins(request, uid=None):
    result = []
    user = None
    if uid==None:
        user = TripUser.objects.get(user=request.user)
    else:
        u = User.objects.get(id=uid)
        user = TripUser.objects.get(user=u)
    pins = Pin.objects.filter(user=user)
    for p in pins:
        result.append({"pid": p.pk, "longtitude": p.longtitude, "latitude": p.latitude})
    return HttpResponse(json.dumps(result), content_type="application/json")


@login_required
def stars(request):
    context = []
    return render(request, 'ratingStars.html', context)


@login_required
def rate_pin(request, pid):
    pin = Pin.objects.get(id=pid)
    user = TripUser.objects.get(user=request.user)

    if request.method == 'GET':
        avg_score = Rate.objects.filter(pin = pin).aggregate(Avg('score'))
        if avg_score.get('score__avg', 0.00) is not None:
            return HttpResponse(avg_score.get('score__avg', 0.00))
        else:
            return HttpResponse(0.0)

    score = request.POST['score']

    if Rate.objects.filter(user = user, pin = pin).count()>0:
        Rate.objects.filter(user = user, pin = pin).update(score = score)
    else:
        rate = Rate(user = user, pin = pin, score = score)
        rate.save()
    try:
        avg_score = Rate.objects.filter(pin = pin).aggregate(Avg('score'))
        pin.rating = avg_score['score__avg']
        pin.save()
    except Exception as err:
        print err
    return HttpResponse("submitted score")


@login_required
def get_timeline(request, uid=None):
    context = {}
    user = None
    if uid==None or uid==request.user.id:
        user = TripUser.objects.get(user=request.user)
        context['self'] = True
    else:
        try:
            user = TripUser.objects.get(user__id=uid)
            if TripUser.objects.filter(followings__user__id=uid, user=request.user).exists():
                context['follow'] = "UnFollow"
            else:
                context['follow'] = "Follow"
        except Exception as err:
            print err
            raise Http404("Please behave yourself!")
    context['user'] = user.user.username
    context['uid'] = request.user.id if uid == None else uid
    pins = Pin.objects.filter(user = user).order_by('date')
    context['pins'] = pins
    context['avatar'] = user.avatar.url
    context['bio'] = user.bio
    return render(request, 'timeline.html', context)


@login_required
def edit_profile(request):
    context = {}
    if request.method == 'GET':
        context['form'] = ProfileSettingForm()
        context['password_form'] = PasswordSettingForm()
        return render(request, 'profile-setting.html', context)

    form = ProfileSettingForm(request.POST, request.FILES)
    password_form = PasswordSettingForm(request.POST)
    context['form'] = ProfileSettingForm()
    context['password_form'] = PasswordSettingForm()
    if not form.is_valid() and not password_form.is_valid():
        print form.errors
        print password_form.errors
        return render(request, 'profile-setting.html', context)
    if form.is_valid():
        user = User.objects.get(username=request.user)
        user.first_name = form.cleaned_data['first_name']
        user.last_name = form.cleaned_data['last_name']
        user.save()
        trip_user = TripUser.objects.get(user=user)
        trip_user.bio = form.cleaned_data['bio']
        trip_user.avatar = form.cleaned_data['avatar']
        trip_user.save()
    elif password_form.is_valid():
        user = User.objects.get(username=request.user)
        user.set_password(password_form.cleaned_data['password1'])
        user.save()
    return render(request, 'profile-setting.html', context)


@login_required
def check_updates(request, max_pid=0):
    try:
        # in case user logined in via cookie
        max_pid = request.session["max_follow_pid"]
    except:
        max_pid = getMaxFeedPid(request)
        request.session["max_follow_pid"] = max_pid

    context = {}

    user = TripUser.objects.get(user = request.user)
    following_set = [followee for followee in user.followings.all()]

    new_pins = Pin.objects.filter(user__in = following_set, id__gt = max_pid).order_by('-date')
    if len(new_pins)>0:
        request.session["max_follow_pid"] = new_pins[0].id
    print "current max follow pid %s" % (Pin.get_max_id())
    context['pins'] = new_pins
    return render(request, 'pins.json', context, content_type='application/json')


@login_required
def follow(request, uid):
    follower = TripUser.objects.get(user = request.user)
    followee = TripUser.objects.get(user = User.objects.get(id = uid))

    follower.followings.add(followee)
    follower.save()
    msg = 'followed %s' % (followee.user.username,)
    return HttpResponse(msg)


@login_required
def unfollow(request, uid):
    follower = TripUser.objects.get(user = request.user)
    followee = TripUser.objects.get(user = User.objects.get(id = uid))

    follower.followings.remove(followee)
    follower.save()
    msg = 'unfollowed %s' % (followee.user.username,)
    return HttpResponse(msg)


@login_required
def feed(request, key=None):
    context = {}

    user = TripUser.objects.get(user = request.user)
    following_set = [followee for followee in user.followings.all()]

    pins = None
    if key==None:
        pins = Pin.objects.filter(user__in = following_set).order_by('date')
        context['pins'] = pins
    else:
        pins = Pin.objects.filter(Q(user__in = following_set), Q(description__icontains=key) | Q(user__user__username__icontains=key)).order_by('date')
        context['pins'] = pins
        return render(request, 'pins.json', context, content_type='application/json')

    return render(request, 'feed.html', context)
