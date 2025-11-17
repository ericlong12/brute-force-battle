export default function Scenarios() {
  return (
    <section>
      <h2 style={{ marginTop: 0 }}>Scenarios</h2>
      <p>Preset comparisons to highlight design choices:</p>
      <ul>
        <li>Short mixed-char passwords + fast hashing</li>
        <li>Longer passphrases + salted slow hashing</li>
        <li>Online defenses with/without MFA</li>
      </ul>
      <p style={{ color: '#555' }}>Next: load presets, compare charts side-by-side, export images.</p>
    </section>
  )
}
