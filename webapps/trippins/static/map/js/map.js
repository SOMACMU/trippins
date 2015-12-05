var imageUrl = '/static/images/pin.jpg';
var marker = false;


//show pin detail on the side column using pid
var funcShowPin = function(pid){
    var tmpF = function (){
        if ( !$("#toggle").hasClass("on") ) {
          $("#toggle").toggleClass("on");
        }
        $.ajax({
            url: "photo/" + pid,
            type: "GET",
            success: function(data) {
              $("#main").empty();
              var pinDetail = ich.pinDetail(data);
              $("#main").append(pinDetail);
              getPinScore(pid);
              renderStars();
              
              mapView.show();
            },
            error: function(xhr, errmsg, err){
                console.log(xhr.status + ": " + xhr.responseText);
                console.log("msg" + errmsg);
                // provide a bit more info about the error to the console
            }
        });
    }
    return tmpF;
}

function getPinScore(pid) {
  $.get("/rate_pin/"+pid)
    .done(function(data) {
      var x = parseInt(data);
      var score = $('#score-label');
      score.empty();
      score.append("<p>" + x + "/5</p>");
  });
}


function initialize(){
	var center = new google.maps.LatLng(37.4419, -12.1419);
	var options = {
		'zoom': 3,
		'center': center,
		'mapTypeId': google.maps.MapTypeId.ROADMAP,
        'zoomControl':true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT
        }
    };
    var map = new google.maps.Map(document.getElementById("map"), options);
    google.maps.event.addListener(map, 'click', function(event) {
        setMarker(event.latLng, map);
    });
    initCluster(map);
    initStyle(map);
}




function initCluster(map) {
    //get all pins from
    $.ajax({
        url: "pins/",
        type: "GET",
        success: function(data) {
            var markers = [];
            for (var i = 0; i < data.length; i++){
                var latLng = new google.maps.LatLng(data[i].latitude,
                    data[i].longtitude);
                var marker = new google.maps.Marker({'position': latLng, 'icon': imageUrl});
                google.maps.event.addListener(marker, 'click', funcShowPin(data[i].pid));
                markers.push(marker);
            }
            var markerCluster = new MarkerClusterer(map, markers);
        },

        error: function(xhr, errmsg, err){
            console.log(xhr.status + ": " + xhr.responseText);
            // provide a bit more info about the error to the console
        }
    })
}


function initStyle(map) {
    var styleArray = [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]}];
    map.set('styles', styleArray);


    // search box
    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    var markers = [];
  // [START region_getplaces]
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
  }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
  });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
    };

    // Create a marker for each place.
    markers.push(new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
    }));

    if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
    } else {
        bounds.extend(place.geometry.location);
    }
});
    map.fitBounds(bounds);
});
}


function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie != '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
          var cookie = jQuery.trim(cookies[i]);
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) == (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}

function addPin(lng, lat) {

	var csrftoken = getCookie('csrftoken');
	$.ajaxSetup({
		beforeSend: function(xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    });

	$.post("/create_temp_pin", {longtitude: lng, latitude: lat})
    .done(function(data) {
		$.post("/render_pin_box/"+data)
        .done(function(data) {
            $('#light').append(data);
            document.getElementById('light').style.display='block';
            document.getElementById('fade').style.display='block';
        });

    }).fail( function(xhr, textStatus, errorThrown) {
      console.log("Status: " + xhr.status);
    })
}
function cancelPin(pinId) {
    document.getElementById('light').style.display='none';
    document.getElementById('fade').style.display='none';
    $.get("/cancel_pin/"+pinId, function(){
        $('#light').empty();
    });
}

function setMarker(latlng, map){
    if (marker!=false)
        marker.setMap(null);
    marker = new google.maps.Marker({
        position: latlng,
        map: map,
        draggable:true,
        icon: 'static/images/marker.png'
    });
    google.maps.event.addListener(marker, 'click', function() {
		    addPin(marker.position.lng, marker.position.lat);
    });

}

function createPin(pinId) {
    var csrftoken = getCookie('csrftoken');
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    });
    var description = $('.pin-desc').val();
    var privateVal = $('#myCheckbox').is(':checked');
    $.ajax({url: "/create_pin/"+pinId,
           data: {"desc": description, 'private': privateVal},
           type: "post",
           success: function () {
                location.reload(true);
           },
           error: function(xhr, errmsg, err){
                console.log(xhr.status + ": " + xhr.responseText);
                console.log("msg" + errmsg);
                location.reload(true);
                // provide a bit more info about the error to the console
            }});
    // Or we can add the marker without refresh
}

function renderStars() {
  var rating = $("#rating");
  $.ajax({url:"/stars",context: document.body, success: function(response){
      rating.html(response);
  }});
}

function viewPin() {
  var pid = $('#header').data('pid');
  if (pid==null)
    return;
  $(location).attr('href', '/album/'+pid);
}

function timeline() {
  var uid = $('#header').data('uid');
  if (uid==null)
      return;
  $(location).attr('href', '/timeline/'+uid);
}


google.maps.event.addDomListener(window, 'load', initialize);
