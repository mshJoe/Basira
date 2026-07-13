import { useState } from 'react';
import {
  Landmark, Monitor, CreditCard, Truck, ShoppingCart, Package,
} from 'lucide-react';
import { useThemeLang } from '../context/ThemeLangProvider';
import FileUpload from '../components/FileUpload';

const INTEGRATIONS = [
  { icon: Landmark, nameAr: 'ربط البنوك المفتوحة', nameEn: 'Open Banking', descAr: 'مزامنة المعاملات البنكية تلقائياً', descEn: 'Auto-sync bank transactions' },
  { icon: Monitor, nameAr: 'نقاط البيع والكاشير', nameEn: 'POS & Cashier', descAr: 'تكامل مباشر مع أنظمة الكاشير', descEn: 'Direct POS integration' },
  { icon: CreditCard, nameAr: 'ربط بوابات الدفع', nameEn: 'Payment Gateways', descAr: 'استيراد المدفوعات والرسوم', descEn: 'Import payments and fees' },
  { icon: Truck, nameAr: 'تطبيقات التوصيل', nameEn: 'Delivery Apps', descAr: 'تتبع مبيعات وتكاليف التوصيل', descEn: 'Track delivery sales & costs' },
  { icon: ShoppingCart, nameAr: 'المتاجر الإلكترونية', nameEn: 'E-commerce', descAr: 'ربط منصات البيع الإلكترونية', descEn: 'Connect e-commerce platforms' },
  { icon: Package, nameAr: 'المخزون والتشغيل', nameEn: 'Inventory & Operations', descAr: 'مزامنة بيانات المستودعات', descEn: 'Sync warehouse data' },
];

export default function FileUploadPage() {
  const { lang } = useThemeLang();
  const isArabic = lang === 'ar';

  const [analysisResult, setAnalysisResult] = useState(null);

  const handleAnalysisComplete = (data) => {
    // حفظ النتائج في localStorage عشان باقي الصفحات تقدر تقرأها
    localStorage.setItem('basira_analysis', JSON.stringify(data));
    setAnalysisResult(data);
    
    // طباعة في الكونسول للتأكد
    console.log('Analysis result:', data);
  };

  return (
    <div className="fade-in">
      {/* File Upload */}
      <FileUpload onAnalysisComplete={handleAnalysisComplete} />

      {/* نتيجة التحليل لو وصلت */}
      {analysisResult && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1.5rem',
          borderRadius: '12px',
          background: analysisResult.alert.color === 'green'
            ? 'rgba(34,197,94,0.1)'
            : analysisResult.alert.color === 'yellow'
            ? 'rgba(234,179,8,0.1)'
            : 'rgba(239,68,68,0.1)',
          border: `1px solid ${
            analysisResult.alert.color === 'green' ? '#22c55e'
            : analysisResult.alert.color === 'yellow' ? '#eab308'
            : '#ef4444'
          }`
        }}>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>
            {analysisResult.alert.message}
          </h3>
          <p style={{ opacity: 0.8, marginBottom: '0.5rem' }}>
            {analysisResult.recommendation}
          </p>
          <small style={{ opacity: 0.6 }}>
            {isArabic ? 'احتمالية الخطر:' : 'Risk probability:'} {analysisResult.alert.risk_probability}%
          </small>
        </div>
      )}

      {/* Coming Soon Integrations */}
      <div style={{ marginTop: '2rem' }}>
        <h2 className="section-title">
          {isArabic ? 'تكاملات قادمة' : 'Coming Soon Integrations'}
        </h2>
        <p className="section-subtitle">
          {isArabic
            ? 'ربط تلقائي مع أنظمة الدفع والمحاسبة — قريباً'
            : 'Automatic connections to payment & accounting systems — coming soon'}
        </p>
        <div className="integrations-grid">
          {INTEGRATIONS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div className="integration-card" key={i}>
                <div className="integration-card__icon">
                  <Icon size={22} strokeWidth={1.6} />
                </div>
                <h3 className="integration-card__name">
                  {isArabic ? item.nameAr : item.nameEn}
                </h3>
                <p className="integration-card__desc">
                  {isArabic ? item.descAr : item.descEn}
                </p>
                <span className="integration-card__badge">
                  {isArabic ? 'قريباً' : 'Coming Soon'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}