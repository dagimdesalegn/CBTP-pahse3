import { readFileSync } from 'node:fs'

const authContext = readFileSync(new URL('../src/context/AuthContext.jsx', import.meta.url), 'utf8')

const expectations = [
  ['const refreshUser = async () =>', 'AuthContext should expose a refreshUser function.'],
  ["api.get('/me')", 'AuthContext should refresh the current user from /me.'],
  ["document.addEventListener('visibilitychange'", 'AuthContext should refresh when returning to the app.'],
  ['setInterval(refreshUser', 'AuthContext should periodically refresh stale user state.'],
  ['logout, refreshUser, updateUser', 'AuthProvider should expose refreshUser to consumers.'],
]

for (const [needle, message] of expectations) {
  if (!authContext.includes(needle)) {
    throw new Error(message)
  }
}

console.log('Auth user refresh wiring is present.')
