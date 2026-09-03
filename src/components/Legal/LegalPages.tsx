import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, Mail, Lock, FileText, CheckCircle2, Send, Award, ExternalLink, Check, X as XIcon, BookOpen } from 'lucide-react';
import { storageService } from '../../services/storageService';

interface LegalPagesProps {
  page: 'terms' | 'privacy' | 'dmca' | 'licenses' | 'contact' | 'ads_txt';
  onBack: () => void;
}

export const LegalPages: React.FC<LegalPagesProps> = ({ page, onBack }) => {
  const legalDocs = storageService.getLegalDocuments();
  
  // Contact form state
  const [senderName, setSenderName] = useState<string>('');
  const [senderEmail, setSenderEmail] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSent, setIsSent] = useState<boolean>(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderEmail.trim() || !message.trim()) return;

    storageService.sendContactMessage(senderName, senderEmail, message, subject);
    setIsSent(true);
    setSenderName('');
    setSenderEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-[#2C2C2C] font-cairo">
      <button
        type="button"
        id="legal-back-btn"
        onClick={onBack}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] hover:bg-[#F7F5EE] text-[#2C2C2C] text-xs font-semibold mb-8 cursor-pointer shadow-xs transition-colors"
      >
        <ArrowLeft className="w-4 h-4 text-[#4A5D4E]" />
        <span>العودة إلى الواجهة الرئيسية</span>
      </button>

      {/* TERMS OF SERVICE */}
      {page === 'terms' && (
        <article className="space-y-6 bg-[#FFFFFF] border border-[#E5E2D9] p-6 sm:p-10 rounded-3xl shadow-xs">
          <div className="border-b border-[#E5E2D9] pb-4">
            <span className="text-xs uppercase font-bold text-[#4A5D4E]">اتفاقية الاستخدام والناشر</span>
            <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-[#2C2C2C] mt-1">
              الشروط والأحكام العامة للموقع
            </h1>
            <p className="text-xs text-[#6E6A64] mt-1">آخر تحديث: {legalDocs.lastUpdated}</p>
          </div>

          <div className="text-sm text-[#2C2C2C] leading-relaxed whitespace-pre-line bg-[#FDFCF8] p-5 rounded-2xl border border-[#E5E2D9]">
            {legalDocs.termsOfService}
          </div>
        </article>
      )}

      {/* PRIVACY POLICY */}
      {page === 'privacy' && (
        <article className="space-y-6 bg-[#FFFFFF] border border-[#E5E2D9] p-6 sm:p-10 rounded-3xl shadow-xs">
          <div className="border-b border-[#E5E2D9] pb-4">
            <span className="text-xs uppercase font-bold text-[#4A5D4E]">الخصوصية وأمان البيانات</span>
            <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-[#2C2C2C] mt-1">
              سياسة الخصوصية وملفات تعريف الارتباط (Cookies & AdSense)
            </h1>
            <p className="text-xs text-[#6E6A64] mt-1">متوافقة مع معايير Google AdSense و GDPR و CCPA</p>
          </div>

          <div className="text-sm text-[#2C2C2C] leading-relaxed whitespace-pre-line bg-[#FDFCF8] p-5 rounded-2xl border border-[#E5E2D9]">
            {legalDocs.privacyPolicy}
          </div>
        </article>
      )}

      {/* DMCA POLICY */}
      {page === 'dmca' && (
        <article className="space-y-6 bg-[#FFFFFF] border border-[#E5E2D9] p-6 sm:p-10 rounded-3xl shadow-xs">
          <div className="border-b border-[#E5E2D9] pb-4">
            <span className="text-xs uppercase font-bold text-[#4A5D4E]">حماية الملكية الفكرية</span>
            <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-[#2C2C2C] mt-1">
              حقوق النشر والملكية الأدبية وقانون DMCA
            </h1>
            <p className="text-xs text-[#6E6A64] mt-1">Digital Millennium Copyright Act Compliance</p>
          </div>

          <div className="text-sm text-[#2C2C2C] leading-relaxed whitespace-pre-line bg-[#FDFCF8] p-5 rounded-2xl border border-[#E5E2D9]">
            {legalDocs.dmcaPolicy}
          </div>
        </article>
      )}

      {/* LICENSES / CREATIVE COMMONS */}
      {page === 'licenses' && (
        <article className="space-y-6 bg-[#FFFFFF] border border-[#E5E2D9] p-6 sm:p-10 rounded-3xl shadow-xs">
          <div className="border-b border-[#E5E2D9] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4A5D4E]" />
                <span className="text-xs uppercase font-bold text-[#4A5D4E]">رخصة النشر والاستخدام</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-[#2C2C2C] mt-1">
                التراخيص وحقوق الاستشهاد والمشاركة
              </h1>
              <p className="text-xs text-[#6E6A64] mt-1">
                رخصة المشاع الإبداعي (نسب المصنف - غير تجاري 4.0 دولي) CC BY-NC 4.0
              </p>
            </div>

            <a
              href="https://creativecommons.org/licenses/by-nc/4.0/deed.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4A5D4E]/10 hover:bg-[#4A5D4E]/20 text-[#4A5D4E] font-bold text-xs transition-colors shrink-0"
            >
              <span>نص الرخصة الرسمي (CC BY-NC 4.0)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Statement Highlight Box */}
          <div className="bg-[#4A5D4E]/5 border border-[#4A5D4E]/20 p-6 sm:p-7 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-[#4A5D4E] font-bold text-sm">
              <BookOpen className="w-4 h-4" />
              <span>عن هذا العمل ورؤية الكاتب أيمن كناني:</span>
            </div>
            <blockquote className="text-base sm:text-lg font-amiri font-semibold text-[#2C2C2C] leading-relaxed italic pr-3 border-r-2 border-[#4A5D4E]">
              "أضع هذا العمل ابتغاء وجه الله، وأسمح بتدريسه والاستشهاد به ونشره للفائدة، شريطة نسبته لصاحبه الأصلي وعدم استغلاله تجاريًا."
            </blockquote>
            <p className="text-sm text-[#4A4740] leading-relaxed">
              الأفكار والرؤية في هذا العمل نابعة مني بالكامل. أستعين بأدوات الذكاء الاصطناعي لتوسيع الأفكار وصياغتها الأولية، مع مراجعتي وإشرافي الكامل على كل نص قبل نشره.
            </p>
          </div>

          {/* Permissions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#F7F9F6] border border-[#D5E1D7] p-5 rounded-2xl space-y-3">
              <h3 className="font-bold text-sm text-[#2D5A34] flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>ما يُسمح به بحرية (وفق الرخصة):</span>
              </h3>
              <ul className="space-y-2 text-xs text-[#3E4A3F] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>المشاركة والتوزيع:</strong> نسخ العمل وتوزيعه بأي صيغة أو وسيلة رقمية أو ورقية.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>التدريس والأكاديميا:</strong> استخدام النصوص وتدريسها في المناهج والجامعات والدورات التدريبية.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>الاقتباس والاستشهاد:</strong> الاستشهاد بالأفكار والأطروحات في الأبحاث والمقالات.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>التطوير والاشتقاق:</strong> البناء على هذه الأفكار لإنتاج محتوى معرفي جديد غير تجاري.</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#FDF8F6] border border-[#EED7D0] p-5 rounded-2xl space-y-3">
              <h3 className="font-bold text-sm text-[#873420] flex items-center gap-2">
                <XIcon className="w-4 h-4 text-rose-600" />
                <span>الشروط والقيود الإلزامية:</span>
              </h3>
              <ul className="space-y-2 text-xs text-[#5D3A32] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>نسب المصنف (Attribution):</strong> يجب وجوباً ذكر اسم الكاتب الأصلي (أيمن كناني - Ayman Kinani) ورابط المنصة.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>غير تجاري (Non-Commercial):</strong> يُحظر تماماً بيع العمل أو استغلاله في منتجات أو دورات مدفوعة لتحقيق أرباح دون إذن كتابي مسبق.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Full Custom License Text from Settings */}
          {legalDocs.licensesPolicy && (
            <div className="text-sm text-[#2C2C2C] leading-relaxed whitespace-pre-line bg-[#FDFCF8] p-5 rounded-2xl border border-[#E5E2D9]">
              {legalDocs.licensesPolicy}
            </div>
          )}

          {/* Direct Link Banner */}
          <div className="p-4 rounded-2xl bg-[#F7F5EE] border border-[#E5E2D9] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#6E6A64]">
              <Award className="w-4 h-4 text-[#C88A3B]" />
              <span>ترخيص المشاع الإبداعي المعتمد دولياً (Creative Commons Attribution-NonCommercial 4.0 International)</span>
            </div>
            <a
              href="https://creativecommons.org/licenses/by-nc/4.0/deed.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4A5D4E] hover:underline font-bold flex items-center gap-1"
            >
              <span>زيارة موقع رخصة المشاع الإبداعي الرسمي</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </article>
      )}

      {/* CONTACT / ABOUT PUBLISHER */}
      {page === 'contact' && (
        <article className="space-y-6 bg-[#FFFFFF] border border-[#E5E2D9] p-6 sm:p-10 rounded-3xl shadow-xs">
          <div className="border-b border-[#E5E2D9] pb-4">
            <span className="text-xs uppercase font-bold text-[#4A5D4E]">الناشر والتواصل المباشر</span>
            <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-[#2C2C2C] mt-1">
              معلومات الناشر والتواصل معنا
            </h1>
            <p className="text-xs text-[#6E6A64] mt-1">استفسارات القراء، طلبات النشر، والرعايات الرسمية</p>
          </div>

          <section className="space-y-6 text-sm text-[#2C2C2C] leading-relaxed">
            <div className="text-sm text-[#2C2C2C] leading-relaxed whitespace-pre-line bg-[#FDFCF8] p-5 rounded-2xl border border-[#E5E2D9]">
              {legalDocs.publisherInfo}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#F7F5EE] border border-[#E5E2D9]">
                <div className="flex items-center gap-2 text-[#4A5D4E] mb-1">
                  <Mail className="w-4 h-4" />
                  <strong className="text-xs uppercase font-bold">البريد الإلكتروني للناشر وفريق التحرير</strong>
                </div>
                <p className="text-xs font-mono text-[#2C2C2C]" dir="ltr">{legalDocs.contactEmail}</p>
              </div>

              {legalDocs.supportEmail && (
                <div className="p-4 rounded-2xl bg-[#F7F5EE] border border-[#E5E2D9]">
                  <div className="flex items-center gap-2 text-[#4A5D4E] mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <strong className="text-xs uppercase font-bold">الشراكات الإعلانية والدعم الفني</strong>
                  </div>
                  <p className="text-xs font-mono text-[#2C2C2C]" dir="ltr">{legalDocs.supportEmail}</p>
                </div>
              )}
            </div>

            {/* Direct Contact Form */}
            <div className="p-6 rounded-2xl bg-[#F7F5EE] border border-[#E5E2D9]">
              <h4 className="font-amiri font-bold text-lg text-[#2C2C2C] mb-1">
                إرسال رسالة مباشرة إلى بريد الناشر والإدارة
              </h4>
              <p className="text-xs text-[#6E6A64] mb-4">
                سيتم إرسال رسالتك مباشرة وحفظها في صندوق بريد الإدارة ليتم الرد عليك عبر بريدك الإلكتروني
              </p>

              {isSent && (
                <div className="mb-4 p-3.5 rounded-xl bg-[#4A5D4E]/10 border border-[#4A5D4E]/30 text-[#4A5D4E] text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>شكراً لك! تم استلام رسالتك بنجاح وسيتواصل معك فريق الناشر في أقرب وقت.</span>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="اسمك الكامل *"
                    required
                    value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
                  />
                  <input
                    type="email"
                    placeholder="بريدك الإلكتروني (لتلقي الرد) *"
                    required
                    value={senderEmail}
                    onChange={e => setSenderEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] text-left font-mono"
                    dir="ltr"
                  />
                </div>

                <input
                  type="text"
                  placeholder="موضوع الرسالة (اختياري)"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
                />

                <textarea
                  rows={4}
                  placeholder="اكتب استفسارك، اقتراحك، أو طلب النشر بالتفصيل..."
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full p-3.5 text-xs rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] leading-relaxed"
                />

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] text-xs font-bold rounded-xl cursor-pointer transition-all shadow-xs flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال الرسالة إلى الناشر</span>
                </button>
              </form>
            </div>
          </section>
        </article>
      )}
    </div>
  );
};
