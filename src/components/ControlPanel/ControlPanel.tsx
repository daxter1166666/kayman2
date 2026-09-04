import React, { useState } from 'react';
import { Novel, Chapter, Comment, AdSettings } from '../../types';
import { DashboardTab } from './DashboardTab';
import { AuthorProfileTab } from './AuthorProfileTab';
import { DonationsTab } from './DonationsTab';
import { SupabaseTab } from './SupabaseTab';
import { ChapterPublisherTab } from './ChapterPublisherTab';
import { NovelManagerTab } from './NovelManagerTab';
import { CategoryManagerTab } from './CategoryManagerTab';
import { LegalAndContactManagerTab } from './LegalAndContactManagerTab';
import { AdManagerTab } from './AdManagerTab';
import { AdSenseComplianceTab } from './AdSenseComplianceTab';
import { CommentModeratorTab } from './CommentModeratorTab';
import { SettingsTab } from './SettingsTab';
import { SeoTab } from './SeoTab';
import {
  LayoutDashboard,
  User,
  Heart,
  Database,
  FilePlus,
  BookOpen,
  DollarSign,
  ShieldCheck,
  MessageSquare,
  ArrowRight,
  Settings,
  LogOut,
  Layers,
  FileText,
  Copy,
  Check,
  Search,
  RotateCcw
} from 'lucide-react';
import { ResetDataModal } from './ResetDataModal';

interface ControlPanelProps {
  novels: Novel[];
  chapters: Chapter[];
  comments: Comment[];
  adSettings: AdSettings;
  onRefreshData: () => void;
  onExitControlPanel: () => void;
  onAdminLogout: () => void;
  onOpenLegalPage: (page: 'terms' | 'privacy' | 'dmca' | 'licenses' | 'contact') => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  novels,
  chapters,
  comments,
  adSettings,
  onRefreshData,
  onExitControlPanel,
  onAdminLogout,
  onOpenLegalPage,
}) => {
  const [activeTab, setActiveTab] = useState<string>('author_profile');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  const tabs = [
    { id: 'author_profile', label: 'نبذة عني وحسابات التواصل', icon: User },
    { id: 'donations', label: 'الدعم المالي (PayPal/بنك)', icon: Heart },
    { id: 'supabase', label: 'الربط مع سوباباس (Supabase)', icon: Database },
    { id: 'dashboard', label: 'لوحة الإحصائيات', icon: LayoutDashboard },
    { id: 'publish', label: 'نشر وتعديل الفصول', icon: FilePlus },
    { id: 'novels', label: 'إدارة المؤلفات والكتب', icon: BookOpen },
    { id: 'categories', label: 'إدارة وتخصيص الأقسام', icon: Layers },
    { id: 'legal_contact', label: 'السياسات ورسائل القراء', icon: FileText },
    { id: 'ads', label: 'إدارة الإعلانات', icon: DollarSign },
    { id: 'compliance', label: 'شروط AdSense', icon: ShieldCheck },
    { id: 'seo', label: 'سيو ومحركات البحث (SEO)', icon: Search },
    { id: 'comments', label: 'تعليقات القراء', icon: MessageSquare, badge: comments.length },
    { id: 'settings', label: 'الهوية والأمان والنسخ', icon: Settings },
  ];

  const adminDirectUrl = `${window.location.origin}/?admin=true`;

  const handleCopyAdminUrl = () => {
    navigator.clipboard.writeText(adminDirectUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#2C2C2C] pb-20 font-cairo">
      {/* Secret Link Notification Header */}
      <div className="bg-[#4A5D4E]/10 border-b border-[#4A5D4E]/20 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[#4A5D4E]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              <strong>رابط الدخول المباشر للوحة التحكم (مخفي عن القراء):</strong> يمكنك نسخ هذا الرابط والاحتفاظ به للدخول المباشر في أي وقت.
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyAdminUrl}
            className="px-3 py-1 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs shrink-0 text-[11px]"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>تم نسخ الرابط السري</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ الرابط السري: {adminDirectUrl}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Control Panel Sticky Sub-Header */}
      <div className="sticky top-0 z-30 bg-[#FDFCF8]/95 backdrop-blur-md border-b border-[#E5E2D9] px-4 py-3">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Top Row: Title, Back button, and Logout */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                id="exit-control-panel-btn"
                onClick={onExitControlPanel}
                className="px-3.5 py-2 rounded-xl border border-[#E5E2D9] bg-[#FFFFFF] hover:bg-[#F7F5EE] text-[#2C2C2C] text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <ArrowRight className="w-4 h-4 text-[#4A5D4E]" />
                <span>العودة للموقع والقراءة</span>
              </button>

              <div className="h-5 w-px bg-[#E5E2D9] hidden sm:block" />

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4A5D4E] animate-pulse" />
                <span className="font-amiri font-bold text-base sm:text-lg text-[#2C2C2C]">
                  لوحة تحكم الكاتب والإدارة | أيمن كناني
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="cp-top-reset-btn"
                onClick={() => setIsResetModalOpen(true)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-[#4A5D4E] bg-[#F7F5EE] hover:bg-[#EAE7DC] border border-[#E5E2D9] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="مسح التخزين المحلي وإعادة سحب البيانات المحدثة فقط من سوباباس لحل تكرار الكتب"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span className="hidden sm:inline">إعادة ضبط ومزامنة البيانات</span>
                <span className="sm:hidden">إعادة ضبط</span>
              </button>

              <button
                type="button"
                id="admin-logout-btn"
                onClick={onAdminLogout}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="تسجيل خروج الأدمن"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>

          {/* Multi-Line Wrapped Tab Switcher Bar - Fully visible in multiple rows */}
          <div className="bg-[#FFFFFF] p-2 sm:p-2.5 rounded-2xl border border-[#E5E2D9] shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    id={`cp-tab-btn-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#4A5D4E] text-[#FDFCF8] shadow-sm ring-2 ring-[#4A5D4E]/20 scale-102'
                        : 'text-[#5C5954] hover:text-[#2C2C2C] hover:bg-[#F7F5EE] bg-[#FDFCF8] border border-[#EBE8DF]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#FDFCF8]' : 'text-[#4A5D4E]'}`} />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isActive ? 'bg-[#3C4C3F] text-white' : 'bg-[#EAE7DD] text-[#4A5D4E]'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {activeTab === 'author_profile' && (
          <AuthorProfileTab
            onRefreshData={onRefreshData}
          />
        )}

        {activeTab === 'donations' && (
          <DonationsTab
            onRefreshData={onRefreshData}
          />
        )}

        {activeTab === 'supabase' && (
          <SupabaseTab
            novels={novels}
            chapters={chapters}
            comments={comments}
            onRefreshData={onRefreshData}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardTab
            novels={novels}
            chapters={chapters}
            comments={comments}
            adSettings={adSettings}
            onNavigateTab={tab => setActiveTab(tab)}
          />
        )}

        {activeTab === 'publish' && (
          <ChapterPublisherTab
            novels={novels}
            chapters={chapters}
            onRefreshData={onRefreshData}
            onNavigateTab={tab => setActiveTab(tab)}
          />
        )}

        {activeTab === 'novels' && (
          <NovelManagerTab
            novels={novels}
            onRefreshData={onRefreshData}
          />
        )}

        {activeTab === 'categories' && (
          <CategoryManagerTab
            novels={novels}
            onRefreshData={onRefreshData}
          />
        )}

        {activeTab === 'legal_contact' && (
          <LegalAndContactManagerTab
            onRefreshData={onRefreshData}
            onOpenLegalPage={onOpenLegalPage}
          />
        )}

        {activeTab === 'ads' && (
          <AdManagerTab
            adSettings={adSettings}
            onRefreshData={onRefreshData}
          />
        )}

        {activeTab === 'compliance' && (
          <AdSenseComplianceTab
            novels={novels}
            chapters={chapters}
            adSettings={adSettings}
            onOpenLegalPage={onOpenLegalPage}
          />
        )}

        {activeTab === 'seo' && (
          <SeoTab
            novels={novels}
            chapters={chapters}
            onRefreshData={onRefreshData}
          />
        )}

        {activeTab === 'comments' && (
          <CommentModeratorTab
            novels={novels}
            chapters={chapters}
            comments={comments}
            onRefreshData={onRefreshData}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            onRefreshData={onRefreshData}
          />
        )}
      </main>

      {/* Quick Reset Data Modal from Header */}
      <ResetDataModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onSuccess={onRefreshData}
      />
    </div>
  );
};
