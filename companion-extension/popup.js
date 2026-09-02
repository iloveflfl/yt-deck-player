'use strict';
const $ = (s) => document.querySelector(s);
const send = (msg) => new Promise((res) => chrome.runtime.sendMessage(msg, res));

function paint(paired) {
  $('#pairBox').classList.toggle('hide', paired);
  $('#pairedBox').classList.toggle('hide', !paired);
  $('#hint').classList.toggle('hide', paired);
}

async function refresh() {
  const s = await send({ type: 'status' });
  paint(!!(s && s.paired));
}

$('#pairBtn').addEventListener('click', async () => {
  const msg = $('#msg');
  msg.textContent = 'Pairing...';
  msg.className = 'status';
  const r = await send({ type: 'pair', code: $('#code').value });
  if (r && r.ok) { msg.textContent = ''; refresh(); }
  else { msg.textContent = (r && r.error) || 'Pairing failed'; msg.className = 'status err'; }
});

$('#code').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#pairBtn').click(); });

$('#unpairBtn').addEventListener('click', async () => {
  await send({ type: 'unpair' });
  $('#msg').textContent = '';
  refresh();
});

refresh();
