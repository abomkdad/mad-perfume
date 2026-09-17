import sqlite3, pathlib, re
db=sqlite3.connect(':memory:')
for migration in sorted(pathlib.Path('drizzle').glob('*.sql')):
    db.executescript(migration.read_text())
source=pathlib.Path('app/api/ingest/route.ts').read_text()
insert=re.search(r"prepare\('(INSERT OR IGNORE INTO sales[^']+)'\)",source).group(1)
args=('sale-1','25351','register-1','Cashier',100000,34900,'ILS','cash','[]','queued',200000,190000,'second',0)
db.execute(insert,args);db.execute(insert,args)
assert db.execute('SELECT count(*) FROM sales').fetchone()[0]==1
db.execute('INSERT INTO mappings VALUES(?,?,?,?,?)',('25351','register-1','test-device',2,30))
job_source=pathlib.Path('app/api/jobs/route.ts').read_text()
claim=re.search(r'prepare\(`(UPDATE sales SET status=\x27processing\x27.+?RETURNING \*)`\)',job_source).group(1)
eligible=re.search(r'eligibleSQL=`([^`]+)`',pathlib.Path('lib/management.ts').read_text()).group(1)
claim=claim.replace('${eligibleSQL}',eligible)
db.execute("INSERT INTO registers VALUES('reg','25351','register-1',1)")
db.execute("INSERT INTO devices VALUES('test-device','Test',4,1)")
assert db.execute(claim,('lease-1',500000,0,180000,180000)).fetchone() is None
row=db.execute(claim,('lease-1',500000,0,200000,200000)).fetchone();assert row is not None
assert db.execute(claim,('lease-2',700000,0,210000,210000)).fetchone() is None
row=db.execute(claim,('lease-2',1200000,0,600000,600000)).fetchone();assert row is not None
assert db.execute('SELECT attempts,lease FROM sales').fetchone()==(2,'lease-2')
stale=db.execute("UPDATE sales SET status='ready' WHERE id=? AND lease=?",('sale-1','lease-1'));assert stale.rowcount==0
db.execute("UPDATE sales SET attempts=5,lease_until=0")
expire=re.search(r'prepare\("(UPDATE sales SET status=\x27failed\x27.+?)"\)',job_source).group(1)
db.execute(expire,(600000,));assert db.execute('SELECT status FROM sales').fetchone()[0]=='failed'
assert db.execute(claim,('lease-3',2000000,0,1000000,1000000)).fetchone() is None
print('PASS: duplicate import, post-roll wait, exclusive lease, crash recovery, stale acknowledgement, retry limit')
