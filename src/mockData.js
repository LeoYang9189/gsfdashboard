import Mock from 'mockjs';

const Random = Mock.Random;

// 辅助函数：生成2024-2025年3月之间的随机日期
const generateRecentDate = () => {
  // 2024年1月1日
  const startDate = new Date(2024, 0, 1).getTime();
  // 2025年3月31日
  const endDate = new Date(2025, 2, 31).getTime();
  
  // 生成这个范围内的随机时间戳
  const randomTimestamp = startDate + Math.random() * (endDate - startDate);
  return new Date(randomTimestamp);
};

// 辅助函数：格式化日期为yyyy-MM-dd
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 辅助函数：格式化日期时间为yyyy-MM-dd HH:mm:ss
const formatDateTime = (date) => {
  const formattedDate = formatDate(date);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${formattedDate} ${hours}:${minutes}:${seconds}`;
};

// 国家/地区列表
const countries = [
  '中国', '美国', '英国', '法国', '德国', '日本', '韩国', '俄罗斯', 
  '澳大利亚', '加拿大', '新加坡', '马来西亚', '印度', '巴西', '南非'
];

// 生成申报总览数据
export const generateOverviewData = () => {
  return {
    totalDeclarations: Random.integer(5000, 10000),
    pendingReview: Random.integer(100, 500),
    approved: Random.integer(4000, 9000),
    rejected: Random.integer(50, 200),
    abnormalWarnings: Random.integer(10, 100),
    complianceRate: Random.float(90, 99.9, 1, 1),
    todayNewDeclarations: Random.integer(100, 300),
    weekGrowthRate: Random.float(-10, 20, 1, 1)
  };
};

// 生成趋势数据（最近30天）
export const generateTrendData = () => {
  const dates = [];
  const data = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(`${date.getMonth() + 1}/${date.getDate()}`);
    data.push(Random.integer(150, 350));
  }
  
  return {
    dates,
    data
  };
};

// 生成国家分布数据
export const generateCountryData = () => {
  return countries.map(country => ({
    country,
    value: Random.integer(100, 2000),
    complianceRate: Random.float(85, 99.9, 1, 1),
    avgProcessTime: Random.float(0.5, 6, 1, 1),
    abnormalRate: Random.float(0.1, 5, 1, 1)
  }));
};

// 生成异常预警数据
export const generateWarningData = () => {
  const vessels = ['EVER GIVEN', 'MSC OSCAR', 'MAERSK TRIPLE', 'CMA CGM ANTOINE', 'COSCO SHIPPING', 'ONE OCEAN'];
  const customsCodes = ['6H', '1H', '2Z'];
  const branches = ['上海分公司', '北京分公司', '广州分公司', '深圳分公司', '青岛分公司', '宁波分公司'];
  const creators = ['张三', '李四', '王五', '赵六', '钱七', '孙八'];
  
  return Mock.mock({
    'list|10-20': [{
      'id|+1': 1,
      'hbl': /HLXU[0-9]{8}/,
      'mbl': /MSCU[0-9]{6}/,
      'vessel': function() {
        return Random.pick(vessels);
      },
      'voyage': function() {
        return Random.string('upper', 1) + Random.string('number', 3);
      },
      'etd': function() {
        return formatDate(generateRecentDate());
      },
      'branch': function() {
        return Random.pick(branches);
      },
      'creator': function() {
        return Random.pick(creators);
      },
      'customsCode': function() {
        return Random.pick(customsCodes);
      },
      'codeReceivedTime': function() {
        return formatDateTime(generateRecentDate());
      },
      'duration': function() {
        return Random.integer(2, 48);
      }
    }]
  }).list;
};

// 生成最近申报列表
export const generateRecentDeclarations = () => {
  const vessels = ['EVER GIVEN', 'MSC OSCAR', 'MAERSK TRIPLE', 'CMA CGM ANTOINE', 'COSCO SHIPPING', 'ONE OCEAN'];
  const status = ['发送中', '接收成功', '1Y+3Z', '仅1Y', '仅3Z'];
  const warningTypes = ['', '6H', '1H', '2Z']; // 空白表示无预警
  const branches = ['上海分公司', '北京分公司', '广州分公司', '深圳分公司', '青岛分公司', '宁波分公司'];
  const creators = ['张三', '李四', '王五', '赵六', '钱七', '孙八'];
  
  return Mock.mock({
    'list|10': [{
      'id|+1': 1,
      'hbl': /HLXU[0-9]{8}/,
      'mbl': /MSCU[0-9]{6}/,
      'vessel': function() {
        return Random.pick(vessels);
      },
      'voyage': function() {
        return Random.string('upper', 1) + Random.string('number', 3);
      },
      'etd': function() {
        return formatDate(generateRecentDate());
      },
      'status': function() {
        return Random.pick(status);
      },
      'branch': function() {
        return Random.pick(branches);
      },
      'creator': function() {
        return Random.pick(creators);
      },
      'warning': function() {
        return Random.pick(warningTypes);
      }
    }]
  }).list;
};

// 生成所有模拟数据
export const generateAllMockData = () => {
  return {
    overview: generateOverviewData(),
    trend: generateTrendData(),
    countryData: generateCountryData(),
    warnings: generateWarningData(),
    recentDeclarations: generateRecentDeclarations()
  };
}; 