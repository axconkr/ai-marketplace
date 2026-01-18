import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { Verification } from '@/lib/types/verification';
import { VerificationBadgeList } from './VerificationBadge';

interface VerificationReportProps {
  verification: Verification;
}

export function VerificationReport({ verification }: VerificationReportProps) {
  const report = verification.report;

  if (!report) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-gray-500">
            Verification report not available yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Score</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold">
                {verification.score !== null
                  ? Math.round(verification.score)
                  : 0}
                %
              </span>
              <RecommendationBadge recommendation={report.recommendation} />
            </div>
            <Progress
              value={verification.score || 0}
              className="h-3"
            />
          </div>
          {verification.badges && verification.badges.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Earned Badges</h4>
              <VerificationBadgeList badges={verification.badges} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Automated Checks (Level 0) */}
      {report.checks && (
        <Card>
          <CardHeader>
            <CardTitle>Automated Checks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <CheckItem
              name="File Format"
              result={report.checks.fileFormat}
            />
            <CheckItem
              name="Virus Scan"
              result={report.checks.virusScan}
            />
            <CheckItem
              name="Metadata Validation"
              result={report.checks.metadata}
            />
          </CardContent>
        </Card>
      )}

      {/* Code Quality (Level 1+) */}
      {report.automated?.codeQuality && (
        <Card>
          <CardHeader>
            <CardTitle>Code Quality Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Score</span>
                <span className="font-bold">
                  {report.automated.codeQuality.score}%
                </span>
              </div>
              <Progress value={report.automated.codeQuality.score} />
            </div>
            {report.automated.codeQuality.issues.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Issues Found</h4>
                <ul className="space-y-1">
                  {report.automated.codeQuality.issues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {report.automated.codeQuality.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Suggestions</h4>
                <ul className="space-y-1">
                  {report.automated.codeQuality.suggestions.map(
                    (suggestion, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-500">→</span>
                        <span>{suggestion}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Documentation (Level 1+) */}
      {report.automated?.documentation && (
        <Card>
          <CardHeader>
            <CardTitle>Documentation Quality</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Score</span>
                <span className="font-bold">
                  {report.automated.documentation.score}%
                </span>
              </div>
              <Progress value={report.automated.documentation.score} />
            </div>
            <div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Coverage</span>
                <span className="text-sm font-medium">
                  {report.automated.documentation.coverage}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security (Level 2+) */}
      {report.automated?.security && (
        <Card>
          <CardHeader>
            <CardTitle>Security Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Score</span>
                <span className="font-bold">
                  {report.automated.security.score}%
                </span>
              </div>
              <Progress value={report.automated.security.score} />
            </div>
            {report.automated.security.vulnerabilities.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-red-600">
                  Vulnerabilities Found
                </h4>
                <ul className="space-y-1">
                  {report.automated.security.vulnerabilities.map((vuln, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                      <span>{vuln}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Performance (Level 2+) */}
      {report.automated?.performance && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Score</span>
                <span className="font-bold">
                  {report.automated.performance.score}%
                </span>
              </div>
              <Progress value={report.automated.performance.score} />
            </div>
            {report.automated.performance.metrics && (
              <div>
                <h4 className="font-medium mb-2">Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(report.automated.performance.metrics).map(
                    ([key, value]) => (
                      <div key={key} className="text-sm">
                        <div className="text-gray-600">{key}</div>
                        <div className="font-medium">{String(value)}</div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Manual Review (Level 1+) */}
      {report.manual && (
        <Card>
          <CardHeader>
            <CardTitle>Verifier Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Manual Score</span>
                <span className="font-bold">{report.manual.score}%</span>
              </div>
              <Progress value={report.manual.score} />
            </div>
            <div>
              <h4 className="font-medium mb-2">Comments</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {report.manual.comments}
              </p>
            </div>
            {report.manual.strengths && report.manual.strengths.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-green-600">Strengths</h4>
                <ul className="space-y-1">
                  {report.manual.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {report.manual.weaknesses && report.manual.weaknesses.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-red-600">Weaknesses</h4>
                <ul className="space-y-1">
                  {report.manual.weaknesses.map((weakness, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {report.manual.improvements.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Suggested Improvements</h4>
                <ul className="space-y-1">
                  {report.manual.improvements.map((improvement, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-500">→</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CheckItem({
  name,
  result,
}: {
  name: string;
  result: { passed: boolean; message: string };
}) {
  return (
    <div className="flex items-start gap-3">
      {result.passed ? (
        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
      )}
      <div className="flex-1">
        <div className="font-medium">{name}</div>
        <div className="text-sm text-gray-600">{result.message}</div>
      </div>
    </div>
  );
}

function RecommendationBadge({
  recommendation,
}: {
  recommendation: 'APPROVE' | 'REJECT' | 'NEEDS_IMPROVEMENT';
}) {
  const config = {
    APPROVE: { text: 'Approved', color: 'bg-green-100 text-green-800' },
    REJECT: { text: 'Rejected', color: 'bg-red-100 text-red-800' },
    NEEDS_IMPROVEMENT: {
      text: 'Needs Improvement',
      color: 'bg-yellow-100 text-yellow-800',
    },
  };

  const { text, color } = config[recommendation];

  return <Badge className={color}>{text}</Badge>;
}
