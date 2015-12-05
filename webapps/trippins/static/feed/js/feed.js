function fetchPhotos() {
  var list = $(this);
  var id = list.attr('id');
  var thumb = list.find('img');
}

function searchPinWithKeyword(word) {
  if (word.length>0) {
    $.get("/feed/"+word)
      .done( function(data) {
        var block = $('.feed-block');
        block.empty();
        for (var i=0; i<data.pins.length; i++) {
          var blog = $('<div></div>');
          // place holder
          var icon_holder = $('<div class=\"icon-holder\"></div>');
          // TODO: replace by real avatar
          var icon = $('<div class=\"icon\"></div>');
          icon_holder.append(icon);
          blog.append(icon_holder);

          var container = $('<div></div>');

          var title = $('<div></div>');
          title.addClass('feed-title');
          title.append(data.pins[i].pin.user);
          title.append("<span class=\"feed-title pin-date\">"+data.pins[i].pin.date+"</span>");

          var descriptoin = $('<div></div>');
          descriptoin.append(data.pins[i].pin.title);

          container.append(title);
          container.append(descriptoin);

          blog.append(container);

          descriptoin.addClass("feed-description");
          container.addClass('text-holder col-3-5');
          blog.addClass('feed-item blog');

          block.append(blog);
        }
      }).fail( function(xhr, textStatus, errorThrown) {
        console.log("Status: " + xhr.status);
        console.log("Message: " + errorThrown);
        console.log("response: "+xhr.responseText);
      })
  }
}

$(document).ready(function() {
  $('#thumb-feed-list > li').each(fetchPhotos);
  $("body").on("click", "#search", function() {searchPinWithKeyword($('.search-input').val())});
})
