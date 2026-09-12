import React, { useState, useEffect } from 'react';
import {
  PenTool,
  BookOpen,
  FileText,
  Lock,
  User,
  KeyRound,
  Mail,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  ShieldCheck,
  Award,
  Feather
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { AuthorAccount } from '../types';

export interface AuthorPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (author: AuthorAccount) => void;
  onOpenAddArticle?: () => void;
  onOpenAddBook?: () => void;
}

export const AuthorPortalModal: React.FC<AuthorPortalModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenAddArticle,
  onOpenAddBook,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login Form
  const [loginIdentifier, setLoginIdentifier] = useState('أيمن كناني');
  const [loginPasscode, setLoginPasscode] = useState('');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regPenName, setRegPenName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSpecialization, setRegSpecialization] = useState('روايات ودراسات فكرية');
  const [regBio, setRegBio] = useState('');
  const [regPasscode, setRegPasscode] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing authors and default passcode info
  const [registeredAuthors, setRegisteredAuthors] = useState<AuthorAccount[]>([]);

  useEffect(() => {
    if (isOpen) {
      setRegisteredAuthors(storageService.getRegisteredAuthors());
      const active = storageService.getActiveAuthor();
      if (active) {
        setLoginIdentifier(active.name);
      }
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginIdentifier.trim()) {
      setErrorMessage('يرجى إدخال اسم الكاتب أو بريده الإلكتروني');
      return;
    }
    if (!loginPasscode.trim()) {
      setErrorMessage('يرجى إدخال الكود السري أو كلمة المرور الخاصة بالكاتب');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const author = storageService.loginAuthorAccount(loginIdentifier, loginPasscode);
      setIsLoading(false);
      if (author) {
        setSuccessMessage(`أهلاً بك أستاذ ${author.name}! تم الدخول لاستوديو التأليف بنجاح.`);
        setTimeout(() => {
          onLoginSuccess(author);
          onClose();
        }, 600);
      } else {
        setErrorMessage('بيانات الدخول غير صحيحة. تأكد من الاسم والكود السري (يمكنك استخدام AK-2026-AUTH أو التسجيل ككاتب جديد).');
      }
    }, 350);
  };

  // Handle Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim()) {
      setErrorMessage('يرجى إدخال اسم الكاتب الكامل.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('يرجى إدخال بريد إلكتروني صحيح.');
      return;
    }
    if (!regPasscode.trim() || regPasscode.trim().length < 4) {
      setErrorMessage('يرجى تحديد كود سري أو كلمة مرور من 4 خانات على الأقل لحماية حسابك.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const newAuthor = storageService.registerAuthor({
        name: regName.trim(),
        penName: regPenName.trim() || regName.trim(),
        email: regEmail.trim(),
        specialization: regSpecialization,
        bio: regBio.trim() || 'كاتب ومفكر مشارك في المنصة.',
        secretPasscode: regPasscode.trim().toUpperCase(),
        role: 'author',
      });

      setIsLoading(false);
      setSuccessMessage(`مرحباً بك أستاذ ${newAuthor.name}! تم إنشاء حساب الكاتب الخاص بك بنجاح، وتفعيل صلاحيات نشر الكتب والمقالات.`);
      setTimeout(() => {
        onLoginSuccess(newAuthor);
        onClose();
      }, 700);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#2C2C2C]/50 backdrop-blur-xs font-cairo" dir="rtl">
      <div className="bg-[#FDFCF8] border border-[#E5E2D9] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#E5E2D9] bg-[#FAF8F2] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4A5D4E] text-[#FDFCF8] flex items-center justify-center shadow-xs">
              <Feather className="w-5 h-5 text-[#C88A3B]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2C2C2C]">
                بوابة الكتّاب والمؤلفين
              </h3>
              <p className="text-xs text-[#6E6A64]">
                مساحة المؤلفين لإضافة ونشر الروايات، الكتب، والدراسات الفكرية
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#8E8A83] hover:text-[#2C2C2C] rounded-xl hover:bg-[#EAE7DD] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E5E2D9] bg-[#F7F5EE] text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-center transition-all cursor-pointer border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'login'
                ? 'border-[#4A5D4E] text-[#4A5D4E] bg-white'
                : 'border-transparent text-[#6E6A64] hover:text-[#2C2C2C]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>تسجيل دخول كاتب معتمد</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-center transition-all cursor-pointer border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'register'
                ? 'border-[#4A5D4E] text-[#4A5D4E] bg-white'
                : 'border-transparent text-[#6E6A64] hover:text-[#2C2C2C]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C88A3B]" />
            <span>تسجيل كاتب جديد / نشر مؤلفات</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {/* Alerts */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2C2C2C]">
                  اسم الكاتب أو البريد الإلكتروني:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    placeholder="مثال: أيمن كناني أو your-email@example.com"
                    required
                    className="w-full pr-9 pl-3 py-2.5 text-xs rounded-xl bg-white border border-[#E5E2D9] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] text-[#2C2C2C] focus:outline-none"
                  />
                  <User className="w-4 h-4 text-[#8E8A83] absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-[#2C2C2C]">
                    الكود السري للكاتب أو كلمة المرور:
                  </label>
                  <span className="text-[11px] text-[#4A5D4E] font-medium">
                    كود كناني المباشر: <code className="font-mono bg-[#EAE7DD] px-1 rounded">AK-2026-AUTH</code>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={loginPasscode}
                    onChange={e => setLoginPasscode(e.target.value)}
                    placeholder="أدخل الكود السري الخاص بك..."
                    required
                    className="w-full pr-9 pl-3 py-2.5 text-xs rounded-xl bg-white border border-[#E5E2D9] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] text-[#2C2C2C] focus:outline-none font-mono"
                  />
                  <KeyRound className="w-4 h-4 text-[#8E8A83] absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Quick Author Selection */}
              {registeredAuthors.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-[#8E8A83] block mb-2">
                    الكتّاب المسجلون في المنصة:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {registeredAuthors.map(auth => (
                      <button
                        key={auth.id}
                        type="button"
                        onClick={() => {
                          setLoginIdentifier(auth.name);
                          setLoginPasscode(auth.secretPasscode);
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-[#FAF8F2] hover:bg-[#F0ECE1] border border-[#E5E2D9] text-[#2C2C2C] flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <User className="w-3 h-3 text-[#4A5D4E]" />
                        <span>{auth.name}</span>
                        {auth.role === 'admin' && (
                          <span className="text-[9px] bg-[#4A5D4E]/10 text-[#4A5D4E] px-1 rounded">مشرف</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38493C] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer mt-4"
              >
                {isLoading ? (
                  <span>جاري التحقق...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#C88A3B]" />
                    <span>الدخول لاستوديو النشر والتأليف</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* TAB 2: REGISTER NEW AUTHOR */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C2C2C]">
                    الاسم الكامل للكاتب: *
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="مثال: د. سمير الأحمدي"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] focus:border-[#4A5D4E] text-[#2C2C2C] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C2C2C]">
                    الاسم الأدبي أو المستعار:
                  </label>
                  <input
                    type="text"
                    value={regPenName}
                    onChange={e => setRegPenName(e.target.value)}
                    placeholder="اختياري (نفس الاسم افتراضياً)"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] focus:border-[#4A5D4E] text-[#2C2C2C] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2C2C2C]">
                  البريد الإلكتروني: *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="author@example.com"
                    required
                    className="w-full pr-8 pl-3 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] focus:border-[#4A5D4E] text-[#2C2C2C] focus:outline-none text-left font-mono"
                    dir="ltr"
                  />
                  <Mail className="w-3.5 h-3.5 text-[#8E8A83] absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2C2C2C]">
                  التخصص الفكري أو الأدبي:
                </label>
                <select
                  value={regSpecialization}
                  onChange={e => setRegSpecialization(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none cursor-pointer"
                >
                  <option value="روايات وسرد أدبي">روايات وسرد أدبي</option>
                  <option value="فلسفة وفكر معاصر">فلسفة وفكر معاصر</option>
                  <option value="دراسات نقدية وأدبية">دراسات نقدية وأدبية</option>
                  <option value="ترجمات عالمية">ترجمات عالمية</option>
                  <option value="تاريخ وحضارة وفكر إسلامي">تاريخ وحضارة وفكر إسلامي</option>
                  <option value="علوم إنسانية واجتماع">علوم إنسانية واجتماع</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2C2C2C]">
                  نبذة تعريفية مختصرة عن الكاتب (Bio):
                </label>
                <textarea
                  rows={2}
                  value={regBio}
                  onChange={e => setRegBio(e.target.value)}
                  placeholder="سيرة أدبية موجزة، اهتمامات بحثية، مؤلفات سابقة..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2C2C2C]">
                  اختر كوداً سرياً أو كلمة مرور لحسابك: *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={regPasscode}
                    onChange={e => setRegPasscode(e.target.value)}
                    placeholder="مثال: AUTH-7788 أو كلمة مرور قوية"
                    required
                    className="w-full pr-8 pl-3 py-2 text-xs rounded-xl bg-white border border-[#E5E2D9] text-[#2C2C2C] focus:outline-none font-mono"
                  />
                  <KeyRound className="w-3.5 h-3.5 text-[#8E8A83] absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[10px] text-[#8E8A83]">
                  ستستخدم هذا الكود السري مع اسمك لتسجيل الدخول من أي هاتف أو جهاز.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38493C] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer mt-3"
              >
                {isLoading ? (
                  <span>جاري تسجيل الحساب...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#C88A3B]" />
                    <span>تسجيل الكاتب والبدء في نشر المقالات والكتب</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
