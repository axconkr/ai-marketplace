import { NextRequest, NextResponse } from 'next/server';
import { getSettlementDetails } from '@/lib/services/settlement';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * GET /api/settlements/[id]/statement - Download settlement statement as PDF
 *
 * Note: This is a basic implementation that returns a text-based statement.
 * For production, you should use a PDF library like @react-pdf/renderer or puppeteer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settlement = await getSettlementDetails(params.id);

    if (!settlement) {
      return NextResponse.json({ error: 'Settlement not found' }, { status: 404 });
    }

    // Check authorization
    if (userRole !== 'admin' && settlement.seller_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Generate statement content (simplified version)
    const statementContent = generateStatementHTML(settlement);

    // Return as HTML for now (in production, convert to PDF)
    return new NextResponse(statementContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="settlement-${params.id}.html"`,
      },
    });
  } catch (error) {
    console.error('Error generating statement:', error);
    return NextResponse.json(
      { error: 'Failed to generate statement' },
      { status: 500 }
    );
  }
}

function generateStatementHTML(settlement: any): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: settlement.currency,
    }).format(amount);
  };

  // Group items by product
  const productSummary = settlement.items.reduce(
    (acc: any, item: any) => {
      const productId = item.product_id;
      if (!acc[productId]) {
        acc[productId] = {
          product: item.product,
          orderCount: 0,
          totalRevenue: 0,
          totalFee: 0,
          netAmount: 0,
        };
      }
      acc[productId].orderCount += 1;
      acc[productId].totalRevenue += item.amount;
      acc[productId].totalFee += item.platform_fee;
      acc[productId].netAmount += item.payout_amount;
      return acc;
    },
    {}
  );

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>정산 명세서 - ${format(new Date(settlement.period_start), 'yyyy년 M월', { locale: ko })}</title>
  <style>
    body {
      font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      color: #1f2937;
    }
    .header p {
      margin: 10px 0 0 0;
      color: #6b7280;
    }
    .info-section {
      margin-bottom: 30px;
    }
    .info-section h2 {
      font-size: 18px;
      margin-bottom: 15px;
      color: #1f2937;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 10px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .info-row.highlight {
      background-color: #f0f9ff;
      padding: 15px 10px;
      margin: 10px 0;
      border-radius: 5px;
      border: 1px solid #3b82f6;
    }
    .info-label {
      color: #6b7280;
      font-size: 14px;
    }
    .info-value {
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th {
      background-color: #f9fafb;
      padding: 12px;
      text-align: left;
      font-size: 13px;
      color: #6b7280;
      border-bottom: 2px solid #e5e7eb;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #f3f4f6;
      font-size: 14px;
    }
    .amount {
      text-align: right;
      font-weight: 500;
    }
    .total-row {
      font-weight: 700;
      background-color: #f9fafb;
    }
    .summary-box {
      background-color: #10b981;
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin: 30px 0;
      text-align: center;
    }
    .summary-box .label {
      font-size: 14px;
      opacity: 0.9;
    }
    .summary-box .amount {
      font-size: 32px;
      font-weight: bold;
      margin-top: 10px;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
      border-top: 1px solid #e5e7eb;
      padding-top: 20px;
    }
    @media print {
      body {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>정산 명세서</h1>
    <p>${format(new Date(settlement.period_start), 'yyyy년 M월', { locale: ko })} 정산</p>
    <p style="font-size: 14px; margin-top: 5px;">
      ${format(new Date(settlement.period_start), 'yyyy-MM-dd')} ~ ${format(new Date(settlement.period_end), 'yyyy-MM-dd')}
    </p>
  </div>

  <div class="info-section">
    <h2>판매자 정보</h2>
    <div class="info-row">
      <span class="info-label">이름</span>
      <span class="info-value">${settlement.seller.name || '-'}</span>
    </div>
    <div class="info-row">
      <span class="info-label">이메일</span>
      <span class="info-value">${settlement.seller.email}</span>
    </div>
    ${settlement.seller.bank_account ? `
    <div class="info-row">
      <span class="info-label">입금 계좌</span>
      <span class="info-value">${settlement.seller.bank_name} ${settlement.seller.bank_account}</span>
    </div>
    ` : ''}
  </div>

  <div class="info-section">
    <h2>정산 요약</h2>
    <div class="info-row">
      <span class="info-label">총 판매액</span>
      <span class="info-value amount">${formatCurrency(settlement.total_amount)}</span>
    </div>
    <div class="info-row">
      <span class="info-label">플랫폼 수수료 (15%)</span>
      <span class="info-value amount">-${formatCurrency(settlement.platform_fee)}</span>
    </div>
    ${settlement.verification_earnings > 0 ? `
    <div class="info-row">
      <span class="info-label">검증 수익 (${settlement.verification_count}건)</span>
      <span class="info-value amount">+${formatCurrency(settlement.verification_earnings)}</span>
    </div>
    ` : ''}
    <div class="info-row highlight">
      <span class="info-label" style="font-size: 16px; color: #1f2937;">정산금</span>
      <span class="info-value" style="font-size: 20px; color: #10b981;">${formatCurrency(settlement.payout_amount)}</span>
    </div>
  </div>

  <div class="info-section">
    <h2>상품별 판매 내역</h2>
    <table>
      <thead>
        <tr>
          <th>상품명</th>
          <th style="text-align: center;">판매 건수</th>
          <th style="text-align: right;">판매액</th>
          <th style="text-align: right;">수수료</th>
          <th style="text-align: right;">순수익</th>
        </tr>
      </thead>
      <tbody>
        ${Object.values(productSummary).map((item: any) => `
          <tr>
            <td>${item.product.name}</td>
            <td style="text-align: center;">${item.orderCount}건</td>
            <td class="amount">${formatCurrency(item.totalRevenue)}</td>
            <td class="amount">${formatCurrency(item.totalFee)}</td>
            <td class="amount">${formatCurrency(item.netAmount)}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="2">합계</td>
          <td class="amount">${formatCurrency(settlement.total_amount)}</td>
          <td class="amount">${formatCurrency(settlement.platform_fee)}</td>
          <td class="amount">${formatCurrency(settlement.payout_amount - settlement.verification_earnings)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="summary-box">
    <div class="label">최종 정산금</div>
    <div class="amount">${formatCurrency(settlement.payout_amount)}</div>
    ${settlement.payout_date ? `
      <div style="margin-top: 15px; font-size: 14px; opacity: 0.9;">
        지급일: ${format(new Date(settlement.payout_date), 'yyyy년 M월 d일', { locale: ko })}
      </div>
    ` : ''}
  </div>

  <div class="footer">
    <p>본 문서는 AI Marketplace에서 자동으로 생성된 정산 명세서입니다.</p>
    <p>문의사항이 있으시면 고객지원팀으로 연락 주시기 바랍니다.</p>
    <p style="margin-top: 10px;">발행일: ${format(new Date(), 'yyyy년 M월 d일', { locale: ko })}</p>
  </div>
</body>
</html>
  `;

  return html;
}
