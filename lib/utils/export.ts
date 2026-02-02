export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  const headers = Object.keys(data[0]);

  const escapeCsvValue = (value: any): string => {
    if (value === null || value === undefined) return '';

    const stringValue = String(value);

    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  };

  const csv = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => escapeCsvValue(row[header])).join(',')
    )
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatOrdersForExport(orders: any[]) {
  return orders.map(order => ({
    'Order ID': order.id,
    'Date': new Date(order.createdAt).toLocaleDateString(),
    'Product': order.product.name,
    'Buyer': order.buyer.email,
    'Amount': order.amount,
    'Platform Fee': order.platform_fee,
    'Your Earnings': order.seller_amount,
    'Status': order.status,
    'Payment Method': order.payment_provider || 'N/A'
  }));
}

export function formatBuyerOrdersForExport(orders: any[]) {
  return orders.map(order => ({
    'Order ID': order.id,
    'Date': new Date(order.createdAt).toLocaleDateString(),
    'Product': order.product?.name || 'Unknown',
    'Amount': order.amount,
    'Currency': order.currency,
    'Status': order.status,
    'Payment Method': order.payment_provider || 'N/A',
    'Paid At': order.paid_at ? new Date(order.paid_at).toLocaleDateString() : 'N/A'
  }));
}

export function formatProductsForExport(products: any[]) {
  return products.map(product => ({
    'Product ID': product.id,
    'Title': product.title,
    'Category': product.category || 'N/A',
    'Price': product.price,
    'Status': product.status,
    'Verification Level': product.verification_level,
    'Orders': product.orders,
    'Revenue': product.revenue,
    'Conversion Rate': `${product.conversionRate.toFixed(2)}%`,
    'Created': new Date(product.createdAt).toLocaleDateString()
  }));
}

export function formatSettlementsForExport(settlements: any[]) {
  return settlements.map(settlement => ({
    'Settlement ID': settlement.id,
    'Period Start': new Date(settlement.period_start).toLocaleDateString(),
    'Period End': new Date(settlement.period_end).toLocaleDateString(),
    'Total Sales': settlement.total_amount,
    'Platform Fee': settlement.platform_fee,
    'Payout Amount': settlement.payout_amount,
    'Status': settlement.status,
    'Payout Date': settlement.payout_date ? new Date(settlement.payout_date).toLocaleDateString() : 'Pending'
  }));
}
