export default function LiveAttack() {
  return (
    <section>
      <h2 style={{ marginTop: 0 }}>Live Attack</h2>
      <p>
        Real-time visualization of brute-force and dictionary guessing against a selected password verifier.
      </p>
      <ul>
        <li>Keyspace N and expected trials N/2</li>
        <li>Success probability over time</li>
        <li>Time-to-50% (T50) and Time-to-95% (T95)</li>
      </ul>
      <p style={{ color: '#555' }}>
        Next: add controls for password length/passphrase model, hash/KDF preset, guesses per second, and
        start/pause simulation.
      </p>
    </section>
  )
}
