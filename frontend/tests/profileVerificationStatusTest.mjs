import { readFileSync } from 'node:fs'

const profile = readFileSync(new URL('../src/pages/member/Profile.jsx', import.meta.url), 'utf8')

const expectations = [
  ["user?.verification_submitted_at ? 'Pending Verification' : 'Verification Required'", 'Fresh unverified accounts should show Verification Required, not Pending Verification.'],
  ["user?.verification_submitted_at ? 'text-yellow-800' : 'text-blue-800'", 'Fresh and submitted verification states should have distinct badge colors.'],
  ['Submit your verification request to activate ordering.', 'Fresh unverified accounts should be told to submit verification.'],
  ['Your verification request is pending admin approval.', 'Submitted accounts should be told to wait for approval.'],
]

for (const [needle, message] of expectations) {
  if (!profile.includes(needle)) {
    throw new Error(message)
  }
}

console.log('Profile verification status copy is present.')
