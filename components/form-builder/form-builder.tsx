'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save, Eye } from "lucide-react";
import { QuestionTypeSelector, QuestionType } from "./question-type-selector";
import { DraggableQuestion, Question } from "./draggable-question";
import { FormPreview } from "./form-preview";

interface FormBuilderProps {
  initialForm?: {
    id?: string;
    title: string;
    description: string;
    questions: Question[];
  };
  onSave: (form: {
    title: string;
    description: string;
    questions: Question[];
  }) => void;
}

export function FormBuilder({ initialForm, onSave }: FormBuilderProps) {
  const [title, setTitle] = useState(initialForm?.title || '');
  const [description, setDescription] = useState(initialForm?.description || '');
  const [questions, setQuestions] = useState<Question[]>(initialForm?.questions || []);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: `question_${Date.now()}`,
      type,
      title: '',
      required: false,
      options: type === 'select' || type === 'multiselect' ? [''] : undefined,
      validation: type === 'rating' ? { max: 5 } : undefined,
    };
    setQuestions([...questions, newQuestion]);
    setShowTypeSelector(false);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const duplicateQuestion = (id: string) => {
    const question = questions.find(q => q.id === id);
    if (question) {
      const newQuestion = {
        ...question,
        id: `question_${Date.now()}`,
      };
      const index = questions.findIndex(q => q.id === id);
      const newQuestions = [...questions];
      newQuestions.splice(index + 1, 0, newQuestion);
      setQuestions(newQuestions);
    }
  };

  const handleSave = () => {
    onSave({
      title,
      description,
      questions,
    });
  };

  if (showPreview) {
    return (
      <FormPreview
        title={title}
        description={description}
        questions={questions}
        onClose={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>폼 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">폼 제목</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 고객 만족도 조사"
            />
          </div>
          <div>
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이 폼에 대한 간단한 설명을 입력하세요"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>질문 목록</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(true)}
              disabled={questions.length === 0}
            >
              <Eye className="h-4 w-4 mr-2" />
              미리보기
            </Button>
            <Button
              size="sm"
              onClick={() => setShowTypeSelector(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              질문 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              아직 질문이 없습니다. "질문 추가" 버튼을 눌러 시작하세요.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={questions.map(q => q.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {questions.map((question) => (
                    <DraggableQuestion
                      key={question.id}
                      question={question}
                      onUpdate={updateQuestion}
                      onDelete={deleteQuestion}
                      onDuplicate={duplicateQuestion}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {showTypeSelector && (
        <QuestionTypeSelector
          onSelect={addQuestion}
        />
      )}

      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleSave}
          disabled={!title || questions.length === 0}
        >
          <Save className="h-4 w-4 mr-2" />
          폼 저장
        </Button>
      </div>
    </div>
  );
}