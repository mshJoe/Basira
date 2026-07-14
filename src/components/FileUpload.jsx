import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { useThemeLang } from '../context/ThemeLangProvider';

const API_URL = 'http://127.0.0.1:8000';

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
    errorTitle: 'حدث خطأ',
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
    errorTitle: 'Error',
    errorSubtitle: 'Please upload a CSV or Excel file only',
    fileLabel: 'File',
    sizeLabel: 'Size',
  },
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

const ACCEPT = {
  'text/csv': ['.csv'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
};

export default function FileUpload({ onAnalysisComplete, onReset }) {
  const { lang } = useThemeLang();
  const t = TEXT[lang];

  const [status, setStatus] = useState(() => {
    return localStorage.getItem('basira_analysis') ? 'success' : 'idle';
  });
  const [file, setFile] = useState(() => {
    const saved = localStorage.getItem('basira_file_info');
    return saved ? JSON.parse(saved) : null;
  });
  const [errorMsg, setErrorMsg] = useState('');

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setStatus('error');
      setErrorMsg(t.errorSubtitle);
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    const droppedFile = acceptedFiles[0];
    if (!droppedFile) return;

    setFile(droppedFile);
    setStatus('processing');

    try {
      // إرسال الملف للباكاند
      const formData = new FormData();
      formData.append('file', droppedFile);
      formData.append('lang', lang);

      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('فشل الاتصال بالسيرفر');
      }

      const data = await response.json();

      setStatus('success');
      localStorage.setItem('basira_file_info', JSON.stringify({ name: droppedFile.name, size: droppedFile.size }));

      // أرسل النتائج للصفحة الرئيسية
      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }

    } catch (error) {
      setStatus('error');
      setErrorMsg('تعذّر الاتصال بالسيرفر — تأكد أن الباكاند شغّال');
      setTimeout(() => setStatus('idle'), 4000);
    }
  }, [t, onAnalysisComplete]);

  const reset = useCallback(() => {
    setStatus('idle');
    setFile(null);
    setErrorMsg('');
    localStorage.removeItem('basira_analysis');
    localStorage.removeItem('basira_file_info');
    if (onReset) onReset();
  }, [onReset]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    multiple: false,
    disabled: status === 'processing',
  });

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
            {status === 'error' ? errorMsg : t.dropSubtitle}
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

  if (status === 'processing') {
    return (
      <div className="file-upload">
        <div className="dropzone dropzone--processing">
          <div className="spinner-wrap">
            <div className="spinner" />
            <FileSpreadsheet size={20} strokeWidth={1.8} className="spinner-inner-icon" />
          </div>
          <h3 className="dropzone__title dropzone__title--processing">
            {t.processingTitle}
          </h3>
          <p className="dropzone__subtitle">{t.processingSubtitle}</p>
          {file && (
            <div className="file-pill file-pill--processing">
              <FileSpreadsheet size={14} strokeWidth={2} />
              <span className="file-pill__name">{file.name}</span>
              <span className="file-pill__size">{formatBytes(file.size)}</span>
            </div>
          )}
          <div className="progress-track">
            <div className="progress-bar" />
          </div>
        </div>
      </div>
    );
  }

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