var imageUrl = '/static/images/pin.jpg';
var map = null;
var curHeader = null;

$(window).scroll(function(){
    $('.container article').each(function(){
        var scrollTop = $(window).scrollTop(),
            elementOffset = $(this).offset().top,
            distance      = (elementOffset - scrollTop),
                windowHeight  = $(window).height(),
                breakPoint = windowHeight*0.9;

            if(distance > breakPoint) {
                $(this).addClass("more-padding");
            }  if(distance < breakPoint) {
                $(this).removeClass("more-padding");
            }
    });
});

function initialize(){
    var mapProp = {
        center:new google.maps.LatLng(40.4291114,-79.9579099),
        zoom:5,
        mapTypeId:google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        mapTypeControl: false,
        zoomControlOptions: {style: google.maps.ZoomControlStyle.SMALL,position: google.maps.ControlPosition.RIGHT_CENTER}
    };
    map=new google.maps.Map(document.getElementById("map"),mapProp);
    initCluster(map);
    initStyle(map);
}

function timelineTo(pid){
    return function(){
        var target= $("#" + pid);
        focusOnHeader(target);
        $('html, body').stop().animate({
            scrollTop: target.offset().top - 300
        }, 1000);
    };
}

function focusOnHeader(header){
    if (curHeader != null){
        curHeader.removeClass("large-font");
    }
    curHeader = header;
    curHeader.addClass("large-font");

}

function initCluster(map) {
    //get all pins from
    $.ajax({
        url: "/personal_pins/" + $("#profile").data('uid'),
        type: "GET",
        success: function(data) {
            var markers = [];
            for (var i = 0; i < data.length; i++){
                var latLng = new google.maps.LatLng(data[i].latitude,
                    data[i].longtitude);
                var marker = new google.maps.Marker({'position': latLng, 'icon': imageUrl});
                google.maps.event.addListener(marker, 'click', timelineTo(data[i].pid));
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
}

function changeCenter(lat, lng){
    map.setCenter({lat:lat, lng:lng});
    map.setZoom(15);
}


function pinChosen(pid, lat, lng){
    changeCenter(lat, lng);
    focusOnHeader($("#"+pid));
}



google.maps.event.addDomListener(window, 'load', initialize);


function addSlideFunc(article){
    $.ajax({
        url: "/photo/" + article.attr("id"),
        type: "GET",
        success: function(data) {
            if (data.photos.length > 0){
                var slider = $('<div class="slider"></div>');
                slider.on("click", (function(id){
                    return function(){
                        window.location.replace('/album/' + id);
                    };
                    
                })(data.pid));
                var imgs = [];
                for (var i = 0; i < data.photos.length; i++){
                    var slide = $("<div class='slide'><p>" + data.time + "</p></div>");
                    var tmpPath = data.photos[i].photo.url;
                    var img = $("<img></img>");
                    img.attr('src', tmpPath);
                    imgs.push(img);
                    slide.prepend(img);
                    slider.append(slide);
                }
                slider.insertAfter(article.children("#longitude"));
                addSlideAnimation(slider[0], imgs);
            }
        },
        error: function(xhr, errmsg, err){
            console.log(xhr.status + ": " + xhr.responseText);
            // provide a bit more info about the error to the console
        }
    })

}

function delete_pin(pid) {
    $.ajax({
        url: "/delete_pin/" + pid,
        type: "GET",
        error: function(xhr, errmsg, err){
            console.log(xhr.status + ": " + xhr.responseText);
            // provide a bit more info about the error to the console
        }
    });
    location.reload();
}

$(document).ready(function() {
    $(".container article").each(
        function(){
            addSlideFunc($(this));
        }
    );
});
