/**
 * Круглый значок play (▶) для видео-медиа. По макету docs/design/mockups/app-dashboard.html:
 * тёмный круг rgba(23,21,15,.72) с белым значком. Размер параметризован —
 * 28px в плитке сетки (fontSize 10) и 46px в предпросмотре (fontSize 15).
 */
export function PlayBadge({ size = 28, fontSize = 10 }: { size?: number; fontSize?: number }) {
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'rgba(23,21,15,.72)',
        color: '#fff',
        fontSize,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none',
      }}
    >
      ▶
    </span>
  )
}
