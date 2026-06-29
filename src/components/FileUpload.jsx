import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { useThemeLang } from '../context/ThemeLangProvider';

/* ─── Bilingual text map ─── */
const TEXT = {
  ar: {
    dropTitle: 'اسحب الملف هنا',
    dropSubtitle: 'أو انقر لاختيار ملف CSV أو Excel',
    browseBtn: 'تصفح الملفات',
    acceptedFormats: 'الصيغ المدعومة: CSV, XLS, XLSX',
    processingTitle: 'جارٍ معالجة البيانات…',
    processingSubtitle: 'يرجى الانتظار بينما نقوم بتحليل ملفك',
    successTitle: 'تمت المعالجة بنجاح',
    successSubtitle: 'تم تحميل ملفك وتحليله بنجاح',
    successAction: 'رفع ملف آخر',
    errorTitle: 'صيغة غير مدعومة',
    errorSubtitle: 'يرجى رفع ملف بصيغة CSV أو Excel فقط',
    fileLabel: 'الملف',
    sizeLabel: 'الحجم',
  },
  en: {
    dropTitle: 'Drop your file here',
    dropSubtitle: 'or click to select a CSV or Excel file',
    browseBtn: 'Browse Files',
    acceptedFormats: 'Supported formats: CSV, XLS, XLSX',
    processingTitle: 'Processing data…',
    processingSubtitle: 'Please wait while we analyse your file',
    successTitle: 'Processing complete',
    successSubtitle: 'Your file has been uploaded and analysed successfully',
    successAction: 'Upload another file',
    errorTitle: 'Unsupported format',
    errorSubtitle: 'Please upload a CSV or Excel file only',
    fileLabel: 'File',
    sizeLabel: 'Size',
  },
};

/**
 * Format bytes to a human-readable string.
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/** Accepted MIME types for CSV / Excel */
const ACCEPT = {
  'text/csv': ['.csv'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
};

// States: 'idle' | 'processing' | 'success' | 'error'

export default function FileUpload() {
  const { lang } = useThemeLang();
  const t = TEXT[lang];

  const [status, setStatus] = useState('idle');
  const [file, setFile] = useState(null);

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
        return;
      }

      const droppedFile = acceptedFiles[0];
      if (!droppedFile) return;

      setFile(droppedFile);
      setStatus('processing');

      // Simulate 3-second data processing delay
      setTimeout(() => {
        setStatus('success');
      }, 3000);
    },
    [],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setFile(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    multiple: false,
    disabled: status === 'processing',
  });

  /* ─── Idle / Drag-active state ─── */
  if (status === 'idle' || status === 'error') {
    return (
      <div className="file-upload">
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'dropzone--active' : ''} ${status === 'error' ? 'dropzone--error' : ''}`}
        >
          <input {...getInputProps()} />

          <div className="dropzone__icon-wrap">
            {status === 'error' ? (
              <AlertCircle size={32} strokeWidth={1.5} className="dropzone__icon dropzone__icon--error" />
            ) : (
              <UploadCloud size={32} strokeWidth={1.5} className="dropzone__icon" />
            )}
          </div>

          <h3 className="dropzone__title">
            {status === 'error' ? t.errorTitle : t.dropTitle}
          </h3>
          <p className="dropzone__subtitle">
            {status === 'error' ? t.errorSubtitle : t.dropSubtitle}
          </p>

          {status !== 'error' && (
            <button type="button" className="dropzone__browse-btn">
              {t.browseBtn}
            </button>
          )}

          <span className="dropzone__formats">{t.acceptedFormats}</span>
        </div>
      </div>
    );
  }

  /* ─── Processing state ─── */
  if (status === 'processing') {
    return (
      <div className="file-upload">
        <div className="dropzone dropzone--processing">
          {/* Spinner */}
          <div className="spinner-wrap">
            <div className="spinner" />
            <FileSpreadsheet size={20} strokeWidth={1.8} className="spinner-inner-icon" />
          </div>

          <h3 className="dropzone__title dropzone__title--processing">
            {t.processingTitle}
          </h3>
          <p className="dropzone__subtitle">{t.processingSubtitle}</p>

          {/* File pill */}
          {file && (
            <div className="file-pill file-pill--processing">
              <FileSpreadsheet size={14} strokeWidth={2} />
              <span className="file-pill__name">{file.name}</span>
              <span className="file-pill__size">{formatBytes(file.size)}</span>
            </div>
          )}

          {/* Progress bar */}
          <div className="progress-track">
            <div className="progress-bar" />
          </div>
        </div>
      </div>
    );
  }

  /* ─── Success state ─── */
  return (
    <div className="file-upload">
      <div className="dropzone dropzone--success">
        <div className="success-icon-wrap">
          <CheckCircle2 size={32} strokeWidth={1.5} className="success-icon" />
        </div>

        <h3 className="dropzone__title dropzone__title--success">
          {t.successTitle}
        </h3>
        <p className="dropzone__subtitle">{t.successSubtitle}</p>

        {file && (
          <div className="file-pill file-pill--success">
            <FileSpreadsheet size={14} strokeWidth={2} />
            <span className="file-pill__name">{file.name}</span>
            <span className="file-pill__size">{formatBytes(file.size)}</span>
          </div>
        )}

        <button type="button" className="dropzone__reset-btn" onClick={reset}>
          {t.successAction}
        </button>
      </div>
    </div>
  );
}
