#!/usr/bin/python
# _*_ coding: UTF-8 _*_

import os,sys
absp=os.path.dirname(os.path.abspath(__file__))
sys.path.append(absp)
os.chdir(absp)
import web
import json
import datetime
import time
from web.contrib.template import render_jinja
import urllib
urls = (
    "/loggin","loggin",
    "/index","index",
    "/addlog","addlog",
    "/wtest1","wtest1",
    "/query/item","queryitem",
    "/logdetail","logdetail",
    "/bgmanage","bgmanage",
)

app = web.application(urls,globals())

db = web.database(dbn='mysql',user='root',pw='root',db='webdb')
store = web.session.DBStore(db,'sessions')

item_user_id = 4

if web.config.get('_session') is None:
    session = web.session.Session(app,store,initializer={'login':None,'privilege':None})
    web.config.__session = session
else:
    session = web.config.__session

render = render_jinja('templates/',encoding = 'utf-8')

class DateEncoder(json.JSONEncoder):
    def default(self,obj):
        if isinstance(obj, datetime.datetime):
            return obj.strftime('%Y-%m-%d %H:%M:%S')
        elif isinstance(obj, datetime.date):
            return obj.strftime('%Y-%m-%d')
        else:
            return json.JSONEncoder.default(self, obj)
class loggin:
    def GET(self):
        return render.loggin()

    def POST(self):
        raise web.seeother("bgmanage")

class index:
    def GET(self):
        return render.index()

class bgmanage:
	def GET(self):
		return render.bgmanage()

class queryitem:
    def GET(self):
        web.header("content-type","text/json")
        itemname_opt= list(db.query("select distinct item_name from items_tb order by item_name"))
        return json.dumps(itemname_opt,cls=DateEncoder)

    def POST(self):
        web.header("content-type","text/json")
        sels_opts=webdata2dict(web.data())
        logdatas=getLogItem(sels_opts)
        return json.dumps(logdatas,cls=DateEncoder)


class logdetail:
    def POST(self):
        web.header("content-type","text/json")
        queDict=webdata2dict(web.data())
        logdetail=getLogDetail(queDict)
        return json.dumps(logdetail,cls=DateEncoder)




class addlog:
    def GET(self):
        web.header("content-type","text/json")
        itemnum_name = list(db.query("select item_num,item_name from items_tb where item_user_id=$datas",vars={"datas":item_user_id}))
        return json.dumps(itemnum_name,cls=DateEncoder)
    def POST(self):
        web.header("content-type","text/json")
        a = web.data()
        b=a.split("&")
        tempdata=[]
        for c in b:
            tempdata.append(c.split("="))
        itemdatas=dict(tempdata)
        itemdatas["logdata"]=urllib.unquote(itemdatas["logdata"])
        tempdatas=list(db.query("select item_id,sub_unit from items_tb where item_num=$data1 and item_user_id=$data2",vars={"data1":itemdatas["logitemnum"],"data2":item_user_id}))[0]
        db.insert("logcontent_tb",log_type=tempdatas["sub_unit"],log_status=itemdatas["logstatus"],log_data=itemdatas["logdata"],u_time=getdate(),log_item_id=tempdatas["item_id"])
        if itemdatas["logdataAppend"]:
            itemdatas["logdataAppend"]=urllib.unquote(itemdatas["logdataAppend"])
            templogid=list(db.query("select log_id from logcontent_tb where u_time=$data1 and log_item_id=$data2",vars={"data1":getdate(),"data2":tempdatas["item_id"]}))[0]
            db.insert("event_tb",event_content=itemdatas["logdataAppend"],event_log_id=templogid["log_id"],event_user_id=item_user_id)
        return json.dumps('itemdatas',cls=DateEncoder)
class wtest1:
    def POST(self):
        web.header("content-type","text/json")
        itemnum=web.data()
        itemid=list(db.query("select item_id from items_tb where item_num=$data1 and item_user_id=$data2",vars={"data1":itemnum,"data2":item_user_id}))[0]["item_id"]
        utime=getdate()
        tempdata=db.query("select * from logcontent_tb where u_time=$data1 and log_item_id=$data2",vars={"data1":utime,"data2":itemid})
        if tempdata:
            qu_result=list(tempdata)[0]
            tempdata2=db.query("select * from event_tb where event_log_id=$data1 and event_user_id=$data2 order by event_id",vars={"data1":qu_result["log_id"],"data2":item_user_id})
            if tempdata2:
                tempdata2=list(tempdata2)[0]
                qu_result["event_content"]=tempdata2["event_content"]
                qu_result["event_userid"]=tempdata2["event_user_id"]
                qu_result["create_time"]=tempdata2["evt_cre_time"]
        else:
            qu_result=None

        return json.dumps(qu_result,cls=DateEncoder)

def getdate():
    if 25>int(time.strftime("%d"))>9:
        curdate=time.strftime("%Y-%m")+"-10"
    else:
        curdate=time.strftime("%Y-%m")+"-25"
    return curdate

def webdata2dict(webdatas):
    url2utf=urllib.unquote(webdatas)
    temp1=url2utf.split("&")
    temp2=[]
    for c in temp1:
        temp2.append(c.split("="))
    return dict(temp2)

def getLogItem(sels_opts):
    timeSt=urllib.unquote(sels_opts['timeSt'])
    timeEnd=urllib.unquote(sels_opts['timeEnd'])
    itemNa=urllib.unquote(sels_opts['itemNa'])
    logTy=urllib.unquote(sels_opts['logTy'])
    logSt=urllib.unquote(sels_opts['logSt'])

    iftime = timeSt+'<c.u_time<'+timeEnd

    sqlstr="""select
                c.log_id,
                c.log_type,
                c.log_status,
                c.log_data,
                c.u_time,
                c.create_time,
                d.item_name,
                d.item_user_id
                from (select * from logcontent_tb) as c
                left join
                items_tb as d
                on c.log_item_id=d.item_id
                where (
            """+iftime+')'

    if itemNa:
        ifitemNa = 'd.item_name="'+itemNa+'"'
        sqlstr=sqlstr+' and '+ifitemNa

    if logTy != 'all':
        iflogTy='c.log_type="'+logTy+'"'
        sqlstr=sqlstr+' and '+iflogTy

    if logSt != "all":
        iflogSt='c.log_status="'+logSt+'"'
        sqlstr=sqlstr+' and '+iflogSt

    sqlstr=sqlstr+' order by c.u_time,d.item_num,c.log_type,c.log_id'
    return list(db.query(sqlstr))

def getLogDetail(queOpts):
    utime=urllib.unquote(queOpts['q_utime'])
    itemname=urllib.unquote(queOpts['q_itemname'])
    logsta=urllib.unquote(queOpts['q_logsta'])
    logtype=urllib.unquote(queOpts['q_logtype'])
    queStr1='''
        select
    e.create_time as ctime,
    e.evt_cre_time as evt_ctime,
    e.log_data,
    e.event_content as evt_cont,
    e.log_user,
    f.user_name as evt_user
    from (
    select
    a.create_time,
    c.evt_cre_time,
    a.log_data,
    c.event_content,
    d.user_name as log_user,
    c.event_user_id,
    b.item_name,
    a.log_type,
    a.log_status,
    a.u_time
    from logcontent_tb as a
    left join
    items_tb as b
    on a.log_item_id=b.item_id
    left join
    event_tb as c
    on a.log_id=c.event_log_id
    left join
    users_tb as d
    on b.item_user_id=d.user_id
    ) as e
    left join
    users_tb as f
    on e.event_user_id=f.user_id
    '''
    queStr2=' where e.item_name="'+itemname+'"'
    queStr2=queStr2+' and e.u_time="'+utime+'"'
    queStr2=queStr2+' and e.log_type="'+logtype+'"'
    queStr2=queStr2+' and e.log_status="'+logsta+'"'
    queStr2=queStr2+' order by evt_ctime'
    queStr=queStr1+queStr2
    return list(db.query(queStr))

if __name__ == '__main__':
    app.run()
