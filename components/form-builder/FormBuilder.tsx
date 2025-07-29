'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Save, 
  Eye, 
  Settings, 
  Palette,
  Share2,
  Play,
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Move,
  Edit
} from 'lucide-react';
import { questionTypes, questionCategories } from './QuestionTypes';
import { QuestionTypeCard } from './QuestionTypeCard';
import { SortableQuestion } from './SortableQuestion';
import { QuestionEditor } from './QuestionEditor';
import { FormPreview } from './FormPreview';
import { supabase } from '@/utils/supabase';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSession } from '@/app/(dashboard)/actions';


// 사이드바 드롭 영역 컴포넌트 (드롭 차단용)
const SidebarDropZone = React.memo(function SidebarDropZone({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'sidebar-drop-zone',
    data: { type: 'sidebar-area' },
  });

  return (
    <div ref={setNodeRef} className="relative">
      {children}
      {isOver && (
        <div className="absolute inset-0 bg-red-500/10 border-2 border-dashed border-red-500 rounded-lg flex items-center justify-center z-50">
          <div className="bg-red-500/20 px-4 py-2 rounded-lg">
            <p className="text-red-700 font-medium">❌ 여기에는 드롭할 수 없습니다</p>
          </div>
        </div>
      )}
    </div>
  );
});

// FormBuilderContainer 컴포넌트 (드롭 영역 컨테이너)
const FormBuilderContainer = React.memo(function FormBuilderContainer({
  questions,
  selectedQuestion,
  onSelectQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onDuplicateQuestion,
  draggedQuestionType,
  dragOverIndex,
  isDragging,
}: {
  questions: Question[];
  selectedQuestion: Question | null;
  onSelectQuestion: (question: Question) => void;
  onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
  onDeleteQuestion: (questionId: string) => void;
  onDuplicateQuestion: (questionId: string) => void;
  draggedQuestionType: any;
  dragOverIndex: number | null;
  isDragging: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'form-builder-container',
    data: { type: 'form-builder-area' },
  });

  return (
    <div
      ref={setNodeRef}
      className="flex-1 p-6 overflow-y-auto"
      data-testid="form-builder-container"
    >
      <FormBuilderDroppable
        questions={questions}
        selectedQuestion={selectedQuestion}
        onSelectQuestion={onSelectQuestion}
        onUpdateQuestion={onUpdateQuestion}
        onDeleteQuestion={onDeleteQuestion}
        onDuplicateQuestion={onDuplicateQuestion}
        draggedQuestionType={draggedQuestionType}
        dragOverIndex={dragOverIndex}
        isDragging={isDragging}
      />
    </div>
  );
});

// FormBuilderDroppable 컴포넌트
const FormBuilderDroppable = React.memo(function FormBuilderDroppable({
  questions,
  selectedQuestion,
  onSelectQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onDuplicateQuestion,
  draggedQuestionType,
  dragOverIndex,
  isDragging,
}: {
  questions: Question[];
  selectedQuestion: Question | null;
  onSelectQuestion: (question: Question) => void;
  onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
  onDeleteQuestion: (questionId: string) => void;
  onDuplicateQuestion: (questionId: string) => void;
  draggedQuestionType: any;
  dragOverIndex: number | null;
  isDragging: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'form-questions-area',
    data: { type: 'form-builder-area' },
  });

  return (
    <div 
      ref={setNodeRef}
      className="max-w-2xl mx-auto min-h-[400px] relative"
    >
      {questions.length === 0 ? (
        <div className={`text-center py-12 rounded-lg transition-all duration-200 ${
          isOver && draggedQuestionType 
            ? 'bg-primary/10 border-2 border-dashed border-primary/50 scale-105' 
            : 'bg-muted/30 border-2 border-dashed border-muted hover:border-muted-foreground/50'
        }`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-200 ${
            isOver && draggedQuestionType 
              ? 'bg-primary/20' 
              : 'bg-muted'
          }`}>
            {isOver && draggedQuestionType ? (
              React.createElement(draggedQuestionType.icon, { className: "w-8 h-8 text-primary" })
            ) : (
              <Plus className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <h3 className={`text-lg font-semibold mb-2 transition-colors duration-200 ${
            isOver && draggedQuestionType ? 'text-primary' : ''
          }`}>
            {isOver && draggedQuestionType 
              ? `${draggedQuestionType.title} 질문 추가` 
              : '질문을 추가하세요'
            }
          </h3>
          <p className={`transition-colors duration-200 ${
            isOver && draggedQuestionType 
              ? 'text-primary/70' 
              : 'text-muted-foreground'
          }`}>
            {isOver && draggedQuestionType 
              ? '여기에 놓아서 질문을 추가하세요' 
              : '왼쪽 패널에서 질문 타입을 드래그하여 폼을 구성하세요'
            }
          </p>

        </div>
      ) : (
        <SortableContext
          items={questions.map(q => q.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="relative space-y-4">
            {questions.map((question, index) => (
              <SortableQuestion
                key={question.id}
                question={question}
                index={index}
                isSelected={selectedQuestion?.id === question.id}
                onSelect={() => onSelectQuestion(question)}
                onUpdate={onUpdateQuestion}
                onDelete={onDeleteQuestion}
                onDuplicate={onDuplicateQuestion}
                draggedQuestionType={draggedQuestionType}
                isDragging={isDragging}
              />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  );
});

export interface Question {
  id: string;
  type: string;
  title: string;
  description?: string;
  required: boolean;
  config: any;
  order: number;
}

export interface FormData {
  id?: string;
  title: string;
  description: string;
  questions: Question[];
  styling: {
    theme: 'light' | 'dark';
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
  settings: {
    isPublished: boolean;
    collectEmail: boolean;
    showProgressBar: boolean;
    allowAnonymous: boolean;
    requireLogin: boolean;
  };
  scheduling?: {
    enabled: boolean;
    duration: number;
    buffer: number;
    workingHours: {
      start: string;
      end: string;
    };
    workingDays: string[];
  };
}

export function FormBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editFormId = searchParams.get('edit');
  const [activeTab, setActiveTab] = useState('build');
  const [draggedQuestion, setDraggedQuestion] = useState<Question | null>(null);
  const [draggedQuestionType, setDraggedQuestionType] = useState<any>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragStartPosition, setDragStartPosition] = useState<{x: number, y: number} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );
  
  const [formData, setFormData] = useState<FormData>({
    title: '새 폼',
    description: '폼 설명을 입력하세요',
    questions: [],
    styling: {
      theme: 'light',
      primaryColor: '#3b82f6',
      backgroundColor: '#ffffff',
      textColor: '#1f2937'
    },
    settings: {
      isPublished: false,
      collectEmail: true,
      showProgressBar: true,
      allowAnonymous: false,
      requireLogin: true
    },
    scheduling: {
      enabled: false,
      duration: 30,
      buffer: 10,
      workingHours: {
        start: '09:00',
        end: '18:00'
      },
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    }
  });

  useEffect(() => {
    checkLoginStatus();
    if (editFormId) {
      loadFormForEdit(editFormId);
    }
  }, [editFormId]);

  const checkLoginStatus = async () => {
    const session = await getSession();
    if (session && session.authenticated) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  };

  const loadFormForEdit = (formId: string) => {
    const savedForms = JSON.parse(localStorage.getItem('formtime_forms') || '[]');
    const formToEdit = savedForms.find((f: any) => f.id === formId);
    
    if (formToEdit) {
      setFormData({
        ...formToEdit,
        id: formId
      });
      setIsEditing(true);
    }
  };

  const addQuestion = useCallback((questionType: any, insertIndex?: number) => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      type: questionType.id,
      title: questionType.title,
      description: '',
      required: questionType.defaultConfig.required || false,
      config: questionType.defaultConfig,
      order: insertIndex !== undefined ? insertIndex : formData.questions.length
    };
    
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      
      if (insertIndex !== undefined) {
        // 특정 인덱스에 삽입
        newQuestions.splice(insertIndex, 0, newQuestion);
      } else {
        // 맨 끝에 추가
        newQuestions.push(newQuestion);
      }
      
      // order 재정렬
      const reorderedQuestions = newQuestions.map((q, index) => ({
        ...q,
        order: index
      }));
      
      return {
        ...prev,
        questions: reorderedQuestions
      };
    });
    
    setSelectedQuestion(newQuestion);
  }, [formData.questions.length]);

  const updateQuestion = useCallback((questionId: string, updates: Partial<Question>) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    }));
    
    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedQuestion]);

  const deleteQuestion = useCallback((questionId: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
    
    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion(null);
    }
  }, [selectedQuestion]);

  const duplicateQuestion = useCallback((questionId: string) => {
    const question = formData.questions.find(q => q.id === questionId);
    if (!question) return;
    
    const duplicatedQuestion: Question = {
      ...question,
      id: `q_${Date.now()}`,
      title: `${question.title} (복사본)`,
      order: formData.questions.length
    };
    
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, duplicatedQuestion]
    }));
  }, [formData.questions]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    setIsDragging(true);
    
    // 드래그 시작 위치 기록 (마우스 포인터 위치)
    if (event.activatorEvent && 'clientX' in event.activatorEvent && 'clientY' in event.activatorEvent) {
      const startPos = {
        x: event.activatorEvent.clientX as number,
        y: event.activatorEvent.clientY as number
      };
      setDragStartPosition(startPos);
    }
    
    // 기존 질문 드래그
    const question = formData.questions.find(q => q.id === active.id);
    if (question) {
      setDraggedQuestion(question);
      setDraggedQuestionType(null);
      setDragOverIndex(null);
      return;
    }

    // 질문 타입 드래그
    if (active.data.current?.type === 'question-type') {
      setDraggedQuestionType(active.data.current.questionType);
      setDraggedQuestion(null);
      setDragOverIndex(null);
    }
  };

  const handleDragOver = useCallback((event: any) => {
    const { over, active } = event;
    
    if (!over) {
      setDragOverIndex(null);
      return;
    }

    // 질문 타입을 드래그하는 경우에만 드롭 영역 활성화
    if (active.data.current?.type !== 'question-type') {
      return;
    }

    // 다양한 드롭 대상들 확인
    const isValidDropTarget = over.id === 'form-builder-container' || 
                              over.id === 'form-questions-area' || 
                              over.data?.current?.type === 'form-builder-area' ||
                              over.data?.current?.type === 'question-drop';
    
    if (isValidDropTarget) {
      let insertIndex;
      
      // 질문 카드 드롭인 경우 해당 인덱스 사용
      if (over.data?.current?.type === 'question-drop' && over.data?.current?.insertIndex !== undefined) {
        insertIndex = over.data.current.insertIndex;
      } else {
        // 빈 상태일 때는 인덱스 0, 그렇지 않으면 맨 끝
        insertIndex = formData.questions.length === 0 ? 0 : formData.questions.length;
      }
      
      setDragOverIndex(prevIndex => {
        if (prevIndex !== insertIndex) {
          return insertIndex;
        }
        return prevIndex;
      });
    } else {
      setDragOverIndex(null);
    }
  }, [formData.questions.length]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    
    // 드래그 상태 초기화
    const startPosition = dragStartPosition;
    setIsDragging(false);
    setDraggedQuestion(null);
    setDraggedQuestionType(null);
    setDragOverIndex(null);
    setDragStartPosition(null);
    
    if (!over) {
      return;
    }

    // 질문 타입을 드래그하는 경우
    if (active.data.current?.type === 'question-type') {
      // 드래그 거리 계산 (delta를 사용하여 실제 이동 거리 계산)
      let dragDistance = 0;
      if (delta) {
        dragDistance = Math.sqrt(Math.pow(delta.x, 2) + Math.pow(delta.y, 2));
      }
      
      // 최소 드래그 거리 확인 (20px 이상 이동해야 함)
      if (dragDistance < 20) {
        return;
      }
      
      // 사이드바 영역에 드롭된 경우 차단
      if (over.id === 'sidebar-drop-zone') {
        return;
      }
      
      // FormBuilderContainer 또는 관련 드롭 영역에 드롭된 경우에만 질문 추가
      const isValidDropTarget = over.id === 'form-builder-container' || 
                                over.id === 'form-questions-area' || 
                                over.data?.current?.type === 'form-builder-area' ||
                                over.data?.current?.type === 'question-drop';
      
      if (isValidDropTarget) {
        const questionType = active.data.current.questionType;
        let insertIndex;
        
        // 질문 카드 드롭인 경우 해당 인덱스 사용
        if (over.data?.current?.type === 'question-drop' && over.data?.current?.insertIndex !== undefined) {
          insertIndex = over.data.current.insertIndex;
        } else {
          // 빈 상태일 때는 인덱스 0, 그렇지 않으면 맨 끝에 추가
          insertIndex = formData.questions.length === 0 ? 0 : formData.questions.length;
        }
        
        addQuestion(questionType, insertIndex);
      }
      
      return;
    }

    // 기존 질문을 드래그하는 경우 (질문 재정렬)
    const draggedQuestion = formData.questions.find(q => q.id === active.id);
    const targetQuestion = formData.questions.find(q => q.id === over.id);
    
    if (draggedQuestion && targetQuestion && active.id !== over.id) {
      setFormData(prev => {
        const oldIndex = prev.questions.findIndex(q => q.id === active.id);
        const newIndex = prev.questions.findIndex(q => q.id === over.id);
        
        const newQuestions = arrayMove(prev.questions, oldIndex, newIndex);
        
        return {
          ...prev,
          questions: newQuestions.map((q, index) => ({
            ...q,
            order: index
          }))
        };
      });
    }
  };

  const saveForm = async () => {
    setIsSaving(true);
    
    try {
      if (!isLoggedIn) {
        toast.error('로그인이 필요합니다.');
        return;
      }

      const slug = formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const savedForms = JSON.parse(localStorage.getItem('formtime_forms') || '[]');
      
      if (isEditing && formData.id) {
        // 기존 폼 업데이트
        const formPayload = {
          ...formData,
          slug: `${slug}-${Date.now()}`,
          updated_at: new Date()
        };
        
        const updatedForms = savedForms.map((form: any) => 
          form.id === formData.id ? formPayload : form
        );
        
        localStorage.setItem('formtime_forms', JSON.stringify(updatedForms));
        setFormData(formPayload);
        toast.success('폼이 업데이트되었습니다!');
      } else {
        // 새 폼 생성
        const formPayload = {
          id: `form_${Date.now()}`,
          title: formData.title,
          description: formData.description,
          slug: `${slug}-${Date.now()}`,
          is_published: formData.settings.isPublished,
          questions: formData.questions,
          styling: formData.styling,
          settings: formData.settings,
          scheduling_config: formData.scheduling,
          created_at: new Date(),
          updated_at: new Date(),
          user_id: 'test-user-123'
        };
        
        savedForms.push(formPayload);
        localStorage.setItem('formtime_forms', JSON.stringify(savedForms));
        
        setFormData(prev => ({ ...prev, id: formPayload.id }));
        setIsEditing(true);
        toast.success('폼이 저장되었습니다!');
      }
      
    } catch (error: any) {
      toast.error(error.message || '폼 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const publishForm = async () => {
    if (!isLoggedIn) {
      toast.error('로그인이 필요합니다.');
      return;
    }
    
    if (!formData.id) {
      await saveForm();
      return;
    }
    
    setIsSaving(true);
    
    try {
      // 로컬 스토리지에서 폼 업데이트
      const savedForms = JSON.parse(localStorage.getItem('formtime_forms') || '[]');
      const updatedForms = savedForms.map((form: any) => 
        form.id === formData.id 
          ? { ...form, is_published: true, updated_at: new Date() }
          : form
      );
      localStorage.setItem('formtime_forms', JSON.stringify(updatedForms));
      
      setFormData(prev => ({
        ...prev,
        settings: { ...prev.settings, isPublished: true }
      }));
      
      toast.success('폼이 게시되었습니다!');
      
    } catch (error: any) {
      toast.error(error.message || '폼 게시에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden" style={{ userSelect: 'none' }}>
      {/* 헤더 */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
        <div className="content-container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/formtime')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                FormTime
              </Button>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="text-lg font-semibold border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="폼 제목을 입력하세요"
                  />
                  {isEditing && (
                    <Badge variant="outline" className="text-xs">
                      편집 모드
                    </Badge>
                  )}
                  {!isLoggedIn && (
                    <Badge variant="secondary" className="text-xs">
                      미리보기
                    </Badge>
                  )}
                </div>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="text-sm text-muted-foreground border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                  placeholder="폼 설명을 입력하세요"
                  rows={1}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant={formData.settings.isPublished ? 'default' : 'secondary'}>
                {formData.settings.isPublished ? '게시됨' : '비공개'}
              </Badge>
              {isLoggedIn ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveForm}
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? '저장 중...' : isEditing ? '업데이트' : '저장'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={publishForm}
                    disabled={isSaving}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    게시
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/formtime')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  로그인하여 저장
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 mx-4 mt-4 flex-shrink-0">
            <TabsTrigger value="build">빌드</TabsTrigger>
            <TabsTrigger value="design">디자인</TabsTrigger>
            <TabsTrigger value="settings">설정</TabsTrigger>
            <TabsTrigger value="preview">미리보기</TabsTrigger>
          </TabsList>

          <div className="flex-1 flex min-h-0">
            <TabsContent value="build" className="flex-1 flex mt-0 min-h-0">
              <DndContext
                id="form-builder-dnd-context"
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
              >
                <div className="flex-1 flex min-h-0">
                  {/* 질문 타입 사이드바 */}
                  <SidebarDropZone>
                    <div className="w-80 border-r border-border/40 bg-muted/30 flex flex-col">
                      <div className="p-4 flex-shrink-0">
                        <h3 className="font-semibold mb-4">질문 타입</h3>
                      </div>
                      <div className="flex-1 min-h-0 px-4 pb-4">
                        <ScrollArea className="h-full">
                          <div className="space-y-6">
                            {questionCategories.map(category => (
                              <div key={category.id}>
                                <h4 className="text-sm font-medium mb-3 flex items-center">
                                  <category.icon className="w-4 h-4 mr-2" />
                                  {category.title}
                                </h4>
                                <div className="space-y-2">
                                  {questionTypes
                                    .filter(type => type.category === category.id)
                                    .map(type => (
                                      <QuestionTypeCard
                                        key={type.id}
                                        type={type}
                                      />
                                    ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </SidebarDropZone>

                  {/* 폼 빌더 */}
                  <div className="flex-1 flex min-h-0">
                    <FormBuilderContainer
                      questions={formData.questions}
                      selectedQuestion={selectedQuestion}
                      onSelectQuestion={setSelectedQuestion}
                      onUpdateQuestion={updateQuestion}
                      onDeleteQuestion={deleteQuestion}
                      onDuplicateQuestion={duplicateQuestion}
                      draggedQuestionType={draggedQuestionType}
                      dragOverIndex={dragOverIndex}
                      isDragging={isDragging}
                    />

                    {/* 질문 편집기 */}
                    {selectedQuestion && (
                      <div className="w-80 border-l border-border/40 bg-muted/30">
                        <QuestionEditor
                          question={selectedQuestion}
                          onUpdate={updateQuestion}
                          onClose={() => setSelectedQuestion(null)}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <DragOverlay
                  dropAnimation={{
                    duration: 200,
                    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                  }}
                  style={{
                    zIndex: 10000,
                  }}
                >
                  {draggedQuestion && (
                    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-2xl">
                      <p className="font-medium">{draggedQuestion.title}</p>
                    </div>
                  )}
                  {draggedQuestionType && (
                    <div className="bg-background/95 backdrop-blur-sm border-2 border-primary rounded-lg p-4 shadow-2xl min-w-[200px]">
                      <div className="flex items-center space-x-3">
                        {React.createElement(draggedQuestionType.icon, { 
                          className: "w-5 h-5 text-primary flex-shrink-0" 
                        })}
                        <div>
                          <p className="font-medium text-primary">{draggedQuestionType.title}</p>
                          <p className="text-xs text-primary/70 mt-1">{draggedQuestionType.description}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            </TabsContent>

            <TabsContent value="design" className="flex-1 mt-0">
              <div className="p-6">
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-lg font-semibold mb-6">디자인 설정</h3>
                  {/* 디자인 설정 UI */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>테마</CardTitle>
                        <CardDescription>전체적인 테마를 선택하세요</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex space-x-4">
                          <Button
                            variant={formData.styling.theme === 'light' ? 'default' : 'outline'}
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              styling: { ...prev.styling, theme: 'light' }
                            }))}
                          >
                            라이트
                          </Button>
                          <Button
                            variant={formData.styling.theme === 'dark' ? 'default' : 'outline'}
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              styling: { ...prev.styling, theme: 'dark' }
                            }))}
                          >
                            다크
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>색상</CardTitle>
                        <CardDescription>브랜드 색상을 설정하세요</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="primary-color">기본 색상</Label>
                            <div className="flex items-center space-x-2 mt-2">
                              <Input
                                id="primary-color"
                                type="color"
                                value={formData.styling.primaryColor}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  styling: { ...prev.styling, primaryColor: e.target.value }
                                }))}
                                className="w-12 h-10"
                              />
                              <Input
                                value={formData.styling.primaryColor}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  styling: { ...prev.styling, primaryColor: e.target.value }
                                }))}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 mt-0">
              <div className="p-6">
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-lg font-semibold mb-6">폼 설정</h3>
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>일반 설정</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="collect-email">이메일 수집</Label>
                            <p className="text-sm text-muted-foreground">
                              응답자의 이메일 주소를 수집합니다
                            </p>
                          </div>
                          <Switch
                            id="collect-email"
                            checked={formData.settings.collectEmail}
                            onCheckedChange={(checked) => setFormData(prev => ({
                              ...prev,
                              settings: { ...prev.settings, collectEmail: checked }
                            }))}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="progress-bar">진행 표시줄</Label>
                            <p className="text-sm text-muted-foreground">
                              폼 작성 진행률을 표시합니다
                            </p>
                          </div>
                          <Switch
                            id="progress-bar"
                            checked={formData.settings.showProgressBar}
                            onCheckedChange={(checked) => setFormData(prev => ({
                              ...prev,
                              settings: { ...prev.settings, showProgressBar: checked }
                            }))}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="require-login">로그인 필수</Label>
                            <p className="text-sm text-muted-foreground">
                              폼 작성 시 로그인을 요구합니다
                            </p>
                          </div>
                          <Switch
                            id="require-login"
                            checked={formData.settings.requireLogin}
                            onCheckedChange={(checked) => setFormData(prev => ({
                              ...prev,
                              settings: { ...prev.settings, requireLogin: checked }
                            }))}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>스케줄링 설정</CardTitle>
                        <CardDescription>
                          폼 응답 후 자동으로 일정을 예약할 수 있습니다
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="enable-scheduling">스케줄링 활성화</Label>
                            <p className="text-sm text-muted-foreground">
                              폼 완료 후 일정 예약 기능을 활성화합니다
                            </p>
                          </div>
                          <Switch
                            id="enable-scheduling"
                            checked={formData.scheduling?.enabled || false}
                            onCheckedChange={(checked) => setFormData(prev => ({
                              ...prev,
                              scheduling: { ...prev.scheduling!, enabled: checked }
                            }))}
                          />
                        </div>

                        {formData.scheduling?.enabled && (
                          <div className="mt-4 space-y-4">
                            <div>
                              <Label htmlFor="duration">미팅 시간 (분)</Label>
                              <Input
                                id="duration"
                                type="number"
                                value={formData.scheduling.duration}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  scheduling: { 
                                    ...prev.scheduling!, 
                                    duration: parseInt(e.target.value) 
                                  }
                                }))}
                                className="mt-2"
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 mt-0">
              <FormPreview formData={formData} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}