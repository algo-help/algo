// 테스트 모드용 샘플 데이터 생성기

export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: Date;
}

export interface TestDelivery {
  id: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  product_name: string;
  quantity: number;
  delivery_date: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  notes?: string;
  created_at: Date;
}

export interface TestForm {
  id: string;
  title: string;
  description: string;
  questions: any[];
  responses_count: number;
  created_at: Date;
}

export interface TestAppointment {
  id: string;
  customer_name: string;
  customer_email: string;
  date: Date;
  time: string;
  duration: number;
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
}

export class TestDataGenerator {
  private static instance: TestDataGenerator;

  private constructor() {}

  static getInstance(): TestDataGenerator {
    if (!TestDataGenerator.instance) {
      TestDataGenerator.instance = new TestDataGenerator();
    }
    return TestDataGenerator.instance;
  }

  generateUsers(count: number = 10): TestUser[] {
    const users: TestUser[] = [];
    const names = ['김철수', '이영희', '박민수', '정선미', '최진호', '강수정', '윤대한', '한미래', '장성호', '문지영'];
    const domains = ['gmail.com', 'naver.com', 'kakao.com', 'daum.net'];

    for (let i = 0; i < count; i++) {
      const name = names[i % names.length];
      const domain = domains[Math.floor(Math.random() * domains.length)];
      users.push({
        id: `user_${i + 1}`,
        email: `test${i + 1}@${domain}`,
        name: `${name} ${i + 1}`,
        role: i === 0 ? 'admin' : 'user',
        is_active: Math.random() > 0.2,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
    }

    return users;
  }

  generateDeliveries(count: number = 20): TestDelivery[] {
    const deliveries: TestDelivery[] = [];
    const products = ['오메가-3', '비타민 D', '프로바이오틱스', '마그네슘', '종합비타민', '콜라겐'];
    const statuses: TestDelivery['status'][] = ['pending', 'processing', 'shipped', 'delivered'];
    const names = ['김영수', '이미정', '박준호', '정하나', '최동욱', '강미선'];

    for (let i = 0; i < count; i++) {
      const customer = names[Math.floor(Math.random() * names.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      deliveries.push({
        id: `delivery_${i + 1}`,
        customer_name: customer,
        customer_phone: `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        address: `서울시 강남구 테헤란로 ${Math.floor(100 + Math.random() * 400)}`,
        product_name: product,
        quantity: Math.floor(1 + Math.random() * 3),
        delivery_date: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        notes: Math.random() > 0.7 ? '빠른 배송 요청' : undefined,
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      });
    }

    return deliveries;
  }

  generateForms(): TestForm[] {
    return [
      {
        id: 'form_1',
        title: '고객 만족도 조사',
        description: '제품과 서비스에 대한 의견을 들려주세요',
        questions: [
          { id: 'q1', type: 'rating', title: '제품 만족도', required: true },
          { id: 'q2', type: 'text', title: '개선사항', required: false },
        ],
        responses_count: 42,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'form_2',
        title: '상담 예약',
        description: '건강 상담을 예약하세요',
        questions: [
          { id: 'q1', type: 'text', title: '이름', required: true },
          { id: 'q2', type: 'email', title: '이메일', required: true },
          { id: 'q3', type: 'date', title: '희망 날짜', required: true },
        ],
        responses_count: 28,
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'form_3',
        title: '제품 문의',
        description: '궁금한 점을 문의해주세요',
        questions: [
          { id: 'q1', type: 'select', title: '문의 유형', options: ['성분', '복용법', '부작용', '기타'], required: true },
          { id: 'q2', type: 'textarea', title: '문의 내용', required: true },
        ],
        responses_count: 15,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ];
  }

  generateAppointments(count: number = 10): TestAppointment[] {
    const appointments: TestAppointment[] = [];
    const types = ['건강 상담', '제품 설명', '정기 구독 상담', '불편 사항 접수'];
    const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
    const names = ['김서연', '이준혁', '박시은', '정민준', '최지우'];

    for (let i = 0; i < count; i++) {
      const customer = names[Math.floor(Math.random() * names.length)];
      appointments.push({
        id: `appointment_${i + 1}`,
        customer_name: customer,
        customer_email: `${customer.toLowerCase().replace(/\s/g, '')}@example.com`,
        date: new Date(Date.now() + (i * 24 + Math.random() * 14 * 24) * 60 * 60 * 1000),
        time: times[Math.floor(Math.random() * times.length)],
        duration: 30,
        type: types[Math.floor(Math.random() * types.length)],
        status: Math.random() > 0.1 ? 'confirmed' : 'pending',
        notes: Math.random() > 0.7 ? '첫 방문 고객' : undefined,
      });
    }

    return appointments;
  }

  // 테스트 모드 활성화 시 localStorage에 데이터 저장
  initializeTestMode() {
    const testData = {
      users: this.generateUsers(),
      deliveries: this.generateDeliveries(),
      forms: this.generateForms(),
      appointments: this.generateAppointments(),
      initialized_at: new Date().toISOString(),
    };

    localStorage.setItem('testMode', 'true');
    localStorage.setItem('testData', JSON.stringify(testData));

    return testData;
  }

  // 테스트 데이터 가져오기
  getTestData() {
    const data = localStorage.getItem('testData');
    return data ? JSON.parse(data) : null;
  }

  // 테스트 모드 확인
  isTestMode() {
    return localStorage.getItem('testMode') === 'true';
  }

  // 테스트 모드 종료
  clearTestMode() {
    localStorage.removeItem('testMode');
    localStorage.removeItem('testData');
  }
}