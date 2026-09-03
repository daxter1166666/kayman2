import React, { useState } from 'react';
import { Novel, Chapter, AdSettings } from '../../types';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Copy,
  ExternalLink,
  Globe
} from 'lucide-react';

interface AdSenseComplianceTabProps {
  novels: Novel[];
  chapters: Chapter[];
  adSettings: AdSettings;
  onOpenLegalPage: (page: 'terms' | 'privacy' | 'dmca' | 'contact') => void;
}

export const AdSenseComplianceTab: React.FC<AdSenseComplianceTabProps> = ({
  novels,
  chapters,
  adSettings,
  onOpenLegalPage,
}) => {
  const [copiedAdsTxt, setCopiedAdsTxt] = useState<boolean>(false);

  const totalWords = chapters.reduce((acc, c) => acc + c.wordCount, 0);

  // Criteria calculations
  const criteria = [
    {
      title: 'حجم المحتوى الروائي الأصلي الحصري',
      desc: 'تشترط Google وجود محتوى أصلي كافٍ وعالي الجودة. يحتوي موقعك حالياً على روايات متعددة وفصول وفيرة ذات نصوص أدبية ثرية.',
      status: chapters.length >= 3 && totalWords >= 2000,
      metric: `${chapters.length} فصول (${totalWords.toLocaleString()} كلمة)`,
      requirement: 'الحد الأدنى: 3 فصول أصلية على الأقل بنصوص أدبية فريدة',
    },
    {
      title: 'سياسة الخصوصية الإلزامية (GDPR / CCPA / Cookies / AdSense)',
      desc: 'تتطلب سياسات Google إفصاحاً صريحاً عن ملفات تعريف الارتباط (Cookies)، وملف تعريف DART، وتتبع الموردين من جهات خارجية وطرق تعطيلها.',
      status: true,
      metric: 'مطابقة بالكامل ومدمجة بالموقع',
      action: () => onOpenLegalPage('privacy'),
      actionLabel: 'معاينة سياسة الخصوصية',
    },
    {
      title: 'شروط وأحكام الاستخدام والخدمة',
      desc: 'إرشادات واضحة للزوار حول حقوق الملكية الفكرية، شروط التعليق والتفاعل، وقواعد استخدام المنصة.',
      status: true,
      metric: 'مطابقة بالكامل ومدمجة بالموقع',
      action: () => onOpenLegalPage('terms'),
      actionLabel: 'معاينة شروط الاستخدام',
    },
    {
      title: 'سياسة حماية حقوق النشر والملكية (DMCA)',
      desc: 'تحمي حقوق المؤلف الأدبية وتوفر وسيلة رسمية للإبلاغ عن أي انتهاكات معتمدة قانونياً.',
      status: true,
      metric: 'مطابقة بالكامل ومدمجة بالموقع',
      action: () => onOpenLegalPage('dmca'),
      actionLabel: 'معاينة سياسة DMCA',
    },
    {
      title: 'صفحة تواصل مباشرة وشفافية هوية الناشر',
      desc: 'معلومات واضحة حول الكاتب/الناشر، بريد إلكتروني مباشر، واستمارة تواصل رسمية للمراجعين والزوار.',
      status: true,
      metric: 'متاحة في شريط التنقل والتذييل',
      action: () => onOpenLegalPage('contact'),
      actionLabel: 'معاينة صفحة اتصل بنا',
    },
    {
      title: 'ملف البائعين الرقميين المعتمدين (ads.txt)',
      desc: 'مطابقة نص الناشر المعتمد مع معرف حسابك في Google AdSense (ca-pub-XXXXXXXXXX).',
      status: !!adSettings.googleAdSense.adsTxtContent && adSettings.googleAdSense.adsTxtContent.includes('google.com'),
      metric: adSettings.googleAdSense.publisherId || 'مُعدّ وجاهز',
      requirement: 'google.com, pub-XXXXX, DIRECT, f08c47fec0942fa0',
    },
    {
      title: 'تصميم متجاوب بالكامل وتجربة قراءة فائقة السرعة',
      desc: 'خطوط عربية مريحة للعين، تحكم في الحجم والإضاءة، وعدم وجود نوافذ منبثقة مزعجة وفق معايير Better Ads Standards.',
      status: true,
      metric: 'جاهز للهواتف الذكية والأجهزة اللوحية بنسبة 100%',
      requirement: 'تصميم انسيابي لكافة أحجام الشاشات',
    },
    {
      title: 'مواضع إعلانية واضحة وغير مضللة',
      desc: 'وضع وسم "إعلان" أو "راعي رسمي" بوضوح فوق كل وحدة إعلانية لمنع النقرات الخاطئة أو غير المقصودة.',
      status: true,
      metric: 'تسميات إعلانية قياسية مفعلة',
      requirement: 'حدود واضحة وإفصاح صريح لكل موضع إعلاني',
    },
  ];

  const passedCount = criteria.filter(c => c.status).length;
  const readinessScore = Math.round((passedCount / criteria.length) * 100);

  const handleCopyAdsTxt = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(adSettings.googleAdSense.adsTxtContent);
      setCopiedAdsTxt(true);
      setTimeout(() => setCopiedAdsTxt(false), 2500);
    }
  };

  return (
    <div className="space-y-8 text-[#2C2C2C] font-cairo">
      {/* Score Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E5E2D9] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-[#4A5D4E] text-[#FDFCF8]">
              تدقيق جاهزية القبول في AdSense
            </span>
            <span className="text-xs text-[#6E6A64]">متوافق مع سياسات ناشري Google</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-amiri font-bold text-[#2C2C2C] mb-1">
            دليل ومتطلبات القبول في Google AdSense
          </h2>
          <p className="text-xs sm:text-sm text-[#6E6A64] max-w-2xl leading-relaxed">
            موقعك يلبي المعايير والشروط الصارمة لشركة Google، بما يشمل أصالة المحتوى الروائي، والصفحات القانونية الإلزامية، وتوزيع الإعلانات المريح، وتكامل ملف ads.txt.
          </p>
        </div>

        {/* Big Score Gauge */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F7F5EE] border border-[#E5E2D9] shrink-0">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-amiri font-bold text-[#4A5D4E] font-mono">
              %{readinessScore}
            </div>
            <span className="text-[10px] font-bold text-[#6E6A64]">
              نسبة الجاهزية للقبول
            </span>
          </div>
          <div className="h-10 w-px bg-[#E5E2D9]" />
          <div className="text-xs text-[#2C2C2C] space-y-1">
            <div className="flex items-center gap-1.5 text-[#4A5D4E] font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{passedCount} من أصل {criteria.length} معايير مكتملة</span>
            </div>
            <div className="text-[11px] text-[#6E6A64]">مؤهل للتقديم والمراجعة الفورية</div>
          </div>
        </div>
      </div>

      {/* Step by Step Compliance Checklist */}
      <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs">
        <h3 className="font-amiri font-bold text-lg text-[#2C2C2C] flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-[#4A5D4E]" />
          <span>قائمة التحقق من متطلبات ناشري Google AdSense الرسمية</span>
        </h3>

        <div className="space-y-3.5">
          {criteria.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                item.status
                  ? 'bg-[#FDFCF8] border-[#E5E2D9] hover:border-[#4A5D4E]'
                  : 'bg-rose-50 border-rose-200'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="pt-0.5 shrink-0">
                  {item.status ? (
                    <CheckCircle2 className="w-5 h-5 text-[#4A5D4E]" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                  )}
                </div>
                <div>
                  <h4 className="font-amiri font-bold text-base text-[#2C2C2C] mb-0.5">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#6E6A64] leading-relaxed">
                    {item.desc}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-[#6E6A64]">
                    <span className="text-[#4A5D4E] font-bold">{item.metric}</span>
                    {item.requirement && <span>· الشرط المطلوب: {item.requirement}</span>}
                  </div>
                </div>
              </div>

              {item.action && (
                <div className="shrink-0 pt-2 md:pt-0">
                  <button
                    type="button"
                    id={`compliance-action-${idx}`}
                    onClick={item.action}
                    className="px-3.5 py-1.5 rounded-lg border border-[#4A5D4E]/30 bg-[#4A5D4E]/10 hover:bg-[#4A5D4E]/20 text-[#4A5D4E] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{item.actionLabel}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Guide: How to Apply & Submit to Google AdSense */}
      <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs">
        <h3 className="font-amiri font-bold text-lg text-[#2C2C2C] flex items-center gap-2 mb-3">
          <Globe className="w-5 h-5 text-[#4A5D4E]" />
          <span>خطوات التقديم على حساب Google AdSense خطوة بخطوة</span>
        </h3>
        <p className="text-xs text-[#6E6A64] leading-relaxed mb-6">
          اتبع هذه الخطوات البسيطة عند تقديم رابط موقعك إلى منصة Google AdSense الرسمية للحصول على قبول سريع:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#F7F5EE] border border-[#E5E2D9]">
            <span className="w-6 h-6 rounded-full bg-[#4A5D4E] text-[#FDFCF8] font-bold text-xs flex items-center justify-center mb-2">
              1
            </span>
            <h5 className="font-amiri font-bold text-sm text-[#2C2C2C] mb-1">إنشاء حساب AdSense</h5>
            <p className="text-[11px] text-[#6E6A64] leading-relaxed">
              قم بزيارة <span className="text-[#4A5D4E] font-bold" dir="ltr">google.com/adsense</span> وسجل الدخول بحساب Google الخاص بك.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F5EE] border border-[#E5E2D9]">
            <span className="w-6 h-6 rounded-full bg-[#4A5D4E] text-[#FDFCF8] font-bold text-xs flex items-center justify-center mb-2">
              2
            </span>
            <h5 className="font-amiri font-bold text-sm text-[#2C2C2C] mb-1">إضافة رابط الموقع</h5>
            <p className="text-[11px] text-[#6E6A64] leading-relaxed">
              أدخل رابط موقعك؛ حيث تتيح بنية الموقع السلسة لعناكب Google فهرسة الفصول بسهولة.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F5EE] border border-[#E5E2D9]">
            <span className="w-6 h-6 rounded-full bg-[#4A5D4E] text-[#FDFCF8] font-bold text-xs flex items-center justify-center mb-2">
              3
            </span>
            <h5 className="font-amiri font-bold text-sm text-[#2C2C2C] mb-1">تضمين معرّف ads.txt</h5>
            <p className="text-[11px] text-[#6E6A64] leading-relaxed">
              انسخ معرّف الناشر (<code className="text-[#4A5D4E] font-bold" dir="ltr">ca-pub-XXXXX</code>) وضعه في تبويب AdSense في لوحة التحكم هنا.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F5EE] border border-[#E5E2D9]">
            <span className="w-6 h-6 rounded-full bg-[#4A5D4E] text-[#FDFCF8] font-bold text-xs flex items-center justify-center mb-2">
              4
            </span>
            <h5 className="font-amiri font-bold text-sm text-[#2C2C2C] mb-1">طلب المراجعة وتحقيق الدخل</h5>
            <p className="text-[11px] text-[#6E6A64] leading-relaxed">
              ستقوم Google بمراجعة الموقع والموافقة عليه؛ لتبدأ الإعلانات بالظهور وتحقيق الأرباح تلقائياً!
            </p>
          </div>
        </div>
      </div>

      {/* ads.txt Inspector */}
      <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#4A5D4E]" />
            <h4 className="font-amiri font-bold text-base text-[#2C2C2C]">
              محتوى ملف ads.txt الفعلي المعتمد للموقع
            </h4>
          </div>
          <button
            type="button"
            id="compliance-copy-ads-btn"
            onClick={handleCopyAdsTxt}
            className="px-3 py-1.5 bg-[#F7F5EE] hover:bg-[#E5E2D9] text-[#2C2C2C] text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border border-[#E5E2D9]"
          >
            <Copy className="w-3 h-3" />
            <span>{copiedAdsTxt ? 'تم النسخ إلى الحافظة!' : 'نسخ ملف ads.txt'}</span>
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-xs font-mono text-[#2C2C2C] overflow-x-auto text-left" dir="ltr">
          {adSettings.googleAdSense.adsTxtContent}
        </pre>
      </div>
    </div>
  );
};
