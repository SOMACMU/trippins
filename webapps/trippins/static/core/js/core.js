function update() {
    var message = $('#message');
    // max_pid = "";
    // if (message.data('max_pid'))
    //   max_pid = message.data('max_pid');
    // else
    max_pid = 0;

    $.get("/check_updates/"+max_pid)
      .done( function(data) {
        message.data('max_pid', data['max_pid']);
        if (data.pins.length>0) {
          var dot = $("<mark class=\"rubberBand\"></mark>")
          message.children("i").append(dot);
          // for (var i = 0; i < data.pins.length; i++) {
          //     var x = data.posts[i];
          //     list.prepend($(x['post'].to_card));
          // }
        }
      })
      .fail( function(xhr, textStatus, errorThrown) {
        console.log("Status: " + xhr.status);
        console.log("Message: " + errorThrown);
        console.log("response: "+xhr.responseText);
      })
}

$(document).ready(function() {
  setInterval(function(){ update() }, 5000)
});
