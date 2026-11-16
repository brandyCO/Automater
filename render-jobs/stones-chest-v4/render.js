// usage: node render.js stills t1,t2,...  |  node render.js video fps outdir  |  node render.js events
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const dir = __dirname;
const srv = http.createServer((q, r) => {
  const f = path.join(dir, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; }
    const ty = f.endsWith('.json') ? 'application/json' : f.endsWith('.html') ? 'text/html' : f.endsWith('.woff2') ? 'font/woff2' : 'application/octet-stream';
    r.writeHead(200, { 'Content-Type': ty }); r.end(d); });
});
async function page(browser, port) {
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  p.on('console', m => console.log('[page]', m.text())); p.on('pageerror', e => console.log('[err]', e.message));
  await p.goto(`http://127.0.0.1:${port}/${process.env.REEL||'reel.html'}`); await p.evaluate(() => window.ready); if (process.env.SAFE) await p.evaluate(() => { window.SAFE = 1; }); return p;
}
(async () => {
  await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const mode = process.argv[2];
  if (mode === 'trace') {
    const p = await page(browser, port); const tr = await p.evaluate(() => window.simTrace()); fs.writeFileSync(path.join(dir, 'trace.json'), JSON.stringify(tr)); console.log('trace ok');
  } else if (mode === 'events') {
    const p = await page(browser, port); const ev = await p.evaluate(() => window.events());
    fs.writeFileSync(path.join(dir, 'events.json'), JSON.stringify(ev, null, 0)); const wt = await p.evaluate(() => window.warpTable ? {warp: window.warpTable(), end: window.REAL_END()} : null); if (wt) fs.writeFileSync(path.join(dir, 'warp.json'), JSON.stringify(wt)); console.log(ev.length, 'events');
  } else if (mode === 'stills') {
    const p = await page(browser, port); fs.mkdirSync(path.join(dir, 'stills'), { recursive: true });
    for (const t of process.argv[3].split(',').map(Number)) {
      await p.evaluate(t => window.draw(t), t);
      await p.screenshot({ path: path.join(dir, 'stills', `t${t.toFixed(2)}.jpg`), type: 'jpeg', quality: 85 });
    }
  } else {
    const fps = +process.argv[3], out = process.argv[4]; const MAP = process.env.MAPFILE ? JSON.parse(fs.readFileSync(path.join(dir, process.env.MAPFILE)))[process.env.PIECE] : null; const n = MAP ? MAP.length : Math.round((+process.env.DUR||46.5) * fps), workers = 4;
    fs.mkdirSync(out, { recursive: true });
    const t0 = Date.now();
    await Promise.all([...Array(workers)].map(async (_, w) => {
      const p = await page(browser, port);
      const A = +process.env.FROM || 0, B = Math.min(n, +process.env.TO || n);
      for (let i = A + w; i < B; i += workers) {
        await p.evaluate(t => window.draw(t), MAP ? MAP[i] : (+process.env.START||0) + i / fps);
        await p.screenshot({ path: path.join(out, `f${String(i).padStart(5, '0')}.png`), type: 'png' });
        if ((i - A) % 50 < workers) console.log('frame', i, ((Date.now() - t0) / 1000).toFixed(0) + 's');
      }
    }));
  }
  await browser.close(); srv.close();
})();
