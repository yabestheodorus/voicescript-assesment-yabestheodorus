import Link from 'next/link';
import { PageHeader } from '@repo/components/ui/page-header';
import { StatCard } from '@repo/components/ui/stat-card';
import { StatusBadge } from '@repo/components/ui/status-badge';
import { Avatar } from '@repo/components/ui/avatar';
import { Card, CardBody } from '@repo/components/ui/card';
import { buttonClasses } from '@repo/components/ui/button';
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
  FiSearch,
  FiArrowUpRight,
} from '@repo/components/icons';
import type { PaymentListItem } from '@repo/schema';
import { getPayments } from '../../lib/api';

// Always render fresh data from the database on each request.
export const dynamic = 'force-dynamic';

const FILTERS = ['All', 'Pending', 'Paid'];

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString('en-US')}`;
}

/**
 * A payment row only exists once a job is reviewed. Its settlement state is
 * derived from the job: REVIEWED is still awaiting payout, COMPLETED is paid.
 */
function paymentStatus(payment: PaymentListItem): 'Paid' | 'Pending' {
  return payment.job.status === 'COMPLETED' ? 'Paid' : 'Pending';
}

function PaymentRow({ payment }: { payment: PaymentListItem }) {
  const status = paymentStatus(payment);
  return (
    <TR>
      <TD>
        <Link
          href={`/jobs/${payment.job.id}`}
          className="font-medium text-surface-800 hover:text-brand-600"
        >
          {payment.job.caseName}
        </Link>
        <div className="text-xs text-surface-400">{payment.job.caseNumber}</div>
      </TD>
      <TD className="whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Avatar name={payment.reporter.name} size="sm" />
          <span className="text-sm">{payment.reporter.name}</span>
        </div>
      </TD>
      <TD className="text-sm text-surface-600">{payment.editor.name}</TD>
      <TD className="text-right text-sm tabular-nums text-surface-600">
        {formatRupiah(payment.transcribePaymentAmount)}
      </TD>
      <TD className="text-right text-sm tabular-nums text-surface-600">
        {formatRupiah(payment.reviewPaymentAmount)}
      </TD>
      <TD className="text-right text-sm font-semibold tabular-nums text-surface-800">
        {formatRupiah(payment.totalPayout)}
      </TD>
      <TD>
        <StatusBadge status={status} />
      </TD>
      <TD className="text-right">
        <Link
          href={`/jobs/${payment.job.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          View <FiArrowUpRight className="size-3.5" />
        </Link>
      </TD>
    </TR>
  );
}

export default async function PaymentsPage() {
  const result = await getPayments();
  const payments = result.ok ? result.data : [];

  const pending = payments.filter((p) => paymentStatus(p) === 'Pending');
  const paid = payments.filter((p) => paymentStatus(p) === 'Paid');

  const sum = (list: PaymentListItem[]) =>
    list.reduce((total, p) => total + p.totalPayout, 0);

  const stats = [
    {
      label: 'Total Payout',
      value: formatRupiah(sum(payments)),
      icon: FiDollarSign,
      hint: `${payments.length} payment${payments.length === 1 ? '' : 's'}`,
    },
    {
      label: 'Outstanding',
      value: formatRupiah(sum(pending)),
      icon: FiClock,
      hint: `${pending.length} awaiting payout`,
    },
    {
      label: 'Paid Out',
      value: formatRupiah(sum(paid)),
      icon: FiCheckCircle,
      hint: `${paid.length} settled`,
    },
    {
      label: 'Pending',
      value: String(pending.length),
      icon: FiAlertCircle,
      hint: 'reporters awaiting payment',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Monitor reporter payouts and execute payments."
        actions={
          <button className={buttonClasses('primary')}>
            <FiDollarSign className="size-4" />
            Pay all pending
          </button>
        }
      />

      {result.ok ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      ) : null}

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
            placeholder="Search by reporter or matter…"
            className="h-9 w-full rounded-lg border border-surface-200 bg-surface-0 pl-9 pr-3 text-sm text-surface-700 placeholder:text-surface-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      {!result.ok ? (
        <Card>
          <CardBody className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-danger-50 text-danger-600">
              <FiAlertCircle className="size-5" />
            </span>
            <div>
              <p className="font-medium text-surface-800">
                Couldn&apos;t load payments
              </p>
              <p className="mt-0.5 text-sm text-surface-500">{result.error}</p>
            </div>
          </CardBody>
        </Card>
      ) : payments.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-surface-100 text-surface-400">
              <FiDollarSign className="size-6" />
            </span>
            <div>
              <p className="font-medium text-surface-800">No payments yet</p>
              <p className="mt-0.5 text-sm text-surface-500">
                Payouts appear here once a job&apos;s review is completed.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <DataTable>
          <THead>
            <TR>
              <TH>Matter</TH>
              <TH>Reporter</TH>
              <TH>Editor</TH>
              <TH className="text-right">Transcribe</TH>
              <TH className="text-right">Review</TH>
              <TH className="text-right">Total</TH>
              <TH>Status</TH>
              <TH className="text-right">Action</TH>
            </TR>
          </THead>
          <TBody>
            {payments.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
          </TBody>
        </DataTable>
      )}
    </div>
  );
}
