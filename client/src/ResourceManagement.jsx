import { useEffect, useRef, useState } from 'react'
import { apiFetch } from './api'
import { useBodyScrollLock } from './useBodyScrollLock'

function emptyValues(fields) {
  return fields.reduce((acc, field) => {
    acc[field.key] = field.type === 'select' ? field.options[0] : ''
    return acc
  }, {})
}

function singular(title) {
  return title.replace(/s$/, '')
}

function statusClass(value) {
  return `status-${String(value).toLowerCase().replace(/\s+/g, '-')}`
}

function FieldInput({ field, value, onChange, className }) {
  if (field.type === 'select') {
    return (
      <select className={className} value={value} onChange={(e) => onChange(e.target.value)}>
        {field.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    )
  }
  return (
    <input
      className={className}
      type={field.type === 'number' ? 'number' : 'text'}
      placeholder={field.label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={field.required}
    />
  )
}

function ItemCard({ item, fields, onStartEdit }) {
  const [imgError, setImgError] = useState(false)
  const imageField = fields.find((f) => f.variant === 'image')
  const titleField = fields.find((f) => f.variant === 'title') || fields[0]
  const metaFields = fields.filter((f) => f !== imageField && f !== titleField)
  const imageUrl = imageField ? item[imageField.key] : null

  return (
    <div className="resource-card">
      <div className="resource-card-image">
        {imageUrl && !imgError ? (
          <img src={imageUrl} alt={item[titleField.key]} loading="lazy" onError={() => setImgError(true)} />
        ) : (
          <div className="resource-card-image-fallback">🖼️</div>
        )}
      </div>
      <div className="resource-card-body">
        <h3 className="resource-card-title">{item[titleField.key]}</h3>
        <div className="resource-card-meta">
          {metaFields.map((field) => {
            const value = item[field.key]
            if (value === undefined || value === null || value === '') return null
            if (field.variant === 'badge') {
              return (
                <span key={field.key} className={`status-badge ${statusClass(value)}`}>
                  {value}
                </span>
              )
            }
            if (field.variant === 'price') {
              return (
                <span key={field.key} className="resource-card-price">
                  ${Number(value).toFixed(2)}
                </span>
              )
            }
            if (field.variant === 'code') {
              return (
                <span key={field.key} className="resource-card-code">
                  {value}
                </span>
              )
            }
            if (field.variant === 'tag') {
              return (
                <span key={field.key} className="resource-card-tag">
                  {value}
                </span>
              )
            }
            return (
              <span key={field.key} className="resource-card-text">
                {field.label}: {value}
              </span>
            )
          })}
        </div>
        <button type="button" className="btn btn-accent btn-sm resource-card-edit-btn" onClick={onStartEdit}>
          ✏️ Edit
        </button>
      </div>
    </div>
  )
}

function EditModal({ title, fields, values, onChange, error, onCancel, onSave }) {
  useBodyScrollLock()

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card resource-edit-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Edit {singular(title)}</h3>
        <div className="resource-edit-modal-fields">
          {fields.map((field) => (
            <div key={field.key} className="resource-card-edit-field">
              <label>{field.label}</label>
              <FieldInput
                field={field}
                value={values[field.key]}
                onChange={(v) => onChange(field.key, v)}
                className="edit-input"
              />
            </div>
          ))}
        </div>
        {error && <p className="error">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-success btn-sm" onClick={onSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function ResourceManagement({ title, endpoint, fields, onLogout }) {
  const [items, setItems] = useState([])
  const [formValues, setFormValues] = useState(() => emptyValues(fields))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [expanded, setExpanded] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [editError, setEditError] = useState('')
  const didLoad = useRef(false)

  async function loadItems() {
    const res = await apiFetch(endpoint, {}, onLogout)
    const data = await res.json()
    setItems(data)
  }

  useEffect(() => {
    if (didLoad.current) return
    didLoad.current = true
    loadItems().finally(() => setInitialLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues),
      }, onLogout)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `Failed to add ${singular(title).toLowerCase()}`)
      }
      setFormValues(emptyValues(fields))
      await loadItems()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function startEdit(item) {
    const values = {}
    fields.forEach((field) => {
      values[field.key] = item[field.key] ?? ''
    })
    setEditingId(item._id)
    setEditValues(values)
    setEditError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditError('')
  }

  async function saveEdit() {
    setEditError('')
    try {
      const res = await apiFetch(`${endpoint}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      }, onLogout)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `Failed to update ${singular(title).toLowerCase()}`)
      }
      setEditingId(null)
      await loadItems()
    } catch (err) {
      setEditError(err.message)
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
        <p>Loading {title.toLowerCase()}...</p>
      </div>
    )
  }

  return (
    <>
      <section className="card create-card">
        <h2>Add {singular(title)}</h2>
        <form onSubmit={handleSubmit} className="user-form">
          {fields.map((field) => (
            <FieldInput
              key={field.key}
              field={field}
              value={formValues[field.key]}
              onChange={(v) => setFormValues((prev) => ({ ...prev, [field.key]: v }))}
            />
          ))}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : `Add ${singular(title)}`}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="card list-card">
        <div className="card-header-row">
          <h2>{title}</h2>
          <button
            type="button"
            className="btn-collapse"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-label={expanded ? `Collapse ${title.toLowerCase()}` : `Expand ${title.toLowerCase()}`}
          >
            <span className={`collapse-arrow ${expanded ? 'expanded' : ''}`}>▶</span>
          </button>
        </div>
        {expanded &&
          (items.length === 0 ? (
            <p className="empty">No {title.toLowerCase()} yet.</p>
          ) : (
            <div className="resource-grid">
              {items.map((item) => (
                <ItemCard key={item._id} item={item} fields={fields} onStartEdit={() => startEdit(item)} />
              ))}
            </div>
          ))}
      </section>

      {editingId && (
        <EditModal
          title={title}
          fields={fields}
          values={editValues}
          onChange={(k, v) => setEditValues((prev) => ({ ...prev, [k]: v }))}
          error={editError}
          onCancel={cancelEdit}
          onSave={saveEdit}
        />
      )}
    </>
  )
}

export default ResourceManagement
