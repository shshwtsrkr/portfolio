export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="a-skel" style={{ height: 40, width: 220, margin: '12px 0 36px' }} />
      <div className="a-stats">
        {[0, 1, 2, 3, 4].map(i => <div key={i} className="a-skel" style={{ height: 168, borderRadius: 16 }} />)}
      </div>
      <div className="a-skel" style={{ height: 240, borderRadius: 16 }} />
    </div>
  )
}
