import katex from 'katex'

/*
 * Тонкая обёртка над уже подключённым KaTeX.
 * <TeX>...</TeX> — строчная формула, <TeX block>...</TeX> — блочная
 * (с горизонтальной прокруткой на узких экранах).
 */
function TeX({ children, block = false }) {
  const html = katex.renderToString(String(children), {
    displayMode: block,
    throwOnError: false,
  })

  if (block) {
    return (
      <div className="tex-block">
        <span dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    )
  }

  return (
    <span
      className="tex-inline"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default TeX
