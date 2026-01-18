'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface CurrentEarnings {
  currentMonth: {
    totalEarnings: number;
    verificationCount: number;
    averagePerVerification: number;
    periodStart: string;
    periodEnd: string;
  };
  pending: {
    totalAmount: number;
    count: number;
  };
}

interface EarningsBreakdown {
  level: number;
  count: number;
  earnings: number;
}

interface Settlement {
  id: string;
  periodStart: string;
  periodEnd: string;
  totalEarnings: number;
  verificationCount: number;
  status: string;
  payoutDate: string | null;
  currency: string;
}

export default function VerifierEarningsDashboard() {
  const [currentEarnings, setCurrentEarnings] = useState<CurrentEarnings | null>(null);
  const [breakdown, setBreakdown] = useState<EarningsBreakdown[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  // TODO: Get actual verifier ID from auth
  const verifierId = 'demo-verifier-id';

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch current month earnings
        const currentRes = await fetch(
          `/api/verifier/earnings/current?verifierId=${verifierId}`
        );
        const currentData = await currentRes.json();
        setCurrentEarnings(currentData);

        // Fetch breakdown
        const breakdownRes = await fetch(
          `/api/verifier/earnings/breakdown?verifierId=${verifierId}&period=current`
        );
        const breakdownData = await breakdownRes.json();
        setBreakdown(breakdownData.breakdown);

        // Fetch settlements
        const settlementsRes = await fetch(
          `/api/verifier/settlements?verifierId=${verifierId}`
        );
        const settlementsData = await settlementsRes.json();
        setSettlements(settlementsData.settlements);
      } catch (error) {
        console.error('Failed to fetch earnings data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [verifierId]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Verifier Earnings</h1>
        <p className="text-muted-foreground">
          Track your verification earnings and settlement history
        </p>
      </div>

      {/* Current Month Summary */}
      {currentEarnings && (
        <Card>
          <CardHeader>
            <CardTitle>Current Month Earnings</CardTitle>
            <p className="text-sm text-muted-foreground">
              {new Date(currentEarnings.currentMonth.periodStart).toLocaleDateString()} -{' '}
              {new Date(currentEarnings.currentMonth.periodEnd).toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                label="Verifications"
                value={currentEarnings.currentMonth.verificationCount.toString()}
              />
              <StatCard
                label="Total Earnings"
                value={formatCurrency(currentEarnings.currentMonth.totalEarnings)}
                highlight
              />
              <StatCard
                label="Avg per Verification"
                value={formatCurrency(currentEarnings.currentMonth.averagePerVerification)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Payouts */}
      {currentEarnings && currentEarnings.pending.count > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                label="Pending Verifications"
                value={currentEarnings.pending.count.toString()}
              />
              <StatCard
                label="Pending Amount"
                value={formatCurrency(currentEarnings.pending.totalAmount)}
                highlight
              />
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              These earnings will be included in your next monthly settlement
            </p>
          </CardContent>
        </Card>
      )}

      {/* Verification Breakdown by Level */}
      {breakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Earnings by Level (Current Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead className="text-right">Verifications</TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                  <TableHead className="text-right">Avg per Verification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {breakdown.map((item) => (
                  <TableRow key={item.level}>
                    <TableCell>
                      <Badge variant="outline">Level {item.level}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.earnings)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(Math.round(item.earnings / item.count))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Settlement History */}
      <Card>
        <CardHeader>
          <CardTitle>Settlement History</CardTitle>
          <p className="text-sm text-muted-foreground">
            Monthly settlements are processed on the 1st of each month
          </p>
        </CardHeader>
        <CardContent>
          {settlements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Verifications</TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payout Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlements.map((settlement) => (
                  <TableRow key={settlement.id}>
                    <TableCell>
                      {new Date(settlement.periodStart).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {settlement.verificationCount}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(settlement.totalEarnings)}
                    </TableCell>
                    <TableCell>
                      <SettlementStatusBadge status={settlement.status} />
                    </TableCell>
                    <TableCell>
                      {settlement.payoutDate
                        ? new Date(settlement.payoutDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No settlements yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Payment Method Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure how you receive your verification earnings
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Bank Transfer</h3>
                <p className="text-sm text-muted-foreground">
                  Direct deposit to your bank account
                </p>
              </div>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                Setup
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Stripe Connect</h3>
                <p className="text-sm text-muted-foreground">
                  Fast payouts via Stripe
                </p>
              </div>
              <button className="px-4 py-2 border rounded-md hover:bg-accent">
                Connect
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Components

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-primary' : ''}`}>
        {value}
      </p>
    </div>
  );
}

function SettlementStatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    PENDING: 'secondary',
    PROCESSING: 'default',
    PAID: 'outline',
    FAILED: 'destructive',
  };

  return (
    <Badge variant={variants[status] || 'secondary'}>
      {status}
    </Badge>
  );
}
