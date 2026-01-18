import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';

const prisma = new PrismaClient();

export interface SettlementReportData {
  settlement: {
    id: string;
    period_start: Date;
    period_end: Date;
    total_amount: number;
    platform_fee: number;
    payout_amount: number;
    currency: string;
    status: string;
    payout_date: Date | null;
    payout_method: string | null;
    payout_reference: string | null;
  };
  seller: {
    id: string;
    email: string;
    name: string | null;
    bank_name: string | null;
    bank_account: string | null;
    account_holder: string | null;
  };
  items: Array<{
    product_id: string;
    product_name: string;
    amount: number;
    platform_fee: number;
    payout_amount: number;
  }>;
  summary: {
    totalOrders: number;
    totalSales: number;
    totalFees: number;
    netPayout: number;
    averageOrderValue: number;
  };
}

/**
 * Generate settlement report data
 */
export async function generateSettlementReport(
  settlementId: string
): Promise<SettlementReportData> {
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
    include: {
      seller: {
        select: {
          id: true,
          email: true,
          name: true,
          bank_name: true,
          bank_account: true,
          account_holder: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!settlement) {
    throw new Error('Settlement not found');
  }

  const items = settlement.items.map((item: any) => ({
    product_id: item.product_id,
    product_name: item.product.name,
    amount: item.amount,
    platform_fee: item.platform_fee,
    payout_amount: item.payout_amount,
  }));

  const summary = {
    totalOrders: settlement.items.length,
    totalSales: settlement.total_amount,
    totalFees: settlement.platform_fee,
    netPayout: settlement.payout_amount,
    averageOrderValue:
      settlement.items.length > 0
        ? settlement.total_amount / settlement.items.length
        : 0,
  };

  return {
    settlement: {
      id: settlement.id,
      period_start: settlement.period_start,
      period_end: settlement.period_end,
      total_amount: settlement.total_amount,
      platform_fee: settlement.platform_fee,
      payout_amount: settlement.payout_amount,
      currency: settlement.currency,
      status: settlement.status,
      payout_date: settlement.payout_date,
      payout_method: settlement.payout_method,
      payout_reference: settlement.payout_reference,
    },
    seller: settlement.seller,
    items,
    summary,
  };
}

/**
 * Generate HTML report
 */
export function generateHTMLReport(data: SettlementReportData): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.settlement.currency,
    }).format(amount / 100);
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMMM dd, yyyy');
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Settlement Report - ${data.settlement.id}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 20px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      color: #1e40af;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    .info-box {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 8px;
    }
    .info-box h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #6b7280;
      text-transform: uppercase;
    }
    .info-box p {
      margin: 5px 0;
      font-size: 14px;
    }
    .summary {
      background: #dbeafe;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .summary h2 {
      margin: 0 0 15px 0;
      color: #1e40af;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      background: white;
      border-radius: 4px;
    }
    .summary-item.total {
      grid-column: 1 / -1;
      background: #3b82f6;
      color: white;
      font-weight: bold;
      font-size: 18px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    thead {
      background: #f3f4f6;
    }
    th {
      padding: 12px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      color: #6b7280;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .text-right {
      text-align: right;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Settlement Report</h1>
    <p>Settlement ID: ${data.settlement.id}</p>
    <p>Generated: ${formatDate(new Date())}</p>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <h3>Settlement Period</h3>
      <p><strong>From:</strong> ${formatDate(data.settlement.period_start)}</p>
      <p><strong>To:</strong> ${formatDate(data.settlement.period_end)}</p>
      <p><strong>Status:</strong> ${data.settlement.status}</p>
    </div>

    <div class="info-box">
      <h3>Seller Information</h3>
      <p><strong>Name:</strong> ${data.seller.name || 'N/A'}</p>
      <p><strong>Email:</strong> ${data.seller.email}</p>
      ${
        data.seller.bank_name
          ? `<p><strong>Bank:</strong> ${data.seller.bank_name}</p>
             <p><strong>Account:</strong> ${data.seller.bank_account}</p>`
          : ''
      }
    </div>
  </div>

  <div class="summary">
    <h2>Settlement Summary</h2>
    <div class="summary-grid">
      <div class="summary-item">
        <span>Total Sales</span>
        <span>${formatCurrency(data.summary.totalSales)}</span>
      </div>
      <div class="summary-item">
        <span>Total Orders</span>
        <span>${data.summary.totalOrders}</span>
      </div>
      <div class="summary-item">
        <span>Platform Fee</span>
        <span>-${formatCurrency(data.summary.totalFees)}</span>
      </div>
      <div class="summary-item">
        <span>Avg. Order Value</span>
        <span>${formatCurrency(data.summary.averageOrderValue)}</span>
      </div>
      <div class="summary-item total">
        <span>Net Payout</span>
        <span>${formatCurrency(data.summary.netPayout)}</span>
      </div>
    </div>
  </div>

  <h2>Order Details</h2>
  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th class="text-right">Sale Amount</th>
        <th class="text-right">Platform Fee</th>
        <th class="text-right">Payout</th>
      </tr>
    </thead>
    <tbody>
      ${data.items
        .map(
          (item) => `
        <tr>
          <td>${item.product_name}</td>
          <td class="text-right">${formatCurrency(item.amount)}</td>
          <td class="text-right">-${formatCurrency(item.platform_fee)}</td>
          <td class="text-right">${formatCurrency(item.payout_amount)}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  ${
    data.settlement.payout_date
      ? `
    <div class="info-box">
      <h3>Payment Information</h3>
      <p><strong>Payout Date:</strong> ${formatDate(data.settlement.payout_date)}</p>
      <p><strong>Payment Method:</strong> ${data.settlement.payout_method}</p>
      ${data.settlement.payout_reference ? `<p><strong>Reference:</strong> ${data.settlement.payout_reference}</p>` : ''}
    </div>
  `
      : ''
  }

  <div class="footer">
    <p>This is an automated settlement report generated by AI Marketplace.</p>
    <p>For questions or concerns, please contact support.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Generate CSV export
 */
export function generateCSV(data: SettlementReportData): string {
  const rows = [
    ['Settlement Report'],
    ['Settlement ID', data.settlement.id],
    ['Period', `${format(data.settlement.period_start, 'yyyy-MM-dd')} to ${format(data.settlement.period_end, 'yyyy-MM-dd')}`],
    ['Status', data.settlement.status],
    [''],
    ['Seller', data.seller.name || data.seller.email],
    [''],
    ['Summary'],
    ['Total Sales', (data.summary.totalSales / 100).toString()],
    ['Platform Fee', (data.summary.totalFees / 100).toString()],
    ['Net Payout', (data.summary.netPayout / 100).toString()],
    ['Total Orders', data.summary.totalOrders.toString()],
    [''],
    ['Order Details'],
    ['Product', 'Sale Amount', 'Platform Fee', 'Payout'],
    ...data.items.map((item) => [
      item.product_name,
      (item.amount / 100).toString(),
      (item.platform_fee / 100).toString(),
      (item.payout_amount / 100).toString(),
    ]),
  ];

  return rows.map((row) => row.join(',')).join('\n');
}
