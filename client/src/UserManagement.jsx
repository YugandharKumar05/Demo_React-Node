import { useEffect, useRef, useState } from 'react'
import { apiFetch } from './api'
import BulkUploadModal from './BulkUploadModal'

function UserManagement({ onLogout }) {
  const [users, setUsers] = useState([])
  const [deletedUsers, setDeletedUsers] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const didLoad = useRef(false)

  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editError, setEditError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [usersExpanded, setUsersExpanded] = useState(true)
  const [deletedExpanded, setDeletedExpanded] = useState(true)
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false)

  async function loadUsers() {
    const res = await apiFetch('/api/users', {}, onLogout)
    const data = await res.json()
    setUsers(data)
  }

  async function loadDeletedUsers() {
    const res = await apiFetch('/api/users/deleted', {}, onLogout)
    const data = await res.json()
    setDeletedUsers(data)
  }

  async function loadAll() {
    await Promise.all([loadUsers(), loadDeletedUsers()])
  }

  useEffect(() => {
    if (didLoad.current) return
    didLoad.current = true
    loadAll().finally(() => setInitialLoading(false))
  }, [])

  useEffect(() => {
    if (!openMenuId) return
    function handleOutsideClick(e) {
      if (!e.target.closest('.actions-menu')) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [openMenuId])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await apiFetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      }, onLogout)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create user')
      }
      setName('')
      setEmail('')
      await loadUsers()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function startEdit(user) {
    setEditingId(user._id)
    setEditName(user.name)
    setEditEmail(user.email)
    setEditError('')
    setOpenMenuId(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditError('')
  }

  async function saveEdit(id) {
    setEditError('')
    try {
      const res = await apiFetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, email: editEmail }),
      }, onLogout)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update user')
      }
      setEditingId(null)
      await loadUsers()
    } catch (err) {
      setEditError(err.message)
    }
  }

  async function handleDelete(id) {
    setOpenMenuId(null)
    if (!window.confirm('Delete this user?')) return
    setDeleteError('')
    setDeletingId(id)
    try {
      const res = await apiFetch(`/api/users/${id}`, { method: 'DELETE' }, onLogout)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete user')
      }
      await loadAll()
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  if (initialLoading) {
    return (
      <div className="page-loader module-loader">
        <div className="gif-loader">
          <span className="gif-loader-dot" />
          <span className="gif-loader-dot" />
          <span className="gif-loader-dot" />
        </div>
        <p>Loading users...</p>
      </div>
    )
  }

  return (
    <>
      <section className="card create-card">
        <h2>Create User</h2>
        <form onSubmit={handleSubmit} className="user-form">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setBulkUploadOpen(true)}>
            📤 Bulk Upload
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>

      {bulkUploadOpen && (
        <BulkUploadModal
          onClose={() => setBulkUploadOpen(false)}
          onLogout={onLogout}
          onUploaded={loadUsers}
        />
      )}

      <section className="card list-card">
        <div className="card-header-row">
          <h2>Users List</h2>
          <button
            type="button"
            className="btn-collapse"
            onClick={() => setUsersExpanded((v) => !v)}
            aria-expanded={usersExpanded}
            aria-label={usersExpanded ? 'Collapse users list' : 'Expand users list'}
          >
            <span className={`collapse-arrow ${usersExpanded ? 'expanded' : ''}`}>▶</span>
          </button>
        </div>
        {usersExpanded && (users.length === 0 ? (
          <p className="empty">No users yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Created At</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  {editingId === user._id ? (
                    <>
                      <td>
                        <input
                          className="edit-input"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="edit-input"
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                        />
                      </td>
                      <td>{new Date(user.createdAt).toLocaleString()}</td>
                      <td>
                        <div className="actions">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => saveEdit(user._id)}
                          >
                            Save
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{new Date(user.createdAt).toLocaleString()}</td>
                      <td>
                        <div className="actions actions-desktop">
                          <button
                            className="btn btn-accent btn-sm"
                            onClick={() => startEdit(user)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(user._id)}
                            disabled={deletingId === user._id}
                          >
                            🗑️ {deletingId === user._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>

                        <div className="actions-menu">
                          <button
                            className="btn-kebab"
                            onClick={() =>
                              setOpenMenuId(openMenuId === user._id ? null : user._id)
                            }
                            aria-label="Actions"
                          >
                            ⋮
                          </button>
                          {openMenuId === user._id && (
                            <div className="dropdown">
                              <button onClick={() => startEdit(user)}>✏️ Edit</button>
                              <button
                                onClick={() => handleDelete(user._id)}
                                disabled={deletingId === user._id}
                              >
                                🗑️ {deletingId === user._id ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ))}
        {editError && <p className="error">{editError}</p>}
        {deleteError && <p className="error">{deleteError}</p>}
      </section>

      <section className="card deleted-card">
        <div className="card-header-row">
          <h2>Deleted Users</h2>
          <button
            type="button"
            className="btn-collapse"
            onClick={() => setDeletedExpanded((v) => !v)}
            aria-expanded={deletedExpanded}
            aria-label={deletedExpanded ? 'Collapse deleted users list' : 'Expand deleted users list'}
          >
            <span className={`collapse-arrow ${deletedExpanded ? 'expanded' : ''}`}>▶</span>
          </button>
        </div>
        {deletedExpanded && (deletedUsers.length === 0 ? (
          <p className="empty">No deleted users.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Deleted At</th>
                <th>Id</th>
              </tr>
            </thead>
            <tbody>
              {deletedUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.updatedAt).toLocaleString()}</td>
                  <td>{user._id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </section>
    </>
  )
}

export default UserManagement
