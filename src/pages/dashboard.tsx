import { motion } from 'framer-motion'

import {
  CompaniesSummary,
  CompanyDebtChart,
  DebtSummary,
  KpiCards,
  NettingTrendChart,
  RecentActivity,
  TransfersComparison,
} from '@/components/dashboard'
import { defaultTransition } from '@/lib/motion'

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={defaultTransition}
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">لوحة التحكم</h1>
          <p className="text-sm text-muted-foreground">
            نظرة شاملة على شبكة الديون والمقاصة الذكية — يونيو ٢٠٢٦
          </p>
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
