function loginReset() {
  var msg = $('.error-message');
  msg.html("");
}

$(document).ready(function() {
  $("body").on("click", "input", loginReset);
})
