export interface SajuData {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm (선택)
  elements: {
    wood: number; // 木
    fire: number; // 火
    earth: number; // 土
    metal: number; // 金
    water: number; // 水
  };
}

export interface TeamAnalysis {
  compatibility: number; // 궁합도 (0-100)
  teamElements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  insights: string[];
  relationships: {
    person1: string;
    person2: string;
    relation: string;
    description: string;
  }[];
}

// 천간 (10개)
const heavenlyStems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];

// 지지 (12개)
const earthlyBranches = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

// 오행 매핑
const stemElements: Record<string, keyof SajuData['elements']> = {
  '갑': 'wood', '을': 'wood',
  '병': 'fire', '정': 'fire',
  '무': 'earth', '기': 'earth',
  '경': 'metal', '신': 'metal',
  '임': 'water', '계': 'water',
};

const branchElements: Record<string, keyof SajuData['elements']> = {
  '인': 'wood', '묘': 'wood',
  '사': 'fire', '오': 'fire',
  '신': 'metal', '유': 'metal',
  '해': 'water', '자': 'water',
  '진': 'earth', '술': 'earth', '축': 'earth', '미': 'earth',
};

// 생년월일로 사주 계산 (간단 버전)
export function calculateSaju(birthDate: string, birthTime?: string): SajuData['elements'] {
  const date = new Date(birthDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const elements = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  // 년주 (간단 계산)
  const yearStem = heavenlyStems[year % 10];
  const yearBranch = earthlyBranches[year % 12];
  
  elements[stemElements[yearStem]]++;
  elements[branchElements[yearBranch]]++;

  // 월주
  const monthBranch = earthlyBranches[(month - 1) % 12];
  elements[branchElements[monthBranch]]++;

  // 일주
  const dayOffset = Math.floor((year * 365 + month * 30 + day) % 60);
  const dayStem = heavenlyStems[dayOffset % 10];
  const dayBranch = earthlyBranches[dayOffset % 12];
  
  elements[stemElements[dayStem]]++;
  elements[branchElements[dayBranch]]++;

  // 시주 (선택)
  if (birthTime) {
    const [hour] = birthTime.split(':').map(Number);
    const timeBranch = earthlyBranches[Math.floor(hour / 2) % 12];
    elements[branchElements[timeBranch]]++;
  }

  return elements;
}

// 팀 분석
export function analyzeTeam(members: SajuData[]): TeamAnalysis {
  // 팀 전체 오행 합계
  const teamElements = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  members.forEach(member => {
    teamElements.wood += member.elements.wood;
    teamElements.fire += member.elements.fire;
    teamElements.earth += member.elements.earth;
    teamElements.metal += member.elements.metal;
    teamElements.water += member.elements.water;
  });

  // 밸런스 계산 (표준편차로)
  const total = teamElements.wood + teamElements.fire + teamElements.earth + teamElements.metal + teamElements.water;
  const avg = total / 5;
  
  const variance = [
    Math.pow(teamElements.wood - avg, 2),
    Math.pow(teamElements.fire - avg, 2),
    Math.pow(teamElements.earth - avg, 2),
    Math.pow(teamElements.metal - avg, 2),
    Math.pow(teamElements.water - avg, 2),
  ].reduce((a, b) => a + b, 0) / 5;

  const stdDev = Math.sqrt(variance);
  
  // 궁합도: 표준편차가 낮을수록 균형잡힘 (100점 만점)
  const compatibility = Math.max(0, Math.min(100, 100 - (stdDev * 10)));

  // 인사이트 생성
  const insights: string[] = [];
  
  const elementNames = {
    wood: '목(木)',
    fire: '화(火)',
    earth: '토(土)',
    metal: '금(金)',
    water: '수(水)',
  };

  // 가장 많은/적은 오행
  const sorted = Object.entries(teamElements).sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  if (strongest[1] > avg * 1.5) {
    insights.push(`팀에 ${elementNames[strongest[0] as keyof typeof elementNames]}기운이 매우 강합니다. 추진력과 에너지가 넘치는 팀입니다! 🔥`);
  }

  if (weakest[1] < avg * 0.5) {
    insights.push(`${elementNames[weakest[0] as keyof typeof elementNames]}기운이 부족합니다. 이 부분을 보완할 멤버가 필요할 수 있어요.`);
  }

  if (compatibility >= 80) {
    insights.push('오행 밸런스가 훌륭합니다! 조화로운 팀워크가 기대됩니다. ✨');
  } else if (compatibility >= 60) {
    insights.push('전반적으로 좋은 궁합입니다. 서로 보완하며 성장할 수 있어요.');
  } else {
    insights.push('오행 편차가 있지만, 이를 인지하고 소통하면 극복할 수 있습니다!');
  }

  // 개인 간 관계 분석
  const relationships = [];
  
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const person1 = members[i];
      const person2 = members[j];
      
      // 상생/상극 관계 찾기
      const relation = findRelation(person1.elements, person2.elements);
      
      relationships.push({
        person1: person1.name,
        person2: person2.name,
        relation: relation.type,
        description: relation.description,
      });
    }
  }

  return {
    compatibility,
    teamElements,
    insights,
    relationships: relationships.slice(0, 5), // 상위 5개만
  };
}

// 상생/상극 판단
function findRelation(
  elem1: SajuData['elements'], 
  elem2: SajuData['elements']
): { type: string; description: string } {
  // 각자 가장 강한 오행
  const sorted1 = Object.entries(elem1).sort((a, b) => b[1] - a[1]);
  const sorted2 = Object.entries(elem2).sort((a, b) => b[1] - a[1]);
  
  const strong1 = sorted1[0][0];
  const strong2 = sorted2[0][0];

  // 상생 관계 (木→火→土→金→水→木)
  const supportMap: Record<string, string> = {
    'wood': 'fire',
    'fire': 'earth',
    'earth': 'metal',
    'metal': 'water',
    'water': 'wood',
  };

  // 상극 관계 (木剋土, 土剋水, 水剋火, 火剋金, 金剋木)
  const conflictMap: Record<string, string> = {
    'wood': 'earth',
    'earth': 'water',
    'water': 'fire',
    'fire': 'metal',
    'metal': 'wood',
  };

  if (supportMap[strong1] === strong2) {
    return {
      type: '상생 🌱',
      description: '서로를 발전시키는 관계입니다',
    };
  }

  if (supportMap[strong2] === strong1) {
    return {
      type: '상생 🌱',
      description: '서로를 북돋우는 좋은 관계입니다',
    };
  }

  if (conflictMap[strong1] === strong2 || conflictMap[strong2] === strong1) {
    return {
      type: '상극 ⚡',
      description: '견제하며 균형을 이루는 관계입니다',
    };
  }

  return {
    type: '평화 ☮️',
    description: '안정적이고 편안한 관계입니다',
  };
}  