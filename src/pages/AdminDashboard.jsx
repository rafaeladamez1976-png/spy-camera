import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, Users, FileText, Database, Eye, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: sessions } = useQuery({
    queryKey: ['admin-sessions'],
    queryFn: () => base44.asServiceRole.entities.ScanSession.list('-created_date', 50),
    enabled: user?.role === 'admin',
  });

  const { data: findings } = useQuery({
    queryKey: ['admin-findings'],
    queryFn: () => base44.asServiceRole.entities.SuspiciousFinding.list('-created_date', 50),
    enabled: user?.role === 'admin',
  });

  const { data: articles } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: () => base44.asServiceRole.entities.GuideArticle.list('-created_date', 50),
    enabled: user?.role === 'admin',
  });

  const { data: signatures } = useQuery({
    queryKey: ['admin-signatures'],
    queryFn: () => base44.asServiceRole.entities.DeviceSignature.list('keyword'),
    enabled: user?.role === 'admin',
  });

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-[#8B9BB4]">Loading...</p>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="p-6 text-center space-y-4">
        <Shield className="w-12 h-12 text-red-400 mx-auto" />
        <h1 className="text-xl font-bold">Access Denied</h1>
        <p className="text-sm text-[#8B9BB4]">Admin privileges required</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-[#8B9BB4] mt-1">Manage app data and content</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-[#1A2332] border-[#2A3A50]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#8B9BB4]">Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{sessions?.length || 0}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1A2332] border-[#2A3A50]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#8B9BB4]">Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{findings?.length || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A2332] border-[#2A3A50]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#8B9BB4]">Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{articles?.length || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A2332] border-[#2A3A50]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#8B9BB4]">Signatures</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{signatures?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#1A2332]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="findings">Findings</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card className="bg-[#1A2332] border-[#2A3A50]">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export All Data (CSV)
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Database className="w-4 h-4 mr-2" />
                Backup Database
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View System Logs
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-3 mt-4">
          {sessions?.map((session) => (
            <Card key={session.id} className="bg-[#1A2332] border-[#2A3A50]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm capitalize">{session.scan_type} Scan</p>
                    <p className="text-xs text-[#5A6A80]">{session.location_name || 'Unknown location'}</p>
                    <p className="text-xs text-[#5A6A80]">
                      {session.suspicious_count || 0} suspicious • {session.devices_found || 0} devices
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
                    session.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                    session.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-gray-500/10 text-gray-400'
                  }`}>
                    {session.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="findings" className="space-y-3 mt-4">
          {findings?.map((finding) => (
            <Card key={finding.id} className="bg-[#1A2332] border-[#2A3A50]">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <p className="font-semibold text-sm">{finding.title}</p>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
                      finding.severity === 'high' ? 'bg-red-500/10 text-red-400' :
                      finding.severity === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {finding.severity}
                    </span>
                  </div>
                  <p className="text-xs text-[#8B9BB4] line-clamp-2">{finding.description}</p>
                  <p className="text-xs text-[#5A6A80]">Type: {finding.finding_type}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="content" className="space-y-4 mt-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">Guide Articles</h3>
            <div className="space-y-2">
              {articles?.map((article) => (
                <Card key={article.id} className="bg-[#1A2332] border-[#2A3A50]">
                  <CardContent className="p-3">
                    <p className="font-semibold text-sm">{article.title}</p>
                    <p className="text-xs text-[#5A6A80] mt-1">{article.category} • {article.read_time_minutes} min</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Device Signatures</h3>
            <div className="flex flex-wrap gap-2">
              {signatures?.slice(0, 15).map((sig) => (
                <span
                  key={sig.id}
                  className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    sig.risk_level === 'high' ? 'bg-red-500/10 text-red-400' :
                    sig.risk_level === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}
                >
                  {sig.keyword}
                </span>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}