'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  Calendar, 
  Clock,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

interface AnalyticsData {
  period: string;
  totalUsers: number;
  activeUsers: number;
  totalDeliveries: number;
  completedDeliveries: number;
  totalAppointments: number;
  confirmedAppointments: number;
  conversionRate: number;
  averageResponseTime: number;
  satisfactionScore: number;
  hourlyDistribution: { hour: number; count: number }[];
  dailyTrends: { date: string; users: number; deliveries: number; appointments: number }[];
}

export function AdvancedStats() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // 실제로는 API에서 데이터를 가져와야 함
  const analyticsData: AnalyticsData = useMemo(() => {
    const now = new Date();
    const baseData = {
      period: selectedPeriod,
      totalUsers: 245,
      activeUsers: 189,
      totalDeliveries: 142,
      completedDeliveries: 128,
      totalAppointments: 67,
      confirmedAppointments: 58,
      conversionRate: 73.5,
      averageResponseTime: 24.5,
      satisfactionScore: 4.6,
      hourlyDistribution: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: Math.floor(Math.random() * 20) + 1
      })),
      dailyTrends: Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
          users: Math.floor(Math.random() * 50) + 20,
          deliveries: Math.floor(Math.random() * 30) + 10,
          appointments: Math.floor(Math.random() * 15) + 5,
        };
      }),
    };

    // 기간에 따라 데이터 조정
    if (selectedPeriod === '30d') {
      baseData.totalUsers *= 3.5;
      baseData.activeUsers *= 3.2;
      baseData.totalDeliveries *= 4.1;
      baseData.completedDeliveries *= 4.0;
      baseData.totalAppointments *= 3.8;
      baseData.confirmedAppointments *= 3.7;
    } else if (selectedPeriod === '1d') {
      baseData.totalUsers *= 0.3;
      baseData.activeUsers *= 0.35;
      baseData.totalDeliveries *= 0.2;
      baseData.completedDeliveries *= 0.22;
      baseData.totalAppointments *= 0.25;
      baseData.confirmedAppointments *= 0.27;
    }

    return baseData;
  }, [selectedPeriod]);

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '1d': return '오늘';
      case '7d': return '최근 7일';
      case '30d': return '최근 30일';
      default: return period;
    }
  };

  const getChangeIndicator = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    const isPositive = change > 0;
    
    return (
      <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
        {Math.abs(change).toFixed(1)}%
      </div>
    );
  };

  const conversionRate = (analyticsData.completedDeliveries / analyticsData.totalDeliveries) * 100;
  const appointmentConfirmationRate = (analyticsData.confirmedAppointments / analyticsData.totalAppointments) * 100;
  const userActivationRate = (analyticsData.activeUsers / analyticsData.totalUsers) * 100;

  return (
    <div className="space-y-6">
      {/* 기간 선택 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">고급 분석</h2>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">오늘</SelectItem>
            <SelectItem value="7d">최근 7일</SelectItem>
            <SelectItem value="30d">최근 30일</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 핵심 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">변환율</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <Progress value={conversionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              배송 완료율
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">예약 확정률</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentConfirmationRate.toFixed(1)}%</div>
            <Progress value={appointmentConfirmationRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              예약 대비 확정률
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">사용자 활성화율</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userActivationRate.toFixed(1)}%</div>
            <Progress value={userActivationRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              활성 사용자 비율
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 응답 시간</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.averageResponseTime}시간</div>
            <Badge variant="secondary" className="mt-2">
              목표: 24시간 이내
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              문의 응답 시간
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 시간대별 활동 분포 */}
      <Card>
        <CardHeader>
          <CardTitle>시간대별 활동 분포</CardTitle>
          <CardDescription>
            24시간 동안의 사용자 활동 패턴
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-1">
            {analyticsData.hourlyDistribution.map(({ hour, count }) => {
              const maxCount = Math.max(...analyticsData.hourlyDistribution.map(h => h.count));
              const height = (count / maxCount) * 100;
              
              return (
                <div key={hour} className="flex flex-col items-center space-y-1">
                  <div 
                    className="w-full bg-blue-500 rounded-sm min-h-[4px] transition-all hover:bg-blue-600"
                    style={{ height: `${height}%` }}
                    title={`${hour}시: ${count}건`}
                  />
                  <span className="text-xs text-muted-foreground">
                    {hour}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 일별 트렌드 */}
      <Card>
        <CardHeader>
          <CardTitle>일별 트렌드</CardTitle>
          <CardDescription>
            사용자, 배송, 예약의 일별 변화
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.dailyTrends.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div className="font-medium">{day.date}</div>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">사용자: {day.users}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-green-500" />
                    <span className="text-sm">배송: {day.deliveries}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">예약: {day.appointments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 만족도 및 성과 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>고객 만족도</CardTitle>
            <CardDescription>
              최근 설문조사 결과
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-500 mb-2">
                {analyticsData.satisfactionScore}
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                5점 만점
              </div>
              <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className={`w-6 h-6 ${
                      star <= analyticsData.satisfactionScore
                        ? 'text-yellow-500'
                        : 'text-gray-300'
                    }`}
                  >
                    ⭐
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>주요 성과 지표</CardTitle>
            <CardDescription>
              {getPeriodLabel(selectedPeriod)} 기준
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">신규 사용자</span>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">+{Math.floor(analyticsData.totalUsers * 0.15)}</Badge>
                {getChangeIndicator(100, 85)}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">배송 완료</span>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{analyticsData.completedDeliveries}</Badge>
                {getChangeIndicator(100, 92)}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">예약 확정</span>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{analyticsData.confirmedAppointments}</Badge>
                {getChangeIndicator(100, 88)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}