import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { AlertTriangle, Bookmark, ChevronRight, Loader2, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

export default function FindingsList() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: findings, isLoading: findingsLoading } = useQuery({
    queryKey: ['my-findings', user?.id],
    queryFn: () => base44.entities.SuspiciousFinding.filter({ user_id: user.id }, '-created_date'),
    enabled: !!user?.id,
  });

  if (userLoading || findingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#00D4AA] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-5 py-6 text-center space-y-4">
        <Shield className="w-12 h-12 text-[#5A6A80] mx-auto" />
        <h1 className="text-xl font-bold">Sign In Required</h1>
        <p className="text-sm text-[#8B9BB4]">
          Log in to view your suspicious findings
        </p>
        <button
          onClick={() => base44.auth.redirectToLogin()}
          className="px-6 py-3 rounded-2xl bg-[#00D4AA] text-[#0F1419] font-bold text-sm"
        >
          Sign In
        </button>
      </div>
    );
  }

  const bookmarkedFindings = findings?.filter(f => f.is_bookmarked) || [];
  const recentFindings = findings?.filter(f => !f.is_bookmarked) || [];

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Suspicious Findings</h1>
        <p className="text-sm text-[#8B9BB4] mt-1">Review and manage your findings</p>
      </div>

      {/* Empty State */}
      {!findings || findings.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <Shield className="w-16 h-16 text-[#5A6A80] mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">No findings recorded</h3>
            <p className="text-sm text-[#8B9BB4] mt-1">
              Suspicious devices found during scans will appear here
            </p>
          </div>
          <Link to={createPageUrl('Home')}>
            <button className="px-6 py-3 rounded-2xl bg-[#00D4AA] text-[#0F1419] font-bold text-sm">
              Start Scan
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Bookmarked */}
          {bookmarkedFindings.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-[#00D4AA] flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                Bookmarked
              </h2>
              {bookmarkedFindings.map(finding => (
                <FindingCard key={finding.id} finding={finding} />
              ))}
            </div>
          )}

          {/* Recent */}
          {recentFindings.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-[#8B9BB4]">All Findings</h2>
              {recentFindings.map(finding => (
                <FindingCard key={finding.id} finding={finding} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FindingCard({ finding }) {
  return (
    <Card className="bg-[#1A2332] border-[#2A3A50]">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            finding.severity === 'high' ? 'bg-red-500/10' :
            finding.severity === 'medium' ? 'bg-amber-500/10' :
            'bg-blue-500/10'
          }`}>
            <AlertTriangle className={`w-6 h-6 ${
              finding.severity === 'high' ? 'text-red-400' :
              finding.severity === 'medium' ? 'text-amber-400' :
              'text-blue-400'
            }`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-base">{finding.title}</p>
                <p className="text-xs text-[#5A6A80] mt-1 capitalize">
                  {finding.finding_type.replace('_', ' ')}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-semibold shrink-0 ${
                finding.severity === 'high' ? 'bg-red-500/10 text-red-400' :
                finding.severity === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                'bg-blue-500/10 text-blue-400'
              }`}>
                {finding.severity}
              </span>
            </div>

            {finding.description && (
              <p className="text-xs text-[#8B9BB4] mt-2 line-clamp-2">
                {finding.description}
              </p>
            )}

            <div className="mt-3 flex items-center gap-4 text-xs">
              {finding.device_name && (
                <span className="text-[#8B9BB4]">{finding.device_name}</span>
              )}
              {finding.ip_address && (
                <span className="text-[#5A6A80] font-mono">{finding.ip_address}</span>
              )}
              <span className="text-[#5A6A80] ml-auto">
                {format(new Date(finding.created_date), 'MMM d')}
              </span>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-[#5A6A80] shrink-0 mt-3" />
        </div>
      </CardContent>
    </Card>
  );
}