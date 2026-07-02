import {
  Landmark,
  Monitor,
  CreditCard,
  Truck,
  ShoppingCart,
  Package,
} from 'lucide-react';
import { useThemeLang } from '../context/ThemeLangProvider';
import FileUpload from '../components/FileUpload';

/* ═══════════════════════════════════════════════════════
   Coming-soon integration data
   ═══════════════════════════════════════════════════════ */
const INTEGRATIONS = [
  {
    icon: Landmark,
    nameAr: 'ربط البنوك المفتوحة',
    nameEn: 'Open Banking',
    descAr: 'مزامنة المعاملات البنكية تلقائياً',
    descEn: 'Auto-sync bank transactions',
  },
  {
    icon: Monitor,
    nameAr: 'نقاط البيع والكاشير',
    nameEn: 'POS & Cashier',
    descAr: 'تكامل مباشر مع أنظمة الكاشير',
    descEn: 'Direct POS integration',
  },
  {
    icon: CreditCard,
    nameAr: 'ربط بوابات الدفع',
    nameEn: 'Payment Gateways',
    descAr: 'استيراد المدفوعات والرسوم',
    descEn: 'Import payments and fees',
  },
  {
    icon: Truck,
    nameAr: 'تطبيقات التوصيل',
    nameEn: 'Delivery Apps',
    descAr: 'تتبع مبيعات وتكاليف التوصيل',
    descEn: 'Track delivery sales & costs',
  },
  {
    icon: ShoppingCart,
    nameAr: 'المتاجر الإلكترونية',
    nameEn: 'E-commerce',
    descAr: 'ربط منصات البيع الإلكترونية',
    descEn: 'Connect e-commerce platforms',
  },
  {
    icon: Package,
    nameAr: 'المخزون والتشغيل',
    nameEn: 'Inventory & Operations',
    descAr: 'مزامنة بيانات المستودعات',
    descEn: 'Sync warehouse data',
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
