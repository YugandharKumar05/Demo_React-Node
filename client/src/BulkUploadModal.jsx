import { useState } from 'react'
import { apiFetch } from './api'
import { useBodyScrollLock } from './useBodyScrollLock'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function parseWorkbook(arrayBuffer) {
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

  if (rawRows.length === 0) {
    return { error: 'The file has no data rows.' }
  }

  const headerKeys = Object.keys(rawRows[0])
  const nameKey = headerKeys.find((k) => k.trim().toLowerCase() === 'name')
  const emailKey = headerKeys.find((k) => k.trim().toLowerCase() === 'email')

  if (!nameKey || !emailKey) {
    return { error: "The file must have a \"Name\" column and an \"Email\" column." }
  }

  const seenEmails = new Set()
  const rows = rawRows.map((row, index) => {
    const name = String(row[nameKey] ?? '').trim()
    const email = String(row[emailKey] ?? '').trim()
    const rowNumber = index + 2 // +1 for header row, +1 for 1-based numbering

    let reason = ''
    if (!name || !email) {
      reason = 'Missing name or email'
    } else if (!EMAIL_PATTERN.test(email)) {
      reason = 'Invalid email format'
    } else if (seenEmails.has(email.toLowerCase())) {
      reason = 'Duplicate email in file'
    }

    if (!reason) seenEmails.add(email.toLowerCase())

    return { rowNumber, name, email, valid: !reason, reason }
  })

  return { rows }
}

function BulkUploadModal({ onClose, onLogout, onUploaded }) {
  useBodyScrollLock()

  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState([])
  const [parseError, setParseError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [result, setResult] = useState(null)

  const validRows = rows.filter((r) => r.valid)
  const invalidRows = rows.filter((r) => !r.valid)

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setParseError('')
    setRows([])
    setResult(null)
    setSubmitError('')

    try {
      const buffer = await file.arrayBuffer()
      const { error, rows: parsedRows } = await parseWorkbook(buffer)
      if (error) {
        setParseError(error)
      } else {
        setRows(parsedRows)
      }
    } catch (err) {
      setParseError('Could not read that file. Please upload a valid Excel (.xlsx/.xls) or CSV file.')
    }
  }

  async function handleSubmit() {
    if (validRows.length === 0) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await apiFetch('/api/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: validRows.map((r) => ({ name: r.name, email: r.email })) }),
      }, onLogout)
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Bulk upload failed')
      }
      setResult(data)
      if (data.created.length > 0) {
        await onUploaded()
      }
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card bulk-upload-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Bulk Upload Users</h3>

        {!result && (
          <>
            <p className="bulk-upload-hint">
              Upload an Excel or CSV file with <strong>Name</strong> and <strong>Email</strong> columns.
            </p>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />

            {fileName && <p className="bulk-upload-filename">{fileName}</p>}
            {parseError && <p className="error">{parseError}</p>}

            {rows.length > 0 && (
              <>
                <p className="bulk-upload-summary">
                  {validRows.length} valid user{validRows.length === 1 ? '' : 's'} found
                  {invalidRows.length > 0 && `, ${invalidRows.length} row${invalidRows.length === 1 ? '' : 's'} skipped`}.
                </p>

                {validRows.length > 0 && (
                  <div className="bulk-upload-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validRows.map((row) => (
                          <tr key={row.rowNumber}>
                            <td>{row.name}</td>
                            <td>{row.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {invalidRows.length > 0 && (
                  <ul className="bulk-upload-issues">
                    {invalidRows.map((row) => (
                      <li key={row.rowNumber}>
                        Row {row.rowNumber}: {row.reason}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {submitError && <p className="error">{submitError}</p>}

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSubmit}
                disabled={validRows.length === 0 || submitting}
              >
                {submitting ? 'Uploading...' : `Submit ${validRows.length || ''}`}
              </button>
            </div>
          </>
        )}

        {result && (
          <>
            <p className="bulk-upload-summary">
              ✅ Created {result.created.length} user{result.created.length === 1 ? '' : 's'}.
              {result.failed.length > 0 && ` ${result.failed.length} row${result.failed.length === 1 ? '' : 's'} failed.`}
            </p>
            {result.failed.length > 0 && (
              <ul className="bulk-upload-issues">
                {result.failed.map((row, i) => (
                  <li key={`${row.email}-${i}`}>
                    {row.name || '(no name)'} &lt;{row.email || 'no email'}&gt;: {row.error}
                  </li>
                ))}
              </ul>
            )}
            <div className="modal-actions">
              <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default BulkUploadModal
