import { PageHeader } from '@repo/components/ui/page-header';
import { StatCard } from '@repo/components/ui/stat-card';
import { StatusBadge } from '@repo/components/ui/status-badge';
import { Avatar } from '@repo/components/ui/avatar';
import { Button, buttonClasses } from '@repo/components/ui/button';
import {
  DataTable,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from '@repo/components/ui/data-table';
import {
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiFilter,
  FiSearch,
} from '@repo/components/icons';

const STATS = [
  {
    label: 'Total Outstanding',
    value: '$11,240',
    icon: FiDollarSign,
    hint: 'across 3 reporters',
  },
  {
    label: 'Pending Payout',
    value: '$6,180',
    icon: FiClock,
    hint: '2 awaiting approval',
  },
  {
    label: 'Paid This Month',
    value: '$48,920',
    icon: FiCheckCircle,
    delta: '11%',
    trend: 'up' as const,
    hint: '128 invoices',
  },
  {
    label: 'Overdue',
    value: '$2,400',
    icon: FiAlertCircle,
    hint: '1 invoice · 6 days',
  },
];

const PAYMENTS = [
  {
    id: 'PAY-5521',
    reporter: 'Maria Solis',
    job: 'JOB-2037 · Whitaker v. Meridian',
    method: 'ACH',
    due: 'Jun 14, 2026',
    amount: '$1,752.00',
    status: 'Pending',
    payable: true,
  },
  {
    id: 'PAY-5520',
    reporter: 'James Okafor',
    job: 'JOB-2036 · Coastal Freight',
    method: 'ACH',
    due: 'Jun 15, 2026',
    amount: '$980.00',
    status: 'Pending',
    payable: true,
  },
  {
    id: 'PAY-5519',
    reporter: 'Daniel Cho',
    job: 'JOB-2038 · Bayfront Holdings',
    method: 'PayPal',
    due: 'Jun 10, 2026',
    amount: '$2,400.00',
    status: 'Overdue',
    payable: true,
  },
  {
    id: 'PAY-5518',
    reporter: 'Priya Nair',
    job: 'JOB-2039 · Redmond Estate',
    method: 'ACH',
    due: 'Jun 18, 2026',
    amount: '$3,448.00',
    status: 'Processing',
    payable: false,
  },
  {
    id: 'PAY-5517',
    reporter: 'Maria Solis',
    job: 'JOB-2029 · Calloway v. Pinnacle',
    method: 'ACH',
    due: 'Jun 6, 2026',
    amount: '$1,260.00',
    status: 'Paid',
    payable: false,
  },
  {
    id: 'PAY-5516',
    reporter: 'Aisha Rahman',
    job: 'JOB-2018 · Garrison Patent',
    method: 'Wire',
    due: 'Jun 4, 2026',
    amount: '$4,120.00',
    status: 'Paid',
    payable: false,
  },
  {
    id: 'PAY-5515',
    reporter: 'Thomas Becker',
    job: 'JOB-2012 · Delgado Realty',
    method: 'ACH',
    due: 'Jul 1, 2026',
    amount: '$640.00',
    status: 'Draft',
    payable: false,
  },
];

const FILTERS = ['All', 'Pending', 'Processing', 'Overdue', 'Paid'];

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Monitor reporter payouts and execute payments."
        actions={
          <>
            <button className={buttonClasses('secondary')}>
              <FiFilter className="size-4" />
              Export
            </button>
            <button className={buttonClasses('primary')}>
              <FiDollarSign className="size-4" />
              Pay all pending
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f, i) => (
            <button
              key={f}
              className={
                i === 0
                  ? 'rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white'
                  : 'rounded-lg px-3 py-1.5 text-sm font-medium text-surface-500 hover:bg-surface-100 hover:text-surface-800'
              }
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative sm:w-72">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-surface-400" />
          <input
            type="search"
            placeholder="Search by reporter or invoice…"
            className="h-9 w-full rounded-lg border border-surface-200 bg-surface-0 pl-9 pr-3 text-sm text-surface-700 placeholder:text-surface-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <DataTable>
        <THead>
          <TR>
            <TH>Invoice</TH>
            <TH>Reporter</TH>
            <TH>Method</TH>
            <TH>Due</TH>
            <TH className="text-right">Amount</TH>
            <TH>Status</TH>
            <TH className="text-right">Action</TH>
          </TR>
        </THead>
        <TBody>
          {PAYMENTS.map((p) => (
            <TR key={p.id}>
              <TD>
                <span className="font-medium text-surface-800">{p.id}</span>
                <div className="text-xs text-surface-400">{p.job}</div>
              </TD>
              <TD className="whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Avatar name={p.reporter} size="sm" />
                  <span className="text-sm">{p.reporter}</span>
                </div>
              </TD>
              <TD className="text-sm text-surface-600">{p.method}</TD>
              <TD className="whitespace-nowrap text-sm text-surface-500">
                {p.due}
              </TD>
              <TD className="text-right text-sm font-semibold tabular-nums text-surface-800">
                {p.amount}
              </TD>
              <TD>
                <StatusBadge status={p.status} />
              </TD>
              <TD className="text-right">
                {p.payable ? (
                  <Button
                    variant={p.status === 'Overdue' ? 'danger' : 'primary'}
                    size="sm"
                  >
                    <FiDollarSign className="size-3.5" />
                    Pay
                  </Button>
                ) : (
                  <span className="text-xs text-surface-400">—</span>
                )}
              </TD>
            </TR>
          ))}
        </TBody>
      </DataTable>
    </div>
  );
}
