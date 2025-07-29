import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { FormData } from './FormBuilder';

interface FormPreviewProps {
  formData: FormData;
}

export function FormPreview({ formData }: FormPreviewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = formData.questions[currentQuestionIndex];
  const totalQuestions = formData.questions.length;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  const handleResponse = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const canProceed = () => {
    if (!currentQuestion) return false;
    
    const response = responses[currentQuestion.id];
    
    if (currentQuestion.required) {
      if (response === undefined || response === null || response === '') {
        return false;
      }
      
      if (Array.isArray(response) && response.length === 0) {
        return false;
      }
    }
    
    return true;
  };

  if (totalQuestions === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">미리보기 준비 중</h3>
          <p className="text-muted-foreground">
            질문을 추가하면 미리보기를 확인할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">완료되었습니다!</h3>
            <p className="text-muted-foreground mb-6">
              폼 작성이 완료되었습니다. 실제 폼에서는 이후 일정 예약이나 결과 페이지로 이동합니다.
            </p>
            <Button
              onClick={() => {
                setCurrentQuestionIndex(0);
                setResponses({});
                setIsCompleted(false);
              }}
              variant="outline"
              className="w-full"
            >
              다시 시작
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-8">
      <div className="max-w-2xl mx-auto w-full">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{formData.title}</h1>
          <p className="text-muted-foreground">{formData.description}</p>
        </div>

        {/* 진행률 표시 */}
        {formData.settings.showProgressBar && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                질문 {currentQuestionIndex + 1} / {totalQuestions}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* 질문 카드 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{currentQuestion.title}</span>
              {currentQuestion.required && (
                <Badge variant="destructive" className="text-xs">
                  필수
                </Badge>
              )}
            </CardTitle>
            {currentQuestion.description && (
              <p className="text-sm text-muted-foreground">
                {currentQuestion.description}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <QuestionInput
              question={currentQuestion}
              value={responses[currentQuestion.id]}
              onChange={(value) => handleResponse(currentQuestion.id, value)}
            />
          </CardContent>
        </Card>

        {/* 네비게이션 */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            이전
          </Button>
          
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalQuestions }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-primary'
                    : index < currentQuestionIndex
                    ? 'bg-primary/50'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {currentQuestionIndex === totalQuestions - 1 ? '완료' : '다음'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function QuestionInput({ question, value, onChange }: {
  question: any;
  value: any;
  onChange: (value: any) => void;
}) {
  switch (question.type) {
    case 'short-text':
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.config.placeholder}
          className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          maxLength={question.config.maxLength}
        />
      );

    case 'long-text':
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.config.placeholder}
          rows={question.config.rows || 4}
          className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          maxLength={question.config.maxLength}
        />
      );

    case 'email':
      return (
        <input
          type="email"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.config.placeholder}
          className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      );

    case 'phone':
      return (
        <input
          type="tel"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.config.placeholder}
          className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      );

    case 'number':
      return (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.config.placeholder}
          min={question.config.min}
          max={question.config.max}
          className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      );

    case 'multiple-choice':
      return (
        <div className="space-y-3">
          {question.config.options?.map((option: string, index: number) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="radio"
                id={`${question.id}-${index}`}
                name={question.id}
                value={option}
                checked={value === option}
                onChange={(e) => onChange(e.target.value)}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <label
                htmlFor={`${question.id}-${index}`}
                className="flex-1 cursor-pointer"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      );

    case 'checkboxes':
      return (
        <div className="space-y-3">
          {question.config.options?.map((option: string, index: number) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={`${question.id}-${index}`}
                value={option}
                checked={Array.isArray(value) && value.includes(option)}
                onChange={(e) => {
                  const currentValue = Array.isArray(value) ? value : [];
                  if (e.target.checked) {
                    onChange([...currentValue, option]);
                  } else {
                    onChange(currentValue.filter((v: string) => v !== option));
                  }
                }}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <label
                htmlFor={`${question.id}-${index}`}
                className="flex-1 cursor-pointer"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      );

    case 'dropdown':
      return (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">{question.config.placeholder}</option>
          {question.config.options?.map((option: string, index: number) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      );

    case 'date':
      return (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      );

    case 'time':
      return (
        <input
          type="time"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      );

    case 'rating':
      return (
        <div className="flex items-center space-x-2">
          {Array.from({ length: question.config.maxRating || 5 }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onChange(index + 1)}
              className={`w-8 h-8 rounded-full border-2 transition-colors ${
                value && value > index
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-muted hover:border-primary'
              }`}
            >
              ★
            </button>
          ))}
          {value && question.config.labels?.[value - 1] && (
            <span className="text-sm text-muted-foreground ml-4">
              {question.config.labels[value - 1]}
            </span>
          )}
        </div>
      );

    case 'yes-no':
      return (
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id={`${question.id}-yes`}
              name={question.id}
              value="yes"
              checked={value === 'yes'}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 text-primary focus:ring-primary"
            />
            <label htmlFor={`${question.id}-yes`} className="cursor-pointer">
              {question.config.labels?.[0] || '예'}
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id={`${question.id}-no`}
              name={question.id}
              value="no"
              checked={value === 'no'}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 text-primary focus:ring-primary"
            />
            <label htmlFor={`${question.id}-no`} className="cursor-pointer">
              {question.config.labels?.[1] || '아니오'}
            </label>
          </div>
        </div>
      );

    default:
      return (
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            {question.type} 타입의 미리보기는 아직 구현되지 않았습니다.
          </p>
        </div>
      );
  }
}