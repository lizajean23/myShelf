import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { copy } from '@/copy'
import { useShelf } from '@/context/ShelfContext'
import type { VinylCondition, VinylRecord } from '@/api/types'
import { Modal } from '@/components/ui/Modal'

const PER_ROW = 6

function chunkRecords(list: VinylRecord[], size: number) {
  const rows: VinylRecord[][] = []
  for (let i = 0; i < list.length; i += size) {
    rows.push(list.slice(i, i + size))
  }
  return rows
}

export function ShelfPage() {
  const { vinyls, removeVinyl, updateVinyl, clearShelf } = useShelf()
  const [editId, setEditId] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [condition, setCondition] = useState<VinylCondition>('near_mint')

  const rows = useMemo(() => chunkRecords(vinyls, PER_ROW), [vinyls])
  const editing = vinyls.find((v) => v.id === editId) ?? null

  const openEdit = (item: VinylRecord) => {
    setEditId(item.id)
    setNote(item.note || '')
    setCondition(item.condition)
  }

  const saveEdit = () => {
    if (editId == null) return
    updateVinyl(editId, { note, condition })
    setEditId(null)
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>{copy.shelf.title}</h1>
        <p>{copy.shelf.subtitle}</p>
      </header>

      {vinyls.length === 0 ? (
        <div className="state-block">
          <p>{copy.shelf.empty}</p>
          <Link
            to="/explore"
            className="btn btn--primary"
            style={{ marginTop: '1rem' }}
          >
            {copy.shelf.emptyCta}
          </Link>
        </div>
      ) : (
        <>
          <div className="shelf-toolbar">
            <p>
              {vinyls.length} {copy.shelf.count}
            </p>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                if (window.confirm(copy.shelf.clearConfirm)) clearShelf()
              }}
            >
              {copy.shelf.clear}
            </button>
          </div>

          <div className="vinyl-wall">
            {rows.map((row, rowIndex) => (
              <div className="vinyl-shelf-row" key={`row-${rowIndex}`}>
                <div className="vinyl-shelf-row__records">
                  {row.map((vinyl, index) => (
                    <motion.button
                      type="button"
                      key={vinyl.id}
                      className="shelf-record"
                      onClick={() => openEdit(vinyl)}
                      aria-label={`Edit ${vinyl.title}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <img src={vinyl.cover} alt="" />
                    </motion.button>
                  ))}
                </div>
                <div className="vinyl-shelf-row__ledge" aria-hidden />
              </div>
            ))}
          </div>
        </>
      )}

      <Modal
        open={Boolean(editing)}
        title={editing?.title ?? copy.shelf.editNote}
        onClose={() => setEditId(null)}
      >
        {editing && (
          <>
            <div className="modal__preview">
              <img src={editing.cover} alt="" />
              <div>
                <strong>{editing.title}</strong>
                <span>{editing.artistName}</span>
              </div>
            </div>
            <label>
              {copy.modal.condition}
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as VinylCondition)}
              >
                {(Object.keys(copy.conditions) as VinylCondition[]).map((c) => (
                  <option key={c} value={c}>
                    {copy.conditions[c]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {copy.shelf.note}
              <textarea value={note} onChange={(e) => setNote(e.target.value)} />
            </label>
            <div className="modal__actions">
              <button type="button" className="btn btn--primary" onClick={saveEdit}>
                {copy.modal.save}
              </button>
              <Link
                to={`/album/${editing.id}`}
                state={{
                  title: editing.title,
                  artistName: editing.artistName,
                  cover: editing.cover,
                  artistId: editing.artistId,
                }}
                className="btn btn--ghost"
                onClick={() => setEditId(null)}
              >
                Open album
              </Link>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  removeVinyl(editing.id)
                  setEditId(null)
                }}
              >
                {copy.shelf.remove}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
