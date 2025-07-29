'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Type,
  Mail,
  Phone,
  ListOrdered,
  Star,
  Calendar,
  FileText,
  MessageSquare,
  Hash,
  ToggleLeft,
} from "lucide-react";

export type QuestionType = 
  | 'text'
  | 'email'
  | 'phone'
  | 'select'
  | 'multiselect'
  | 'rating'
  | 'date'
  | 'time'
  | 'textarea'
  | 'number'
  | 'boolean';

interface QuestionTypeSelectorProps {
  onSelect: (type: QuestionType) => void;
}

const questionTypes = [
  {
    type: 'text' as QuestionType,
    icon: Type,
    title: '텍스트',
    description: '짧은 텍스트 답변',
  },
  {
    type: 'email' as QuestionType,
    icon: Mail,
    title: '이메일',
    description: '이메일 주소 입력',
  },
  {
    type: 'phone' as QuestionType,
    icon: Phone,
    title: '전화번호',
    description: '전화번호 입력',
  },
  {
    type: 'select' as QuestionType,
    icon: ListOrdered,
    title: '단일 선택',
    description: '여러 옵션 중 하나 선택',
  },
  {
    type: 'multiselect' as QuestionType,
    icon: MessageSquare,
    title: '다중 선택',
    description: '여러 옵션 선택 가능',
  },
  {
    type: 'rating' as QuestionType,
    icon: Star,
    title: '평점',
    description: '별점으로 평가',
  },
  {
    type: 'date' as QuestionType,
    icon: Calendar,
    title: '날짜',
    description: '날짜 선택',
  },
  {
    type: 'textarea' as QuestionType,
    icon: FileText,
    title: '긴 텍스트',
    description: '여러 줄 텍스트 입력',
  },
  {
    type: 'number' as QuestionType,
    icon: Hash,
    title: '숫자',
    description: '숫자 입력',
  },
  {
    type: 'boolean' as QuestionType,
    icon: ToggleLeft,
    title: '예/아니오',
    description: '이진 선택',
  },
];

export function QuestionTypeSelector({ onSelect }: QuestionTypeSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>질문 유형 선택</CardTitle>
        <CardDescription>
          추가할 질문의 유형을 선택하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {questionTypes.map(({ type, icon: Icon, title, description }) => (
            <Button
              key={type}
              variant="outline"
              className="h-auto flex-col items-start p-4 space-y-2"
              onClick={() => onSelect(type)}
            >
              <div className="flex items-center space-x-2">
                <Icon className="h-4 w-4" />
                <span className="font-medium">{title}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {description}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}