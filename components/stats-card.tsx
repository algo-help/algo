'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  loading?: boolean;
}

export const StatsCard = React.memo(({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  loading = false 
}: StatsCardProps) => {
  return (
    <Card className="p-3 sm:p-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-1 sm:pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[28px] sm:h-[36px] flex items-center relative">
          <div className={`transition-opacity duration-500 ${loading ? 'opacity-100' : 'opacity-0'} absolute`}>
            <Skeleton className="h-4 sm:h-5 w-8 sm:w-12" />
          </div>
          <div className={`text-lg sm:text-2xl font-bold transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}>
            {value}
          </div>
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
});

StatsCard.displayName = 'StatsCard';