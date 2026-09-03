import React, { useState } from 'react';
import {
  FileText,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Inbox,
  Trash2,
  Eye,
  RefreshCw,
  Send,
  ExternalLink
} from 'lucide-react';
import { LegalDocuments, ContactMessage } from '../../types';
import { storageService } from '../../services/storageService';

interface LegalAndContactManagerTabProps {
  onRefreshData: () => void;
  onOpenLegalPage: (page: 'terms' | 'privacy' | 'dmca' | 'licenses' | 'contact') => void;
}

export const LegalAndContactManagerTab: React.FC<LegalAndContactManagerTabProps> = ({
  onRefreshData,
  onOpenLegalPage,
}) => {
  const [legalDocs, setLegalDocs] = useState<LegalDocuments>(storageService.getLegalDocuments());
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(storageService.getContactMessages());
  const [subTab, setSubTab] = useState<'legal' | 'messages'>('legal');
  
  // Legal Form State
  const [terms, setTerms] = useState<string>(legalDocs.termsOfService);
  const [privacy, setPrivacy] = useState<string>(legalDocs.privacyPolicy);
  const [dmca, setDmca] = useState<string>(legalDocs.dmcaPolicy);
  const [licensesPolicy, setLicensesPolicy] = useState<string>(legalDocs.licensesPolicy || '');
  const [publisher, setPublisher] = useState<string>(legalDocs.publisherInfo);
  const [contactEmail, setContactEmail] = useState<string>(legalDocs.contactEmail);
  const [supportEmail, setSupportEmail] = useState<string>(legalDocs.supportEmail);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveLegalDocs = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = storageService.saveLegalDocuments({
      termsOfService: terms,
      privacyPolicy: privacy,
      dmcaPolicy: dmca,
      licensesPolicy: licensesPolicy,
      publisherInfo: publisher,
      contactEmail: contactEmail.trim(),
      supportEmail: supportEmail.trim(),
    });
    setLegalDocs(updated);
    showToast('تم حفظ وتحديث كافة السياسات والوثائق القانونية والتراخيص ومعلومات الناشر!');
  };

  const handleDeleteMessage = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
      storageService.deleteContactMessage(id);
      setContactMessages(storageService.getContactMessages());
      showToast('تم حذف الرسالة بنجاح.');
    }
  };

  const handleToggleRead = (id: string, currentRead: boolean) => {
    storageService.markContactMessageRead(id, !currentRead);
    setContactMessages(storageService.getContactMessages());
  };

  return (
    <div className="space-y-8 font-cairo text-[#2C2C2C]">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#4A5D4E] text-[#FDFCF8] px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-amiri font-bold text-2xl text-[#2C2C2C]">
              إدارة الصفحات القانونية والناشر والبريد
            </h2>
            <p className="text-xs text-[#6E6A64] mt-0.5">
              تعديل الشروط والأحكام، سياسة الخصوصية، معلومات الناشر، واستقبال رسائل التواصل عبر البريد
            </p>
          </div>
        </div>

        {/* SubTab Toggle */}
        <div className="flex items-center gap-2 bg-[#F7F5EE] p-1.5 rounded-2xl border border-[#E5E2D9]">
          <button
            type="button"
            onClick={() => setSubTab('legal')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'legal'
                ? 'bg-[#4A5D4E] text-[#FDFCF8] shadow-xs'
                : 'text-[#6E6A64] hover:text-[#2C2C2C]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>السياسات والناشر</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('messages')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer relative ${
              subTab === 'messages'
                ? 'bg-[#4A5D4E] text-[#FDFCF8] shadow-xs'
                : 'text-[#6E6A64] hover:text-[#2C2C2C]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>صندوق رسائل التواصل</span>
            {contactMessages.filter(m => !m.read).length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#C88A3B] text-white text-[10px] font-mono">
                {contactMessages.filter(m => !m.read).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* SubTab 1: Legal Documents Editor */}
      {subTab === 'legal' && (
        <form onSubmit={handleSaveLegalDocs} className="space-y-6">
          {/* Quick Previews Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-bold text-[#6E6A64] shrink-0">معاينة الصفحات كما يراها القارئ:</span>
            <button
              type="button"
              onClick={() => onOpenLegalPage('terms')}
              className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-xs font-bold text-[#4A5D4E] hover:bg-[#F7F5EE] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>الشروط والأحكام</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onOpenLegalPage('privacy')}
              className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-xs font-bold text-[#4A5D4E] hover:bg-[#F7F5EE] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>سياسة الخصوصية</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onOpenLegalPage('dmca')}
              className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-xs font-bold text-[#4A5D4E] hover:bg-[#F7F5EE] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>حقوق الملكية (DMCA)</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onOpenLegalPage('licenses')}
              className="px-3 py-1.5 rounded-xl bg-[#4A5D4E]/10 border border-[#4A5D4E]/30 text-xs font-bold text-[#4A5D4E] hover:bg-[#4A5D4E]/20 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>رخصة المشاع الإبداعي (CC BY-NC 4.0)</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onOpenLegalPage('contact')}
              className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#E5E2D9] text-xs font-bold text-[#4A5D4E] hover:bg-[#F7F5EE] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>معلومات الناشر والتواصل</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Publisher & Contact Emails */}
            <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-amiri font-bold text-lg text-[#2C2C2C] pb-2 border-b border-[#E5E2D9]">
                بيانات الناشر وبريد التواصل
              </h3>

              <div>
                <label className="block text-xs font-bold text-[#2C2C2C] mb-1">
                  البريد الرسمي للموقع / التحرير (ستصلك عليه الرسائل)
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] focus:outline-none font-mono text-left"
                  dir="ltr"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C2C2C] mb-1">
                  بريد الدعم الفني أو الشراكات الإعلانية
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={e => setSupportEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] focus:outline-none font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C2C2C] mb-1">
                  نبذة عن الناشر ورؤية المنصة
                </label>
                <textarea
                  rows={5}
                  value={publisher}
                  onChange={e => setPublisher(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] focus:outline-none leading-relaxed"
                />
              </div>
            </div>

            {/* Terms of Service */}
            <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-amiri font-bold text-lg text-[#2C2C2C] pb-2 border-b border-[#E5E2D9]">
                الشروط والأحكام العامة للموقع
              </h3>

              <div>
                <label className="block text-xs font-bold text-[#2C2C2C] mb-1">
                  بنود اتفاقية الاستخدام وحقوق النشر
                </label>
                <textarea
                  rows={10}
                  value={terms}
                  onChange={e => setTerms(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] focus:outline-none leading-relaxed"
                />
              </div>
            </div>

            {/* Privacy Policy */}
            <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-amiri font-bold text-lg text-[#2C2C2C] pb-2 border-b border-[#E5E2D9]">
                سياسة الخصوصية وملفات الكوكيز (AdSense & GDPR)
              </h3>

              <div>
                <label className="block text-xs font-bold text-[#2C2C2C] mb-1">
                  نص سياسة الخصوصية واستخدام ملفات تعريف الارتباط والإعلانات
                </label>
                <textarea
                  rows={10}
                  value={privacy}
                  onChange={e => setPrivacy(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] focus:outline-none leading-relaxed"
                />
              </div>
            </div>

            {/* DMCA Policy */}
            <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-amiri font-bold text-lg text-[#2C2C2C] pb-2 border-b border-[#E5E2D9]">
                سياسة حقوق الملكية الفكرية وقانون DMCA
              </h3>

              <div>
                <label className="block text-xs font-bold text-[#2C2C2C] mb-1">
                  شروط إرسال إشعارات التعدي والتعامل مع حقوق النشر
                </label>
                <textarea
                  rows={10}
                  value={dmca}
                  onChange={e => setDmca(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] focus:outline-none leading-relaxed"
                />
              </div>
            </div>

            {/* Licenses & Creative Commons Policy */}
            <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-3xl p-6 shadow-xs space-y-4 md:col-span-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E2D9]">
                <h3 className="font-amiri font-bold text-lg text-[#2C2C2C]">
                  بيان رخصة المشاع الإبداعي (CC BY-NC 4.0) والتراخيص
                </h3>
                <span className="text-xs text-[#4A5D4E] font-bold bg-[#4A5D4E]/10 px-3 py-1 rounded-lg">
                  رخصة المشاع الإبداعي المعتمدة
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C2C2C] mb-1">
                  نص صفحة التراخيص ورؤية العمل وشروط الاستشهاد
                </label>
                <textarea
                  rows={8}
                  value={licensesPolicy}
                  onChange={e => setLicensesPolicy(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] focus:outline-none leading-relaxed"
                  placeholder="أدخل نص التراخيص ورخصة العمل..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-8 py-3.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] font-bold text-sm rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>حفظ وتحديث جميع الصفحات القانونية</span>
            </button>
          </div>
        </form>
      )}

      {/* SubTab 2: Contact Messages Inbox */}
      {subTab === 'messages' && (
        <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E2D9]">
            <div>
              <h3 className="font-amiri font-bold text-xl text-[#2C2C2C] flex items-center gap-2">
                <Inbox className="w-5 h-5 text-[#4A5D4E]" />
                <span>الرسائل الواردة من القراء والمؤلفين</span>
              </h3>
              <p className="text-xs text-[#6E6A64] mt-0.5">
                تصل الرسائل هنا مباشرة عند قيام أي قارئ أو كاتب بإرسال نموذج "تواصل معنا"
              </p>
            </div>
            <div className="text-xs font-bold text-[#6E6A64] bg-[#F7F5EE] px-3.5 py-1.5 rounded-xl border border-[#E5E2D9]">
              إجمالي الرسائل: <span className="font-mono text-[#2C2C2C]">{contactMessages.length}</span>
            </div>
          </div>

          {contactMessages.length === 0 ? (
            <div className="text-center py-16 text-[#8E8A83]">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-40 text-[#4A5D4E]" />
              <p className="text-sm font-bold">لا توجد رسائل واردة جديدة حالياً</p>
              <p className="text-xs mt-1">ستظهر هنا أي استفسارات أو طلبات شراكة يرسلها زوار الموقع.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contactMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    !msg.read
                      ? 'bg-[#4A5D4E]/5 border-[#4A5D4E]/40 shadow-xs'
                      : 'bg-[#FDFCF8] border-[#E5E2D9]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E2D9]/60">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#2C2C2C]">{msg.name}</span>
                        {!msg.read && (
                          <span className="px-2 py-0.5 rounded-full bg-[#C88A3B] text-white text-[10px] font-bold">
                            جديدة
                          </span>
                        )}
                      </div>
                      <a
                        href={`mailto:${msg.email}`}
                        className="text-xs text-[#4A5D4E] hover:underline font-mono"
                        dir="ltr"
                      >
                        {msg.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#8E8A83] font-mono">
                        {new Date(msg.createdAt).toLocaleString('ar-EG')}
                      </span>
                    </div>
                  </div>

                  {msg.subject && (
                    <div className="mt-3">
                      <span className="text-xs font-bold text-[#6E6A64]">الموضوع: </span>
                      <span className="text-xs font-bold text-[#2C2C2C]">{msg.subject}</span>
                    </div>
                  )}

                  <p className="text-xs text-[#2C2C2C] leading-relaxed mt-2 p-3.5 bg-[#FFFFFF] rounded-xl border border-[#E5E2D9]">
                    {msg.message}
                  </p>

                  <div className="flex items-center justify-end gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => handleToggleRead(msg.id, msg.read)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#4A5D4E] hover:bg-[#4A5D4E]/10 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{msg.read ? 'تعليم كغير مقروءة' : 'تعليم كمقروءة'}</span>
                    </button>

                    <a
                      href={`mailto:${msg.email}?subject=رد من منصة نوفيليا: ${encodeURIComponent(msg.subject || '')}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#FDFCF8] bg-[#4A5D4E] hover:bg-[#3C4C3F] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>الرد عبر البريد</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
