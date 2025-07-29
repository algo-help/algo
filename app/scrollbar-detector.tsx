'use client';

import { useEffect } from 'react';

export function ScrollbarDetector() {
  useEffect(() => {
    // 스크롤바 너비 감지 및 CSS 변수 설정
    const detectScrollbarWidth = () => {
      // 임시 요소를 생성하여 스크롤바 너비 측정
      const outer = document.createElement('div');
      outer.style.visibility = 'hidden';
      outer.style.overflow = 'scroll';
      // msOverflowStyle를 any로 캐스팅하여 TypeScript 오류 해결
      (outer.style as any).msOverflowStyle = 'scrollbar';
      document.body.appendChild(outer);
      
      const inner = document.createElement('div');
      outer.appendChild(inner);
      
      const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
      outer.parentNode?.removeChild(outer);
      
      // CSS 변수로 스크롤바 너비 설정
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    };
    
    detectScrollbarWidth();
    
    // 창 크기 변경 시 재계산
    window.addEventListener('resize', detectScrollbarWidth);
    
    return () => {
      window.removeEventListener('resize', detectScrollbarWidth);
    };
  }, []);
  
  return null;
}