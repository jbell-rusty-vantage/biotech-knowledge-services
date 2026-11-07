import re,sys,html
x=open(sys.argv[1],'rb').read().decode('utf8')
t=re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',x)))
open(sys.argv[2],'wb').write(t.encode('utf8'))
