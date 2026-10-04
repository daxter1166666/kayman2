import React from 'react';
import {
  FileText,
  GraduationCap,
  Languages,
  BookOpenCheck,
  BookMarked,
  MessageSquare,
  Feather,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { IntellectualType } from '../types';

export interface IntellectualTypeInfo {
  type: IntellectualType;
  label: string;
  shortLabel: string;
  pluralLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  pillBg: string;
  pillText: string;
  pillActiveBg: string;
}

export const INTELLECTUAL_TYPES_CONFIG: Record<IntellectualType, IntellectualTypeInfo> = {
  article: {
    type: 'article',
    label: 'مقالة فكرية',
    shortLabel: 'مقال',
    pluralLabel: 'مقالات فكرية',
    description: 'مقالات في الفكر، الفلسفة، تجديد الوعي، والقضايا المعاصرة',
    icon: FileText,
    badgeBg: 'bg-[#4A5D4E]/10',
    badgeText: 'text-[#4A5D4E]',
    badgeBorder: 'border-[#4A5D4E]/20',
    pillBg: 'bg-emerald-50',
    pillText: 'text-emerald-800',
    pillActiveBg: 'bg-[#4A5D4E]',
  },
  study: {
    type: 'study',
    label: 'دراسة تحليلية',
    shortLabel: 'دراسة',
    pluralLabel: 'دراسات تحليلية',
    description: 'دراسات منهجية متعمقة وأبحاث فكرية معمقة',
    icon: GraduationCap,
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800',
    badgeBorder: 'border-indigo-200',
    pillBg: 'bg-indigo-50',
    pillText: 'text-indigo-800',
    pillActiveBg: 'bg-indigo-700',
  },
  translated_article: {
    type: 'translated_article',
    label: 'مقالة مترجمة',
    shortLabel: 'مقال مترجم',
    pluralLabel: 'مقالات مترجمة',
    description: 'مقالات فكرية وفلسفية مترجمة من لغات أجنبية مع توثيق المصدر',
    icon: Languages,
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    pillBg: 'bg-amber-50',
    pillText: 'text-amber-800',
    pillActiveBg: 'bg-amber-700',
  },
  translated_study: {
    type: 'translated_study',
    label: 'دراسة مترجمة',
    shortLabel: 'دراسة مترجمة',
    pluralLabel: 'دراسات مترجمة',
    description: 'أبحاث ودراسات أكاديمية مترجمة مع مراجعة وهوامش علمية دقيقة',
    icon: Languages,
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-800',
    badgeBorder: 'border-orange-200',
    pillBg: 'bg-orange-50',
    pillText: 'text-orange-800',
    pillActiveBg: 'bg-orange-700',
  },
  academic_research: {
    type: 'academic_research',
    label: 'بحث محكّم',
    shortLabel: 'بحث محكّم',
    pluralLabel: 'أبحاث محكّمة',
    description: 'أوراق بحثية علمية محكمة بالمراجع والمنهجية الأكاديمية الرصينة',
    icon: BookOpenCheck,
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-800',
    badgeBorder: 'border-teal-200',
    pillBg: 'bg-teal-50',
    pillText: 'text-teal-800',
    pillActiveBg: 'bg-teal-700',
  },
  book_review: {
    type: 'book_review',
    label: 'قراءة ومراجعة كتاب',
    shortLabel: 'مراجعة كتاب',
    pluralLabel: 'مراجعات الكتب',
    description: 'قراءات نقدية تحليلية لأبرز الكتب والمؤلفات الفكرية والفلسفية',
    icon: BookMarked,
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-200',
    pillBg: 'bg-purple-50',
    pillText: 'text-purple-800',
    pillActiveBg: 'bg-purple-700',
  },
  intellectual_dialogue: {
    type: 'intellectual_dialogue',
    label: 'حوار فكري ومناظرة',
    shortLabel: 'حوار فكري',
    pluralLabel: 'حوارات فكرية',
    description: 'مناظرات وجدليات فكرية وحوارات حول إشكاليات الوعي والمنهج',
    icon: MessageSquare,
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-800',
    badgeBorder: 'border-sky-200',
    pillBg: 'bg-sky-50',
    pillText: 'text-sky-800',
    pillActiveBg: 'bg-sky-700',
  },
  essay: {
    type: 'essay',
    label: 'خاطرة ومقال رأي',
    shortLabel: 'خاطرة فكرية',
    pluralLabel: 'خواطر فكرية',
    description: 'شذرات أدبية فلسفية ومقالات رأي وتأملات حرة',
    icon: Feather,
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-800',
    badgeBorder: 'border-rose-200',
    pillBg: 'bg-rose-50',
    pillText: 'text-rose-800',
    pillActiveBg: 'bg-rose-700',
  },
};

export const ALL_INTELLECTUAL_TYPES: IntellectualType[] = [
  'article',
  'study',
  'translated_article',
  'translated_study',
  'academic_research',
  'book_review',
  'intellectual_dialogue',
  'essay',
];

export function getIntellectualTypeInfo(type?: string | null): IntellectualTypeInfo {
  if (!type || !INTELLECTUAL_TYPES_CONFIG[type as IntellectualType]) {
    return INTELLECTUAL_TYPES_CONFIG.article;
  }
  return INTELLECTUAL_TYPES_CONFIG[type as IntellectualType];
}

export function isTranslatedIntellectualType(type?: string | null): boolean {
  return type === 'translated_article' || type === 'translated_study';
}

export function isStudyIntellectualType(type?: string | null): boolean {
  return (
    type === 'study' ||
    type === 'translated_study' ||
    type === 'academic_research'
  );
}
