from django.conf import settings
from django.core.urlresolvers import reverse
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404

from trippins.forms import *

from feeds import getMaxFeedPid

def trippins_login(request):
    context = {}

    # if already login, directly redirect to stream page
    if request.user.is_authenticated():
        return redirect(reverse('index'))

    if request.method == 'GET':
        context['form'] = LoginForm()
        return render(request, 'authentication/login.html', context)

    form = LoginForm(request.POST)
    context['form'] = form

    if not form.is_valid():
        print form.errors
        return render(request, 'authentication/login.html', context)
    user = authenticate(username=form.cleaned_data['username'], \
                        password=form.cleaned_data['password'])
    try:
        login(request, user)
        request.session["max_follow_pid"] = getMaxFeedPid(request)
        print getMaxFeedPid(request)
    except Exception as err:
        print err
        print 'username password mismatch'
        context['error_message'] = "Your username and password seems wrong, please try again"
        return render(request, 'authentication/login.html', context)

    return redirect(reverse('index'))


def register(request):
    context = {}

    if request.method == 'GET':
        context['form'] = RegistrationForm()
        return render(request, 'authentication/register.html', context)

    form = RegistrationForm(request.POST)
    context['form'] = form

    if not form.is_valid():
        # register form is invalid: redirect back to register page
        print form.errors
        return render(request, 'authentication/register.html', context)

    user = User.objects.create_user(
        username=form.cleaned_data['username'],
        email=form.cleaned_data['email'],
        first_name=form.cleaned_data['first_name'],
        last_name=form.cleaned_data['last_name'],
        password=form.cleaned_data['password1'])

    trip_user = TripUser(user=user, bio='')

    trip_user.save()
    user.save()

    user = authenticate(username=form.cleaned_data['username'], \
                        password=form.cleaned_data['password1'])
    login(request, user)

    return redirect(reverse('index'))

@login_required
def trippins_logout(request):
    logout(request)
    return redirect('/')
