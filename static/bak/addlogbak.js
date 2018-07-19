var jq=$.noConflict();
jq(document).ready(function(){
var l1num = 1

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
	})


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

