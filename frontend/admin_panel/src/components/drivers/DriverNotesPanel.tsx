import { useState } from 'react';
import { SectionCard } from '../common/SectionCard';
import { useDriverNotes, useSaveNote } from '../../hooks/useDriverDetail';
import { useToast } from '../../hooks/useToast';
import { format, parseISO } from 'date-fns';
import styles from './DriverNotesPanel.module.css';

interface Props { driverId: string; }

export function DriverNotesPanel({ driverId }: Props) {
  const [noteText, setNoteText] = useState('');
  const { data: notes = [], isLoading } = useDriverNotes(driverId);
  const saveNote = useSaveNote();
  const { showSuccess, showError } = useToast();
  const MAX = 1000;

  async function handleSave() {
    if (!noteText.trim()) return;
    try {
      await saveNote.mutateAsync({ driverId, note: noteText.trim() });
      setNoteText('');
      showSuccess('Note saved');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to save note');
    }
  }

  return (
    <SectionCard title="Internal Notes">
      <textarea
        className={styles.textarea}
        placeholder="Add a private note visible only to admins..."
        value={noteText}
        onChange={(e) => setNoteText(e.target.value.slice(0, MAX))}
        rows={4}
      />
      <div className={styles.textareaFooter}>
        <span className={styles.counter}>{noteText.length} / {MAX}</span>
        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={!noteText.trim() || saveNote.isPending}
        >
          {saveNote.isPending ? '…' : 'Save Note'}
        </button>
      </div>

      <div className={styles.list}>
        {isLoading && Array.from({ length: 2 }).map((_, i) => <div key={i} className={styles.sk} />)}
        {!isLoading && notes.length === 0 && (
          <p className={styles.empty}>No internal notes yet</p>
        )}
        {!isLoading && notes.map((note, i) => (
          <div key={note.id ?? i} className={styles.note}>
            <div className={styles.noteMeta}>
              <span className={styles.noteAuthor}>{note.admin_name}</span>
              <span className={styles.noteDate}>{note.created_at ? format(parseISO(note.created_at), 'MMM d, yyyy · h:mm a') : ''}</span>
            </div>
            <p className={styles.noteText}>{note.note}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
