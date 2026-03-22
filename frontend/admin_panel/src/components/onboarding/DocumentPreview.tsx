type Props = {
  fileUrl: string | null;
  documentType?: string;
};

const IMAGE_EXTS = /\.(jpe?g|png|webp|gif|bmp|svg)(\?|$)/i;

export function DocumentPreview({ fileUrl, documentType }: Props) {
  if (!fileUrl) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-line bg-[#f7f7f5]">
        <span className="text-sm text-muted">No file uploaded</span>
      </div>
    );
  }

  const isImage = IMAGE_EXTS.test(fileUrl);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-[#f7f7f5]">
      {isImage ? (
        <img
          src={fileUrl}
          alt={documentType ?? 'Document'}
          className="max-h-64 w-full object-contain"
        />
      ) : (
        <div className="flex h-28 items-center justify-center">
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-[#f0eee8]"
          >
            <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open Document ↗
          </a>
        </div>
      )}
    </div>
  );
}
