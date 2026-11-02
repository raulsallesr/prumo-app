const CACHE = 'prumo-435d70a8f22e'
const PRECACHE = [
  "./",
  "./assets/AjustesPagina-VqqlPcLo.js",
  "./assets/AntesDeGastarPagina-Czj0LUNC.js",
  "./assets/CampoControle-MbX0NCMh.js",
  "./assets/CartoesPagina-1e3sjWZj.js",
  "./assets/DestinoPagina-XMUj8Y0n.js",
  "./assets/FormCartao-yy2syDYd.js",
  "./assets/FormLancamento-pt4PtUTv.js",
  "./assets/FormRecorrencia-Dh3YaR6S.js",
  "./assets/HojePagina-DfEr_KWc.js",
  "./assets/ImportarPagina-Bwk7RoWe.js",
  "./assets/NavegacaoMes-Bf41Dzmn.js",
  "./assets/PlanoPagina-DS1y2R6a.js",
  "./assets/ResultadosDetalhados-Ci0pfor2.js",
  "./assets/SaldosPagina-Cw0U9wbz.js",
  "./assets/SeletorCategoria-D3nDAU7J.js",
  "./assets/SeloValidacaoTextos-BR5WvYkI.js",
  "./assets/SimuladorPagina-B-DytGAg.css",
  "./assets/SimuladorPagina-Sdf3eqjV.js",
  "./assets/TotaisPagina-mN0UL0jA.js",
  "./assets/TravessiaApertoDialogo-D02zbNVu.js",
  "./assets/backupLembrete-DDE3cJrX.js",
  "./assets/checklistDispensado-BelZ49yE.js",
  "./assets/compartilhar-BzK7LwiO.js",
  "./assets/controle-B_5ftamf.css",
  "./assets/controle-Dw2RczqC.js",
  "./assets/diagnostico.worker-BJid57cd.js",
  "./assets/index-BRaQBuHr.css",
  "./assets/index-JzX3GMxg.js",
  "./assets/jsx-runtime-G0LVwMXR.js",
  "./assets/montecarlo.worker-Dm262AjB.js",
  "./assets/textos-BSZFcUth.js",
  "./assets/ui-DYUyp2-Y.js",
  "./assets/useControle-BZJQ-tud.js",
  "./icon-prumo-192.png",
  "./icon-prumo-512.png",
  "./icon-prumo-maskable-512.png",
  "./icon-prumo.svg",
  "./index.html",
  "./manifest.webmanifest",
  "./robots.txt",
  "./tema-inicial.js"
]
const deveIgnorarCache = function deveIgnorarCache(caminho, possuiAutorizacao) {
	if (possuiAutorizacao) return true;
	return [
		"/api/",
		"/rest/",
		"/auth/"
	].some((prefixo) => caminho === prefixo.slice(0, -1) || caminho.startsWith(prefixo));
}
const podeArmazenarNoCache = function podeArmazenarNoCache(caminho, estaNoPrecache, possuiAutorizacao) {
	if (possuiAutorizacao) return false;
	if ([
		"/api/",
		"/rest/",
		"/auth/"
	].some((prefixo) => caminho === prefixo.slice(0, -1) || caminho.startsWith(prefixo))) return false;
	const nomeArquivo = caminho.slice(caminho.lastIndexOf("/") + 1);
	const ehIcone = caminho.startsWith("/icons/") || nomeArquivo.startsWith("icon-") && /\.(?:ico|png|svg|webp)$/.test(nomeArquivo);
	const ehManifest = caminho.endsWith("/manifest.webmanifest");
	return estaNoPrecache || caminho.startsWith("/assets/") || ehIcone || ehManifest;
}
const podeAtualizarIndiceDaNavegacao = function podeAtualizarIndiceDaNavegacao(respostaOk) {
	return respostaOk;
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((nome) => (nome.startsWith('prumo-') && nome !== CACHE) || nome.startsWith('horizonte-')).map((nome) => caches.delete(nome))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const requisicao = event.request
  const url = new URL(requisicao.url)
  if (requisicao.method !== 'GET' || url.origin !== self.location.origin) return
  if (url.searchParams.has('conectividade')) {
    event.respondWith(fetch(requisicao))
    return
  }

  const possuiAutorizacao = requisicao.headers.has('Authorization')
  if (deveIgnorarCache(url.pathname, possuiAutorizacao)) {
    event.respondWith(fetch(requisicao))
    return
  }

  if (requisicao.mode === 'navigate') {
    event.respondWith(
      fetch(requisicao)
        .then((resposta) => {
          if (!podeAtualizarIndiceDaNavegacao(resposta.ok)) {
            return caches.match('./index.html').then((armazenada) => armazenada || caches.match('./'))
          }
          const copia = resposta.clone()
          caches.open(CACHE).then((cache) => cache.put('./index.html', copia))
          return resposta
        })
        .catch(() => caches.match('./index.html').then((resposta) => resposta || caches.match('./'))),
    )
    return
  }

  const estaNoPrecache = PRECACHE.some((arquivo) => new URL(arquivo, self.location.href).pathname === url.pathname)
  if (!podeArmazenarNoCache(url.pathname, estaNoPrecache, possuiAutorizacao)) {
    event.respondWith(fetch(requisicao))
    return
  }

  event.respondWith(
    caches.match(requisicao, { ignoreVary: true }).then((armazenada) => armazenada || fetch(requisicao).then((resposta) => {
      if (resposta.ok) caches.open(CACHE).then((cache) => cache.put(requisicao, resposta.clone()))
      return resposta
    })),
  )
})
