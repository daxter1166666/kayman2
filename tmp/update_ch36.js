const fs = require('fs');
const published = JSON.parse(fs.readFileSync('src/data/publishedChapters.json', 'utf8'));
const ch36 = published.find(c => c.chapterNumber === 36);
if (ch36) {
  ch36.title = 'الفصل الأول: مسؤولية الكلمة في زمن الانتشار السريع';
  ch36.slug = 'الفصل-الأول-مسؤولية-الكلمة-في-زمن-الانتشار-السريع';
  ch36.content = `<p dir="RTL" style="direction:rtl;">&nbsp;مقدمة الفصل</p><p dir="RTL" style="direction:rtl;">في زمن تتسارع فيه وسائط النشر وتتعدد منصات التواصل الاجتماعي، تصبح الكلمة المكتوبة أو المنطوقة قادرة على قطع مسافات هائلة في ثوانٍ معدودات. هذا الانتشار السريع والفائق للحدود يضع الباحث والكاتب أمام مسؤولية أخلاقية ومعرفية غير مسبوقة؛ فما كان يستغرق شهورًا أو سنوات ليصل إلى الجمهور، بات يصل اليوم إلى الملايين بلحظة واحدة بكبسة زر.</p><p dir="RTL" style="direction:rtl;">&nbsp;طبيعة الكلمة في عصر السرعة</p><p dir="RTL" style="direction:rtl;">الكلمة لم تعد مجرد حبر على ورق يُقرأ بتأني وبصيرة، بل تحولت إلى طاقة رقمية متنقلة قد تُقتطع من سياقها، أو تُفهم على غير مرادها، أو يُبنى عليها مواقف ومترتبات خطيرة. من هنا كان لزامًا على الباحث المسلم أن يدرك أن سرعة الانتشار لا تسقط عنه واجب التثبت، بل تضاعفه أضعافًا مضاعفة.</p><p dir="RTL" style="direction:rtl;">&nbsp;مخاطر العجلة والانفعال اللحظي</p><p dir="RTL" style="direction:rtl;">إن أشد ما يهدد مصداقية الباحث هو الانجرار خلف التريند أو الرغبة في التعقيب السريع على كل حدث ساخن دون تدبر عواقب الكلمة. الكلمة الطائشة في زمن الانتشار السريع كشرارة في حشيش جاف؛ قد تحرق ما لا يمكن استدراكه لاحقًا من ثقة الناس أو استقرار المجتمعات.</p><p dir="RTL" style="direction:rtl;">&nbsp;القواعد الأخلاقية للكاتب المنشور</p><p dir="RTL" style="direction:rtl;">1. التثبت والتدقيق قبل النشر مهما كانت الإثارة متسارعة.<br>2. مراعاة عواقب الكلام ومآلات الأفعال والأقوال.<br>3. الابتعاد عن التهويل واستفزاز العواطف الرخيصة طلبًا للتفاعل.<br>4. تذكر الدوام الأخلاقي للكلمة أمام الله عز وجل ثم أمام التاريخ.</p><p dir="RTL" style="direction:rtl;">&nbsp;خلاصة تطبيقية</p><p dir="RTL" style="direction:rtl;">قبل أن تنشر أي رأي أو مقال في وسائط التواصل الاجتماعي، اسأل نفسك بصدق: هل هذه الكلمة تمثل أمانة العلم، أم أنها مجرد صدى لانفعال لحظي زائل؟ إن كانت الأولى فانشرها متوكلًا على الله، وإن كانت الثانية فصمتك عنها خير وأسلم لدينك وعلمك.</p>`;
  const plainText = ch36.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  ch36.wordCount = plainText.split(/\s+/).filter(Boolean).length;
  fs.writeFileSync('src/data/publishedChapters.json', JSON.stringify(published, null, 2), 'utf8');
  console.log('Successfully updated Chapter 36 in publishedChapters.json, new wordCount:', ch36.wordCount);
} else {
  console.log('Chapter 36 not found');
}
