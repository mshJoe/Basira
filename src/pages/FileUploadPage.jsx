import {
  CreditCard,
  Smartphone,
  ShoppingCart,
  Database,
  Layers,
  Globe,
} from 'lucide-react';
import { useThemeLang } from '../context/ThemeLangProvider';
import FileUpload from '../components/FileUpload';

/* ═══════════════════════════════════════════════════════
   Coming-soon integration data
   ═══════════════════════════════════════════════════════ */
const INTEGRATIONS = [
  {
    icon: CreditCard,
    nameAr: 'مدى',
    nameEn: 'Mada',
    descAr: 'ربط مباشر مع بوابة مدى للمدفوعات',
    descEn: 'Direct integration with Mada payment gateway',
  },
  {
    icon: Smartphone,
    nameAr: 'STC Pay',
    nameEn: 'STC Pay',
    descAr: 'استيراد بيانات المعاملات تلقائياً',
    descEn: 'Auto-import transaction data',
  },
  {
    icon: ShoppingCart,
    nameAr: 'Foodics',
    nameEn: 'Foodics',
    descAr: 'ربط نظام نقاط البيع مع بصيرة',
    descEn: 'Connect POS system with Basira',
  },
  {
    icon: Database,
    nameAr: 'Odoo ERP',
    nameEn: 'Odoo ERP',
    descAr: 'مزامنة البيانات المالية من Odoo',
    descEn: 'Sync financial data from Odoo',
  },
  {
    icon: Layers,
    nameAr: 'SAP Business One',
    nameEn: 'SAP Business One',
    descAr: 'تكامل مع نظام SAP المحاسبي',
    descEn: 'Integration with SAP accounting system',
  },
  {
    icon: Globe,
    nameAr: 'Apple Pay',
    nameEn: 'Apple Pay',
    descAr: 'ربط مدفوعات Apple Pay',
    descEn: 'Connect Apple Pay payments',
  },
];

/**
 * FileUploadPage — File upload area + coming-soon integrations grid.
 */
export default function FileUploadPage() {
  const { lang } = useThemeLang();
  const isArabic = lang === 'ar';

  return (
    <div className="fade-in">
      {/* File Upload */}
      <FileUpload />

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
