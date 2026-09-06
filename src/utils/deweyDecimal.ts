export interface DeweyCategory {
  code: string;
  name: string;
  description: string;
  categoryGroup: string;
  arabicName?: string;
  group?: string;
}

export const DEWEY_DECIMAL_CATEGORIES: DeweyCategory[] = [
  // 800 - الأدب والبلاغة (Literature)
  {
    code: '813',
    name: '813 - الروايات والقصص الأدبية العربية',
    description: 'الروايات، الحكايات، والقصص الأدبية المعاصرة والحديثة',
    categoryGroup: 'الأدب والبلاغة'
  },
  {
    code: '813.08',
    name: '813.08 - مجموعات القصص والروايات المختارة',
    description: 'المجموعات القصصية والمختارات السردية',
    categoryGroup: 'الأدب والبلاغة'
  },
  {
    code: '810',
    name: '810 - الأدب العربي العام',
    description: 'الأدب العربي بمختلف عصوره وفنونه ونقده الأدبي',
    categoryGroup: 'الأدب والبلاغة'
  },
  {
    code: '811',
    name: '811 - الشعر العربي والدواوين',
    description: 'الشعر العربي الكلاسيكي والحديث والقصائد الوجدانية',
    categoryGroup: 'الأدب والبلاغة'
  },
  {
    code: '814',
    name: '814 - المقالات الأدبية والخواطر',
    description: 'المقالات والخواطر الأدبية والتأملات الذاتية والفكرية',
    categoryGroup: 'الأدب والبلاغة'
  },
  {
    code: '812',
    name: '812 - المسرحيات والدراما العربية',
    description: 'النصوص المسرحية والدراما الأدبية العربية',
    categoryGroup: 'الأدب والبلاغة'
  },
  {
    code: '808',
    name: '808 - البلاغة والإنشاء وفنون الكتابة',
    description: 'فنون السرد والتأليف والكتابة الإبداعية والبيان',
    categoryGroup: 'الأدب والبلاغة'
  },
  {
    code: '809',
    name: '809 - تاريخ الأدب والنقد المقارن',
    description: 'دراسات تاريخ الأدب والنظريات النقدية والمقارنة',
    categoryGroup: 'الأدب والبلاغة'
  },

  // 100 - الفلسفة وعلم النفس (Philosophy & Psychology)
  {
    code: '100',
    name: '100 - الفلسفة والفكر الإنساني',
    description: 'المباحث الفلسفية ونظرية المعرفة والتأملات الفكرية',
    categoryGroup: 'الفلسفة وعلم النفس'
  },
  {
    code: '150',
    name: '150 - علم النفس وتطوير الوعي والذات',
    description: 'علم النفس السلوكي والمعرفي والنمو الوجداني',
    categoryGroup: 'الفلسفة وعلم النفس'
  },
  {
    code: '181',
    name: '181 - الفلسفة الشرقية والإسلامية',
    description: 'تاريخ الحكمة والفلسفة الإسلامية والشرقية القديمة',
    categoryGroup: 'الفلسفة وعلم النفس'
  },
  {
    code: '170',
    name: '170 - الأخلاق وفلسفة القيم',
    description: 'علم الأخلاق والضمير والقيم الإنسانية السامية',
    categoryGroup: 'الفلسفة وعلم النفس'
  },

  // 200 - الديانات والفكر الديني (Religion)
  {
    code: '210',
    name: '210 - الفكر والدراسات الإسلامية',
    description: 'الدراسات الفكرية الإسلامية وتاريخ الحضارة الإسلامية',
    categoryGroup: 'الديانات والفكر'
  },
  {
    code: '211',
    name: '211 - العقيدة والتوحيد وأصول الإيمان',
    description: 'مباحث العقيدة والفكر اللاهوتي والإيماني',
    categoryGroup: 'الديانات والفكر'
  },
  {
    code: '214',
    name: '214 - الفقه وأصول التشريع والمقاصد',
    description: 'مقاصد الشريعة وأصول الأحكام الفقهية',
    categoryGroup: 'الديانات والفكر'
  },

  // 300 - العلوم الاجتماعية (Social Sciences)
  {
    code: '300',
    name: '300 - العلوم الاجتماعية والمجتمع',
    description: 'دراسة الظواهر الاجتماعية والتحولات المجتمعية',
    categoryGroup: 'العلوم الاجتماعية'
  },
  {
    code: '320',
    name: '320 - العلوم السياسية والفكر الاستراتيجي',
    description: 'النظريات السياسية والدولة والعلاقات الدولية',
    categoryGroup: 'العلوم الاجتماعية'
  },
  {
    code: '370',
    name: '370 - التربية والتعليم وبناء العقل',
    description: 'المناهج التربوية والتنشئة الثقافية وبناء الأجيال',
    categoryGroup: 'العلوم الاجتماعية'
  },

  // 900 - التاريخ والجغرافيا والتراجم (History & Geography)
  {
    code: '900',
    name: '900 - التاريخ العام والحضارات الكبرى',
    description: 'التاريخ الإنساني وتطور الأمم والحضارات الكبرى',
    categoryGroup: 'التاريخ والتراجم'
  },
  {
    code: '920',
    name: '920 - السير الذاتية والتراجم والذكريات',
    description: 'مذكرات الأعلام وتراجم الشخصيات الأدبية والمؤثرين',
    categoryGroup: 'التاريخ والتراجم'
  },
  {
    code: '953',
    name: '953 - تاريخ الجزيرة العربية والخليج العربي',
    description: 'تاريخ وحضارة شبه الجزيرة العربية والخليج العربي',
    categoryGroup: 'التاريخ والتراجم'
  },
  {
    code: '956',
    name: '956 - تاريخ الشرق الأوسط المعاصر',
    description: 'أحداث وقضايا الشرق الأوسط والعالم العربي المعاصر',
    categoryGroup: 'التاريخ والتراجم'
  },

  // 000 - المعارف العامة (General Works)
  {
    code: '000',
    name: '000 - المعارف العامة والموسوعات',
    description: 'دوائر المعارف، التوثيق، والمخطوطات والمناهج العلمية',
    categoryGroup: 'المعارف العامة'
  }
];

export function getDeweyInfo(code?: string): DeweyCategory | undefined {
  if (!code) return undefined;
  const trimmed = code.trim();
  return DEWEY_DECIMAL_CATEGORIES.find(c => c.code === trimmed || trimmed.startsWith(c.code));
}

export function formatDeweyDisplay(code?: string, categoryName?: string): string {
  if (!code && !categoryName) return '';
  if (categoryName) return categoryName;
  const info = getDeweyInfo(code);
  return info ? info.name : `تصنيف ديوي: ${code}`;
}
