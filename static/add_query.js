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
		if (logdatas.length>0){
			jq("#bodycontent").append("<div id='labs' class=''></div>");
			jq("#labs").append("<lable id='seq_i' class='content_lab' style='width:50px;'>序号</lable>");
			jq("#labs").append("<lable id='itemname' class='content_lab' style='width:200px;'>项目名称</lable>");
			jq("#labs").append("<lable id='logcls' class='content_lab' style='width:120px;'>日志分类</lable>");
			jq("#labs").append("<lable id='logrst' class='content_lab' style='width:120px;'>分析结果</lable>");
			jq("#labs").append("<lable id='time_c' class='content_lab' style='width:200px;'>创建时间</lable>");
			jq("#labs").append("<lable id='time_sub' class='content_lab' style='width:200px;'>提交日期</lable>");

			jq("#bodycontent").append("<div id='log' class='logcontent'></div>");
			jq("#log").append("<div id='lab' class='lab'></div>");
			jq("#lab").append("<lable id='seq' class='' style='width:45px;'>1</lable>");
			jq("#lab").append("<lable id='l_name' style='width:200px;'></lable>");
			jq("#lab").append("<lable id='l_clas' style='width:120px;'></lable>");
			jq("#lab").append("<lable id='l_sta' style='width:120px;'></lable>");
			jq("#lab").append("<lable id='l_ct' style='width:200px;'></lable>");
			jq("#lab").append("<lable id='l_ut' style='width:110px;'></lable>");
			jq("#lab").append("<input type='button' id='l_bt'  value='btn' style='width:50px;'></input>");

			jq("#l_ct").text(logdatas[0].create_time)
			jq("#l_ut").text(logdatas[0].u_time)
			jq("#l_name").text(logdatas[0].item_name)
			jq("#l_clas").text(logdatas[0].log_type)
			jq("#l_sta").text(logdatas[0].log_status)
			if (logdatas.length>1){
				for (var i=1;i<logdatas.length;i++){
					jq("#lab").clone().appendTo("#log")
					jq("#seq").text(i+1)
					jq("#l_ct").text(logdatas[i].create_time)
					jq("#l_ut").text(logdatas[i].u_time)
					jq("#l_name").text(logdatas[i].item_name)
					jq("#l_clas").text(logdatas[i].log_type)
					jq("#l_sta").text(logdatas[i].log_status)
				}
				jq("#log").children().first().clone().appendTo("#log")
				jq("#log").children().first().remove()
			}
		}else{
			alert("无记录")}
	}
	}) 
	}else {
		alert("结束时间必须大于开始时间")};
});
	//查询详情
		var temp=1
	jq('#blockRight').on('click','#l_bt',function(){
		var currObj=jq(this)
if (temp==1){
			jq.ajax({
			url:'logdetail',
			type:'post',
			data:{
						'q_utime':currObj.siblings('#l_ut').text(),
						'q_itemname':currObj.siblings('#l_name').text(),
						'q_logsta':currObj.siblings('#l_sta').text(),
						'q_logtype':currObj.siblings('#l_clas').text()},
			success:function(logdetail){
				if (logdetail.length>0){
						currObj.parent().append("<div id='logdes' class='logdes'></div")
						currObj.parent().children('#logdes').append("<textarea id='logdet' class='logcls'></textarea");
						currObj.parent().children('#logdes').append("<lable id='logded' class='logcls'></lable>")
						currObj.parent().children('div').children().last().text(decodeURI(logdetail[0].ctime));
						currObj.parent().children('div').children().first().text(decodeURI(logdetail[0].log_data));
					if (logdetail[0].evt_cont){
						currObj.parent().append("<div id='logdee1' class='logdes'></div")
						currObj.parent().children('#logdee1').append("<textarea id='logdete1' class='logcls'></textarea");
						currObj.parent().children('#logdee1').append("<lable id='logdede1' class='logcls'></lable");
						currObj.parent().children('div').last().children().last().text(decodeURI(logdetail[0].evt_ctime));
						currObj.parent().children('div').last().children().first().text(decodeURI(logdetail[0].evt_cont));
						if (logdetail.length>1){
							for (var i=1;i<logdetail.length;i++){
							currObj.parent().append("<div id='logdees' class='logdes'></div")
							currObj.parent().children('div').last().append("<textarea id='logdetes' class='logcls'></textarea");
							currObj.parent().children('div').last().append("<lable id='logdedes' class='logcls'></lable");
							currObj.parent().children('div').last().children().last().text(decodeURI(logdetail[i].evt_ctime));
							currObj.parent().children('div').last().children().first().text(decodeURI(logdetail[i].evt_cont));
							}
						};
					};

				}else{
					alert('None')
				};
					
							}
		})
	temp=0
}else{
	currObj.parent().children('div').remove()
	temp=1
}
	})

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

