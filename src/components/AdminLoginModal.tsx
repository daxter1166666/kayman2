import React, { useState } from 'react';
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
  ArrowLeft
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
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
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

    setTimeout(() => {
      const success = storageService.loginAdmin(username, password);
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
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 font-cairo">
      <div
        className="relative w-full max-w-md bg-[#FFFFFF] border-2 border-[#E5E2D9] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
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
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="font-amiri font-bold text-2xl text-[#2C2C2C]">
            بوابة الإدارة والناشر
          </h3>
          <p className="text-xs text-[#6E6A64] mt-1 max-w-xs mx-auto">
            منطقة مؤمنة ومخصصة لإدارة ونشر الكتب والمؤلفات، الفصول، الأقسام، والإعلانات
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#2C2C2C] block mb-1.5">
              اسم المستخدم
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8A83]" />
              <input
                type="text"
                id="admin-username-input"
                placeholder="أدخل اسم المستخدم (مثل: admin)"
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
            id="admin-submit-login-btn"
            disabled={isLoading}
            className="w-full py-3 mt-2 bg-[#4A5D4E] hover:bg-[#3C4C3F] disabled:opacity-50 text-[#FDFCF8] font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>دخول لوحة التحكم والتحرير</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
