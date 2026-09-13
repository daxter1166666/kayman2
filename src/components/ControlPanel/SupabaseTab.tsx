import React, { useState, useEffect } from 'react';
import { SupabaseConfig, Novel, Chapter, Comment } from '../../types';
import { storageService } from '../../services/storageService';
import { supabaseService } from '../../services/supabaseService';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Zap,
  Server,
  Layers,
  ArrowUpRight,
  Download,
  Globe,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { ResetDataModal } from './ResetDataModal';

interface SupabaseTabProps {
  novels: Novel[];
  chapters: Chapter[];
  comments: Comment[];
  onRefreshData: () => void;
}

export const SupabaseTab: React.FC<SupabaseTabProps> = ({
  novels,
  chapters,
  comments,
  onRefreshData,
}) => {
  const detectedEnv = supabaseService.detectEnvironmentCredentials();
  const [config, setConfig] = useState<SupabaseConfig>(() => storageService.getSupabaseConfig());
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [pullResult, setPullResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Table Health Check State
  const [tablesStatus, setTablesStatus] = useState<{
    tested: boolean;
    allOk: boolean;
    details: { table: string; label: string; exists: boolean }[];
  } | null>(null);
  const [isCheckingTables, setIsCheckingTables] = useState<boolean>(false);

  // Auto-fill from detected environment variables if storage config is empty
  useEffect(() => {
    if ((!config.url || !config.anonKey) && detectedEnv.url && detectedEnv.anonKey) {
      const initialFromEnv: SupabaseConfig = {
        ...config,
        enabled: true,
        url: detectedEnv.url,
        anonKey: detectedEnv.anonKey,
        connected: true,
      };
      setConfig(initialFromEnv);
      storageService.saveSupabaseConfig(initialFromEnv);
    }
  }, [detectedEnv.url, detectedEnv.anonKey]);

  const handleCheckTables = async () => {
    setIsCheckingTables(true);
    try {
      const status = await supabaseService.checkTablesStatus();
      setTablesStatus({
        tested: true,
        allOk: status.allTablesReady,
        details: [
          { table: 'novels', label: 'المؤلفات والروايات (novels)', exists: status.tables.novels },
          { table: 'chapters', label: 'الفصول والأجزاء (chapters)', exists: status.tables.chapters },
          { table: 'comments', label: 'التعليقات والمراجعات (comments)', exists: status.tables.comments },
          { table: 'author_profile', label: 'الملف التعريفي للكاتب (author_profile)', exists: status.tables.author_profile },
          { table: 'site_settings', label: 'الإعدادات والأقسام والوثائق (site_settings)', exists: status.tables.site_settings },
        ]
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsCheckingTables(false);
    }
  };

  const handlePullAll = async () => {
    setIsPulling(true);
    setPullResult(null);
    try {
      const data = await supabaseService.pullAllFromSupabase();
      if (data) {
        onRefreshData();
        setPullResult({
          success: true,
          message: `تم سحب البيانات بنجاح من سوباباس! وُجد ${data.novels.length} كتاب، و ${data.chapters.length} فصل.`,
        });
      } else {
        setPullResult({
          success: false,
          message: 'لم يتم العثور على بيانات أو تعذر الاتصال بسوباباس. تأكد من صحة الرابط والمفتاح وتشغيل كود SQL.',
        });
      }
    } catch (e: any) {
      setPullResult({ success: false, message: `فشل السحب: ${e.message}` });
    } finally {
      setIsPulling(false);
    }
  };

  const handleExportJson = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      siteName: storageService.getSiteBranding().siteName,
      novels: storageService.getNovels(),
      chapters: storageService.getChapters(),
      comments: storageService.getComments(),
      authorProfile: storageService.getAuthorProfile(),
      siteBranding: storageService.getSiteBranding(),
      donationSettings: storageService.getDonationSettings(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ayman_kinani_data_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const sanitizedUrl = supabaseService.cleanProjectUrl(config.url);
    const cleanedConfig = {
      ...config,
      url: sanitizedUrl,
      anonKey: config.anonKey.trim(),
    };
    setConfig(cleanedConfig);
    storageService.saveSupabaseConfig(cleanedConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const sanitizedUrl = supabaseService.cleanProjectUrl(config.url);
      const res = await supabaseService.testConnection(sanitizedUrl, config.anonKey);
      setTestResult(res);
      if (res.cleanedUrl && res.cleanedUrl !== config.url) {
        setConfig(prev => ({ ...prev, url: res.cleanedUrl! }));
      }
      if (res.success) {
        const updated = {
          ...config,
          url: res.cleanedUrl || sanitizedUrl,
          anonKey: config.anonKey.trim(),
          connected: true,
        };
        setConfig(updated);
        storageService.saveSupabaseConfig(updated);
      }
    } catch (err: any) {
      setTestResult({ success: false, message: `فشل الفحص: ${err.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const sanitizedUrl = supabaseService.cleanProjectUrl(config.url);
      const sanitizedKey = config.anonKey.trim();

      if (!sanitizedUrl || !sanitizedKey) {
        setSyncResult({
          success: false,
          message: 'يرجى إدخال رابط المشروع (Project URL) والمفتاح العام (anon key) أولاً.',
        });
        setIsSyncing(false);
        return;
      }

      const activeConfig: SupabaseConfig = {
        ...config,
        enabled: true,
        url: sanitizedUrl,
        anonKey: sanitizedKey,
        connected: true,
      };
      setConfig(activeConfig);
      storageService.saveSupabaseConfig(activeConfig);

      const allNovels = novels && novels.length > 0 ? novels : storageService.getNovels();
      const allChapters = chapters && chapters.length > 0 ? chapters : storageService.getChapters();
      const allComments = comments && comments.length > 0 ? comments : storageService.getComments();
      const authorProfile = storageService.getAuthorProfile();
      const siteBranding = storageService.getSiteBranding();
      const donationSettings = storageService.getDonationSettings();

      const res = await supabaseService.syncAllToSupabase(activeConfig, {
        novels: allNovels,
        chapters: allChapters,
        comments: allComments,
        authorProfile,
        siteBranding,
        donationSettings,
        categories: storageService.getCategories(),
        legalDocuments: storageService.getLegalDocuments(),
        adSettings: storageService.getAdSettings(),
        seoSettings: storageService.getSeoSettings(),
      });

      setSyncResult(res);
      if (res.success) {
        const updated = {
          ...activeConfig,
          lastSyncTime: new Date().toLocaleString('ar-EG'),
        };
        setConfig(updated);
        storageService.saveSupabaseConfig(updated);
      }
    } catch (err: any) {
      setSyncResult({ success: false, message: `خطأ أثناء المزامنة: ${err.message}` });
    } finally {
      setIsSyncing(false);
    }
  };

  const [sqlTab, setSqlTab] = useState<'full' | 'fix'>('fix');

  const activeSqlScript = sqlTab === 'fix' 
    ? supabaseService.getFixPermissionsSqlScript() 
    : supabaseService.getSqlSchemaScript();

  const handleCopySql = () => {
    navigator.clipboard.writeText(activeSqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-cairo">
      {/* Header Card */}
      <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 shrink-0">
            <Database className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#2C2C2C] font-amiri">
                الربط السحابي مع قاعدة بيانات سوباباس (Supabase Integration)
              </h2>
              <span className="text-xs bg-emerald-700 text-white px-2.5 py-0.5 rounded-full font-mono">
                Cloud Backend
              </span>
            </div>
            <p className="text-sm text-[#6E6A64] mt-1">
              اربط منصة أيمن كناني مع مشروعك في Supabase لحفظ المؤلفات، الفصول، التعليقات، والبيانات سحابياً في الوقت الفعلي.
            </p>
          </div>
        </div>

        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 bg-[#F7F5EE] hover:bg-[#E5E2D9] text-[#2C2C2C] border border-[#E5E2D9] rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0"
        >
          <span>فتح لوحة Supabase</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-bold flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>تم حفظ إعدادات الاتصال بـ Supabase بنجاح!</span>
        </div>
      )}

      {/* Vercel Integration Detected Banner */}
      {detectedEnv.url && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50 to-[#F4F9F5] border-2 border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-emerald-950">
                  {detectedEnv.isFromVercel ? 'تم ربط مشروع Supabase تلقائياً عبر Vercel Integration!' : 'تم اكتشاف بيانات الربط بسوباباس من المتغيرات البرمجية!'}
                </h4>
                <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-bold">
                  متصل
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-0.5 font-mono" dir="ltr">
                {detectedEnv.url}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckTables}
            disabled={isCheckingTables}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-xs disabled:opacity-60"
          >
            {isCheckingTables ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            <span>فحص جاهزية الجداول الآن</span>
          </button>
        </div>
      )}

      {/* Why changes only appear in Chrome banner */}
      <div className="bg-[#FFF9EE] border-2 border-[#E9D7A5] rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5 text-[#785E22] font-bold text-sm">
          <Globe className="w-5 h-5 text-[#8C6D1F]" />
          <span>توضيح هام: لماذا تظهر التعديلات في متصفح كروم ولا تظهر في المتصفحات الأخرى للقراء؟</span>
        </div>
        <p className="text-xs text-[#6B5625] leading-relaxed">
          عندما تدير الموقع محلياً، تُحفظ الروايات والفصول في الذاكرة التخزينية الخاصة بمتصفحك فقط (LocalStorage). لذلك، عند فتح الموقع في متصفح آخر (سفاري، فايرفوكس، أو هاتف زائر)، يكون المتصفح الجديد فارغاً تماماً.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E9D7A5]/60">
            <strong className="text-emerald-800 block mb-1">✓ الحل السحابي التلقائي (Supabase):</strong>
            <span className="text-[#6E6A64]">
              بمجرد ملء بيانات سوباباس أدناه وتفعيلها، يقوم الموقع تلقائياً بمزامنة وسحب ونشر كل كتاب وفصل لحظياً لجميع القراء في كل المتصفحات والأجهزة دون أي تدخل منك.
            </span>
          </div>
          <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E9D7A5]/60">
            <strong className="text-blue-800 block mb-1">✓ الاستضافة عبر المتغيرات (Env Variables):</strong>
            <span className="text-[#6E6A64]">
              في لوحة تحكم استضافتك (Vercel أو Netlify أو cPanel)، أضف المتغيرين <code className="bg-[#F7F5EE] px-1 py-0.5 rounded font-mono font-bold text-blue-700">VITE_SUPABASE_URL</code> و <code className="bg-[#F7F5EE] px-1 py-0.5 rounded font-mono font-bold text-blue-700">VITE_SUPABASE_ANON_KEY</code> ليتم ربط كافة الزوار بالسيرفر تلقائياً.
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Connection Settings (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-4">
              <h3 className="text-base font-bold text-[#2C2C2C] flex items-center gap-2">
                <Server className="w-5 h-5 text-[#4A5D4E]" />
                <span>بيانات الاعتماد والاتصال (API Credentials)</span>
              </h3>

              <label className="flex items-center gap-2 text-xs font-bold text-[#2C2C2C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded border-[#E5E2D9] text-[#4A5D4E] focus:ring-[#4A5D4E]"
                />
                <span>تفعيل الربط مع سوباباس</span>
              </label>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C] flex items-center justify-between">
                  <span>رابط المشروع (Project URL) *</span>
                  <span className="text-[11px] text-emerald-700 font-bold">يجب أن يكون الرابط الأساسي فقط: https://xxxxx.supabase.co</span>
                </label>
                <input
                  type="url"
                  value={config.url}
                  onChange={(e) => setConfig(prev => ({ ...prev, url: e.target.value.trim() }))}
                  onBlur={() => {
                    if (config.url) {
                      const cleaned = supabaseService.cleanProjectUrl(config.url);
                      setConfig(prev => ({ ...prev, url: cleaned }));
                    }
                  }}
                  placeholder="https://your-project-id.supabase.co"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs font-mono text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
                  dir="ltr"
                />
                <p className="text-[11px] text-[#8E8A83] leading-tight">
                  ⚠️ <strong>تنبيه لمنع خطأ PGRST125:</strong> لا تضع مسار <code className="bg-[#F7F5EE] px-1 py-0.5 rounded text-rose-700 font-mono">/rest/v1</code> أو مسار لوحة التحكم <code className="bg-[#F7F5EE] px-1 py-0.5 rounded text-rose-700 font-mono">/dashboard</code>. النظام سيقوم بتنظيف وتصحيح الرابط تلقائياً عند الحفظ أو الفحص.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C] flex items-center justify-between">
                  <span>المفتاح العام (anon / public key) *</span>
                  <span className="text-[11px] text-[#6E6A64]">مفتاح JWT الآمن للاستعلام</span>
                </label>
                <input
                  type="password"
                  value={config.anonKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, anonKey: e.target.value.trim() }))}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] text-xs font-mono text-[#2C2C2C] focus:outline-none focus:border-[#4A5D4E]"
                  dir="ltr"
                />
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  حفظ البيانات
                </button>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !config.url || !config.anonKey}
                  className="px-5 py-2.5 bg-[#F7F5EE] hover:bg-[#E5E2D9] text-[#2C2C2C] border border-[#E5E2D9] rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-600" />}
                  <span>فحص واختبار الاتصال بالسيرفر</span>
                </button>
              </div>
            </form>

            {/* Test Result Message */}
            {testResult && (
              <div
                className={`p-4 rounded-xl text-xs font-bold flex items-start gap-3 border ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <div>
                  <p>{testResult.message}</p>
                </div>
              </div>
            )}
          </div>

          {/* Cloud Sync Operations */}
          <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-[#2C2C2C] flex items-center gap-2 border-b border-[#E5E2D9] pb-3">
              <RefreshCw className="w-5 h-5 text-[#4A5D4E]" />
              <span>مزامنة المحتوى والمؤلفات مع سوباباس</span>
            </h3>

            <p className="text-xs text-[#6E6A64] leading-relaxed">
              يمكنك رفع كافة مؤلفات الكاتب أيمن كناني ({novels.length} كتاب)، فصولها ({chapters.length} فصل)، والملف الشخصي إلى قاعدة بيانات Supabase، أو سحبها من السيرفر، أو حفظ نسخة احتياطية:
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSyncAll}
                disabled={isSyncing || !config.url || !config.anonKey}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                <span>رفع ومزامنة البيانات إلى السيرفر</span>
              </button>

              <button
                type="button"
                onClick={handlePullAll}
                disabled={isPulling}
                className="px-5 py-2.5 bg-[#F7F5EE] hover:bg-[#E5E2D9] text-[#2C2C2C] border border-[#E5E2D9] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isPulling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 text-emerald-700" />}
                <span>سحب وتحديث البيانات من سوباباس</span>
              </button>

              <button
                type="button"
                onClick={handleExportJson}
                className="px-5 py-2.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>تحميل نسخة احتياطية (JSON)</span>
              </button>

              <button
                type="button"
                id="supabase-force-reset-btn"
                onClick={() => setIsResetModalOpen(true)}
                className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                title="مسح التخزين المحلي وإعادة سحب البيانات المحدثة فقط لحل تكرار الكتب"
              >
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span>إعادة ضبط البيانات ومسح الكاش</span>
              </button>
            </div>

            {config.lastSyncTime && (
              <p className="text-xs text-[#6E6A64]">
                آخر رفع ناجح: <strong>{config.lastSyncTime}</strong>
              </p>
            )}

            {pullResult && (
              <div
                className={`p-4 rounded-xl text-xs font-bold flex items-start gap-3 border ${
                  pullResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {pullResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <div>
                  <p>{pullResult.message}</p>
                </div>
              </div>
            )}

            {syncResult && (
              <div
                className={`p-4 rounded-xl text-xs font-bold flex items-start gap-3 border ${
                  syncResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {syncResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <div>
                  <p>{syncResult.message}</p>
                </div>
              </div>
            )}
          </div>

          {/* Database Tables Health Check Card */}
          <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E2D9] pb-3">
              <h3 className="text-base font-bold text-[#2C2C2C] flex items-center gap-2">
                <Database className="w-5 h-5 text-[#4A5D4E]" />
                <span>فحص جاهزية جداول قاعدة البيانات (Tables Health Check)</span>
              </h3>
              <button
                type="button"
                onClick={handleCheckTables}
                disabled={isCheckingTables}
                className="px-4 py-2 bg-[#F7F5EE] hover:bg-[#E5E2D9] text-[#2C2C2C] border border-[#E5E2D9] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isCheckingTables ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-emerald-700" />}
                <span>فحص وجود الجداول الآن</span>
              </button>
            </div>

            <p className="text-xs text-[#6E6A64] leading-relaxed">
              عند ربط سوباباس عبر Vercel Integration لأول مرة، تكون قاعدة البيانات جديدة وخالية. تحقق هنا بضغطة زر مما إذا كانت الجداول الخمسة المطلوبة قد أُنشئت بنجاح أم أنها بحاجة لتشغيل كود SQL:
            </p>

            {tablesStatus && (
              <div className="space-y-3 pt-2">
                <div
                  className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 border ${
                    tablesStatus.allOk
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {tablesStatus.allOk ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>ممتاز! جميع جداول قاعدة البيانات (5 من 5) موجودة وجاهزة للعمل والحفظ ومزامنة المتصفحات فوراً.</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <span>تنبيه: بعض الجداول غير موجودة بعد! انسخ كود SQL من الصندوق المجاور ونفذه في SQL Editor داخل سوباباس.</span>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tablesStatus.details.map((d) => (
                    <div
                      key={d.table}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                        d.exists
                          ? 'bg-emerald-50/40 border-emerald-200/60 text-emerald-800'
                          : 'bg-rose-50/40 border-rose-200/60 text-rose-800'
                      }`}
                    >
                      <span className="font-bold">{d.label}</span>
                      {d.exists ? (
                        <span className="flex items-center gap-1 font-bold text-emerald-700">
                          <Check className="w-3.5 h-3.5" /> متاح
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-bold text-rose-700">
                          مفقود (يتطلب SQL)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SQL Schema Generator & Setup Guide (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* SQL Code Box */}
          <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#2C2C2C] flex items-center gap-2">
                <Database className="w-4 h-4 text-[#4A5D4E]" />
                <span>أكواد SQL لـ Supabase</span>
              </h3>
              <button
                type="button"
                onClick={handleCopySql}
                className="px-3 py-1.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ الكود المختار</span>
                  </>
                )}
              </button>
            </div>

            {/* Sub Tabs */}
            <div className="flex items-center gap-2 bg-[#F7F5EE] p-1 rounded-xl border border-[#E5E2D9] text-xs">
              <button
                type="button"
                onClick={() => setSqlTab('fix')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer text-center ${
                  sqlTab === 'fix'
                    ? 'bg-[#4A5D4E] text-[#FDFCF8] shadow-2xs'
                    : 'text-[#6E6A64] hover:text-[#2C2C2C]'
                }`}
              >
                ⚡ كود إصلاح الصلاحيات والحذف الفوري (Fix Permissions)
              </button>
              <button
                type="button"
                onClick={() => setSqlTab('full')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer text-center ${
                  sqlTab === 'full'
                    ? 'bg-[#4A5D4E] text-[#FDFCF8] shadow-2xs'
                    : 'text-[#6E6A64] hover:text-[#2C2C2C]'
                }`}
              >
                🛠️ كود إنشاء الجداول الكامل (Full Schema)
              </button>
            </div>

            <p className="text-xs text-[#6E6A64] leading-relaxed">
              {sqlTab === 'fix' ? (
                <span>
                  <strong>حل مشكلة الحذف والتعديل:</strong> إذا كانت الجداول موجودة بالفعل ولكن حذف الروايات أو تعديل الصورة أو الخصوصية لا ينعكس في سوباباس، انسخ هذا الكود والصقه في <strong>SQL Editor</strong> في سوباباس واضغط <strong>Run</strong> لتفعيل صلاحيات الحذف والتعديل لكافة الجداول فوراً.
                </span>
              ) : (
                <span>
                  <strong>للمشاريع الجديدة:</strong> انسخ هذا الكود والصقه في <strong>SQL Editor</strong> في سوباباس واضغط <strong>Run</strong> لإنشاء الجداول الخمسة وتفعيل قواعد الأمان.
                </span>
              )}
            </p>

            <div className="relative bg-[#1E2421] text-emerald-300 rounded-xl p-3 font-mono text-[11px] h-64 overflow-y-auto direction-ltr text-left border border-black/20">
              <pre className="whitespace-pre-wrap">{activeSqlScript}</pre>
            </div>
          </div>

          {/* Quick Guide Card */}
          <div className="bg-[#F7F5EE] border border-[#E5E2D9] rounded-2xl p-6 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-[#4A5D4E]" />
              <span>خطوات تجهيز مشروع Supabase:</span>
            </h4>
            <ol className="text-xs text-[#6E6A64] space-y-2 list-decimal list-inside pr-1 leading-relaxed">
              <li>ادخل إلى <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#4A5D4E] underline font-bold">supabase.com</a> وأنشئ مشروعاً جديداً مجانياً.</li>
              <li>توجه إلى <strong>Project Settings</strong> ثم <strong>API</strong>.</li>
              <li>انسخ <strong>Project URL</strong> و <strong>anon / public key</strong> والصقهما هنا.</li>
              <li>توجه إلى <strong>SQL Editor</strong> في سوباباس، الصق كود SQL الموضح أعلاه واضغط <strong>Run</strong>.</li>
              <li>اضغط على <strong>مزامنة جميع المؤلفات الآن</strong> لرفع كتبك وفصولك.</li>
            </ol>
          </div>
        </div>
      </div>

      <ResetDataModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onSuccess={() => {
          onRefreshData();
        }}
      />
    </div>
  );
};
