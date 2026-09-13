import React from 'react';
import { Novel, Chapter, Comment, AdSettings, AdPlacement } from '../../types';
import {
  BookOpen,
  Heart,
  Eye,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Award,
  PlusCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface DashboardTabProps {
  novels: Novel[];
  chapters: Chapter[];
  comments: Comment[];
  adSettings: AdSettings;
  onNavigateTab: (tab: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  novels,
  chapters,
  comments,
  adSettings,
  onNavigateTab,
}) => {
  const totalViews = chapters.reduce((acc, c) => acc + c.views, 0);
  const totalLikes = chapters.reduce((acc, c) => acc + c.likes, 0);
  const totalWords = chapters.reduce((acc, c) => acc + c.wordCount, 0);

  // Ad Stats
  const totalAdImpressions = adSettings.corporateSponsors.reduce((acc, s) => acc + s.impressions, 0);
  const totalAdClicks = adSettings.corporateSponsors.reduce((acc, s) => acc + s.clicks, 0);
  const averageCtr = totalAdImpressions > 0 ? ((totalAdClicks / totalAdImpressions) * 100).toFixed(2) : '0.00';

  // Top chapters
  const topChapters = [...chapters].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <div className="space-y-8 text-[#2C2C2C] font-cairo">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#F7F5EE] border border-[#E5E2D9] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#4A5D4E] text-[#FDFCF8]">
              استوديو الكاتب الرقمي
            </span>
            <span className="text-xs text-[#6E6A64]">لوحة التحكم المباشرة</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-amiri font-bold text-[#2C2C2C] mb-1">
            أهلاً بك في المقر الأدبي وإدارة أعمالك
          </h2>
          <p className="text-xs sm:text-sm text-[#6E6A64] max-w-2xl leading-relaxed">
            تابع تفاعل القراء ومعدلات القراءة اللحظية، وانشر فصولك الجديدة، وأدر وحدات Google AdSense وإعلانات الرعاة والشركات، وتأكد من استيفاء شروط القبول.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            type="button"
            id="dash-quick-publish-btn"
            onClick={() => onNavigateTab('publish')}
            className="px-4 py-2.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>نشر فصل جديد</span>
          </button>
          <button
            type="button"
            id="dash-quick-ads-btn"
            onClick={() => onNavigateTab('ads')}
            className="px-3.5 py-2.5 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] hover:bg-[#F7F5EE] text-[#2C2C2C] font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <DollarSign className="w-4 h-4 text-[#4A5D4E]" />
            <span>إعدادات الإعلانات</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Views */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6E6A64] mb-2">
            <span className="text-xs font-bold">إجمالي قراءات الفصول</span>
            <Eye className="w-4 h-4 text-[#4A5D4E]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-amiri font-bold text-[#2C2C2C]">
              {totalViews.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#4A5D4E] mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>تتبع لحظي وتلقائي للمشاهدات</span>
            </div>
          </div>
        </div>

        {/* Total Likes */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6E6A64] mb-2">
            <span className="text-xs font-bold">إعجابات القراء</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-amiri font-bold text-[#2C2C2C]">
              {totalLikes.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#6E6A64] mt-1">
              نسبة التفاعل {(totalViews > 0 ? (totalLikes / totalViews * 100).toFixed(1) : 0)}% من إجمالي القراء
            </div>
          </div>
        </div>

        {/* Published Content */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6E6A64] mb-2">
            <span className="text-xs font-bold">المحتوى المنشور</span>
            <BookOpen className="w-4 h-4 text-[#4A5D4E]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-amiri font-bold text-[#2C2C2C]">
              {chapters.length} <span className="text-xs text-[#6E6A64] font-normal">فصل في {novels.length} روايات</span>
            </div>
            <div className="text-[11px] text-[#6E6A64] mt-1">
              {totalWords.toLocaleString()} كلمة منشورة
            </div>
          </div>
        </div>

        {/* Reader Comments */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6E6A64] mb-2">
            <span className="text-xs font-bold">المناقشات والتعليقات</span>
            <MessageSquare className="w-4 h-4 text-[#4A5D4E]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-amiri font-bold text-[#2C2C2C]">
              {comments.length}
            </div>
            <div className="text-[11px] text-[#4A5D4E] mt-1 cursor-pointer hover:underline" onClick={() => onNavigateTab('comments')}>
              إدارة والرد على آراء القراء ←
            </div>
          </div>
        </div>
      </div>

      {/* Ad & Monetization Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#4A5D4E]" />
              <h3 className="font-amiri font-bold text-lg text-[#2C2C2C]">
                أداء الإعلانات وعوائد الرعاية
              </h3>
            </div>
            <button
              type="button"
              id="dash-manage-ads-btn"
              onClick={() => onNavigateTab('ads')}
              className="text-xs text-[#4A5D4E] hover:underline cursor-pointer font-bold"
            >
              تخصيص المساحات والمواضع ←
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-3.5 rounded-xl bg-[#F7F5EE] border border-[#E5E2D9]">
              <span className="text-[11px] text-[#6E6A64] block mb-1">مرات الظهور (Impressions)</span>
              <span className="text-lg font-bold font-mono text-[#2C2C2C]">
                {totalAdImpressions.toLocaleString()}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F7F5EE] border border-[#E5E2D9]">
              <span className="text-[11px] text-[#6E6A64] block mb-1">نقرات الرعاة (Clicks)</span>
              <span className="text-lg font-bold font-mono text-[#2C2C2C]">
                {totalAdClicks.toLocaleString()}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F7F5EE] border border-[#E5E2D9]">
              <span className="text-[11px] text-[#6E6A64] block mb-1">معدل النقر (CTR)</span>
              <span className="text-lg font-bold font-mono text-[#4A5D4E]">
                %{averageCtr}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold text-[#2C2C2C]">مواضع الإعلانات النشطة بالموقع:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {(Object.entries(adSettings.placements) as [string, AdPlacement][]).map(([key, placement]) => (
                <div
                  key={key}
                  className="p-2.5 rounded-lg bg-[#F7F5EE] border border-[#E5E2D9] flex items-center justify-between"
                >
                  <span className="font-bold text-[#2C2C2C]">{placement.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      placement.enabled
                        ? placement.type === 'adsense'
                          ? 'bg-[#C88A3B]/15 text-[#C88A3B] border border-[#C88A3B]/30'
                          : 'bg-[#4A5D4E]/15 text-[#4A5D4E] border border-[#4A5D4E]/30'
                        : 'bg-[#E5E2D9] text-[#6E6A64]'
                    }`}
                  >
                    {placement.enabled ? (placement.type === 'adsense' ? 'أدسنس' : 'راعي مباشر') : 'معطل'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AdSense Approval Status Badge */}
        <div className="p-6 rounded-2xl bg-[#F7F5EE] border border-[#E5E2D9] flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-[#4A5D4E] mb-2">
              <ShieldCheck className="w-5 h-5" />
              <h4 className="font-amiri font-bold text-base text-[#2C2C2C]">
                جاهزية قبول Google AdSense
              </h4>
            </div>
            <p className="text-xs text-[#6E6A64] leading-relaxed mb-4">
              الموقع مجهز بالكامل بصفحات الشروط والخصوصية المعتمدة لـ GDPR/CCPA، وإشعارات حقوق النشر DMCA، وملف ads.txt سليم.
            </p>

            <div className="space-y-2 text-xs text-[#5A5751] mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>محتوى روائي أصلي ({chapters.length} فصول منشورة)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>صفحات سياسة الخصوصية والشروط كاملة</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>ملف ads.txt معتمد للناشرين</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>متوافق كلياً مع الهواتف والشاشات الصغيرة</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            id="dash-view-compliance-btn"
            onClick={() => onNavigateTab('compliance')}
            className="w-full py-2.5 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] rounded-xl text-xs font-bold transition-all cursor-pointer text-center shadow-xs"
          >
            فحص معايير وشروط أدسنس ←
          </button>
        </div>
      </div>

      {/* Top Performing Chapters Table */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-amiri font-bold text-lg text-[#2C2C2C] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#4A5D4E]" />
            <span>أكثر الفصول قراءة وتفاعلاً</span>
          </h3>
          <button
            type="button"
            id="dash-view-all-chapters-btn"
            onClick={() => onNavigateTab('publish')}
            className="text-xs text-[#4A5D4E] hover:underline cursor-pointer font-bold"
          >
            إدارة جميع الفصول ←
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs font-cairo">
            <thead>
              <tr className="border-b border-[#E5E2D9] text-[#6E6A64] text-[11px] font-bold">
                <th className="py-2.5 px-3">الرواية</th>
                <th className="py-2.5 px-3">الفصل</th>
                <th className="py-2.5 px-3">عدد الكلمات</th>
                <th className="py-2.5 px-3">القراءات (المشاهدات)</th>
                <th className="py-2.5 px-3">الإعجابات</th>
                <th className="py-2.5 px-3 text-left">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2D9]">
              {topChapters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#6E6A64]">
                    لا توجد فصول منشورة حتى الآن. انقر على "نشر فصل جديد" بالأعلى للبدء بنشر أول فصل!
                  </td>
                </tr>
              ) : (
                topChapters.map(ch => {
                  const novel = novels.find(n => n.id === ch.novelId);
                  return (
                    <tr key={ch.id} className="hover:bg-[#F7F5EE] transition-colors">
                      <td className="py-3 px-3 font-bold text-[#2C2C2C] truncate max-w-xs">
                        {novel?.title || 'رواية غير معروفة'}
                      </td>
                      <td className="py-3 px-3 text-[#5A5751]">
                        فصل {ch.chapterNumber}: {ch.title}
                      </td>
                      <td className="py-3 px-3 text-[#6E6A64] font-mono">
                        {ch.wordCount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-mono text-[#2C2C2C] font-bold">
                        {ch.views.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-mono text-rose-500 font-bold">
                        {ch.likes.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-left">
                        <button
                          type="button"
                          id={`edit-top-ch-${ch.id}`}
                          onClick={() => onNavigateTab('publish')}
                          className="text-xs text-[#4A5D4E] hover:text-[#3C4C3F] font-bold cursor-pointer"
                        >
                          تعديل الفصل
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
