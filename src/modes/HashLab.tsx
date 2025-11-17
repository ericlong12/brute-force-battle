export default function HashLab() {
  return (
    <section>
      <h2 style={{ marginTop: 0 }}>Hash Lab</h2>
      <p>Compare verifier strategies and presets:</p>
      <ul>
        <li>Fast unsalted hashing vs salted hashing</li>
        <li>Memory-hard KDFs (e.g., scrypt/Argon2) and iteration tuning</li>
        <li>Salts vs rainbow tables explainer</li>
      </ul>
      <p style={{ color: '#555' }}>Next: parameter presets and charts of time-per-guess vs success curves.</p>
    </section>
  )
}
