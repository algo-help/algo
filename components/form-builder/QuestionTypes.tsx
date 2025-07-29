import { 
  Type, 
  List, 
  CheckSquare, 
  Radio, 
  Calendar, 
  Clock, 
  Hash,
  Mail,
  Phone,
  MapPin,
  Link,
  FileText,
  Star,
  Image,
  FileUp
} from 'lucide-react';

export interface QuestionType {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'input' | 'choice' | 'advanced';
  defaultConfig: any;
}

export const questionTypes: QuestionType[] = [
  // Input Types
  {
    id: 'short-text',
    title: '단답형',
    description: '짧은 텍스트 입력',
    icon: Type,
    category: 'input',
    defaultConfig: {
      placeholder: '답변을 입력하세요',
      required: true,
      maxLength: 255
    }
  },
  {
    id: 'long-text',
    title: '장문형',
    description: '긴 텍스트 입력',
    icon: FileText,
    category: 'input',
    defaultConfig: {
      placeholder: '자세한 내용을 입력하세요',
      required: true,
      maxLength: 1000,
      rows: 4
    }
  },
  {
    id: 'email',
    title: '이메일',
    description: '이메일 주소 입력',
    icon: Mail,
    category: 'input',
    defaultConfig: {
      placeholder: 'name@example.com',
      required: true,
      validation: 'email'
    }
  },
  {
    id: 'phone',
    title: '전화번호',
    description: '전화번호 입력',
    icon: Phone,
    category: 'input',
    defaultConfig: {
      placeholder: '010-1234-5678',
      required: true,
      validation: 'phone'
    }
  },
  {
    id: 'number',
    title: '숫자',
    description: '숫자 입력',
    icon: Hash,
    category: 'input',
    defaultConfig: {
      placeholder: '숫자를 입력하세요',
      required: true,
      min: 0,
      max: 100
    }
  },
  {
    id: 'url',
    title: 'URL',
    description: '웹사이트 주소',
    icon: Link,
    category: 'input',
    defaultConfig: {
      placeholder: 'https://example.com',
      required: false,
      validation: 'url'
    }
  },
  
  // Choice Types
  {
    id: 'multiple-choice',
    title: '객관식 (단일 선택)',
    description: '여러 옵션 중 하나 선택',
    icon: Radio,
    category: 'choice',
    defaultConfig: {
      options: ['옵션 1', '옵션 2', '옵션 3'],
      required: true,
      allowOther: false
    }
  },
  {
    id: 'checkboxes',
    title: '체크박스 (다중 선택)',
    description: '여러 옵션 중 여러 개 선택',
    icon: CheckSquare,
    category: 'choice',
    defaultConfig: {
      options: ['옵션 1', '옵션 2', '옵션 3'],
      required: true,
      minSelect: 1,
      maxSelect: null
    }
  },
  {
    id: 'dropdown',
    title: '드롭다운',
    description: '드롭다운 메뉴에서 선택',
    icon: List,
    category: 'choice',
    defaultConfig: {
      options: ['옵션 1', '옵션 2', '옵션 3'],
      required: true,
      placeholder: '선택하세요'
    }
  },
  {
    id: 'yes-no',
    title: '예/아니오',
    description: '간단한 이분법 선택',
    icon: CheckSquare,
    category: 'choice',
    defaultConfig: {
      required: true,
      labels: ['예', '아니오']
    }
  },
  
  // Advanced Types
  {
    id: 'date',
    title: '날짜',
    description: '날짜 선택',
    icon: Calendar,
    category: 'advanced',
    defaultConfig: {
      required: true,
      format: 'YYYY-MM-DD',
      minDate: null,
      maxDate: null
    }
  },
  {
    id: 'time',
    title: '시간',
    description: '시간 선택',
    icon: Clock,
    category: 'advanced',
    defaultConfig: {
      required: true,
      format: 'HH:mm',
      minTime: null,
      maxTime: null
    }
  },
  {
    id: 'datetime',
    title: '날짜와 시간',
    description: '날짜와 시간 선택',
    icon: Calendar,
    category: 'advanced',
    defaultConfig: {
      required: true,
      format: 'YYYY-MM-DD HH:mm',
      minDateTime: null,
      maxDateTime: null
    }
  },
  {
    id: 'rating',
    title: '별점',
    description: '별점 평가',
    icon: Star,
    category: 'advanced',
    defaultConfig: {
      required: true,
      maxRating: 5,
      labels: ['매우 나쁨', '나쁨', '보통', '좋음', '매우 좋음']
    }
  },
  {
    id: 'scale',
    title: '척도',
    description: '슬라이더 척도',
    icon: Hash,
    category: 'advanced',
    defaultConfig: {
      required: true,
      min: 1,
      max: 10,
      step: 1,
      labels: ['최소', '최대']
    }
  },
  {
    id: 'file-upload',
    title: '파일 업로드',
    description: '파일 첨부',
    icon: FileUp,
    category: 'advanced',
    defaultConfig: {
      required: false,
      maxFileSize: 10,
      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
      maxFiles: 1
    }
  },
  {
    id: 'image-choice',
    title: '이미지 선택',
    description: '이미지로 선택',
    icon: Image,
    category: 'advanced',
    defaultConfig: {
      required: true,
      options: [],
      allowMultiple: false
    }
  },
  {
    id: 'address',
    title: '주소',
    description: '주소 입력',
    icon: MapPin,
    category: 'advanced',
    defaultConfig: {
      required: true,
      placeholder: '주소를 입력하세요',
      autoComplete: true
    }
  }
];

export const questionCategories = [
  { id: 'input', title: '입력 필드', icon: Type },
  { id: 'choice', title: '선택 필드', icon: CheckSquare },
  { id: 'advanced', title: '고급 필드', icon: Star }
] as const;