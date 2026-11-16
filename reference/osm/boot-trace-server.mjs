// boot trace receiver: GET /log?m=... appended to boot-trace.log
import http from 'http';
import fs from 'fs';

const OUT = new URL('./boot-trace.log', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/log') {
    const m = url.searchParams.get('m') ?? '';
    fs.appendFileSync(OUT, `${new Date().toISOString()} ${m}\n`);
    console.log(m);
  }
  res.writeHead(204, { 'Access-Control-Allow-Origin': '*' });
  res.end();
});
server.listen(8124, '127.0.0.1', () => console.log('trace server on 8124'));
