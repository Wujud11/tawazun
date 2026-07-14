# توازن | Tawazun

منصة مقاصة ذكية متعددة الأطراف لشبكات الديون المؤسسية — تجمع بين خوارزمية تسوية حتمية وتحليل تنفيذي مدعوم بالذكاء الاصطناعي.

## التجربة المباشرة

**[تجربة مباشرة — المقاصة الذكية](https://tawazun-production-e0ed.up.railway.app/netting)**

| الرابط | الوصف |
|--------|--------|
| [المقاصة الذكية](https://tawazun-production-e0ed.up.railway.app/netting) | صفحة المقاصة والتحليل التنفيذي |
| [لوحة التحكم](https://tawazun-production-e0ed.up.railway.app/) | نظرة شاملة على شبكة الديون |
| [فحص الصحة](https://tawazun-production-e0ed.up.railway.app/health) | حالة الخادم |

## الكود المصدري

[github.com/Wujud11/tawazun](https://github.com/Wujud11/tawazun)

## الميزات

- **مقاصة متعددة الأطراف** — تجميع المراكز الصافية وتسوية ثنائية محسّنة
- **تحليل GPT-4o** — ملخص تنفيذي، مؤشرات مخاطر، توصيات، ورؤى مالية
- **تقرير PDF** — تصدير تقرير مالي تنفيذي من واجهة المقاصة
- **لوحة خزينة** — مؤشرات أداء، رسوم بيانية، وملخص الشركات

## التشغيل المحلي

```bash
npm install
npm run dev          # الواجهة على http://localhost:5173
npm run server:dev   # الخادم على http://localhost:3001
```

انسخ `.env.example` إلى `.env` وأضف `OPENAI_API_KEY`.

## البناء

```bash
npm run build
npm run server:build
npm start
```

## التقنيات

React 19 · TypeScript · Vite · Express · Tailwind CSS · OpenAI GPT-4o · Recharts
