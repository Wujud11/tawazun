import { motion } from 'framer-motion'

import {
  CompaniesSummary,
  CompanyDebtChart,
  DebtSummary,
  KpiCards,
  NettingTrendChart,
  RecentActivity,
  SettlementOpportunities,
  TransfersComparison,
} from '@/components/dashboard'
import { defaultTransition } from '@/lib/motion'

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

export function DashboardPage() {
  return (
    <div className="space-y-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={defaultTransition}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">
              Treasury Operations
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              لوحة التحكم
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              نظرة شاملة على شبكة الديون والمقاصة الذكية — يونيو 2026
            </p>
          </div>
          <div className="hidden rounded-lg border bg-muted/40 px-4 py-2 text-xs text-muted-foreground sm:block">
            آخر تحديث: 29 يونيو 2026
          </div>
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ ...defaultTransition, delay: 0.05 }}
      >
        <KpiCards />
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ ...defaultTransition, delay: 0.08 }}
      >
        <SettlementOpportunities />
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-3">
        <motion.div
          className="xl:col-span-2"
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ ...defaultTransition, delay: 0.1 }}
        >
          <NettingTrendChart />
        </motion.div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ ...defaultTransition, delay: 0.15 }}
        >
          <TransfersComparison />
        </motion.div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <motion.div
          className="xl:col-span-2"
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ ...defaultTransition, delay: 0.2 }}
        >
          <CompanyDebtChart />
        </motion.div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ ...defaultTransition, delay: 0.25 }}
        >
          <RecentActivity />
        </motion.div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ ...defaultTransition, delay: 0.3 }}
      >
        <DebtSummary />
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ ...defaultTransition, delay: 0.35 }}
      >
        <CompaniesSummary />
      </motion.div>
    </div>
  )
}
