(() => {
  try {
    const raiz = document.documentElement
    const temas = ['auto', 'claro', 'escuro']
    const tamanhos = ['100', '112.5', '125']
    let tema = localStorage.getItem('prumo:tema')
    if (!temas.includes(tema)) {
      const antigo = localStorage.getItem('horizonte:tema')
      if (temas.includes(antigo)) {
        tema = antigo
        localStorage.setItem('prumo:tema', antigo)
        localStorage.removeItem('horizonte:tema')
      }
    }
    if (tema === 'claro' || tema === 'escuro') raiz.dataset.theme = tema
    const texto = localStorage.getItem('prumo:texto')
    if (tamanhos.includes(texto) && texto !== '100') raiz.dataset.texto = texto
  } catch {
    // O CSS assume as preferências automáticas quando o armazenamento não está disponível.
  }
})()
