function slugify (url) {
	var regex = /[^/]+$/;
	var slug = url.match(regex);
	console.log(slug[0]);
	return slug[0];
}


function ajax (url) {
	console.log(url);
	$.ajax({
		url: url,
		type: 'POST',
		dataType: 'json',
		data: {
			"slug": slugify(url),
		},
		success: function(res){
			alert("success");
		},
		error: function(data){
			console.log("ERROR " + data);
		}
	});
}

$(document).ready(function(){
	$('#upvote').click(function(){
		ajax( $('#upvote').val() );
	});
});
