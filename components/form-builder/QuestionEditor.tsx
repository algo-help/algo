import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Plus, 
  Trash2, 
  Move,
  Settings,
  Type,
  HelpCircle
} from 'lucide-react';
import { Question } from './FormBuilder';
import { questionTypes } from './QuestionTypes';

interface QuestionEditorProps {
  question: Question;
  onUpdate: (questionId: string, updates: Partial<Question>) => void;
  onClose: () => void;
}

export function QuestionEditor({ question, onUpdate, onClose }: QuestionEditorProps) {
  const questionType = questionTypes.find(type => type.id === question.type);
  const IconComponent = questionType?.icon;

  const updateQuestion = (updates: Partial<Question>) => {
    onUpdate(question.id, updates);
  };

  const updateConfig = (configUpdates: any) => {
    onUpdate(question.id, {
      config: { ...question.config, ...configUpdates }
    });
  };

  const addOption = () => {
    if (question.config.options) {
      updateConfig({
        options: [...question.config.options, `옵션 ${question.config.options.length + 1}`]
      });
    }
  };

  const updateOption = (index: number, value: string) => {
    if (question.config.options) {
      const newOptions = [...question.config.options];
      newOptions[index] = value;
      updateConfig({ options: newOptions });
    }
  };

  const removeOption = (index: number) => {
    if (question.config.options) {
      const newOptions = question.config.options.filter((_: any, i: number) => i !== index);
      updateConfig({ options: newOptions });
    }
  };

  const moveOption = (index: number, direction: 'up' | 'down') => {
    if (!question.config.options) return;
    
    const newOptions = [...question.config.options];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newOptions.length) {
      [newOptions[index], newOptions[targetIndex]] = [newOptions[targetIndex], newOptions[index]];
      updateConfig({ options: newOptions });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {IconComponent && (
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <IconComponent className="w-4 h-4 text-primary" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-sm">질문 편집</h3>
              <p className="text-xs text-muted-foreground">
                {questionType?.title || question.type}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 편집 영역 */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* 기본 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Type className="w-4 h-4 mr-2" />
                기본 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="question-title">질문 제목</Label>
                <Input
                  id="question-title"
                  value={question.title}
                  onChange={(e) => updateQuestion({ title: e.target.value })}
                  placeholder="질문을 입력하세요"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="question-description">설명 (선택사항)</Label>
                <Textarea
                  id="question-description"
                  value={question.description || ''}
                  onChange={(e) => updateQuestion({ description: e.target.value })}
                  placeholder="질문에 대한 추가 설명을 입력하세요"
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="required">필수 응답</Label>
                  <p className="text-xs text-muted-foreground">
                    이 질문에 반드시 답해야 합니다
                  </p>
                </div>
                <Switch
                  id="required"
                  checked={question.required}
                  onCheckedChange={(checked) => updateQuestion({ required: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* 타입별 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                세부 설정
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderTypeSpecificSettings()}
            </CardContent>
          </Card>

          {/* 검증 설정 */}
          {(question.type === 'short-text' || question.type === 'long-text' || question.type === 'number') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  검증 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(question.type === 'short-text' || question.type === 'long-text') && (
                  <div>
                    <Label htmlFor="max-length">최대 글자 수</Label>
                    <Input
                      id="max-length"
                      type="number"
                      value={question.config.maxLength || ''}
                      onChange={(e) => updateConfig({ maxLength: parseInt(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                )}
                
                {question.type === 'number' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min-value">최솟값</Label>
                      <Input
                        id="min-value"
                        type="number"
                        value={question.config.min || ''}
                        onChange={(e) => updateConfig({ min: parseInt(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-value">최댓값</Label>
                      <Input
                        id="max-value"
                        type="number"
                        value={question.config.max || ''}
                        onChange={(e) => updateConfig({ max: parseInt(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  function renderTypeSpecificSettings() {
    switch (question.type) {
      case 'short-text':
      case 'long-text':
      case 'email':
      case 'phone':
      case 'number':
      case 'url':
        return (
          <div>
            <Label htmlFor="placeholder">플레이스홀더</Label>
            <Input
              id="placeholder"
              value={question.config.placeholder || ''}
              onChange={(e) => updateConfig({ placeholder: e.target.value })}
              placeholder="입력 도움말 텍스트"
              className="mt-1"
            />
          </div>
        );

      case 'multiple-choice':
      case 'checkboxes':
      case 'dropdown':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>선택지</Label>
              <Button size="sm" variant="outline" onClick={addOption}>
                <Plus className="w-4 h-4 mr-2" />
                추가
              </Button>
            </div>
            
            <div className="space-y-2">
              {question.config.options?.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`옵션 ${index + 1}`}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveOption(index, 'up')}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveOption(index, 'down')}
                    disabled={index === question.config.options.length - 1}
                  >
                    ↓
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeOption(index)}
                    disabled={question.config.options.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            {question.type === 'checkboxes' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-select">최소 선택 개수</Label>
                  <Input
                    id="min-select"
                    type="number"
                    value={question.config.minSelect || 1}
                    onChange={(e) => updateConfig({ minSelect: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="max-select">최대 선택 개수</Label>
                  <Input
                    id="max-select"
                    type="number"
                    value={question.config.maxSelect || ''}
                    onChange={(e) => updateConfig({ maxSelect: parseInt(e.target.value) || null })}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'rating':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="max-rating">최대 별점</Label>
              <Input
                id="max-rating"
                type="number"
                value={question.config.maxRating || 5}
                onChange={(e) => updateConfig({ maxRating: parseInt(e.target.value) })}
                className="mt-1"
                min="1"
                max="10"
              />
            </div>
            
            <div>
              <Label>별점 설명</Label>
              <div className="mt-1 space-y-2">
                {Array.from({ length: question.config.maxRating || 5 }).map((_, index) => (
                  <Input
                    key={index}
                    value={question.config.labels?.[index] || ''}
                    onChange={(e) => {
                      const newLabels = [...(question.config.labels || [])];
                      newLabels[index] = e.target.value;
                      updateConfig({ labels: newLabels });
                    }}
                    placeholder={`${index + 1}점 설명`}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 'scale':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min-scale">최솟값</Label>
                <Input
                  id="min-scale"
                  type="number"
                  value={question.config.min || 1}
                  onChange={(e) => updateConfig({ min: parseInt(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="max-scale">최댓값</Label>
                <Input
                  id="max-scale"
                  type="number"
                  value={question.config.max || 10}
                  onChange={(e) => updateConfig({ max: parseInt(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="step">단계</Label>
              <Input
                id="step"
                type="number"
                value={question.config.step || 1}
                onChange={(e) => updateConfig({ step: parseInt(e.target.value) })}
                className="mt-1"
                min="1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min-label">최솟값 라벨</Label>
                <Input
                  id="min-label"
                  value={question.config.labels?.[0] || ''}
                  onChange={(e) => {
                    const newLabels = [...(question.config.labels || ['', ''])];
                    newLabels[0] = e.target.value;
                    updateConfig({ labels: newLabels });
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="max-label">최댓값 라벨</Label>
                <Input
                  id="max-label"
                  value={question.config.labels?.[1] || ''}
                  onChange={(e) => {
                    const newLabels = [...(question.config.labels || ['', ''])];
                    newLabels[1] = e.target.value;
                    updateConfig({ labels: newLabels });
                  }}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 'file-upload':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="max-file-size">최대 파일 크기 (MB)</Label>
              <Input
                id="max-file-size"
                type="number"
                value={question.config.maxFileSize || 10}
                onChange={(e) => updateConfig({ maxFileSize: parseInt(e.target.value) })}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="max-files">최대 파일 개수</Label>
              <Input
                id="max-files"
                type="number"
                value={question.config.maxFiles || 1}
                onChange={(e) => updateConfig({ maxFiles: parseInt(e.target.value) })}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'yes-no':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="yes-label">긍정 답변</Label>
              <Input
                id="yes-label"
                value={question.config.labels?.[0] || '예'}
                onChange={(e) => {
                  const newLabels = [...(question.config.labels || ['예', '아니오'])];
                  newLabels[0] = e.target.value;
                  updateConfig({ labels: newLabels });
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="no-label">부정 답변</Label>
              <Input
                id="no-label"
                value={question.config.labels?.[1] || '아니오'}
                onChange={(e) => {
                  const newLabels = [...(question.config.labels || ['예', '아니오'])];
                  newLabels[1] = e.target.value;
                  updateConfig({ labels: newLabels });
                }}
                className="mt-1"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              이 질문 타입에 대한 추가 설정이 없습니다.
            </p>
          </div>
        );
    }
  }
}