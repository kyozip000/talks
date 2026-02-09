'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Calendar, Clock, Users } from 'lucide-react';
import { calculateSaju, analyzeTeam, SajuData } from '@/lib/sajuCalculator';

export default function SajuClient() {
  const [members, setMembers] = useState<SajuData[]>([]);
  const [currentName, setCurrentName] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  const handleAddMember = () => {
    if (!currentName || !currentDate) {
      alert('이름과 생년월일을 입력해주세요!');
      return;
    }

    const elements = calculateSaju(currentDate, currentTime || undefined);

    setMembers([
      ...members,
      {
        name: currentName,
        birthDate: currentDate,
        birthTime: currentTime || undefined,
        elements,
      },
    ]);

    // 초기화
    setCurrentName('');
    setCurrentDate('');
    setCurrentTime('');
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="이름"
            value={currentName}
            onChange={(e) => setCurrentName(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
          />

          <div className="relative">
            <Calendar size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="relative">
            <Clock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="time"
              value={currentTime}
              onChange={(e) => setCurrentTime(e.target.value)}
              placeholder="태어난 시간 (선택)"
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddMember}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
          >
            <Plus size={20} />
            추가
          </motion.button>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          💡 태어난 시간을 입력하면 더 정확한 분석이 가능해요
        </p>
      </motion.div>

      {/* 멤버 목록 */}
      {members.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {members.map((member, index) => (
              <motion.div
                key={`${member.name}-${index}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="bg-white rounded-2xl border-2 border-gray-200 p-5 relative"
              >
                <button
                  onClick={() => handleRemoveMember(index)}
                  className="absolute top-3 right-3 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                >
                  <X size={14} />
                </button>

                <h4 className="font-bold text-gray-900 mb-1">{member.name}</h4>
                <p className="text-xs text-gray-500 mb-4">
                  {member.birthDate} {member.birthTime && `(${member.birthTime})`}
                </p>

                <div className="space-y-2">
                  {(Object.keys(member.elements) as Array<keyof typeof member.elements>).map((elem) => (
                    <div key={elem}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={elementColors[elem].text}>
                          {elementNames[elem]}
                        </span>
                        <span className="font-bold">{member.elements[elem]}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${elementColors[elem].bar}`}
                          style={{ width: `${(member.elements[elem] / 8) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 팀 분석 결과 */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* 궁합도 */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border-2 border-indigo-200 p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              팀 궁합도
            </h3>
            <div className="relative w-48 h-48 mx-auto mb-4">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="16"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="16"
                  strokeDasharray={`${(analysis.compatibility / 100) * 502.4} 502.4`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {Math.round(analysis.compatibility)}
                  </div>
                  <div className="text-sm text-gray-600">점</div>
                </div>
              </div>
            </div>
          </div>

          {/* 팀 오행 밸런스 */}
          <div className="bg-white rounded-3xl border-2 border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              팀 오행 밸런스
            </h3>
            <div className="space-y-3">
              {(Object.keys(analysis.teamElements) as Array<keyof typeof analysis.teamElements>).map((elem) => (
                <div key={elem}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className={`font-bold ${elementColors[elem].text}`}>
                      {elementNames[elem]}
                    </span>
                    <span className="font-bold">{analysis.teamElements[elem]}</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(analysis.teamElements[elem] / (members.length * 8)) * 100}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={elementColors[elem].bar}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 인사이트 */}
          <div className="bg-white rounded-3xl border-2 border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              💡 분석 결과
            </h3>
            <div className="space-y-3">
              {analysis.insights.map((insight, idx) => (
                <motion.div
                  key={idx}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200"
                >
                  <p className="text-sm text-gray-700">{insight}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 관계 분석 */}
          <div className="bg-white rounded-3xl border-2 border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              🤝 팀원 간 관계
            </h3>
            <div className="space-y-3">
              {analysis.relationships.map((rel, idx) => (
                <motion.div
                  key={idx}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div>
                    <p className="font-bold text-gray-900">
                      {rel.person1} ↔ {rel.person2}
                    </p>
                    <p className="text-sm text-gray-600">{rel.description}</p>
                  </div>
                  <span className="text-2xl">{rel.relation}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* 안내 메시지 */}
      {members.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">🔮</div>
          <p className="text-gray-600 text-lg mb-2">
            팀원을 추가해주세요
          </p>
          <p className="text-gray-400 text-sm">
            2명 이상 입력하면 궁합 분석이 시작됩니다
          </p>
        </div>
      )}

      {members.length === 1 && (
        <div className="text-center py-12 bg-blue-50 rounded-3xl border-2 border-blue-200">
          <p className="text-blue-700 font-medium">
            한 명 더 추가하면 궁합 분석을 시작할 수 있어요! 👥
          </p>
        </div>
      )}
    </div>
  );
} 