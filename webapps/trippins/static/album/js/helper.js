function showComment(pid) {
	document.getElementById('light'.concat(pid)).style.display='block';
}
function hideComment(pid) {
	document.getElementById('light'.concat(pid)).style.display='none';
}
function sendComment(pid) {
	console.log($('#comment-box'.concat(pid)));
	var content = $('#comment-box'.concat(pid)).val();
	$.ajaxSetup({
		beforeSend: function(xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    });
	$.ajax({
		url:"/addcomment/".concat(pid),
		type:"POST",
		data:{'content':content},
		success:function() {
			hideComment(pid);
			refreshComment();
		},
		error: function() {
			hideComment(pid);
		}
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
var csrftoken = getCookie('csrftoken');
refreshComment();

function refreshComment() {
	var comment = $('.embed-comments'); 
	comment.empty();
	var postId = comment.attr('data-post-id');
	$.ajax({
	        url: "/getcomments/" + postId,
	        type: "GET",
	        success: function(data) {
						console.log(data);
						//Cache this if you can
						for (obj in data.comments) {
							var item = data.comments[obj].comment;
							var itemRow = MakeCommentRow(item);
							comment.append(  itemRow );
						}
					},
			error: function(xhr, errmsg, err){
	                console.log(xhr.status + ": " + xhr.responseText);
	                console.log("msg" + errmsg);
	                // provide a bit more info about the error to the console
	            }
		}
	);
} 

  
 
 
function MakeCommentRow(object){
	console.log(object);
	  var row = '<div class="UFIRow clearfix">'+ "\n" +
	  '<div class="ufithumbwrap">'+ "\n" +
	  '</div>'+ "\n" +
	  '<div>'+ "\n" +
	  '   <div class="clearfix UFIImageBlockContent ">'+ "\n" +
	  '      <div class="UFICommentContentBlock">'+ "\n" +
	  '        <div class="UFICommentContent">'+ "\n" +
	  '          <a href="/timeline/'+ object.id +'" class="UFICommentActorName">'+ "\n" +
	  object.username + ":\n" +
	  '          </a>'+ "\n" +
	  '          <span class="UFICommentBody">'+ "\n" + object.content + "\n"            
	  '          </span>'+ "\n" +
	  '        </div>'+ "\n" +
	  '      </div>'+ "\n" +
	  '   </div>'+ "\n" +
	  '</div>'+ "\n" +
	  '<div class="clearfix"></div>'+ "\n" +  
	  '</div>';
return row;
}