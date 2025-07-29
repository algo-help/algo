'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { GripVertical, Trash2, Copy } from "lucide-react";
import { QuestionType } from "./question-type-selector";

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface DraggableQuestionProps {
  question: Question;
  onUpdate: (id: string, updates: Partial<Question>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function DraggableQuestion({
  question,
  onUpdate,
  onDelete,
  onDuplicate,
}: DraggableQuestionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderQuestionOptions = () => {
    switch (question.type) {
      case 'select':
      case 'multiselect':
        return (
          <div className="space-y-2">
            <Label>옵션</Label>
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(question.options || [])];
                    newOptions[index] = e.target.value;
                    onUpdate(question.id, { options: newOptions });
                  }}
                  placeholder={`옵션 ${index + 1}`}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const newOptions = question.options?.filter((_, i) => i !== index);
                    onUpdate(question.id, { options: newOptions });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const newOptions = [...(question.options || []), ''];
                onUpdate(question.id, { options: newOptions });
              }}
            >
              옵션 추가
            </Button>
          </div>
        );
      case 'rating':
        return (
          <div className="space-y-2">
            <Label>최대 평점</Label>
            <Input
              type="number"
              value={question.validation?.max || 5}
              onChange={(e) => {
                onUpdate(question.id, {
                  validation: {
                    ...question.validation,
                    max: parseInt(e.target.value) || 5,
                  },
                });
              }}
              min={1}
              max={10}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`${isDragging ? 'shadow-lg' : ''}`}>
        <CardHeader className="flex flex-row items-center space-x-2 p-4">
          <button
            className="cursor-grab active:cursor-grabbing touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="flex-1 space-y-2">
            <Input
              value={question.title}
              onChange={(e) => onUpdate(question.id, { title: e.target.value })}
              placeholder="질문 제목"
              className="font-medium"
            />
            <Textarea
              value={question.description || ''}
              onChange={(e) => onUpdate(question.id, { description: e.target.value })}
              placeholder="설명 (선택사항)"
              className="text-sm resize-none"
              rows={2}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderQuestionOptions()}
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Switch
                checked={question.required}
                onCheckedChange={(checked) => 
                  onUpdate(question.id, { required: checked })
                }
              />
              <Label>필수 질문</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDuplicate(question.id)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(question.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}