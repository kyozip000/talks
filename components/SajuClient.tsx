'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Users } from 'lucide-react';
import { calculateSaju, analyzeTeam, SajuData } from '@/lib/sajuCalculator';

export default function SajuClient() {
  const [members, setMembers] = useState<SajuData[]>([]);
  const [currentName, setCurrentName] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');

  const handleAddMember = () => {
    if (!currentName || !year || !month || !day) {
      alert('이름, 연도, 월, 일을 모두 입력해주세요!');
      return;
    }

    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    const hourNum = hour ? parseInt(hour) : undefined;
    const minuteNum = minute ? parseInt(minute) : undefined;

    // 유효성 검사
    if (yearNum < 1900 || yearNum > 2100) {
      alert('연도를 올바르게 입력해주세요 (1900-2100)');
      return;
    }
    if (monthNum < 1 || monthNum > 12) {
      alert('월을 올바르게 입력해주세요 (1-12)');
      return;
    }
    if (dayNum < 1 || dayNum > 31) {
      alert('일을 올바르게 입력해주세요 (1-31)');
      return;
    }
    if (hourNum !== undefined && (hourNum < 0 || hourNum > 23)) {
      alert('시간을 올바르게 입력해주세요 (0-23)');
      return;
    }

    const elements = calculateSaju(yearNum, monthNum, dayNum, hourNum, minuteNum);

    setMembers([
      ...members,
      {
        name: currentName,
        birthYear: yearNum,
        birthMonth: monthNum,
        birthDay: dayNum,
        birthHour: hourNum,
        birthMinute: minuteNum,
        elements,
      },
    ]);

    // 초기화
    setCurrentName('');
    setYear('');
    setMonth('');
    setDay('');
    setHour('');
    setMinute('');
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const analysis = members.length >= 2 ? analyzeTeam(members) : null;

  const elementColors = {
    wood: { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' },
    fire: { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500' },
    earth: { bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'bg-yellow-500' },
    metal: { bg: 'bg-gray-100', text: 'text-gray-700', bar: 'bg-gray-500' },
    water: { bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-blue-500' },
  };

  const elementNames = {
    wood: '목(木)',
    fire: '화(火)',
    earth: '토(土)',
    metal: '금(金)',
    water: '수(水)',
  };

  return (
    <div className="space-y-8">
      {/* 입력 폼 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border-2 border-gray-200 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users size={24} className="text-indigo-600" />
          팀원 추가하기
        </h3>

        <div className="space-y-4">
          {/* 이름 */}
          <input
            type="text"
            placeholder="이름"
            value={currentName}
            onChange={(e) => setCurrentName(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
          />

          {/* 생년월일 */}
          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              placeholder="연도 (예: 1999)"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
            <input
              type="number"
              placeholder="월 (1-12)"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              min="1"
              max="12"
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
            <input
              type="number"
              placeholder="일 (1-31)"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              min="1"
              max="31"
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* 시간 (선택) */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="시 (0-23, 선택)"
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              min="0"
              max="23"
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
            <input
              type="number"
              placeholder="분 (0-59, 선택)"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              min="0"
              max="59"
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddMember}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
          >
            <Plus size={20} />
            추가하기
          </motion.button>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          💡 태어난 시간을 입력하면 더 정확한 분석이 가능해요 (예: 1999년 10월 7일 오후 12시 30분 → 12, 30 입력)
        </p>
      </motion.div>

      {/* 나머지 코드는 동일... */}
      {/* (멤버 목록, 분석 결과 등은 이전과 동일) */}
    </div>
  );
}