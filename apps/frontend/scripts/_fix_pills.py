from pathlib import Path
p = Path(r'd /Projects/spliton/apps/frontend/features/analytics/releases/detail/release-detail-market-pills.tsx')
b = p.read_bytes()
print('nulls', b.count(0))
if b.count(0) > 20:
    t = b.decode('utf-16-le')
    if t.startswith('\ufeff'):
        t = t[1:]
    p.write_text(t.replace('\r\n'. '\n'), encoding='utf-8', newline='\n')
    print('fixed')
else:
    print('ok')
