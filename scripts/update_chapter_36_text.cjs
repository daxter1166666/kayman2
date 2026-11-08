const fs = require('fs');
const path = require('path');

const newContent = `<p dir="RTL" style="direction:rtl;"><strong>مقدمة الفصل: الكلمة الرقمية وسلطتها الممتدة</strong></p>
<p dir="RTL" style="direction:rtl;">في زمن تتسارع فيه وسائط النشر وتتعدد منصات التواصل الاجتماعي، تصبح الكلمة المكتوبة أو المنطوقة قادرة على قطع مسافات هائلة في ثوانٍ معدودات. هذا الانتشار السريع والفائق للحدود يضع الباحث والكاتب أمام مسؤولية أخلاقية ومعرفية غير مسبوقة؛ فما كان يستغرق شهورًا أو سنوات ليصل إلى الجمهور، بات يصل اليوم إلى الملايين بلحظة واحدة بكبسة زر.</p>
<p dir="RTL" style="direction:rtl;">لم تعد الكلمة مجرد حبر على ورق يُقرأ بتأني وبصيرة، بل تحولت إلى طاقة رقمية متنقلة قد تُقتطع من سياقها، أو تُفهم على غير مرادها، أو يُبنى عليها مواقف ومترتبات خطيرة. من هنا كان لزامًا على الباحث المسلم أن يدرك أن سرعة الانتشار لا تسقط عنه واجب التثبت، بل تضاعفه أضعافًا مضاعفة.</p>

<p dir="RTL" style="direction:rtl;"><strong>أولاً: طبيعة الكلمة في عصر السرعة الافتراضية</strong></p>
<p dir="RTL" style="direction:rtl;">تتسم البيئة الرقمية المعاصرة بثلاث خصائص رئيسية تؤثر بشكل مباشر على حياة الكلمة:</p>
<p dir="RTL" style="direction:rtl;">1. <strong>السرعة المفرطة والتجاوز المكاني:</strong> تنتقل الفكرة من حيزها المحلي الضيق إلى الفضاء العالمي الكوني دون فحص أو تدقيق، مما يجعل تصحيح الخطأ لاحقًا أشبه بمحاولة جمع ريش متطاير في العاصفة.</p>
<p dir="RTL" style="direction:rtl;">2. <strong>بتر السياق (Context Collapse):</strong> يفقد المنشور الرقمي غالبًا سياقه الأصلي حين يعاد تداوله، فيقرأه جمهور جديد لا يعرف خلفيات النص ولا شروط إطلاقه، مما يؤدي لتأويلات متباينة تمامًا لما أراده الكاتب.</p>
<p dir="RTL" style="direction:rtl;">3. <strong>الدوام الرقمي (Digital Permanence):</strong> ما يُكتب على الإنترنت لا يموت بسهولة؛ حتى لو حذفه الكاتب، تظل نسخه مخزنة في الأرشيفات الرقمية وذاكرة المتابعين، ليتحول الخطأ العابر إلى وثيقة دائمة تُطارد صاحبها سنين طويلة.</p>

<p dir="RTL" style="direction:rtl;"><strong>ثانياً: مخاطر العجلة والانفعال اللحظي في الكتابة</strong></p>
<p dir="RTL" style="direction:rtl;">إن أشد ما يهدد مصداقية الباحث هو الانجرار خلف التريند أو الرغبة في التعقيب السريع على كل حدث ساخن دون تدبر عواقب الكلمة. الكلمة الطائشة في زمن الانتشار السريع كشرارة في حشيش جاف؛ قد تحرق ما لا يمكن استدراكه لاحقًا من ثقة الناس أو استقرار المجتمعات.</p>
<p dir="RTL" style="direction:rtl;">في الماضي، كان الكاتب يكتب المقال ثم يعرضه على نفسه أيامًا، وربما عرضه على زملائه وأساتذته، لتهدأ فورورة الانفعال وتتضح معالم الموضوعية. أما اليوم، فيُدفع بالكاتب نحو "اقتصاد الانتباه"، حيث يُطلب منه أن يكون حاضرًا، سريع التعقيب، متفاعلاً مع كل نبضة في الشبكة، وهو ما يصنع بالضرورة ثقافة "الرأي الخفيف" المفتقر للعمق والمسؤولية.</p>

<p dir="RTL" style="direction:rtl;"><strong>ثالثاً: المسؤولية الشرعية والأخلاقية للكلمة المنشورة</strong></p>
<p dir="RTL" style="direction:rtl;">في التراث الإسلامي، لم تكن الكلمة تُستخف قط. يقول الله عز وجل: <em>«مَا يَلْفِظُ مِنْ قَوْلٍ إِلَّا لَدَيْهِ رَقِيبٌ عَتِيدٌ»</em>، ويقول النبي ﷺ لمعاذ بن جبل رضي الله عنه: <em>«وهل يكب الناس في النار على وجوههم إلا حصائد ألسنتهم»</em>. واللسان اليوم قد امتد ليشمل بنان الكاتب وما خطته أصابعه على الشاشات الرقمية.</p>
<p dir="RTL" style="direction:rtl;">إن الباحث المسلم يكتب وهو يدرك أن كل حرف يُسطر في صحيفته يوم القيامة؛ فإن كان خيرًا ونفعًا وصدقًا أثقل موازينه، وإن كان زورًا أو تحريضًا أعمى أو نشرًا للباطل كان وبالاً عليه. هذه الرقابة الإلهية الذاتية هي الصمام الأمان الحقيقي في عصر تغيب فيه الرقابة القانونية الصارمة عن كثير من أشكال النشر الفردي.</p>

<p dir="RTL" style="direction:rtl;"><strong>رابعاً: نماذج تاريخية من التحري والتحقيق عند علماء الأمة</strong></p>
<p dir="RTL" style="direction:rtl;">ضرب أئمة الإسلام أروع الأمثلة في التحري والتحفظ قبل إطلاق الكلمات والآراء؛ فكان الإمام مالك بن أَنَس رحمه الله يُسأل عن أربعين مسألة فيجيب عن ثمانٍ منها ويقول في الباقي: «لا أحسن»، ولا يجد في ذلك أي حرج. كما كان الإمام البخاري رحمه الله يعرض أحاديث جامعه الصحيح على أئمة عصره كأحمد بن حنبل وعلي بن المديني ويستشيرهم ويراجع الصياغات بدقة متناهية. هذا التريث الواعي يعكس يقين الأئمة بأن الكلمة المنشورة شهادة ودين يسأل عنه المرء أمام الله تبارك وتعالى.</p>

<p dir="RTL" style="direction:rtl;"><strong>خامساً: الآثار النفسية والاجتماعية للانتشار الخاطئ وطرق العلاج المعرفي</strong></p>
<p dir="RTL" style="direction:rtl;">تترتب على الكلمة المتسرعة آثار نفسية واجتماعية عميقة؛ إذ قد تسهم في تضليل الجمهور أو إشاعة الشائعات والمعلومات المغلوطة التي تؤدي لتفكك النسيج المجتمعي واستثارة العصبيات. ولعلاج هذه الظاهرة، يجب على الكاتب تبني نهج الفحص المزدوج: فحص مصادر المعلومة قبل اعتمادها، وفحص النية والدافع النفسي قبل ضغط زر النشر.</p>

<p dir="RTL" style="direction:rtl;"><strong>سادساً: القواعد والمحاذير المنهجية للكاتب المعاصر</strong></p>
<p dir="RTL" style="direction:rtl;">لتكييف العمل الفكري مع مقتضيات الأمانة في عصر السرعة، ينبغي الالتزام بالضوابط الآتية:</p>
<p dir="RTL" style="direction:rtl;">1. <strong>قاعدة "التبريد الزمني":</strong> لا تنشر رأيًا في نازلة أو حدث ساخن فور وقوعه، بل امنح نفسك نافذة زمنية لا تقل عن أربع وعشرين ساعة لتهدأ العواطف وتتضح الحقائق.</p>
<p dir="RTL" style="direction:rtl;">2. <strong>فحص العواقب والمآلات:</strong> انظر إلى ما بعد النشر؛ ما الذي سيترتب على هذه الكلمة؟ هل ستبني أم تهدم؟ هل ستجمع الكلمة أم تفرق الصفوف دون حق؟</p>
<p dir="RTL" style="direction:rtl;">3. <strong>الاستغناء عن إثارة الجمهور:</strong> لا تكن عبدًا لعداد الإعجابات والمشاركات، فالانتشار الواسع للرأي ليس دليلًا بالضرورة على صحته، بل قد يكون دليلًا على قدرته على إثارة العصبيات أو الغرائز الدنيا.</p>

<p dir="RTL" style="direction:rtl;"><strong>خلاصة تطبيقية وميثاق أمانة القلم</strong></p>
<p dir="RTL" style="direction:rtl;">قبل أن تنشر أي رأي أو مقال في وسائط التواصل الاجتماعي، اسأل نفسك بصدق: هل هذه الكلمة تمثل أمانة العلم، أم أنها مجرد صدى لانفعال لحظي زائل؟ إن كانت الأولى فانشرها متوكلًا على الله، وإن كانت الثانية فصمتك عنها خير وأسلم لدينك وعلمك ومصداقيتك العلمية والأخلاقية.</p>`;

const plainText = newContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const words = plainText.split(/\s+/).filter(Boolean).length;
console.log('New Word Count for Chapter 36:', words);

// 1. Update publishedChapters.json
const pubPath = path.resolve(__dirname, '../src/data/publishedChapters.json');
const pubData = JSON.parse(fs.readFileSync(pubPath, 'utf8'));
const ch36Index = pubData.findIndex(c => c.chapterNumber === 36);
if (ch36Index !== -1) {
  pubData[ch36Index].content = newContent;
  pubData[ch36Index].wordCount = words;
  fs.writeFileSync(pubPath, JSON.stringify(pubData, null, 2), 'utf8');
  console.log('✅ Updated src/data/publishedChapters.json');
}

// 2. Update src/data/chapters/chapter-36.json
const ch36JsonPath = path.resolve(__dirname, '../src/data/chapters/chapter-36.json');
if (fs.existsSync(ch36JsonPath)) {
  const jsonContent = JSON.parse(fs.readFileSync(ch36JsonPath, 'utf8'));
  jsonContent.content = newContent;
  jsonContent.wordCount = words;
  fs.writeFileSync(ch36JsonPath, JSON.stringify(jsonContent, null, 2), 'utf8');
  console.log('✅ Updated src/data/chapters/chapter-36.json');
}

// 3. Update public/chapters/chapter-36.json
const pubStaticJsonPath = path.resolve(__dirname, '../public/chapters/chapter-36.json');
if (fs.existsSync(pubStaticJsonPath)) {
  const jsonContent = JSON.parse(fs.readFileSync(pubStaticJsonPath, 'utf8'));
  jsonContent.content = newContent;
  jsonContent.wordCount = words;
  fs.writeFileSync(pubStaticJsonPath, JSON.stringify(jsonContent, null, 2), 'utf8');
  console.log('✅ Updated public/chapters/chapter-36.json');
}

// 4. Update src/data/chapters/chapter-36.md
const ch36MdPath = path.resolve(__dirname, '../src/data/chapters/chapter-36.md');
if (fs.existsSync(ch36MdPath)) {
  const mdText = `---
id: "ch-novel-1788556252989-1791660041876"
novelId: "novel-1788556252989"
chapterNumber: 36
title: "الفصل الأول: مسؤولية الكلمة في زمن الانتشار السريع"
slug: "الفصل-الأول-مسؤولية-الكلمة-في-زمن-الانتشار-السريع"
partName: "الباب السادس: في أصول النشر والتأثير العام"
publishedAt: "2026-10-10T19:20:41.876+00:00"
wordCount: ${words}
status: "PUBLISHED"
---

${newContent}
`;
  fs.writeFileSync(ch36MdPath, mdText, 'utf8');
  console.log('✅ Updated src/data/chapters/chapter-36.md');
}
