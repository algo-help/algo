import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GripVertical, 
  Edit, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { Question } from './FormBuilder';
import { questionTypes } from './QuestionTypes';

interface SortableQuestionProps {
  question: Question;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (questionId: string, updates: Partial<Question>) => void;
  onDelete: (questionId: string) => void;
  onDuplicate: (questionId: string) => void;
  draggedQuestionType?: any;
  isDragging?: boolean;
}

export function SortableQuestion({
  question,
  index,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  draggedQuestionType,
  isDragging: globalIsDragging
}: SortableQuestionProps) {


  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: question.id });

  // 드래그 중일 때만 드롭 영역 활성화
  const shouldShowDropZones = globalIsDragging && draggedQuestionType && !isDragging;

  // 상단 드롭 영역
  const { isOver: isOverTop, setNodeRef: setTopDropRef } = useDroppable({
    id: shouldShowDropZones ? `question-${question.id}-top` : 'disabled-top',
    data: shouldShowDropZones ? { 
      type: 'question-drop', 
      questionId: question.id,
      position: 'top',
      insertIndex: index
    } : undefined,
    disabled: !shouldShowDropZones,
  });

  // 하단 드롭 영역
  const { isOver: isOverBottom, setNodeRef: setBottomDropRef } = useDroppable({
    id: shouldShowDropZones ? `question-${question.id}-bottom` : 'disabled-bottom',
    data: shouldShowDropZones ? { 
      type: 'question-drop', 
      questionId: question.id,
      position: 'bottom',
      insertIndex: index + 1
    } : undefined,
    disabled: !shouldShowDropZones,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const questionType = questionTypes.find(type => type.id === question.type);
  const IconComponent = questionType?.icon;

  // 드롭 인디케이터는 드롭 영역과 동일한 조건 사용
  const showDropIndicators = shouldShowDropZones;

  return (
    <div className="relative">
      {/* 상단 드롭 인디케이터 */}
      {showDropIndicators && isOverTop && (
        <div className="absolute -top-2 left-0 right-0 z-10 h-4 flex items-center">
          <div className="flex-1 h-0.5 bg-primary transform origin-center scale-y-100 animate-in fade-in-0 scale-in-y-0 duration-200 ease-out" />
          <div className="mx-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-md whitespace-nowrap animate-in fade-in-0 slide-in-from-left-2 duration-200">
            {draggedQuestionType.title} 여기에 추가
          </div>
          <div className="flex-1 h-0.5 bg-primary transform origin-center scale-y-100 animate-in fade-in-0 scale-in-y-0 duration-200 ease-out" />
        </div>
      )}

      {/* 드롭 감지 영역들 - 드래그 중일 때만 활성화 */}
      {shouldShowDropZones && (
        <>
          {/* 상단 드롭 영역 (카드 상단 절반) */}
          <div
            ref={setTopDropRef}
            className="absolute top-0 left-0 right-0 z-20"
            style={{ height: '50%' }}
          />
          
          {/* 하단 드롭 영역 (카드 하단 절반) */}
          <div
            ref={setBottomDropRef}
            className="absolute bottom-0 left-0 right-0 z-20"
            style={{ height: '50%' }}
          />
        </>
      )}

      {/* 메인 카드 */}
      <Card 
        ref={setNodeRef}
        style={style}
        className={`cursor-pointer transition-all duration-200 relative ${
          isSelected 
            ? 'ring-2 ring-primary border-primary' 
            : 'hover:shadow-md hover:border-primary/50'
        } ${showDropIndicators && (isOverTop || isOverBottom) ? 'scale-[1.02]' : ''}`}
        onClick={onSelect}
      >
        {/* 카드 내용 */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                {...attributes}
                {...listeners}
                className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </button>
              
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {index + 1}
                </Badge>
                {IconComponent && (
                  <div className="w-5 h-5 flex items-center justify-center">
                    <IconComponent className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(question.id);
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(question.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">{question.title}</h4>
              <div className="flex items-center space-x-2">
                {question.required && (
                  <Badge variant="destructive" className="text-xs">
                    필수
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  {questionType?.title || question.type}
                </Badge>
              </div>
            </div>
            
            {question.description && (
              <p className="text-xs text-muted-foreground">
                {question.description}
              </p>
            )}
            
            {/* 질문 타입별 미리보기 */}
            <div className="mt-3 p-3 bg-muted/30 rounded-md">
              <QuestionPreview question={question} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 하단 드롭 인디케이터 */}
      {showDropIndicators && isOverBottom && (
        <div className="absolute -bottom-2 left-0 right-0 z-10 h-4 flex items-center">
          <div className="flex-1 h-0.5 bg-primary transform origin-center scale-y-100 animate-in fade-in-0 scale-in-y-0 duration-200 ease-out" />
          <div className="mx-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-md whitespace-nowrap animate-in fade-in-0 slide-in-from-left-2 duration-200">
            {draggedQuestionType.title} 여기에 추가
          </div>
          <div className="flex-1 h-0.5 bg-primary transform origin-center scale-y-100 animate-in fade-in-0 scale-in-y-0 duration-200 ease-out" />
        </div>
      )}
    </div>
  );
}

function QuestionPreview({ question }: { question: Question }) {
  switch (question.type) {
    case 'short-text':
      return (
        <input
          type="text"
          placeholder={question.config.placeholder}
          className="w-full p-2 border border-border rounded text-sm"
          disabled
        />
      );
      
    case 'long-text':
      return (
        <textarea
          placeholder={question.config.placeholder}
          rows={question.config.rows || 3}
          className="w-full p-2 border border-border rounded text-sm resize-none"
          disabled
        />
      );
      
    case 'multiple-choice':
      return (
        <div className="space-y-2">
          {question.config.options?.map((option: string, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <input type="radio" disabled className="text-sm" />
              <span className="text-sm">{option}</span>
            </div>
          ))}
        </div>
      );
      
    case 'checkboxes':
      return (
        <div className="space-y-2">
          {question.config.options?.map((option: string, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <input type="checkbox" disabled className="text-sm" />
              <span className="text-sm">{option}</span>
            </div>
          ))}
        </div>
      );
      
    case 'dropdown':
      return (
        <select className="w-full p-2 border border-border rounded text-sm" disabled>
          <option>{question.config.placeholder}</option>
          {question.config.options?.map((option: string, index: number) => (
            <option key={index}>{option}</option>
          ))}
        </select>
      );
      
    case 'date':
      return (
        <input
          type="date"
          className="w-full p-2 border border-border rounded text-sm"
          disabled
        />
      );
      
    case 'time':
      return (
        <input
          type="time"
          className="w-full p-2 border border-border rounded text-sm"
          disabled
        />
      );
      
    case 'email':
      return (
        <input
          type="email"
          placeholder={question.config.placeholder}
          className="w-full p-2 border border-border rounded text-sm"
          disabled
        />
      );
      
    case 'phone':
      return (
        <input
          type="tel"
          placeholder={question.config.placeholder}
          className="w-full p-2 border border-border rounded text-sm"
          disabled
        />
      );
      
    case 'number':
      return (
        <input
          type="number"
          placeholder={question.config.placeholder}
          min={question.config.min}
          max={question.config.max}
          className="w-full p-2 border border-border rounded text-sm"
          disabled
        />
      );
      
    case 'rating':
      return (
        <div className="flex items-center space-x-1">
          {Array.from({ length: question.config.maxRating || 5 }).map((_, index) => (
            <div key={index} className="w-6 h-6 border border-border rounded-full"></div>
          ))}
        </div>
      );
      
    case 'yes-no':
      return (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input type="radio" disabled />
            <span className="text-sm">{question.config.labels?.[0] || '예'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <input type="radio" disabled />
            <span className="text-sm">{question.config.labels?.[1] || '아니오'}</span>
          </div>
        </div>
      );
      
    default:
      return (
        <div className="text-sm text-muted-foreground">
          {question.type} 타입 미리보기
        </div>
      );
  }
}