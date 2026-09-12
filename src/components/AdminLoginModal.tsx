import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import { storageService } from '../services/storageService';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [loginMode, setLoginMode] = useState<'secret_code' | 'password'>('secret_code');

  // Password Mode States
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Secret Passcode Mode States (طلب المستخدم: اسم + كود سري للدخول من أي هاتف)
  const [authorName, setAuthorName] = useState<string>('أيمن كناني');
  const [secretCode, setSecretCode] = useState<string>('');
  const [activeSecretCode, setActiveSecretCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const authData = storageService.getAuthorSecretAuth();
      setActiveSecretCode(authData.secretPasscode);
      if (authData.authorName) {
        setAuthorName(authData.authorName);
      }
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Login via Author Name + Secret Code
  const handleSecretCodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!authorName.trim()) {
      setErrorMessage('يرجى كتابة اسم الكاتب');
      return;
    }
    if (!secretCode.trim()) {
      setErrorMessage('يرجى كتابة الكود السري للدخول');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const success = storageService.loginWithAuthorSecretCode(authorName, secretCode);
      setIsLoading(false);
      if (success) {
        setSuccessMessage('تم التحقق بنجاح! جاري توجيهك إلى لوحة النشر والتأليف...');
        setTimeout(() => {
          onLoginSuccess();
          onClose();
        }, 700);
      } else {
        setErrorMessage('الكود السري أو اسم الكاتب غير متطابق! يمكنك استخدام الكود السري المخصص (AK-2026-AUTH) أو توليد كود جديد أدناه.');
      }
    }, 400);
  };

  // Handle Standard Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage('يرجى كتابة اسم المستخدم');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('يرجى كتابة كلمة المرور');
      return;
    }

    setIsLoading(true);

    try {
      const success = await storageService.loginAdminAsync(username, password);
      setIsLoading(false);

      if (success) {
        setUsername('');
        setPassword('');
        setErrorMessage(null);
        onLoginSuccess();
        onClose();
      } else {
        setErrorMessage('بيانات الدخول غير صحيحة! يرجى التحقق من اسم المستخدم وكلمة المرور.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('حدث خطأ غير متوقع أثناء تسجيل الدخول');
    }
  };

  // Generate a new Secret Code for the author's mobile device
  const handleGenerateNewCode = () => {
    const newCode = storageService.generateNewSecretPasscode();
    setActiveSecretCode(newCode);
    setSecretCode(newCode);
    setSuccessMessage(`تم توليد كود سري جديد بنجاح: ${newCode} - تم إدراجه تلقائياً.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleCopyActiveCode = () => {
    navigator.clipboard.writeText(activeSecretCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 font-cairo">
      <div
        className="relative w-full max-w-lg bg-[#FFFFFF] border-2 border-[#E5E2D9] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Subtle decorative top bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#4A5D4E] via-[#C88A3B] to-[#4A5D4E]" />

        {/* Close Button */}
        <button
          type="button"
          id="close-admin-login-modal-btn"
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full text-[#8E8A83] hover:text-[#2C2C2C] hover:bg-[#F7F5EE] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center mb-3 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="font-amiri font-bold text-2xl text-[#2C2C2C]">
            بوابة دخول الكاتب والناشر
          </h3>
          <p className="text-xs text-[#6E6A64] mt-1 max-w-sm mx-auto">
            سجل دخولك لنشر المقالات والدراسات وإدارة فصول الكتب والروايات من هاتفك أو أي جهاز
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#F7F5EE] rounded-2xl border border-[#E5E2D9] mb-5">
          <button
            type="button"
            onClick={() => {
              setLoginMode('secret_code');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              loginMode === 'secret_code'
                ? 'bg-white text-[#4A5D4E] shadow-xs border border-[#E5E2D9]'
                : 'text-[#6E6A64] hover:text-[#2C2C2C]'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>كود الكاتب السري (للهواتف)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMode('password');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              loginMode === 'password'
                ? 'bg-white text-[#4A5D4E] shadow-xs border border-[#E5E2D9]'
                : 'text-[#6E6A64] hover:text-[#2C2C2C]'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>كلمة المرور</span>
          </button>
        </div>

        {/* Status Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Mode 1: Secret Code Login (Author Name + Secret Code for Phones) */}
        {loginMode === 'secret_code' ? (
          <form onSubmit={handleSecretCodeLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#2C2C2C] block mb-1.5">
                اسم الكاتب / المؤلف
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8A83]" />
                <input
                  type="text"
                  placeholder="اسمك (مثل: أيمن كناني)"
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  className="w-full pr-10 pl-3.5 py-2.5 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] focus:outline-none font-bold"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#2C2C2C]">
                  الكود السري للدخول
                </label>
                <button
                  type="button"
                  onClick={() => setSecretCode(activeSecretCode)}
                  className="text-[11px] text-[#4A5D4E] hover:underline font-bold cursor-pointer"
                >
                  استخدام الكود المحفوظ ({activeSecretCode})
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8A83]" />
                <input
                  type="text"
                  placeholder="أدخل الكود السري (مثل: AK-2026-AUTH)"
                  value={secretCode}
                  onChange={e => setSecretCode(e.target.value)}
                  className="w-full pr-10 pl-3.5 py-2.5 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] focus:outline-none font-mono tracking-wider font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#4A5D4E] text-white hover:bg-[#3C4C3F] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Smartphone className="w-4 h-4" />
              <span>{isLoading ? 'جاري التحقق...' : 'دخول فوري ونشر المؤلفات'}</span>
            </button>

            {/* Secret Code Quick Card for Phone */}
            <div className="mt-5 p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E2D9]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C88A3B]" />
                  <span className="text-xs font-bold text-[#2C2C2C]">
                    كود الوصول المخصص لهاتفك:
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateNewCode}
                  className="inline-flex items-center gap-1 text-[11px] text-[#4A5D4E] hover:underline font-bold cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>توليد كود جديد</span>
                </button>
              </div>

              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-[#E5E2D9]">
                <code className="font-mono text-xs sm:text-sm font-bold text-[#4A5D4E] tracking-wider">
                  {activeSecretCode}
                </code>
                <button
                  type="button"
                  onClick={handleCopyActiveCode}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg bg-[#4A5D4E]/10 text-[#4A5D4E] hover:bg-[#4A5D4E]/20 transition-all cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>نسخ الكود</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-[#8E8A83] mt-2 leading-relaxed">
                احتفظ بهذا الكود في ملاحظات هاتفك؛ يتيح لك فتح المنصة من أي متصفح جوال وتأليف ونشر المقالات والفصول فوراً دون الحاجة لكلمة مرور معقدة.
              </p>
            </div>
          </form>
        ) : (
          /* Mode 2: Password Login */
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#2C2C2C] block mb-1.5">
                اسم المستخدم
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8A83]" />
                <input
                  type="text"
                  id="admin-username-input"
                  placeholder="أدخل اسم المستخدم (مثل: aymankinani)"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pr-10 pl-3.5 py-2.5 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] focus:outline-none font-bold"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#2C2C2C] block mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8A83]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="admin-password-input"
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pr-10 pl-10 py-2.5 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] focus:outline-none font-mono"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  id="toggle-show-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8A83] hover:text-[#2C2C2C] cursor-pointer"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="admin-login-submit-btn"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#4A5D4E] text-white hover:bg-[#3C4C3F] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
