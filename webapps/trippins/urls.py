"""webapps URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.8/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.views.generic import RedirectView
from trippins.views import *
from trippins.auth_views import *

urlpatterns = [
    url(r'^$', 'trippins.views.index', name='index'),
    url(r'^login$', 'trippins.auth_views.trippins_login', name = 'login'),
    url(r'^logout$', 'trippins.auth_views.trippins_logout', name = 'logout'),
    url(r'^registration$', 'trippins.auth_views.register', name = 'registration'),
    url(r'^album/(?P<pid>\d+)$', 'trippins.views.album', name='album'),
    url(r'^map$', "trippins.views.map", name='map'),
    url(r'^upload/(?P<pid>\d+)$', 'trippins.views.upload_photo', name = 'jfu_upload' ),
    url(r'^stars$', 'trippins.views.stars', name = 'stars' ),
    url(r'^create_temp_pin$', 'trippins.views.create_temp_pin', name='create_temp_pin'),
    url(r'^cancel_pin/(?P<pid>\d+)$', 'trippins.views.cancel_pin', name = 'cancel_pin'),
    url(r'^delete_pin/(?P<pid>\d+)$', 'trippins.views.delete_pin', name = 'delete_pin'),
    url(r'^render_pin_box/(?P<pid>\d+)$', 'trippins.views.render_pin_box', name='render_pin_box'),
    url(r'^rate_pin/(?P<pid>\d+)$', 'trippins.views.rate_pin', name='rate_pin'),
    url(r'^photo/(?P<pid>\d+)$', 'trippins.views.get_photo', name = 'get_photo'),
    url(r'^pins/$', 'trippins.views.get_pins', name='get_pins'),
    url(r'^personal_pins$', 'trippins.views.get_personal_pins', name='get_personal_pins'),
    url(r'^personal_pins/$', 'trippins.views.get_personal_pins', name='get_personal_pins'),
    url(r'^personal_pins/(?P<uid>\d+)$', 'trippins.views.get_personal_pins', name='get_personal_pins'),
    url(r'^create_pin/(?P<pid>\d+)$', 'trippins.views.create_pin', name='create_pin'),
    url(r'^addcomment/(?P<photoid>\d+)$', 'trippins.views.add_comment', name='add_comment'),
    url(r'^getcomments/(?P<pid>\d+)$', 'trippins.views.get_comments', name='get_comments'),
    url(r'^delete/(?P<pk>\d+)/(?P<pid>\d+)$', 'trippins.views.upload_delete', name = 'jfu_delete' ),
    url(r'^timeline/(?P<uid>\d+)$', 'trippins.views.get_timeline', name='timeline'),
    url(r'^timeline$', 'trippins.views.get_timeline', name='timeline'),
    url(r'^check_updates$', 'trippins.views.check_updates', name='check_updates'),
    url(r'^check_updates/(?P<max_pid>\d+)$', 'trippins.views.check_updates', name='check_updates'),
    url(r'^follow/(?P<uid>\d+)$', 'trippins.views.follow', name='follow'),
    url(r'^unfollow/(?P<uid>\d+)$', 'trippins.views.unfollow', name='unfollow'),
    url(r'^feed/(?P<key>\w+)$', 'trippins.views.feed', name='feed'),
    url(r'^feed$', 'trippins.views.feed', name='feed'),
    url(r'^edit-profile$', 'trippins.views.edit_profile', name='edit-profile'),
    url(r'^.*$', RedirectView.as_view(pattern_name='index')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
