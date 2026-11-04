const CACHE = 'prumo-502842f54619'
const PRECACHE = [
  "./",
  "./assets/AjustesPagina-D9yoUdPq.js",
  "./assets/AntesDeGastarPagina-ChYV0Hth.js",
  "./assets/BuscaPagina-V2p6Xpnv.js",
  "./assets/CampoControle-MbX0NCMh.js",
  "./assets/CartoesPagina-DuGXdAGN.js",
  "./assets/ContasDoMesPagina-DldvqzAz.js",
  "./assets/ConteudoDia-BiS5fHNy.js",
  "./assets/DestinoPagina-CRvFwZcN.js",
  "./assets/DetalheDoDiaDialogo-CwDVUd0B.js",
  "./assets/FormCartao-BpUm4Eoa.js",
  "./assets/FormLancamento-Cq5e8BcR.js",
  "./assets/FormRecorrencia-DxxIhj8H.js",
  "./assets/HojePagina-B7EBWfCa.js",
  "./assets/ImportarPagina-DOkZcugK.js",
  "./assets/LinhaDeLancamento-D8tsZ3L5.js",
  "./assets/NavegacaoMes-Cg4z1W0d.js",
  "./assets/PlanoPagina-BInqMpDz.js",
  "./assets/ResultadosDetalhados-cBzPe56Y.js",
  "./assets/SaldosPagina-wCGVD5hG.js",
  "./assets/SeletorCategoria-C9Iug_nN.js",
  "./assets/SeloValidacaoTextos-BR5WvYkI.js",
  "./assets/SimuladorPagina-B-DytGAg.css",
  "./assets/SimuladorPagina-Bq5sKtEi.js",
  "./assets/TotaisPagina-DBl4N72Y.js",
  "./assets/TravessiaApertoDialogo-Cmm1hCqS.js",
  "./assets/backupLembrete-DDE3cJrX.js",
  "./assets/baixarArquivo-BkMlFKN2.js",
  "./assets/checklistDispensado-BelZ49yE.js",
  "./assets/compartilhar-CZ_D1CkJ.js",
  "./assets/controle-B8OSWKRU.js",
  "./assets/controle-Bzg9I5-V.css",
  "./assets/diagnostico.worker-BJid57cd.js",
  "./assets/distribuicao-DrBw4FVA.js",
  "./assets/index-BHu2OmA6.js",
  "./assets/index-D6zXqpPf.css",
  "./assets/jsx-runtime-G0LVwMXR.js",
  "./assets/montecarlo.worker-Dm262AjB.js",
  "./assets/repetidasIgnoradas-DB7jm8e6.js",
  "./assets/textos-BSZFcUth.js",
  "./assets/ui-DYUyp2-Y.js",
  "./assets/useControle-DxKhxeTJ.js",
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
