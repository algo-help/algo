'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Link2, Unlink, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CalendarIntegration {
  id: string;
  type: 'google' | 'outlook' | 'apple';
  email?: string;
  connected: boolean;
  lastSync?: Date;
}

export function CalendarIntegration() {
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([
    {
      id: 'google',
      type: 'google',
      connected: false,
    },
    {
      id: 'outlook',
      type: 'outlook',
      connected: false,
    },
    {
      id: 'apple',
      type: 'apple',
      connected: false,
    },
  ]);

  const [syncing, setSyncing] = useState<string | null>(null);

  const handleConnect = async (id: string) => {
    setSyncing(id);
    
    // 실제 구현 시에는 OAuth 플로우를 시작
    // 여기서는 시뮬레이션
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration => 
        integration.id === id
          ? {
              ...integration,
              connected: true,
              email: `user@${integration.type}.com`,
              lastSync: new Date(),
            }
          : integration
      ));
      setSyncing(null);
      toast.success(`${getCalendarName(id)} 캘린더가 연동되었습니다.`);
    }, 2000);
  };

  const handleDisconnect = (id: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id
        ? {
            ...integration,
            connected: false,
            email: undefined,
            lastSync: undefined,
          }
        : integration
    ));
    toast.success(`${getCalendarName(id)} 캘린더 연동이 해제되었습니다.`);
  };

  const handleSync = async (id: string) => {
    setSyncing(id);
    
    // 실제 구현 시에는 캘린더 동기화 API 호출
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration => 
        integration.id === id
          ? { ...integration, lastSync: new Date() }
          : integration
      ));
      setSyncing(null);
      toast.success('캘린더가 동기화되었습니다.');
    }, 1500);
  };

  const getCalendarName = (id: string) => {
    switch (id) {
      case 'google':
        return 'Google Calendar';
      case 'outlook':
        return 'Outlook Calendar';
      case 'apple':
        return 'Apple Calendar';
      default:
        return 'Calendar';
    }
  };

  const getCalendarIcon = (type: string) => {
    // 실제로는 각 캘린더 서비스의 아이콘을 사용
    return <Calendar className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          캘린더를 연동하면 예약 가능한 시간이 자동으로 관리되고, 
          새로운 예약이 캘린더에 자동으로 추가됩니다.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getCalendarIcon(integration.type)}
                  <div>
                    <CardTitle className="text-base">
                      {getCalendarName(integration.id)}
                    </CardTitle>
                    {integration.email && (
                      <CardDescription>{integration.email}</CardDescription>
                    )}
                  </div>
                </div>
                <Badge variant={integration.connected ? "default" : "secondary"}>
                  {integration.connected ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      연동됨
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      미연동
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {integration.lastSync && (
                  <p className="text-sm text-muted-foreground">
                    마지막 동기화: {new Date(integration.lastSync).toLocaleString('ko-KR')}
                  </p>
                )}
                <div className="flex space-x-2">
                  {integration.connected ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSync(integration.id)}
                        disabled={syncing === integration.id}
                      >
                        {syncing === integration.id ? '동기화 중...' : '동기화'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDisconnect(integration.id)}
                      >
                        <Unlink className="h-4 w-4 mr-2" />
                        연동 해제
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleConnect(integration.id)}
                      disabled={syncing === integration.id}
                    >
                      {syncing === integration.id ? (
                        '연동 중...'
                      ) : (
                        <>
                          <Link2 className="h-4 w-4 mr-2" />
                          연동하기
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}