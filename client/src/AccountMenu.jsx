import { useEffect, useRef, useState } from 'react'
import { useBodyScrollLock } from './useBodyScrollLock'

function LogoutConfirmDialog({ onCancel, onConfirm }) {
  useBodyScrollLock()

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>Log out</h3>
        <p>Are you sure you want to log out?</p>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={onConfirm}>
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}

function initials(name) {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function AccountMenu({ account, onLogout, onProfile }) {
  const [open, setOpen] = useState(false)
  const [confirmingLogout, setConfirmingLogout] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleOutsideClick(e) {
      if (!menuRef.current?.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [open])

  return (
    <>
      <div className="account-menu" ref={menuRef}>
        <button
          type="button"
          className="btn-profile"
          onClick={() => setOpen((o) => !o)}
          aria-label="Account menu"
        >
          {initials(account?.name)}
        </button>
        {open && (
          <div className="dropdown account-dropdown">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onProfile?.()
              }}
            >
              👤 Profile
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setConfirmingLogout(true)
              }}
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>

      {confirmingLogout && (
        <LogoutConfirmDialog onCancel={() => setConfirmingLogout(false)} onConfirm={onLogout} />
      )}
    </>
  )
}

export default AccountMenu
