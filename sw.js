const CACHE = 'prumo-35ea3920535c'
const PRECACHE = [
  "./",
  "./assets/AjustesPagina-EnsBW9El.js",
  "./assets/AntesDeGastarPagina-CNYnd2Ww.js",
  "./assets/BuscaPagina-6BhwUpzR.js",
  "./assets/CampoControle-MbX0NCMh.js",
  "./assets/CartoesPagina-Vz_WxxM-.js",
  "./assets/ConteudoDia-qE6cZIwj.js",
  "./assets/DestinoPagina-DUaRigIp.js",
  "./assets/FormCartao-J_VuOXlq.js",
  "./assets/FormLancamento-CNoC15nm.js",
  "./assets/FormRecorrencia-Dr9G0wrX.js",
  "./assets/HojePagina-BQbXCWnK.js",
  "./assets/ImportarPagina-BHPW-4Op.js",
  "./assets/NavegacaoMes-0rEOJN2W.js",
  "./assets/PlanoPagina-BB_0ilZT.js",
  "./assets/ResultadosDetalhados-BbbxUD_3.js",
  "./assets/SaldosPagina-D7zAsGOE.js",
  "./assets/SeletorCategoria-D9YTmMr4.js",
  "./assets/SeloValidacaoTextos-BR5WvYkI.js",
  "./assets/SimuladorPagina-B-DytGAg.css",
  "./assets/SimuladorPagina-B6_uaJXD.js",
  "./assets/TotaisPagina-q_B0oZGQ.js",
  "./assets/TravessiaApertoDialogo-bZSjGuHf.js",
  "./assets/backupLembrete-DDE3cJrX.js",
  "./assets/checklistDispensado-BelZ49yE.js",
  "./assets/compartilhar-DQJuxAtW.js",
  "./assets/controle-D2iO3nyI.js",
  "./assets/controle-Dhln8q0P.css",
  "./assets/diagnostico.worker-BJid57cd.js",
  "./assets/distribuicao-BaH27OY5.js",
  "./assets/hoje-Beidnipv.js",
  "./assets/index-BRaQBuHr.css",
  "./assets/index-DbI5z_gL.js",
  "./assets/jsx-runtime-G0LVwMXR.js",
  "./assets/montecarlo.worker-Dm262AjB.js",
  "./assets/repetidasIgnoradas-DB7jm8e6.js",
  "./assets/textos-BSZFcUth.js",
  "./assets/ui-DYUyp2-Y.js",
  "./assets/useControle-C6H6XNUD.js",
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
