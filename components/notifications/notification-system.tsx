'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Bell, Send, Clock, Users } from "lucide-react";
import { toast } from "sonner";

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push';
  subject?: string;
  content: string;
  trigger: 'delivery_created' | 'delivery_shipped' | 'delivery_delivered' | 'appointment_confirmed' | 'manual';
  enabled: boolean;
}

interface NotificationChannel {
  type: 'email' | 'sms' | 'push';
  enabled: boolean;
  config?: {
    smtp_host?: string;
    sms_provider?: string;
    api_key?: string;
  };
}

export function NotificationSystem() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      name: '배송 시작 알림',
      type: 'email',
      subject: '주문하신 제품이 배송 시작되었습니다',
      content: '안녕하세요 {{customer_name}}님,\n\n주문하신 {{product_name}}이 배송 시작되었습니다.\n배송 예정일: {{delivery_date}}\n\n감사합니다.',
      trigger: 'delivery_shipped',
      enabled: true,
    },
    {
      id: '2',
      name: '배송 완료 SMS',
      type: 'sms',
      content: '[영양제배송] {{customer_name}}님, {{product_name}} 배송이 완료되었습니다. 확인 부탁드립니다.',
      trigger: 'delivery_delivered',
      enabled: true,
    },
    {
      id: '3',
      name: '상담 예약 확정',
      type: 'email',
      subject: '상담 예약이 확정되었습니다',
      content: '{{customer_name}}님의 상담 예약이 확정되었습니다.\n\n일시: {{appointment_date}} {{appointment_time}}\n상담 유형: {{appointment_type}}\n\n준비사항이나 궁금한 점이 있으시면 언제든 문의해주세요.',
      trigger: 'appointment_confirmed',
      enabled: true,
    },
  ]);

  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      type: 'email',
      enabled: true,
      config: {
        smtp_host: 'smtp.gmail.com',
      },
    },
    {
      type: 'sms',
      enabled: false,
      config: {
        sms_provider: 'twilio',
      },
    },
    {
      type: 'push',
      enabled: false,
    },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveTemplate = (template: NotificationTemplate) => {
    setTemplates(prev => 
      prev.map(t => t.id === template.id ? template : t)
    );
    setSelectedTemplate(null);
    setIsEditing(false);
    toast.success('알림 템플릿이 저장되었습니다.');
  };

  const handleTestNotification = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    // 실제 구현 시에는 API 호출
    toast.success(`${template.name} 테스트 발송이 시작되었습니다.`);
  };

  const toggleChannel = (type: 'email' | 'sms' | 'push', enabled: boolean) => {
    setChannels(prev => 
      prev.map(c => c.type === type ? { ...c, enabled } : c)
    );
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'push':
        return <Bell className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTriggerLabel = (trigger: string) => {
    switch (trigger) {
      case 'delivery_created':
        return '배송 생성';
      case 'delivery_shipped':
        return '배송 시작';
      case 'delivery_delivered':
        return '배송 완료';
      case 'appointment_confirmed':
        return '예약 확정';
      case 'manual':
        return '수동 발송';
      default:
        return trigger;
    }
  };

  return (
    <div className="space-y-6">
      {/* 알림 채널 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>알림 채널 설정</CardTitle>
          <CardDescription>
            사용할 알림 채널을 선택하고 설정하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {channels.map((channel) => (
              <div key={channel.type} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getChannelIcon(channel.type)}
                  <div>
                    <div className="font-medium capitalize">{channel.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {channel.type === 'email' && '이메일로 알림 발송'}
                      {channel.type === 'sms' && 'SMS로 알림 발송'}
                      {channel.type === 'push' && '푸시 알림 발송'}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={channel.enabled}
                  onCheckedChange={(enabled) => toggleChannel(channel.type, enabled)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 알림 템플릿 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>알림 템플릿</CardTitle>
              <CardDescription>
                자동 발송될 알림 메시지를 관리하세요
              </CardDescription>
            </div>
            <Button onClick={() => {
              setSelectedTemplate({
                id: Date.now().toString(),
                name: '',
                type: 'email',
                content: '',
                trigger: 'manual',
                enabled: true,
              });
              setIsEditing(true);
            }}>
              새 템플릿
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{template.name}</h3>
                    <Badge variant={template.enabled ? "default" : "secondary"}>
                      {template.enabled ? '활성' : '비활성'}
                    </Badge>
                    <Badge variant="outline">
                      {getChannelIcon(template.type)}
                      <span className="ml-1 capitalize">{template.type}</span>
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestNotification(template.id)}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      테스트
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setIsEditing(true);
                      }}
                    >
                      편집
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  트리거: {getTriggerLabel(template.trigger)}
                </div>
                <div className="text-sm bg-muted p-2 rounded">
                  {template.subject && (
                    <div className="font-medium mb-1">제목: {template.subject}</div>
                  )}
                  <div className="whitespace-pre-wrap">{template.content}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 템플릿 편집 모달 */}
      {selectedTemplate && isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedTemplate.id ? '템플릿 편집' : '새 템플릿'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>템플릿 이름</Label>
              <Input
                value={selectedTemplate.name}
                onChange={(e) => setSelectedTemplate({
                  ...selectedTemplate,
                  name: e.target.value
                })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>알림 유형</Label>
                <Select
                  value={selectedTemplate.type}
                  onValueChange={(value: 'email' | 'sms' | 'push') => 
                    setSelectedTemplate({
                      ...selectedTemplate,
                      type: value
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>트리거</Label>
                <Select
                  value={selectedTemplate.trigger}
                  onValueChange={(value: any) => 
                    setSelectedTemplate({
                      ...selectedTemplate,
                      trigger: value
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery_created">배송 생성</SelectItem>
                    <SelectItem value="delivery_shipped">배송 시작</SelectItem>
                    <SelectItem value="delivery_delivered">배송 완료</SelectItem>
                    <SelectItem value="appointment_confirmed">예약 확정</SelectItem>
                    <SelectItem value="manual">수동 발송</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedTemplate.type === 'email' && (
              <div>
                <Label>제목</Label>
                <Input
                  value={selectedTemplate.subject || ''}
                  onChange={(e) => setSelectedTemplate({
                    ...selectedTemplate,
                    subject: e.target.value
                  })}
                />
              </div>
            )}

            <div>
              <Label>내용</Label>
              <Textarea
                value={selectedTemplate.content}
                onChange={(e) => setSelectedTemplate({
                  ...selectedTemplate,
                  content: e.target.value
                })}
                rows={6}
                placeholder="{{customer_name}}, {{product_name}}, {{delivery_date}} 등의 변수를 사용할 수 있습니다"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={selectedTemplate.enabled}
                onCheckedChange={(enabled) => setSelectedTemplate({
                  ...selectedTemplate,
                  enabled
                })}
              />
              <Label>활성화</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedTemplate(null);
                  setIsEditing(false);
                }}
              >
                취소
              </Button>
              <Button onClick={() => handleSaveTemplate(selectedTemplate)}>
                저장
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}