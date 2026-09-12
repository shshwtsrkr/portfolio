/* Three slow neutral clouds behind the page — light and shade only, no hue — so glass surfaces have something to refract. */
export default function LiquidBackground() {
  return (
    <div className="liquid-bg" aria-hidden="true">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
    </div>
  )
}
