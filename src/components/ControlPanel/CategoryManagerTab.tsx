import React, { useState } from 'react';
import {
  FolderPlus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Layers,
  BookOpen,
  X
} from 'lucide-react';
import { Category, Novel } from '../../types';
import { storageService } from '../../services/storageService';

interface CategoryManagerTabProps {
  novels: Novel[];
  onRefreshData: () => void;
}

export const CategoryManagerTab: React.FC<CategoryManagerTabProps> = ({
  novels,
  onRefreshData,
}) => {
  const [categories, setCategories] = useState<Category[]>(storageService.getCategories());
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  
  // Form State
  const [arabicName, setArabicName] = useState<string>('');
  const [englishName, setEnglishName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetForm = () => {
    setEditingCatId(null);
    setArabicName('');
    setEnglishName('');
    setDescription('');
    setErrorMessage(null);
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCatId(cat.id);
    setArabicName(cat.arabicName);
    setEnglishName(cat.name);
    setDescription(cat.description || '');
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!arabicName.trim() || !englishName.trim()) {
      setErrorMessage('يرجى كتابة الاسم بالعربية والاسم المعرف (بالإنجليزية)');
      return;
    }

    if (editingCatId) {
      storageService.updateCategory(editingCatId, {
        arabicName: arabicName.trim(),
        name: englishName.trim(),
        description: description.trim(),
      });
      showToast('تم تحديث بيانات القسم بنجاح!');
    } else {
      storageService.addCategory({
        arabicName: arabicName.trim(),
        name: englishName.trim(),
        description: description.trim(),
      });
      showToast('تمت إضافة القسم الجديد بنجاح!');
    }

    setCategories(storageService.getCategories());
    onRefreshData();
    handleResetForm();
  };

  const handleDeleteCategory = (cat: Category) => {
    // Check how many books/novels are using this category
    const count = novels.filter(n => n.genres.includes(cat.name) || n.genres.includes(cat.arabicName)).length;
    const confirmText = count > 0
      ? `تحذير: هذا القسم مرتبط حالياً بـ (${count}) كتاب ومؤلف. هل أنت متأكد من حذفه؟`
      : `هل أنت متأكد من حذف قسم "${cat.arabicName}"؟`;

    if (window.confirm(confirmText)) {
      storageService.deleteCategory(cat.id);
      setCategories(storageService.getCategories());
      onRefreshData();
      showToast(`تم حذف قسم "${cat.arabicName}" بنجاح.`);
      if (editingCatId === cat.id) {
        handleResetForm();
      }
    }
  };

  return (
    <div className="space-y-8 font-cairo text-[#2C2C2C]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#4A5D4E] text-[#FDFCF8] px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E5E2D9] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-amiri font-bold text-2xl text-[#2C2C2C]">
                إدارة أقسام وتصنيفات الكتب والمؤلفات
              </h2>
              <p className="text-xs text-[#6E6A64] mt-0.5">
                يمكنك إضافة أقسام جديدة لكافة أصناف الكتب، تعديل مسمياتها، أو حذف الأقسام غير المطلوبة
              </p>
            </div>
          </div>
        </div>
        <div className="px-4 py-2 rounded-xl bg-[#F7F5EE] border border-[#E5E2D9] text-xs font-bold text-[#4A5D4E]">
          إجمالي الأقسام الحالية: <span className="font-mono text-[#2C2C2C] text-sm">{categories.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: Add / Edit Category */}
        <div className="lg:col-span-1">
          <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-3xl p-6 shadow-xs sticky top-20">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E5E2D9]">
              <h3 className="font-amiri font-bold text-lg text-[#2C2C2C] flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#4A5D4E]" />
                <span>{editingCatId ? 'تعديل بيانات القسم' : 'إضافة قسم / تصنيف جديد'}</span>
              </h3>
              {editingCatId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="p-1 text-[#8E8A83] hover:text-[#2C2C2C] text-xs font-bold flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  <span>إلغاء التعديل</span>
                </button>
              )}
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2C2C2C] mb-1">
                  اسم القسم بالعربية <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: فكر وفلسفة، روايات، تاريخ، تطوير ذات..."
                  value={arabicName}
                  onChange={e => setArabicName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] focus:outline-none font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C2C2C] mb-1">
                  المعرف / الاسم الإنجليزي (ID/Slug) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: Philosophy, Literature, Self-Development..."
                  value={englishName}
                  onChange={e => setEnglishName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] focus:outline-none font-mono text-left"
                  dir="ltr"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C2C2C] mb-1">
                  وصف مختصر عن محتوى وتصنيف القسم
                </label>
                <textarea
                  rows={3}
                  placeholder="نبذة عن الكتب والمؤلفات التي تندرج تحت هذا التصنيف..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl bg-[#FDFCF8] border border-[#E5E2D9] text-[#2C2C2C] focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#4A5D4E] hover:bg-[#3C4C3F] text-[#FDFCF8] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {editingCatId ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>حفظ التعديلات على القسم</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>إنشاء وإضافة القسم للموقع</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right List: Existing Categories */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-3xl p-6 shadow-xs">
            <h3 className="font-amiri font-bold text-lg text-[#2C2C2C] mb-4 pb-3 border-b border-[#E5E2D9] flex items-center justify-between">
              <span>الأقسام المفعلة في الموقع</span>
              <span className="text-xs font-sans text-[#6E6A64] font-normal">
                تظهر هذه الأقسام تلقائياً في شريط التصفح وفلاتر الكتب
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {categories.map((cat) => {
                const bookCount = novels.filter(n => n.genres.includes(cat.name) || n.genres.includes(cat.arabicName)).length;
                const isSelectedForEdit = editingCatId === cat.id;

                return (
                  <div
                    key={cat.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelectedForEdit
                        ? 'bg-[#4A5D4E]/5 border-[#4A5D4E] shadow-sm'
                        : 'bg-[#FDFCF8] border-[#E5E2D9] hover:border-[#4A5D4E]/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-amiri font-bold text-base text-[#2C2C2C]">
                            {cat.arabicName}
                          </h4>
                          <span className="text-[11px] font-mono text-[#8E8A83]">
                            {cat.name}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-[#F7F5EE] border border-[#E5E2D9] text-[10px] font-bold text-[#4A5D4E] flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          <span>{bookCount} كتاب</span>
                        </span>
                      </div>

                      {cat.description && (
                        <p className="text-xs text-[#6E6A64] mt-2 line-clamp-2 leading-relaxed">
                          {cat.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#E5E2D9]/60">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(cat)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#4A5D4E] hover:bg-[#4A5D4E]/10 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-1 cursor-pointer transition-colors"
                        title="حذف هذا القسم"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
