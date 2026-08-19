import { useState } from 'react'
import { getToken, getAccount, setSession, clearSession } from './api'
import Login from './Login'
import App from './App'

function AuthGate() {
  const [token, setToken] = useState(getToken)
  const [account, setAccount] = useState(getAccount)

  function handleAuthSuccess(data) {
    setSession(data.token, data.account)
    setToken(data.token)
    setAccount(data.account)
  }

  function handleLogout() {
    clearSession()
    setToken(null)
    setAccount(null)
  }

  if (!token) {
    return <Login onAuthSuccess={handleAuthSuccess} />
  }

  return <App account={account} onLogout={handleLogout} />
}

export default AuthGate
