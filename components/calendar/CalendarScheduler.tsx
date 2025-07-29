'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, addDays, startOfWeek, isSameDay, isToday } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Clock, Calendar, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimeSlot {
  time: string
  available: boolean
}

interface CalendarSchedulerProps {
  onSelectDateTime?: (date: Date, time: string) => void
  workingHours?: {
    start: string
    end: string
  }
  workingDays?: number[]
  duration?: number
  bufferTime?: number
  formId?: string
  onBookingConfirm?: (bookingData: any) => void
}

export function CalendarScheduler({
  onSelectDateTime,
  workingHours = { start: '09:00', end: '18:00' },
  workingDays = [1, 2, 3, 4, 5], // 월-금
  duration = 30,
  bufferTime = 15,
  formId,
  onBookingConfirm
}: CalendarSchedulerProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [bookedSlots, setBookedSlots] = useState<any[]>([])

  useEffect(() => {
    // 기존 예약 정보 로드
    const savedAppointments = JSON.parse(localStorage.getItem('formtime_appointments') || '[]')
    setBookedSlots(savedAppointments)
  }, [])

  // 주간 날짜 생성
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // 시간 슬롯 생성
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const [startHour, startMinute] = workingHours.start.split(':').map(Number)
    const [endHour, endMinute] = workingHours.end.split(':').map(Number)
    
    const startTime = startHour * 60 + startMinute
    const endTime = endHour * 60 + endMinute
    
    for (let time = startTime; time < endTime; time += duration) {
      const hour = Math.floor(time / 60)
      const minute = time % 60
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      
      // 실제 예약 상태 확인
      const slotDateTime = new Date(date)
      slotDateTime.setHours(hour, minute, 0, 0)
      
      const isBooked = bookedSlots.some(appointment => {
        const appointmentStart = new Date(appointment.start_time)
        const appointmentEnd = new Date(appointment.end_time)
        return slotDateTime >= appointmentStart && slotDateTime < appointmentEnd
      })
      
      // 과거 시간은 예약 불가
      const now = new Date()
      const isPast = slotDateTime < now
      
      slots.push({
        time: timeString,
        available: !isBooked && !isPast
      })
    }
    
    return slots
  }

  const handlePrevWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7))
  }

  const handleNextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7))
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleTimeSelect = (time: string) => {
    if (selectedDate) {
      setSelectedTime(time)
      onSelectDateTime?.(selectedDate, time)
    }
  }

  const isWorkingDay = (date: Date) => {
    return workingDays.includes(date.getDay())
  }

  const handleBookingConfirm = () => {
    if (!selectedDate || !selectedTime) return
    
    const [hour, minute] = selectedTime.split(':').map(Number)
    const startDateTime = new Date(selectedDate)
    startDateTime.setHours(hour, minute, 0, 0)
    
    const endDateTime = new Date(startDateTime)
    endDateTime.setMinutes(endDateTime.getMinutes() + duration)
    
    const bookingData = {
      id: `appointment_${Date.now()}`,
      title: '새 예약',
      description: '폼을 통해 예약된 미팅',
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      time_zone: 'Asia/Seoul',
      meeting_type: 'online',
      status: 'confirmed',
      form_id: formId,
      user_id: 'test-user-123',
      created_at: new Date().toISOString()
    }
    
    // 로컬 스토리지에 예약 추가
    const savedAppointments = JSON.parse(localStorage.getItem('formtime_appointments') || '[]')
    savedAppointments.push(bookingData)
    localStorage.setItem('formtime_appointments', JSON.stringify(savedAppointments))
    
    // 예약 목록 업데이트
    setBookedSlots(savedAppointments)
    
    // 부모 컴포넌트에 콜백 호출
    if (onBookingConfirm) {
      onBookingConfirm(bookingData)
    }
    
    // 선택 상태 초기화
    setSelectedDate(null)
    setSelectedTime(null)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>날짜 및 시간 선택</span>
            </CardTitle>
            <CardDescription>
              원하는 날짜와 시간을 선택해주세요. 예약 가능한 시간만 표시됩니다.
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrevWeek}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Badge variant="outline" className="min-w-[120px] justify-center">
              {format(weekStart, 'yyyy년 M월', { locale: ko })}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleNextWeek}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 캘린더 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium">날짜 선택</h3>
            </div>
            
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                <div 
                  key={day} 
                  className={cn(
                    "text-center text-xs font-medium py-2",
                    index === 0 || index === 6 ? "text-red-500" : "text-muted-foreground"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((date) => {
                const isSelected = selectedDate && isSameDay(date, selectedDate)
                const isCurrentDay = isToday(date)
                const isWorking = isWorkingDay(date)
                
                return (
                  <Button
                    key={date.toISOString()}
                    variant="ghost"
                    size="sm"
                    onClick={() => isWorking && handleDateSelect(date)}
                    disabled={!isWorking}
                    className={cn(
                      "aspect-square p-0 h-auto text-sm font-normal transition-all",
                      isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                      !isSelected && isCurrentDay && "bg-accent text-accent-foreground",
                      !isWorking && "text-muted-foreground opacity-50 cursor-not-allowed",
                      isWorking && !isSelected && !isCurrentDay && "hover:bg-accent"
                    )}
                  >
                    {format(date, 'd')}
                  </Button>
                )
              })}
            </div>

            {/* 범례 */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-sm"></div>
                <span>선택됨</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-accent rounded-sm"></div>
                <span>오늘</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-muted rounded-sm"></div>
                <span>예약 불가</span>
              </div>
            </div>
          </div>

          {/* 시간 선택 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium">시간 선택</h3>
              {selectedDate && (
                <Badge variant="outline" className="ml-auto">
                  {format(selectedDate, 'M월 d일 (E)', { locale: ko })}
                </Badge>
              )}
            </div>
            
            {selectedDate ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {generateTimeSlots(selectedDate).map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    onClick={() => slot.available && handleTimeSelect(slot.time)}
                    disabled={!slot.available}
                    className={cn(
                      "w-full justify-start text-left h-auto py-3",
                      !slot.available && "opacity-50 line-through",
                      selectedTime === slot.time && "ring-2 ring-primary ring-offset-2"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-3">
                        {selectedTime === slot.time && (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        <span className="font-medium">{slot.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={slot.available ? "secondary" : "destructive"}
                          className="text-xs"
                        >
                          {slot.available ? `${duration}분` : '예약됨'}
                        </Badge>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm">먼저 날짜를 선택해주세요</p>
              </div>
            )}
          </div>
        </div>

        {/* 선택된 정보 표시 */}
        {selectedDate && selectedTime && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>선택된 예약 시간</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(selectedDate, 'yyyy년 M월 d일 (E)', { locale: ko })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{selectedTime}</span>
                      <Badge variant="secondary" className="text-xs">
                        {duration}분
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" className="shrink-0" onClick={handleBookingConfirm}>
                    예약 확정하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}