select c.log_id,
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
	where '2018-06-10'<c.u_time<'2018-07-10' and c.log_status='normal' and d.item_name='浙江台'
	order by c.u_time,d.item_num,c.log_type,c.log_id;


select * from logcontent_tb as log left join event_tb as evn on log.log_id=evn.event_log_id;


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
where e.item_name="成都台全台网"