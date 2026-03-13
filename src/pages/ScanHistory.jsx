import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { History, Wifi, Camera, Magnet, AlertTriangle, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

const scanIcons = {
  wifi: Wifi,
  lens: Camera,
  magnetic: Magnet,
  full: AlertTriangle,
};

export default function ScanHistory() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['my-sessions', user?.id],
    queryFn: () => base44.entities.ScanSession.filter({ user_id: user.id }, '-created_date'),
    enabled: !!user?.id,
  });

  if (userLoading || sessionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#00D4AA] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-5 py-6 text-center space-y-4">
        <History className="w-12 h-12 text-[#5A6A80] mx-auto" />
        <h1 className="text-xl font-bold">Sign In Required</h1>
        <p className="text-sm text-[#8B9BB4]">
          Log in to view your scan history and saved findings
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

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Scan History</h1>
        <p className="text-sm text-[#8B9BB4] mt-1">Review your previous scans</p>
      </div>

      {/* Sessions List */}
      {!sessions || sessions.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <History className="w-16 h-16 text-[#5A6A80] mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">No scans yet</h3>
            <p className="text-sm text-[#8B9BB4] mt-1">
              Start your first scan to build your history
            </p>
          </div>
          <Link to={createPageUrl('Home')}>
            <button className="px-6 py-3 rounded-2xl bg-[#00D4AA] text-[#0F1419] font-bold text-sm">
              Start Scan
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const Icon = scanIcons[session.scan_type] || AlertTriangle;
            return (
              <Card key={session.id} className="bg-[#1A2332] border-[#2A3A50]">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#243044] flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-[#00D4AA]" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-base capitalize">
                            {session.scan_type} Scan
                          </p>
                          <p className="text-xs text-[#5A6A80] mt-1">
                            {session.location_name || 'Unnamed location'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-semibold shrink-0 ${
                          session.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                          session.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-gray-500/10 text-gray-400'
                        }`}>
                          {session.status}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-4 text-xs">
                        <span className="text-[#8B9BB4]">
                          {session.devices_found || 0} devices
                        </span>
                        {session.suspicious_count > 0 && (
                          <span className="text-amber-400 font-medium">
                            ⚠️ {session.suspicious_count} suspicious
                          </span>
                        )}
                        <span className="text-[#5A6A80] ml-auto">
                          {format(new Date(session.created_date), 'MMM d, yyyy')}
                        </span>
                      </div>

                      {session.notes && (
                        <p className="text-xs text-[#8B9BB4] mt-2 line-clamp-2">
                          {session.notes}
                        </p>
                      )}
                    </div>

                    <ChevronRight className="w-5 h-5 text-[#5A6A80] shrink-0 mt-3" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}