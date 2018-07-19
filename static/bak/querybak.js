<script>
//处理日期与月份（小于10添加"0"）
function md(s){
	return s<10 ? "0"+s:s;
}
//获取当前日期（查询结束日期）
function getcurrdate(){
	var currYear=new Date().getFullYear();
	var currMonth=new Date().getMonth()+1;
	var currDate=new Date().getDate();
	var currD=currYear+"-"+md(currMonth)+"-"+md(currDate);
	return currD;
}
//获取日期（查询开始日期）
function getprevdate(){
	var currYear=new Date().getFullYear();
	var currMonth=new Date().getMonth()+1;
	var lastMonth=new Date().getMonth();
	var currDate=new Date().getDate();
	var prevYear=0;
	var prevMonth=0;
	if (currMonth==0){
		prevYear=currYear-1;
		prevMonth=12;
	}else{
		prevYear=currYear;
		prevMonth=currMonth-1;
	}
	if (currDate>25){
		currDate=10
		prevMonth=prevMonth+1
	}else if (currDate>10){
		currDate=25
	}else{currDate=10}
	var prevD=prevYear+"-"+md(prevMonth)+"-"+currDate;
	return prevD;
}
//
jq(document).ready(function(){
//避免重复添加项目名称
var itemname_tag = 1

//单击查询自动赋值于起始日期、项目名称下拉列表
jq("#logquebtn").click(function(){
	jq("#blockRight").load("static/query.html");
//赋值起始日期
//alert("123")
jq("#time1").attr("value",getprevdate())
jq("#time2").attr("value",getcurrdate())
//填充项目名称下拉列表
jq.ajax({
	url:"query/item",
	type:"get",
	success:function(itemname_opt){
	if (itemname_tag==1){
		for (var i=0;i<itemname_opt.length;i++){
			jq("#itemname_dtl").append("<option value='"+itemname_opt[i].item_name+"'>");
			};
	itemname_tag = 0};
	},
	})
		});
//完成查询功能
jq("#querybtn").click(function(){
	if (jq("#time2").val()>jq("#time1").val()){
	jq.ajax({
	url:"query/item",
	type:"post",
	data:{
	"timeSt":jq("#time1").val(),
	"timeEnd":jq("#time2").val(),
	"itemNa":encodeURI(jq("#itemname_sel").val()),
	"logTy":encodeURI(jq("#logtype_sel").val()),
	"logSt":encodeURI(jq("#logstatus_sel").val())},
	success:function(logdatas){
		if (logdatas){
			jq("#bodycontent").append("<div id='log' class='logcontent'></div>");
			jq("#log").append("<div id='lab' class='lab'></div>");
			jq("#lab").append("<lable class='content_lab'>项目名称:</lable>");
			jq("#lab").append("<b id='b_name'></b>");
			jq("#lab").append("<lable class='content_lab'>日志分类:</lable>");
			jq("#lab").append("<b id='b_clas'></b>");
			jq("#lab").append("<lable class='content_lab'>分析结果:</lable>");
			jq("#lab").append("<b id='b_sta'></b>");
			jq("#lab").append("<lable class='content_lab'>创建时间:</lable>");
			jq("#lab").append("<b id='b_ct'></b>");
			jq("#lab").append("<lable class='content_lab'>提交日期:</lable>");
			jq("#lab").append("<b id='b_ut'></b>");
			jq("#log").append("<div id='curlog' class='currlog'></div>");
			jq("#curlog").append("<lable class='content_lab' for='content'>seq</lable>");
			jq("#curlog").append("<textarea id='content' class='contents'></textarea>");
			jq("#curlog").append("<button id='addcanc' class='contbtn'>add_cancel</button>");
			jq("#b_ct").text(logdatas[0].create_time)
			jq("#b_ut").text(logdatas[0].u_time)
			jq("#b_name").text(logdatas[0].item_name)
			jq("#b_clas").text(logdatas[0].log_type)
			jq("#b_sta").text(logdatas[0].log_status)
			if (logdatas[0].log_data){
				jq("#content").text(decodeURI(logdatas[0].log_data))
			} else {
				jq("#content").text("空")};
			if (logdatas.length>1){
				for (var i=1;i<logdatas.length;i++){
					if (logdatas[i].log_id==logdatas[i-1].log_id){
						jq("#curlog").clone().appendTo("#log")
						if (logdatas[i].event_content){
							jq("#content").text(decodeURI(logdatas[i].log_data+logdatas[i].event_content))
							} else {
							jq("#content").text("空")};
					}else{
						jq("#log").clone().appendTo("#bodycontent")
						jq("#b_ct").text(logdatas[i].create_time)
						jq("#b_ut").text(logdatas[i].u_time)
						jq("#b_name").text(logdatas[i].item_name)
						jq("#b_clas").text(logdatas[i].log_type)
						jq("#b_sta").text(logdatas[i].log_status)
						if (logdatas[i].event_content){
							jq("#content").text(decodeURI(logdatas[i].log_data+'%0a'+logdatas[i].event_content))
							} else {
							jq("#content").text("空")};
					}
					}
				}
		}else{
			alert("无记录")}
	}
	})
	}else {
		alert("结束时间必须大于开始时间")};
})
})
</script>
