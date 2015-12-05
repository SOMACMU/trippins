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

function followAction() {
  // get uid from url
  var path = window.location.pathname;
  var uid = path.split("/")[2]

  var follow_btn = $('#follow-btn');
  var csrftoken = getCookie('csrftoken');
  $.ajaxSetup({
    beforeSend: function(xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    });
  // TODO: follow ajax request
  if (follow_btn.html()=="Follow") {
    $.post("/follow/"+uid)
      .done(function(data) {
        console.log(data);
        $('#follow-btn').html("Unfollow");
      }).fail( function(xhr, textStatus, errorThrown) {
        console.log("Status: " + xhr.status);
        console.log("Message: " + errorThrown);
        console.log("response: "+xhr.responseText);
      });
      event.stopPropagation();
  }
  else {
    $.post("/unfollow/"+uid)
      .done(function(data) {
        console.log(data);
        $('#follow-btn').html("Follow");
      }).fail( function(xhr, textStatus, errorThrown) {
        console.log("Status: " + xhr.status);
        console.log("Message: " + errorThrown);
        console.log("response: "+xhr.responseText);
      });
      event.stopPropagation();
  }
  return false;
}

$(document).ready(function() {
  var follow_btn = $('#follow-btn');
  $('div').on('click', '#follow-btn', followAction);
})
