from trippins.models import *

def getMaxFeedPid(request, max_pid=0):
    user = TripUser.objects.get(user = request.user)
    following_set = [followee for followee in user.followings.all()]

    new_pins = Pin.objects.filter(user__in = following_set, id__gt = max_pid).order_by('-date')
    if len(new_pins)==0:
    	return 0
    return new_pins[0].id
