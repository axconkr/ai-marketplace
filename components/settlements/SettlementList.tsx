'use client';

import { Settlement } from '@prisma/client';
import { SettlementCard } from './SettlementCard';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface SettlementWithItems extends Settlement {
  items: any[];
}

interface SettlementListProps {
  settlements: SettlementWithItems[];
  loading?: boolean;
  onViewDetails: (settlementId: string) => void;
  onDownloadStatement?: (settlementId: string) => void;
}

export function SettlementList({
  settlements,
  loading,
  onViewDetails,
  onDownloadStatement,
}: SettlementListProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                </div>
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (settlements.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">정산 내역이 없습니다</h3>
            <p className="text-gray-500 text-sm">
              첫 판매가 발생하면 정산 내역이 표시됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {settlements.map((settlement) => (
        <SettlementCard
          key={settlement.id}
          settlement={settlement}
          onViewDetails={onViewDetails}
          onDownloadStatement={onDownloadStatement}
        />
      ))}
    </div>
  );
}
