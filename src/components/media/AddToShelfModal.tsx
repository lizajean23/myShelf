import { useEffect, useState } from 'react'
import type { AlbumSummary, VinylCondition } from '@/api/types'
import { Modal } from '@/components/ui/Modal'
import { copy } from '@/copy'
import { useShelf } from '@/context/ShelfContext'

interface AddToShelfModalProps {
  album: AlbumSummary | null
  open: boolean
  onClose: () => void
}

export function AddToShelfModal({ album, open, onClose }: AddToShelfModalProps) {
  const { addVinyl } = useShelf()
  const [condition, setCondition] = useState<VinylCondition>('near_mint')
  const [note, setNote] = useState('')
  const [draft, setDraft] = useState<AlbumSummary | null>(album)

  useEffect(() => {
    if (album) setDraft(album)
  }, [album])

  const conditions = Object.keys(copy.conditions) as VinylCondition[]
  const current = album ?? draft

  const handleSave = () => {
    if (!current) return
    addVinyl({
      id: current.id,
      title: current.title,
      artistName: current.artistName,
      artistId: current.artistId,
      cover: current.cover,
      year: current.year,
      condition,
      note,
    })
    setNote('')
    setCondition('near_mint')
    onClose()
  }

  return (
    <Modal open={open && Boolean(current)} title={copy.modal.addTitle} onClose={onClose}>
      {current && (
        <>
          <div className="modal__preview">
            <img src={current.cover} alt={current.title} />
            <div>
              <strong>{current.title}</strong>
              <span>{current.artistName}</span>
            </div>
          </div>

          <label>
            {copy.modal.condition}
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as VinylCondition)}
            >
              {conditions.map((c) => (
                <option key={c} value={c}>
                  {copy.conditions[c]}
                </option>
              ))}
            </select>
          </label>

          <label>
            {copy.shelf.note}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={copy.modal.notePlaceholder}
            />
          </label>

          <div className="modal__actions">
            <button type="button" className="btn btn--primary" onClick={handleSave}>
              {copy.modal.save}
            </button>
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              {copy.modal.cancel}
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}
