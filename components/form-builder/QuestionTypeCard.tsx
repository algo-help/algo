import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuestionType } from './QuestionTypes';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface QuestionTypeCardProps {
  type: QuestionType;
  onClick?: () => void;
}

export function QuestionTypeCard({ type, onClick }: QuestionTypeCardProps) {
  const IconComponent = type.icon;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `question-type-${type.id}`,
    data: {
      type: 'question-type',
      questionType: type,
    },
  });


  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const,
    MozUserSelect: 'none' as const,
    msUserSelect: 'none' as const,
    touchAction: 'none' as const,
    transition: isDragging ? 'none' : 'opacity 0.2s ease, transform 0.2s ease'
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging && onClick) {
      onClick();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer hover:shadow-md transition-shadow duration-200 hover:border-primary/50 select-none ${
        isDragging ? 'shadow-lg border-primary ring-2 ring-primary/20' : ''
      }`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      {...listeners}
      {...attributes}
      data-testid="question-type-card"
      tabIndex={0}
      role="button"
      aria-label={`${type.title} 질문 타입 추가`}
    >
      <CardContent className="p-4" style={{ userSelect: 'none' }}>
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <IconComponent className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm mb-1 select-none">{type.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2 select-none">
              {type.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}