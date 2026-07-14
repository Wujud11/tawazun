import {
  ArrowUpRight,
  Building2,
  Code,
  ExternalLink,
  Sparkles,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { GITHUB_REPO_URL, LIVE_DEMO_URL } from '@/lib/site'

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <Badge variant="secondary" className="font-normal">
          منصة خزينة المؤسسات
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">عن توازن</h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          توازن (Tawazun) منصة مقاصة ذكية متعددة الأطراف تساعد شبكات الشركات
          على تقليل عدد التحويلات البنكية مع الحفاظ على صافي الالتزامات المالية.
          تجمع المنصة بين خوارزمية مقاصة حتمية وتحليل تنفيذي مدعوم بالذكاء
          الاصطناعي.
        </p>
      </div>

      <Card className="treasury-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            التجربة المباشرة
          </CardTitle>
          <CardDescription>
            جرّب صفحة المقاصة الذكية على البيئة الإنتاجية
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="gap-2">
            <a href={LIVE_DEMO_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" />
              تجربة مباشرة — المقاصة الذكية
            </a>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
              <Code className="size-4" />
              عرض الكود المصدري
            </a>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="treasury-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">المقاصة الحتمية</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            تجميع المراكز الصافية ثم تسوية ثنائية جشعة لتقليل عدد التحويلات
            المطلوبة دون تغيير الالتزامات المالية.
          </CardContent>
        </Card>
        <Card className="treasury-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">تحليل تنفيذي بالذكاء الاصطناعي</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            ملخص تنفيذي، مؤشرات مخاطر، توصيات، ورؤى مالية — مع أرقام محسوبة
            خوارزمياً على الخادم.
          </CardContent>
        </Card>
      </div>

      <Card className="treasury-card border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <Building2 className="size-5" />
            </div>
            <div>
              <p className="font-semibold">رابط الإنتاج</p>
              <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                {LIVE_DEMO_URL}
              </p>
            </div>
          </div>
          <Button asChild variant="ghost" size="sm" className="shrink-0 gap-1">
            <a href={LIVE_DEMO_URL} target="_blank" rel="noopener noreferrer">
              فتح
              <ArrowUpRight className="size-3.5" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
