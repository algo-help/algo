'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X, ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Question } from "./draggable-question";

interface FormPreviewProps {
  title: string;
  description: string;
  questions: Question[];
  onClose: () => void;
}

export function FormPreview({ title, description, questions, onClose }: FormPreviewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const answer = answers[currentQuestion.id];

    switch (currentQuestion.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <Input
            type={currentQuestion.type === 'number' ? 'number' : 'text'}
            value={answer || ''}
            onChange={(e) => setAnswers({
              ...answers,
              [currentQuestion.id]: e.target.value
            })}
            placeholder={currentQuestion.placeholder}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={answer || ''}
            onChange={(e) => setAnswers({
              ...answers,
              [currentQuestion.id]: e.target.value
            })}
            placeholder={currentQuestion.placeholder}
            rows={4}
          />
        );

      case 'select':
        return (
          <RadioGroup
            value={answer || ''}
            onValueChange={(value) => setAnswers({
              ...answers,
              [currentQuestion.id]: value
            })}
          >
            {currentQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {currentQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${index}`}
                  checked={(answer || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValues = answer || [];
                    const newValues = checked
                      ? [...currentValues, option]
                      : currentValues.filter((v: string) => v !== option);
                    setAnswers({
                      ...answers,
                      [currentQuestion.id]: newValues
                    });
                  }}
                />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'rating':
        const maxRating = currentQuestion.validation?.max || 5;
        return (
          <div className="flex space-x-2">
            {Array.from({ length: maxRating }, (_, i) => i + 1).map((rating) => (
              <Button
                key={rating}
                variant={answer === rating ? "default" : "outline"}
                size="lg"
                className="w-12 h-12"
                onClick={() => setAnswers({
                  ...answers,
                  [currentQuestion.id]: rating
                })}
              >
                {rating}
              </Button>
            ))}
          </div>
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !answer && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {answer ? format(answer, "PPP") : "날짜를 선택하세요"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={answer}
                onSelect={(date) => setAnswers({
                  ...answers,
                  [currentQuestion.id]: date
                })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'boolean':
        return (
          <RadioGroup
            value={answer === true ? 'yes' : answer === false ? 'no' : ''}
            onValueChange={(value) => setAnswers({
              ...answers,
              [currentQuestion.id]: value === 'yes'
            })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes">예</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no">아니오</Label>
            </div>
          </RadioGroup>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle>{title}</CardTitle>
          {currentQuestionIndex === 0 && description && (
            <p className="text-sm text-muted-foreground mt-2">{description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 진행률 표시 */}
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* 현재 질문 */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">
                {currentQuestion?.title}
                {currentQuestion?.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </h3>
              {currentQuestion?.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {currentQuestion.description}
                </p>
              )}
            </div>
            {renderQuestion()}
          </div>

          {/* 네비게이션 버튼 */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              이전
            </Button>
            <span className="text-sm text-muted-foreground self-center">
              {currentQuestionIndex + 1} / {questions.length}
            </span>
            <Button
              onClick={handleNext}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              다음
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}