jq(document).ready(function(){
	
jq("#nav_user").click(function(){
	jq("#blockRight").empty()
	jq("#blockRight").load("static/userManage.html")
})



})
