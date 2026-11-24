import { useState, type FormEvent } from 'react'
import Modal from '../../ui/modal'
import { Input } from '../../ui/input'

interface Props {
  firstName: string
  lastName: string
  saving: boolean
  onClose: () => void
  onSave: (firstName: string, lastName: string) => void
}

export default function EditAdminNameModal({ firstName: initialFirstName, lastName: initialLastName, saving, onClose, onSave }: Props) {
  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const first = firstName.trim()
    const last = lastName.trim()
    if (first && last && !saving) onSave(first, last)
  }

  return (
    <Modal open onClose={onClose} title="Edit admin name">
      <form onSubmit={submit}>
        <Input label="First name" value={firstName} maxLength={50} required onChange={(event) => setFirstName(event.target.value)} />
        <Input label="Last name" value={lastName} maxLength={50} required onChange={(event) => setLastName(event.target.value)} />
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={saving || !firstName.trim() || !lastName.trim()} className="rounded-lg bg-[#03034D] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  )
}
