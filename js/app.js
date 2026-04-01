/* ── Helpers ─────────────────────────────────────────────── */
function fmt(v) {
  return parseFloat(v || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function g(id) {
  return document.getElementById(id)?.value || '';
}

/* ── Totais ──────────────────────────────────────────────── */
function calcTotais() {
  let tp = 0, ts = 0;

  document.querySelectorAll('#body-pecas tr').forEach(r => {
    const inp = r.querySelector('td input[type=number]');
    if (inp) tp += parseFloat(inp.value || 0);
  });

  document.querySelectorAll('#body-servicos tr').forEach(r => {
    const inp = r.querySelector('td input[type=number]');
    if (inp) ts += parseFloat(inp.value || 0);
  });

  document.getElementById('tot-pecas').textContent  = 'R$ ' + fmt(tp);
  document.getElementById('tot-servicos').textContent = 'R$ ' + fmt(ts);
  document.getElementById('tot-geral').textContent   = 'R$ ' + fmt(tp + ts);
}

/* ── Adicionar linhas ────────────────────────────────────── */
function addPeca() {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input placeholder="Componente" /></td>
    <td><input placeholder="Especificação" /></td>
    <td><input placeholder="https://..." /></td>
    <td class="val-cell">
      <input type="number" placeholder="0,00" min="0" step="0.01" oninput="calcTotais()" />
    </td>
    <td style="text-align:center">
      <button class="btn-del" onclick="delRow(this)">×</button>
    </td>
  `;
  document.getElementById('body-pecas').appendChild(tr);
}

function addServico() {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input placeholder="Serviço" /></td>
    <td><textarea placeholder="Descrição detalhada..."></textarea></td>
    <td class="val-cell">
      <input type="number" placeholder="0,00" min="0" step="0.01" oninput="calcTotais()" />
    </td>
    <td style="text-align:center">
      <button class="btn-del" onclick="delRow(this)">×</button>
    </td>
  `;
  document.getElementById('body-servicos').appendChild(tr);
}

function delRow(btn) {
  btn.closest('tr').remove();
  calcTotais();
}

/* ── Número do orçamento no pill ─────────────────────────── */
function syncNum() {
  const val = document.getElementById('num').value;
  document.getElementById('num-display').textContent = 'Nº ' + val;
}

/* ── Gerar orçamento ─────────────────────────────────────── */
function gerarOrcamento() {
  const num      = g('num')      || '001/2026';
  const dataVal  = g('data');
  const validade = g('validade') || '15 dias';
  const cliente  = g('cliente')  || '—';
  const tecnico  = g('tecnico')  || '—';

  const dataFmt = dataVal
    ? new Date(dataVal + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  /* Peças */
  let pecasRows = '', totPecas = 0;
  document.querySelectorAll('#body-pecas tr').forEach(r => {
    const cells = r.querySelectorAll('td');
    const comp  = cells[0]?.querySelector('input')?.value || '';
    const esp   = cells[1]?.querySelector('input')?.value || '';
    const link  = cells[2]?.querySelector('input')?.value || '';
    const val   = parseFloat(cells[3]?.querySelector('input')?.value || 0);
    if (!comp) return;
    totPecas += val;
    const linkHtml = link
      ? `<a href="${link}" style="color:#1a6dc8;font-size:11px;">Ver link</a>`
      : '—';
    pecasRows += `
      <tr>
        <td>${comp}</td>
        <td>${esp || '—'}</td>
        <td>${linkHtml}</td>
        <td style="text-align:right">R$ ${fmt(val)}</td>
      </tr>`;
  });

  /* Serviços */
  let servsRows = '', totServs = 0;
  document.querySelectorAll('#body-servicos tr').forEach(r => {
    const cells = r.querySelectorAll('td');
    const serv  = cells[0]?.querySelector('input')?.value    || '';
    const desc  = cells[1]?.querySelector('textarea')?.value || '';
    const val   = parseFloat(cells[2]?.querySelector('input')?.value || 0);
    if (!serv) return;
    totServs += val;
    servsRows += `
      <tr>
        <td>${serv}</td>
        <td>${desc || '—'}</td>
        <td style="text-align:right">R$ ${fmt(val)}</td>
      </tr>`;
  });

  const totGeral = totPecas + totServs;
  const log = g('logistica') || '—';
  const exe = g('execucao')  || '—';
  const pz  = g('prazo')     || '—';
  const pc  = g('pix-chave') || '—';
  const pf  = g('pix-fav')   || '—';
  const pb  = g('pix-banco') || '—';

  const pecasSection = pecasRows ? `
    <div class="doc-sec">
      <h3>1. Peças e insumos</h3>
      <p>Itens adquiridos diretamente pelo cliente nos links abaixo:</p>
      <table>
        <thead>
          <tr>
            <th>Componente</th>
            <th>Especificação</th>
            <th>Link</th>
            <th style="text-align:right">Valor Ref.</th>
          </tr>
        </thead>
        <tbody>${pecasRows}</tbody>
      </table>
    </div>` : '';

  const servsSection = servsRows ? `
    <div class="doc-sec">
      <h3>2. Serviços profissionais</h3>
      <table>
        <thead>
          <tr>
            <th>Serviço</th>
            <th>Descrição</th>
            <th style="text-align:right">Valor</th>
          </tr>
        </thead>
        <tbody>${servsRows}</tbody>
      </table>
    </div>
    <div class="tot-doc">
      <small>* Peças por conta do cliente — cobrado apenas mão de obra</small>
      <strong>Total mão de obra: R$ ${fmt(totServs)}</strong>
    </div>` : '';

  const valorPix = totServs > 0 ? totServs : totGeral;

  document.getElementById('doc-content').innerHTML = `
    <div class="doc-header">
      <h2>Orçamento de Serviços<br>de TI</h2>
      <div class="doc-num">Nº ${num}</div>
    </div>

    <div class="doc-meta">
      <div><b>Cliente:</b> ${cliente}</div>
      <div><b>Data:</b> ${dataFmt}</div>
      <div><b>Técnico responsável:</b> ${tecnico}</div>
      <div><b>Validade:</b> ${validade}</div>
    </div>

    ${pecasSection}
    ${servsSection}

    <div class="doc-sec">
      <h3>3. Condições e prazos</h3>
      <div class="cond-doc">
        <b>Logística:</b> <span>${log}</span>
        <b>Execução:</b>  <span>${exe}</span>
        <b>Prazo:</b>     <span>${pz}</span>
      </div>
    </div>

    <div class="doc-sec">
      <h3>4. Pagamento da mão de obra</h3>
      <div class="pix-doc">
        <div class="pix-lbl">&#9632; Pague via PIX</div>
        <div>
          <span class="pix-sub">Chave PIX</span>
          <b>${pc}</b>
        </div>
        <div>
          <span class="pix-sub">Favorecido</span>
          <b>${pf} — ${pb}</b>
        </div>
        <div class="pix-val-doc">
          <span>Valor</span>
          <span>R$ ${fmt(valorPix)}</span>
        </div>
      </div>
    </div>

    <hr class="hr-doc">
    <p class="fnote">
      Este orçamento tem validade de ${validade}.
      Em caso de dúvidas, entre em contato com ${tecnico || 'o técnico responsável'}.
    </p>
  `;

  document.getElementById('formulario').style.display = 'none';
  document.getElementById('preview').style.display    = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Voltar para o formulário ────────────────────────────── */
function voltarForm() {
  document.getElementById('formulario').style.display = 'block';
  document.getElementById('preview').style.display    = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Imprimir / Salvar PDF ───────────────────────────────── */
function imprimir() {
  const conteudo = document.getElementById('doc-content').innerHTML;
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Orçamento</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --brand: #0f4c8a;
      --brand-light: #e6f1fb;
      --border: #dde3ea;
    }
    body {
      font-family: 'DM Sans', Arial, sans-serif;
      padding: 2.5rem;
      color: #111;
      font-size: 13px;
      background: #fff;
    }
    .doc-header {
      background: var(--brand);
      border-radius: 8px;
      padding: 1.4rem 1.8rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 1.4rem;
    }
    .doc-header h2 {
      color: #fff;
      font-size: 22px;
      font-weight: 400;
      line-height: 1.2;
      font-family: 'DM Serif Display', Georgia, serif;
    }
    .doc-num { color: rgba(255,255,255,.55); font-size: 12px; }
    .doc-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border: 0.5px solid var(--border);
      border-radius: 6px;
      margin-bottom: 1.4rem;
      overflow: hidden;
    }
    .doc-meta div { padding: 9px 14px; font-size: 12px; }
    .doc-meta div:nth-child(odd) { border-right: 0.5px solid var(--border); }
    .doc-meta div:nth-child(1),
    .doc-meta div:nth-child(2) { border-bottom: 0.5px solid var(--border); background: #f7fafd; }
    .doc-meta b { font-weight: 600; color: #3a5070; }
    .doc-sec { margin-bottom: 1.4rem; }
    .doc-sec h3 {
      color: var(--brand);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 2px solid var(--brand-light);
    }
    .doc-sec p { font-size: 11px; color: #888; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th {
      background: #f0f5fb;
      padding: 8px 10px;
      text-align: left;
      font-weight: 600;
      border: 0.5px solid var(--border);
      color: #3a5070;
      font-size: 11px;
    }
    td { padding: 7px 10px; border: 0.5px solid var(--border); vertical-align: top; }
    tbody tr:nth-child(even) td { background: #fafbfd; }
    .tot-doc {
      background: var(--brand);
      border-radius: 6px;
      padding: 11px 1.4rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 0.6rem 0 1.4rem;
    }
    .tot-doc small { color: rgba(255,255,255,.55); font-size: 11px; font-style: italic; }
    .tot-doc strong { color: #fff; font-size: 14px; font-weight: 600; }
    .pix-doc {
      border: 1.5px solid var(--brand);
      border-radius: 6px;
      display: grid;
      grid-template-columns: auto 1fr 1fr auto;
      overflow: hidden;
    }
    .pix-doc > div { padding: 11px 14px; border-right: 0.5px solid #b8d4ef; }
    .pix-doc > div:last-child { border-right: none; }
    .pix-lbl { background: #0c1929; color: #fff; font-weight: 700; font-size: 12px; display: flex; align-items: center; }
    .pix-sub { font-size: 10px; color: #888; display: block; margin-bottom: 3px; }
    .pix-val-doc {
      background: var(--brand);
      color: #fff;
      font-weight: 600;
      font-size: 14px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
    }
    .pix-val-doc span:first-child { font-size: 10px; opacity: .6; font-weight: 400; }
    .cond-doc { display: grid; grid-template-columns: auto 1fr; gap: 5px 14px; font-size: 12px; }
    .cond-doc b { font-weight: 600; color: #3a5070; }
    .hr-doc { border: none; border-top: 0.5px solid var(--border); margin: 1.2rem 0 0.6rem; }
    .fnote { font-size: 10px; color: #aaa; font-style: italic; text-align: center; }
    a { color: var(--brand); }
    @media print {
      body { padding: 0; }
      @page { margin: 1.5cm; }
    }
  </style>
</head>
<body>${conteudo}</body>
</html>`);
  w.document.close();
  setTimeout(() => w.print(), 600);
}

/* ── Init ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('data').value = new Date().toISOString().split('T')[0];
});
