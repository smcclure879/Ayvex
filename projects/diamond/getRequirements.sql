select
  c.nct_id,s.brief_title,e.criteria

from conditions c
inner join studies s    on c.nct_id=s.nct_id
inner join eligibilities e    on s.nct_id=e.nct_id

where
  c.name like 'Diabetes'
  and s.overall_status='Recruiting'


;
