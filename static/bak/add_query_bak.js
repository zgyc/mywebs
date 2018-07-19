var jq=$.noConflict();
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

jq(document).ready(function(){
//避免重复添加
var l1num = 1

//单击查询自动赋值于起始日期、项目名称下拉列表
jq("#logquebtn").click(function(){
	jq("#itemNameList").hide();
	jq("#blockRight").load("static/query.html");
	//填充项目名称下拉列表
	jq.ajax({
	url:"query/item",
	type:"get",
	success:function(itemname_opt){
	//赋值起始日期
	jq("#time1").attr("value",getprevdate());
	jq("#time2").attr("value",getcurrdate());
	for (var i=0;i<itemname_opt.length;i++){
			jq("#itemname_dtl").append("<option value='"+itemname_opt[i].item_name+"'>");
			};
		},
	})
});

//完成查询功能
jq('#blockRight').on('click','#querybtn',function(){
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
		jq("#bodycontent").empty()
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
			jq("#curlog").append("<lable id='seqid' class='content_lab' for='content'>seq:1</lable>");
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
						jq("#seqid").text("seq:"+(i+1))
						if (logdatas[i].event_content){
							jq("#content").text(decodeURI(logdatas[i].log_data+'%0a'+logdatas[i].event_content))
							} else {
							jq("#content").text("空")};
					}
					}
				jq("#bodycontent").children().first().clone().appendTo("#bodycontent")
				jq("#bodycontent").children().first().remove()
				}
		}else{
			alert("无记录")}
	}
	})
	}else {
		alert("结束时间必须大于开始时间")};
});

//进入日志添加
jq("#logaddbtn").click(function(){
	jq("#itemNameList").toggle();
	jq("#blockRight").load("static/addlog.html");
});
//初始化左侧列表
		jq.ajax({
			url:"addlog",
			type:"get",
			success:function(itemnum_name){
				if (l1num==1){
					for (var i=0;i<itemnum_name.length;i++){
						jq("#itemNameList").append("<li class='itemnum_nam' id='"+itemnum_name[i].item_num+"'><a>"+itemnum_name[i].item_num+':'+itemnum_name[i].item_name+"</a></li>");
					};
					}
				l1num=0},
			});
	jq("#itemNameList").hide();
//左侧列表单击获取项目num及name
	jq('#itemNameList').on('click','.itemnum_nam',function(){
	var numName=jq(this).text()
	logitemnum=numName.substring(0,4)	
	jq("#num_name").empty()
	jq("#num_name").append(numName)	
	//填充test
	jq.ajax({
			url:"wtest1",
			type:"post",
			data:logitemnum,
			success:function(qu_result){
				if (qu_result)
				{
					document.getElementById("testarea1").value=decodeURI(qu_result.log_data);
					if (qu_result.event_content)
					{document.getElementById("testarea2").value=decodeURI(qu_result.event_content)}
					else
					{document.getElementById("testarea2").value="none"};

					document.getElementById("testarea1").readOnly=true;
					document.getElementById("testarea2").readOnly=true;
					document.getElementById("btn1").disabled=true;
				}
				else
				{
					document.getElementById("testarea1").value="";
					document.getElementById("testarea2").value="";
					document.getElementById("testarea1").readOnly=false;
					document.getElementById("testarea2").readOnly=false;
					document.getElementById("btn1").disabled=false;
				}
			},
		})
	});


//提交到数据库
	jq("#blockRight").on("click","#btn1",function(){
		logstatus=jq("#logstatus").val()
		logdata=jq("#testarea1").val()
		logdataAppend=jq("#testarea2").val()
		if (jq("#num_name").text()){
		jq.ajax({
			url:"addlog",
			type:"post",
			data:{
				"logitemnum":logitemnum,
				"logstatus":logstatus,
				"logdata":encodeURI(logdata),
				"logdataAppend":encodeURI(logdataAppend)
				},
			success:function(){
				alert("submit success");
					document.getElementById("testarea1").readOnly=true;
					document.getElementById("testarea2").readOnly=true;
					document.getElementById("btn1").disabled=true;
			},
		})
		}
		else {alert('select item_name')}
		})

	});

