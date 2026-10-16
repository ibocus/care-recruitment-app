import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { FieldShell, type BaseProps } from './fields';
import { uploadDocument, ACCEPTED_DOCUMENT_TYPES } from '../lib/uploadDocument';
import type { DocumentSlot, UploadedDocument } from '../types';

interface FileUploadFieldProps extends BaseProps {
  draftId: string;
  slot: DocumentSlot;
  value: UploadedDocument | undefined;
  onChange: (value: UploadedDocument | undefined) => void;
}

export function FileUploadField({ draftId, slot, value, onChange, ...shell }: FileUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const uploaded = await uploadDocument(draftId, slot, file);
      onChange(uploaded);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange(undefined);
    setUploadError(null);
  };

  return (
    <FieldShell {...shell} error={shell.error ?? uploadError ?? undefined}>
      {value ? (
        <div className="file-upload__done">
          <span className="file-upload__name">{value.originalName}</span>
          <button type="button" className="btn btn--ghost btn--small" onClick={handleRemove}>
            Remove
          </button>
        </div>
      ) : (
        <input
          ref={inputRef}
          id={shell.id}
          type="file"
          accept={ACCEPTED_DOCUMENT_TYPES.join(',')}
          disabled={uploading}
          onChange={handleFileChange}
          className="field__input"
        />
      )}
      {uploading && <p className="field__hint">Uploading…</p>}
    </FieldShell>
  );
}
