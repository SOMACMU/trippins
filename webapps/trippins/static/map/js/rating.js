function submitScore(score){
  return function() {
    var pid = $('#header').data('pid');

    var csrftoken = getCookie('csrftoken');
    $.ajaxSetup({
      beforeSend: function(xhr, settings) {
              xhr.setRequestHeader("X-CSRFToken", csrftoken);
          }
      });

    $.post("/rate_pin/"+pid, {score: score})
      .done(function(data) {

        $('#rating-'+score).prop('checked', true);

      }).fail( function(xhr, textStatus, errorThrown) {
        console.log("Status: " + xhr.status);
        console.log("Message: " + errorThrown);
        console.log("response: "+xhr.responseText);
      });

      event.stopPropagation();
      return false;
  };
}

$(document).ready(function() {
  $("body").on("click", "#score1", submitScore(1));
  $("body").on("click", "#score2", submitScore(2));
  $("body").on("click", "#score3", submitScore(3));
  $("body").on("click", "#score4", submitScore(4));
  $("body").on("click", "#score5", submitScore(5));

  $("#toggle").click(function() {
    if ( $(this).hasClass("on") ) {
      $(this).removeClass("on");
    }
    else {
      $(this).toggleClass("on");
    }
  });
});
