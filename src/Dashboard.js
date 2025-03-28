import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Table, 
  Tag, 
  Typography, 
  Divider, 
  Alert,
  Spin,
  Tabs,
  Radio,
  DatePicker,
  Space,
  Button,
  Input,
  Form,
  message,
  Tooltip
} from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  SendOutlined,
  CheckSquareOutlined,
  SearchOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { generateAllMockData } from './mockData';
import locale from 'antd/es/date-picker/locale/zh_CN';
import dayjs from 'dayjs';
import { Random } from 'mockjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filteredWarnings, setFilteredWarnings] = useState([]); // 添加过滤后的预警数据状态
  const [filteredDeclarations, setFilteredDeclarations] = useState([]); // 添加过滤后的申报数据状态
  const [activeTab, setActiveTab] = useState('AMS');
  const [timeType, setTimeType] = useState('create');
  const [dateRange, setDateRange] = useState([null, null]);
  const [quickSelect, setQuickSelect] = useState('');
  const [matchType, setMatchType] = useState('all');
  const [warningType, setWarningType] = useState('receive_fail'); // 新增异常预警类型状态
  const [trendMetric, setTrendMetric] = useState('total');
  const [portType, setPortType] = useState('origin');
  const [portMetric, setPortMetric] = useState('total');
  const [form] = Form.useForm();
  const warningTableRef = React.useRef(null); // 添加对异常预警表格的引用

  // 模拟数据加载
  useEffect(() => {
    setTimeout(() => {
      const mockData = generateAllMockData();
      setData(mockData);
      setFilteredWarnings(mockData.warnings); // 初始化过滤后的预警数据
      setFilteredDeclarations(mockData.recentDeclarations); // 初始化过滤后的申报数据
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>数据加载中...</p>
      </div>
    );
  }

  // Tab切换项配置
  const tabItems = [
    {
      key: 'AMS',
      label: 'AMS',
    },
    {
      key: 'ISF',
      label: 'ISF',
    },
    {
      key: 'ICS2',
      label: 'ICS2',
    },
    {
      key: 'AFR',
      label: 'AFR',
    },
    {
      key: 'eManifest',
      label: 'eManifest',
    },
    {
      key: 'ACI',
      label: 'ACI',
    }
  ];

  // Tab切换处理函数
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // 时间类型选择处理函数
  const handleTimeTypeChange = (e) => {
    setTimeType(e.target.value);
    
    // 如果已经选择了日期范围，则改变时间类型后重新筛选数据
    if (dateRange && dateRange[0] && dateRange[1]) {
      setTimeout(() => {
        handleSearch();
      }, 100);
    }
  };

  // 日期范围选择处理函数
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    setQuickSelect('');
    form.setFieldsValue({ dateRange: dates });
  };

  // 快速选择处理函数
  const handleQuickSelectChange = (value) => {
    setQuickSelect(value);
    
    const now = dayjs();
    let startDate = null;
    let endDate = now;
    
    if (value === 'week') {
      // 本周
      const day = now.day() || 7; // 如果是0（周日）则设为7
      startDate = now.subtract(day - 1, 'day').startOf('day');
    } else if (value === 'month') {
      // 本月
      startDate = now.startOf('month');
    } else if (value === 'year') {
      // 本年
      startDate = now.startOf('year');
    }
    
    setDateRange([startDate, endDate]);
    form.setFieldsValue({ dateRange: [startDate, endDate] });
    
    // 快速选择后立即应用筛选条件
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  // 查询按钮处理函数
  const handleSearch = () => {
    form.validateFields().then(values => {
      const { dateRange } = values;
      
      // 如果没有选择日期范围，显示所有数据
      if (!dateRange || !dateRange[0] || !dateRange[1]) {
        setFilteredWarnings(data.warnings);
        setFilteredDeclarations(data.recentDeclarations);
        message.success('显示所有数据');
        return;
      }
      
      // 将日期范围转换为时间戳，便于比较
      const startTime = dateRange[0].startOf('day').valueOf();
      const endTime = dateRange[1].endOf('day').valueOf();
      
      // 根据所选时间类型和日期范围过滤预警数据
      const filteredWarnings = data.warnings.filter(item => {
        // 根据不同的时间类型选择对应的日期字段
        let itemTime;
        if (timeType === 'create') {
          // 使用代码收到时间作为创建时间
          itemTime = new Date(item.codeReceivedTime).getTime();
        } else {
          // 其他时间类型暂时也使用代码收到时间
          itemTime = new Date(item.codeReceivedTime).getTime();
        }
        
        // 判断时间是否在选定的日期范围内
        return itemTime >= startTime && itemTime <= endTime;
      });
      
      // 根据所选时间类型和日期范围过滤申报数据
      const filteredDeclarations = data.recentDeclarations.filter(item => {
        // 根据不同的时间类型选择对应的日期字段
        let itemTime;
        if (timeType === 'create') {
          itemTime = new Date(item.submitTime).getTime();
        } else {
          // 其他时间类型暂时也使用提交时间
          itemTime = new Date(item.submitTime).getTime();
        }
        
        // 判断时间是否在选定的日期范围内
        return itemTime >= startTime && itemTime <= endTime;
      });
      
      // 更新过滤后的数据状态
      setFilteredWarnings(filteredWarnings);
      setFilteredDeclarations(filteredDeclarations);
      
      message.success('查询条件已应用');
    });
  };

  // 处理匹配类型切换
  const handleMatchTypeChange = (type) => {
    setMatchType(type);
  };

  // 处理趋势图数据维度切换
  const handleTrendMetricChange = (metric) => {
    setTrendMetric(metric);
    // 不再设置portMetric，完全分离两个图表
  };

  // 处理港口类型切换
  const handlePortTypeChange = (type) => {
    setPortType(type);
    // 只修改港口类型，不影响任何其他状态
  };
  
  // 新增：同步更新饼图的统计维度（当点击统计卡片时调用）
  const handleMetricChange = (metric) => {
    setTrendMetric(metric); // 更新折线图维度
    setPortMetric(metric);  // 同时更新饼图维度
    
    // 当点击异常预警卡片时，滚动到异常预警表格
    if (metric === 'warning' && warningTableRef.current) {
      setTimeout(() => {
        warningTableRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  };

  // 处理异常预警类型切换
  const handleWarningTypeChange = (type) => {
    setWarningType(type);
    // 根据不同的异常预警类型过滤数据
    const filteredData = data.warnings.filter(item => {
      switch(type) {
        case 'receive_fail':
          return item.warningType === 'receive_fail';
        case 'rfi':
          return item.warningType === 'rfi';
        case 'rfs':
          return item.warningType === 'rfs';
        case 'other':
          return item.warningType === 'other';
        default:
          return true;
      }
    });
    setFilteredWarnings(filteredData);
  };

  // 根据时间范围生成日期数组
  const generateDateRange = () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      // 默认显示最近30天
      const dates = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(dayjs(date).format('MM/DD'));
      }
      return dates;
    }

    const start = dateRange[0];
    const end = dateRange[1];
    const dates = [];
    let current = start;

    while (current.isBefore(end) || current.isSame(end, 'day')) {
      dates.push(current.format('MM/DD'));
      current = current.add(1, 'day');
    }

    return dates;
  };

  // 根据选择的维度生成趋势数据
  const generateTrendData = () => {
    const dates = generateDateRange();
    const data = dates.map(() => {
      switch (trendMetric) {
        case 'total':
          return Random.integer(150, 350);
        case 'pending':
          return Random.integer(50, 150);
        case 'approved':
          return Random.integer(100, 250);
        case 'matched':
          return Random.integer(80, 200);
        case 'warning':
          return Random.integer(10, 50);
        default:
          return Random.integer(150, 350);
      }
    });

    return {
      dates,
      data
    };
  };

  // 根据匹配类型计算数值
  const getMatchValue = () => {
    const baseValue = Math.floor(data.overview.approved * 0.85);
    switch(matchType) {
      case 'all':
        return baseValue;
      case '1y':
        return Math.floor(baseValue * 0.6); // 假设1Y占总匹配的60%
      case '3z':
        return Math.floor(baseValue * 0.4); // 假设3Z占总匹配的40%
      default:
        return baseValue;
    }
  };

  // 趋势图配置
  const trendChartOption = {
    title: {
      text: '舱单申报趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const date = params[0].axisValue;
        const value = params[0].value;
        let metricName = '';
        switch (trendMetric) {
          case 'total':
            metricName = '总申报量';
            break;
          case 'pending':
            metricName = '发送中';
            break;
          case 'approved':
            metricName = '接收成功';
            break;
          case 'matched':
            metricName = '匹配成功';
            break;
          case 'warning':
            metricName = '异常预警';
            break;
          default:
            metricName = '总申报量';
        }
        return `${date}<br/>${metricName}: ${value}`;
      }
    },
    xAxis: {
      type: 'category',
      data: generateTrendData().dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: generateTrendData().data,
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#1890ff'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(24, 144, 255, 0.6)'
              },
              {
                offset: 1,
                color: 'rgba(24, 144, 255, 0.1)'
              }
            ]
          }
        }
      }
    ]
  };

  // 根据港口类型生成港口数据（仅用于饼图，不影响折线图）
  const generatePortData = () => {
    // 定义起运港和目的港数据
    const originPorts = [
      { name: 'Shanghai', value: Random.integer(1000, 3000) },
      { name: 'Ningbo', value: Random.integer(800, 2000) },
      { name: 'Qingdao', value: Random.integer(600, 1500) },
      { name: 'Dalian', value: Random.integer(500, 1200) },
      { name: 'Guangzhou', value: Random.integer(400, 1000) },
      { name: 'Shenzhen', value: Random.integer(300, 900) },
      { name: 'Xiamen', value: Random.integer(200, 700) },
      { name: 'Tianjin', value: Random.integer(100, 500) }
    ];
    
    const destinationPorts = [
      { name: 'Los Angeles', value: Random.integer(800, 2000) },
      { name: 'Long Beach', value: Random.integer(700, 1800) },
      { name: 'New York', value: Random.integer(600, 1500) },
      { name: 'Rotterdam', value: Random.integer(500, 1300) },
      { name: 'Singapore', value: Random.integer(400, 1200) },
      { name: 'Hamburg', value: Random.integer(300, 900) },
      { name: 'Antwerp', value: Random.integer(200, 800) },
      { name: 'Tokyo', value: Random.integer(100, 600) }
    ];
    
    // 根据当前选择的统计指标调整数据值
    const adjustData = (data) => {
      // 应用时间范围影响因子 - 选择范围越短，数据量越小
      let timeFactor = 1.0;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const daysDiff = dateRange[1].diff(dateRange[0], 'day') + 1;
        if (daysDiff <= 7) {
          timeFactor = 0.3; // 一周以内
        } else if (daysDiff <= 30) {
          timeFactor = 0.6; // 一个月以内
        } else if (daysDiff <= 90) {
          timeFactor = 0.8; // 三个月以内
        }
      }
      
      return data.map(item => {
        let ratio = 1.0;
        // 应用统计指标影响因子 - 使用portMetric而非trendMetric
        switch(portMetric) {
          case 'total':
            ratio = 1.0;
            break;
          case 'pending':
            ratio = 0.3;
            break;
          case 'approved':
            ratio = 0.6;
            break;
          case 'matched':
            ratio = 0.5;
            break;
          case 'warning':
            ratio = 0.1;
            break;
          default:
            ratio = 1.0;
        }
        
        // 同时应用时间因子和统计指标因子
        return {
          ...item,
          value: Math.floor(item.value * ratio * timeFactor)
        };
      });
    };
    
    // 根据港口类型返回对应的数据
    return portType === 'origin' ? adjustData(originPorts) : adjustData(destinationPorts);
  };

  // 获取港口分布图标题 - 仅用于饼图
  const getPortChartTitle = () => {
    let metricName = '';
    switch (portMetric) {
      case 'total':
        metricName = '总申报量';
        break;
      case 'pending':
        metricName = '发送中';
        break;
      case 'approved':
        metricName = '接收成功';
        break;
      case 'matched':
        metricName = '匹配成功';
        break;
      case 'warning':
        metricName = '异常预警';
        break;
      default:
        metricName = '总申报量';
    }
    
    const portTypeName = portType === 'origin' ? '起运港' : '目的港';
    return `${portTypeName}${metricName}分布`;
  };

  // 国家分布图配置
  const portDistributionChartOption = {
    title: {
      text: getPortChartTitle(),
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      type: 'scroll',
      pageIconSize: 10,
      pageTextStyle: {
        color: '#888'
      }
    },
    series: [
      {
        name: portType === 'origin' ? '起运港' : '目的港',
        type: 'pie',
        radius: '50%',
        data: generatePortData(),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          formatter: '{b}: {c} ({d}%)'
        }
      }
    ]
  };

  // 生成欧盟入境国分布数据
  const generateEUEntryData = () => {
    const euCountries = [
      { name: '德国', code: 'DE' },
      { name: '法国', code: 'FR' },
      { name: '荷兰', code: 'NL' },
      { name: '比利时', code: 'BE' },
      { name: '意大利', code: 'IT' },
      { name: '西班牙', code: 'ES' },
      { name: '波兰', code: 'PL' },
      { name: '瑞典', code: 'SE' },
      { name: '奥地利', code: 'AT' },
      { name: '丹麦', code: 'DK' },
      { name: '芬兰', code: 'FI' },
      { name: '捷克', code: 'CZ' },
      { name: '葡萄牙', code: 'PT' },
      { name: '希腊', code: 'GR' },
      { name: '匈牙利', code: 'HU' },
      { name: '斯洛伐克', code: 'SK' },
      { name: '爱尔兰', code: 'IE' },
      { name: '罗马尼亚', code: 'RO' },
      { name: '保加利亚', code: 'BG' },
      { name: '克罗地亚', code: 'HR' },
      { name: '立陶宛', code: 'LT' },
      { name: '斯洛文尼亚', code: 'SI' },
      { name: '拉脱维亚', code: 'LV' },
      { name: '爱沙尼亚', code: 'EE' },
      { name: '卢森堡', code: 'LU' },
      { name: '塞浦路斯', code: 'CY' },
      { name: '马耳他', code: 'MT' }
    ];

    return euCountries.map(country => ({
      name: `${country.name}(${country.code})`,
      value: Random.integer(50, 500)
    }));
  };

  // 欧盟入境国分布图配置
  const euEntryChartOption = {
    title: {
      text: '第一欧盟入境国分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',  // 增加底部空间以显示横向滚动条
      containLabel: true
    },
    dataZoom: [
      {
        type: 'slider',  // 使用滑动条型数据区域缩放组件
        show: true,
        xAxisIndex: [0],
        start: 0,
        end: 40  // 默认显示前40%的数据
      },
      {
        type: 'inside',  // 使用内置型数据区域缩放组件
        xAxisIndex: [0],
        start: 0,
        end: 40
      }
    ],
    xAxis: {
      type: 'category',
      data: generateEUEntryData().map(item => item.name),
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '申报数量'
    },
    series: [
      {
        data: generateEUEntryData().map(item => item.value),
        type: 'bar',
        barWidth: '40%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: '#83bff6'
            }, {
              offset: 1,
              color: '#188df0'
            }]
          }
        }
      }
    ]
  };

  // 渲染时间选择控件
  const renderTimeSelector = () => {
    return (
      <>
        <div className="time-selector">
          <Form form={form} layout="vertical" initialValues={{ timeType, dateRange }}>
            <Row gutter={[24, 0]} align="middle">
              <Col span={5}>
                <Form.Item label="时间类型" name="timeType">
                  <Radio.Group 
                    value={timeType} 
                    onChange={handleTimeTypeChange} 
                    buttonStyle="solid"
                    className="time-type-group"
                  >
                    <Radio.Button value="create">创建时间</Radio.Button>
                    <Radio.Button value="firstSend">首次发送</Radio.Button>
                    <Radio.Button value="update">更新时间</Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={15}>
                <Form.Item label="时间范围" name="dateRange">
                  <Space size="middle">
                    <Button 
                      type={quickSelect === 'week' ? 'primary' : 'default'} 
                      onClick={() => handleQuickSelectChange('week')}
                      className={quickSelect === 'week' ? 'quick-select-btn quick-select-btn-active' : 'quick-select-btn'}
                    >
                      本周
                    </Button>
                    <Button 
                      type={quickSelect === 'month' ? 'primary' : 'default'} 
                      onClick={() => handleQuickSelectChange('month')}
                      className={quickSelect === 'month' ? 'quick-select-btn quick-select-btn-active' : 'quick-select-btn'}
                    >
                      本月
                    </Button>
                    <Button 
                      type={quickSelect === 'year' ? 'primary' : 'default'} 
                      onClick={() => handleQuickSelectChange('year')}
                      className={quickSelect === 'year' ? 'quick-select-btn quick-select-btn-active' : 'quick-select-btn'}
                    >
                      本年
                    </Button>
                    <RangePicker 
                      value={dateRange} 
                      onChange={handleDateRangeChange} 
                      locale={locale}
                      allowClear={true}
                      placeholder={['开始日期', '结束日期']}
                      style={{ width: 280 }}
                      suffixIcon={<CalendarOutlined />}
                    />
                    <Button 
                      type="primary" 
                      icon={<SearchOutlined />} 
                      onClick={handleSearch}
                      className="search-btn"
                    >
                      查询
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
        
        {/* 安全预警提示 */}
        <Alert
          description={`当前有 ${data.overview.abnormalWarnings} 条异常预警待处理，请及时查看并处理。`}
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
          className="warning-alert"
        />
      </>
    );
  };

  // 渲染AMS面板
  const renderAMSPanel = () => {
    return (
      <>
        {renderTimeSelector()}
        
        {/* 数据概览卡片 */}
        <Row gutter={[16, 16]} className="data-overview">
          <Col span={4}>
            <Card 
              className={`stats-card info-card ${trendMetric === 'total' ? 'active' : ''}`}
              onClick={() => handleMetricChange('total')}
            >
              <Statistic
                title="总申报单量"
                value={data.overview.totalDeclarations}
                precision={0}
                valueStyle={{ color: '#1890ff' }}
                prefix={<SafetyOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card 
              className={`stats-card ${trendMetric === 'pending' ? 'active' : ''}`}
              onClick={() => handleMetricChange('pending')}
            >
              <Statistic
                title="发送中"
                value={data.overview.pendingReview}
                precision={0}
                valueStyle={{ color: '#faad14' }}
                prefix={<SendOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card 
              className={`stats-card ${trendMetric === 'approved' ? 'active' : ''}`}
              onClick={() => handleMetricChange('approved')}
            >
              <Statistic
                title="接收成功"
                value={data.overview.approved}
                precision={0}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card 
              className={`stats-card ${trendMetric === 'matched' ? 'active' : ''}`}
              onClick={() => handleMetricChange('matched')}
            >
              <Statistic
                title={
                  <div>
                    <span style={{ marginRight: '8px' }}>匹配成功</span>
                    <Radio.Group 
                      size="small" 
                      value={matchType} 
                      onChange={(e) => handleMatchTypeChange(e.target.value)}
                      style={{ marginLeft: '4px' }}
                      buttonStyle="solid"
                      className="match-type-tabs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Radio.Button value="all">1Y+3Z</Radio.Button>
                      <Radio.Button value="1y">仅1Y</Radio.Button>
                      <Radio.Button value="3z">仅3Z</Radio.Button>
                    </Radio.Group>
                  </div>
                }
                value={getMatchValue()}
                precision={0}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckSquareOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card 
              className={`stats-card error-card ${trendMetric === 'receive_fail' ? 'active' : ''}`}
              onClick={() => handleMetricChange('receive_fail')}
            >
              <Statistic
                title="接收失败"
                value={data.overview.receiveFailed || 25}
                precision={0}
                valueStyle={{ color: '#ff7875' }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card 
              className={`stats-card warning-card ${trendMetric === 'warning' ? 'active' : ''}`}
              onClick={() => handleMetricChange('warning')}
            >
              <Statistic
                title="异常预警"
                value={data.overview.abnormalWarnings}
                precision={0}
                valueStyle={{ color: '#cf1322' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
        
        {/* 图表区域 */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card className="chart-container">
              <ReactECharts option={trendChartOption} style={{ height: '350px' }} />
            </Card>
          </Col>
          <Col span={12}>
            <Card className="chart-container" onClick={(e) => e.stopPropagation()}>
              <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <Radio.Group 
                  value={portType} 
                  onChange={(e) => handlePortTypeChange(e.target.value)}
                  buttonStyle="solid"
                  className="port-type-tabs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Radio.Button value="origin">起运港</Radio.Button>
                  <Radio.Button value="destination">目的港</Radio.Button>
                </Radio.Group>
              </div>
              <ReactECharts option={portDistributionChartOption} style={{ height: '320px' }} />
            </Card>
          </Col>
        </Row>
        
        {/* 表格数据 */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card 
              title="异常预警列表" 
              className="table-card"
              id="warning-table-section"
              ref={warningTableRef}
            >
              {filteredWarnings.length > 0 ? (
                <Table 
                  columns={warningColumns} 
                  dataSource={filteredWarnings} 
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  className="styled-table"
                  bordered={false}
                  size="middle"
                />
              ) : emptyTableContent}
            </Card>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="最近申报记录" className="table-card">
              {filteredDeclarations.length > 0 ? (
                <Table 
                  columns={declarationColumns} 
                  dataSource={filteredDeclarations} 
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  className="styled-table"
                  bordered={false}
                  size="middle"
                />
              ) : emptyTableContent}
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  // 渲染ISF面板
  const renderISFPanel = () => {
    // ISF专用的异常预警表格列配置
    const isfWarningColumns = [
      {
        title: 'HBL',
        dataIndex: 'hbl',
        key: 'hbl',
        render: (text, record) => {
          // 如果HBL有值，显示蓝色链接；否则显示空
          if (text) {
            return <a style={{ color: '#1890ff', cursor: 'pointer' }}>{text}</a>;
          }
          return '';
        }
      },
      {
        title: 'MBL',
        dataIndex: 'mbl',
        key: 'mbl',
        render: (text, record) => {
          // 如果MBL有值，显示蓝色链接；否则显示空
          if (text) {
            return <a style={{ color: '#1890ff', cursor: 'pointer' }}>{text}</a>;
          }
          return '';
        }
      },
      {
        title: 'Ship to',
        dataIndex: 'shipTo',
        key: 'shipTo',
        ellipsis: {
          showTitle: false,
        },
        render: text => (
          <Tooltip title={text}>
            <span>{text}</span>
          </Tooltip>
        )
      },
      {
        title: 'Seller',
        dataIndex: 'seller',
        key: 'seller',
        ellipsis: {
          showTitle: false,
        },
        render: text => (
          <Tooltip title={text}>
            <span>{text}</span>
          </Tooltip>
        )
      },
      {
        title: 'Bond ID',
        dataIndex: 'bondId',
        key: 'bondId',
      },
      {
        title: '分公司',
        dataIndex: 'branch',
        key: 'branch',
      },
      {
        title: '创建人',
        dataIndex: 'creator',
        key: 'creator',
      },
      {
        title: '海关代码',
        dataIndex: 'customsCode',
        key: 'customsCode',
        render: (text) => (
          <a style={{ color: '#1890ff', cursor: 'pointer' }}>S2</a>
        )
      },
      {
        title: '代码收到时间',
        dataIndex: 'codeReceivedTime',
        key: 'codeReceivedTime',
      },
      {
        title: '持续时长',
        dataIndex: 'duration',
        key: 'duration',
        render: (text) => {
          let icon = null;
          
          if (text >= 12) {
            // 大于等于12小时显示红色感叹号
            icon = <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />;
          } else if (text >= 2) {
            // 大于等于2小时小于12小时显示黄色感叹号
            icon = <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: '8px' }} />;
          }
          
        return (
            <span>
              {icon}{text}小时
            </span>
        );
      }
    }
  ];

    // ISF专用的最近申报记录表格列配置
    const isfDeclarationColumns = [
      {
        title: 'HBL',
        dataIndex: 'hbl',
        key: 'hbl',
        render: (text, record) => {
          // 如果HBL有值，显示蓝色链接；否则显示空
          if (text) {
            return <a style={{ color: '#1890ff', cursor: 'pointer' }}>{text}</a>;
          }
          return '';
        }
      },
      {
        title: 'MBL',
        dataIndex: 'mbl',
        key: 'mbl',
        render: (text, record) => {
          // 如果MBL有值，显示蓝色链接；否则显示空
          if (text) {
            return <a style={{ color: '#1890ff', cursor: 'pointer' }}>{text}</a>;
          }
          return '';
        }
      },
      {
        title: 'Ship to',
        dataIndex: 'shipTo',
        key: 'shipTo',
        ellipsis: {
          showTitle: false,
        },
        render: text => (
          <Tooltip title={text}>
            <span>{text}</span>
          </Tooltip>
        )
      },
      {
        title: 'Seller',
        dataIndex: 'seller',
        key: 'seller',
        ellipsis: {
          showTitle: false,
        },
        render: text => (
          <Tooltip title={text}>
            <span>{text}</span>
          </Tooltip>
        )
      },
      {
        title: 'Bond ID',
        dataIndex: 'bondId',
        key: 'bondId',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
          let color = '';
          let icon = null;
          
          switch (status) {
            case '发送中':
              color = 'gold';
              icon = <SendOutlined />;
              break;
            case '接收成功':
              color = 'green';
              icon = <CheckCircleOutlined />;
              break;
            case '匹配成功（S1）':
              color = 'blue';
              icon = <CheckSquareOutlined />;
              break;
            default:
              color = 'default';
          }
          
        return (
          <Tag color={color} icon={icon}>{status}</Tag>
        );
      }
    },
    {
        title: '分公司',
        dataIndex: 'branch',
        key: 'branch',
      },
      {
        title: '创建人',
        dataIndex: 'creator',
        key: 'creator',
      },
      {
        title: '异常预警',
        dataIndex: 'warning',
        key: 'warning',
        render: (text) => {
          if (!text || text === '') return <span>-</span>;
          
        return (
            <a style={{ color: '#1890ff', cursor: 'pointer' }}>{text}</a>
        );
      }
    }
  ];

    // 为ISF面板生成适配的警告数据
    const getISFWarningData = () => {
      // 复制过滤后的警告数据
      return filteredWarnings.map(item => {
        // 随机决定是显示HBL还是MBL
        const showHBL = Math.random() > 0.5;
        
        // 生成英文公司名称
        const generateCompanyName = () => {
          const prefixes = ['Global', 'International', 'Pacific', 'Atlantic', 'United', 'Eastern', 'Western', 'Northern', 'Southern'];
          const mids = ['Trade', 'Shipping', 'Logistics', 'Cargo', 'Freight', 'Supply', 'Transport', 'Marine'];
          const suffixes = ['Co., Ltd.', 'Inc.', 'Corporation', 'Group', 'Enterprises', 'Partners', 'Services', 'Solutions'];
          
          return `${Random.pick(prefixes)} ${Random.pick(mids)} ${Random.pick(suffixes)}`;
        };
        
        // 生成Bond ID
        const generateBondId = () => {
          const prefix = String(Random.integer(10, 99));
          const suffix = String(Random.integer(1000000, 9999999));
          return `${prefix}-${suffix}`;
        };
        
        return {
          ...item,
          hbl: showHBL ? item.hbl : '',
          mbl: showHBL ? '' : item.mbl,
          shipTo: generateCompanyName(),
          seller: generateCompanyName(),
          bondId: generateBondId(),
          customsCode: 'S2'  // 覆盖原有值
        };
      });
    };
    
    // 为ISF面板生成适配的申报记录数据
    const getISFDeclarationData = () => {
      // 复制过滤后的申报数据
      return filteredDeclarations.map(item => {
        // 随机决定是显示HBL还是MBL
        const showHBL = Math.random() > 0.5;
        
        // 生成英文公司名称
        const generateCompanyName = () => {
          const prefixes = ['Global', 'International', 'Pacific', 'Atlantic', 'United', 'Eastern', 'Western', 'Northern', 'Southern'];
          const mids = ['Trade', 'Shipping', 'Logistics', 'Cargo', 'Freight', 'Supply', 'Transport', 'Marine'];
          const suffixes = ['Co., Ltd.', 'Inc.', 'Corporation', 'Group', 'Enterprises', 'Partners', 'Services', 'Solutions'];
          
          return `${Random.pick(prefixes)} ${Random.pick(mids)} ${Random.pick(suffixes)}`;
        };
        
        // 生成Bond ID
        const generateBondId = () => {
          const prefix = String(Random.integer(10, 99));
          const suffix = String(Random.integer(1000000, 9999999));
          return `${prefix}-${suffix}`;
        };
        
        // 随机生成状态，但确保状态和警告是互斥的
        const statuses = ['发送中', '接收成功', '匹配成功（S1）'];
        let status = Random.pick(statuses);
        
        // 如果状态是匹配成功，警告必须为空；否则有20%概率为S2
        let warning = '';
        if (status !== '匹配成功（S1）' && Math.random() < 0.2) {
          warning = 'S2';
        }
        
        return {
          ...item,
          hbl: showHBL ? item.hbl : '',
          mbl: showHBL ? '' : item.mbl,
          shipTo: generateCompanyName(),
          seller: generateCompanyName(),
          bondId: generateBondId(),
          status: status,
          warning: warning
        };
      });
    };
    
    return (
      <>
        {renderTimeSelector()}
      
      {/* 数据概览卡片 */}
      <Row gutter={[16, 16]} className="data-overview">
          <Col span={4}>
            <Card 
              className={`stats-card info-card ${trendMetric === 'total' ? 'active' : ''}`}
              onClick={() => handleMetricChange('total')}
            >
            <Statistic
                title="总申报单量"
              value={data.overview.totalDeclarations}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<SafetyOutlined />}
            />
          </Card>
        </Col>
          <Col span={4}>
            <Card 
              className={`stats-card ${trendMetric === 'pending' ? 'active' : ''}`}
              onClick={() => handleMetricChange('pending')}
            >
            <Statistic
                title="发送中"
              value={data.overview.pendingReview}
              precision={0}
              valueStyle={{ color: '#faad14' }}
                prefix={<SendOutlined />}
            />
          </Card>
        </Col>
          <Col span={4}>
            <Card 
              className={`stats-card ${trendMetric === 'approved' ? 'active' : ''}`}
              onClick={() => handleMetricChange('approved')}
            >
            <Statistic
                title="接收成功"
                value={data.overview.approved}
                precision={0}
                valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
          <Col span={4}>
            <Card 
              className={`stats-card ${trendMetric === 'matched' ? 'active' : ''}`}
              onClick={() => handleMetricChange('matched')}
            >
            <Statistic
                title="匹配成功（S1）"
                value={data.overview.approved * 0.85}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
                prefix={<CheckSquareOutlined />}
            />
          </Card>
        </Col>
          <Col span={4}>
            <Card 
              className={`stats-card error-card ${trendMetric === 'receive_fail' ? 'active' : ''}`}
              onClick={() => handleMetricChange('receive_fail')}
            >
            <Statistic
                title="接收失败"
                value={data.overview.receiveFailed || 25}
                precision={0}
                valueStyle={{ color: '#ff7875' }}
                prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
          <Col span={4}>
            <Card 
              className={`stats-card warning-card ${trendMetric === 'warning' ? 'active' : ''}`}
              onClick={() => handleMetricChange('warning')}
            >
            <Statistic
              title="异常预警"
              value={data.overview.abnormalWarnings}
              precision={0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]}>
          <Col span={24}>
          <Card className="chart-container">
              <ReactECharts option={trendChartOption} style={{ height: '400px' }} />
          </Card>
        </Col>
      </Row>
      
      {/* 表格数据 */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
            <Card 
              title="异常预警列表" 
              className="table-card"
              id="warning-table-section"
              ref={warningTableRef}
            >
              {filteredWarnings.length > 0 ? (
            <Table 
                  columns={isfWarningColumns} 
                  dataSource={getISFWarningData()} 
              rowKey="id"
              pagination={{ pageSize: 5 }}
                  className="styled-table"
                  bordered={false}
                  size="middle"
            />
              ) : emptyTableContent}
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="最近申报记录" className="table-card">
              {filteredDeclarations.length > 0 ? (
            <Table 
                  columns={isfDeclarationColumns} 
                  dataSource={getISFDeclarationData()} 
              rowKey="id"
              pagination={{ pageSize: 5 }}
                  className="styled-table"
                  bordered={false}
                  size="middle"
            />
              ) : emptyTableContent}
          </Card>
        </Col>
      </Row>
      </>
    );
  };

  // 渲染ICS2面板
  const renderICS2Panel = () => {
    // 生成随机的报文类型和海关状态
    const getRandomMessageType = () => {
      const types = ['F14', 'F15', 'F16', 'F17'];
      return types[Math.floor(Math.random() * types.length)];
    };

    const getRandomCustomsStatus = () => {
      const statuses = ['申报不完整', '需补充信息', '要求安检', '禁止装载', '海关管制'];
      return statuses[Math.floor(Math.random() * statuses.length)];
    };

    // ICS2专用的异常预警表格列配置
    const ics2WarningColumns = [
      {
        title: 'HBL',
        dataIndex: 'hbl',
        key: 'hbl',
        render: (text) => (
          <a style={{ color: '#1890ff', cursor: 'pointer' }}>{text}</a>
        )
      },
      {
        title: 'MBL',
        dataIndex: 'mbl',
        key: 'mbl',
      },
      {
        title: '报文类型',
        dataIndex: 'messageType',
        key: 'messageType',
        render: (type) => {
          return <Tag color="blue">{type}</Tag>;
        }
      },
      {
        title: 'MRN#',
        dataIndex: 'mrn',
        key: 'mrn',
        render: (text) => {
          // 确保MRN格式正确：前两位大写字母后面数字
          const formattedMrn = text ? text.toUpperCase() : '';
          return <span>{formattedMrn}</span>;
        }
      },
      {
        title: '海关状态',
        dataIndex: 'customsStatus',
        key: 'customsStatus',
        render: (status) => {
          let color = 'default';
          switch (status) {
            case '申报不完整':
              color = 'warning';
              break;
            case '需补充信息':
              color = 'processing';
              break;
            case '要求安检':
              color = 'error';
              break;
            case '禁止装载':
              color = 'error';
              break;
            case '海关管制':
              color = 'error';
              break;
            default:
              color = 'default';
          }
          return <Tag color={color}>{status}</Tag>;
        }
      },
      {
        title: '分公司',
        dataIndex: 'branch',
        key: 'branch',
      },
      {
        title: '创建人',
        dataIndex: 'creator',
        key: 'creator',
      },
      {
        title: '海关代码',
        dataIndex: 'customsCode',
        key: 'customsCode',
        render: (text) => (
          <a style={{ color: '#1890ff', cursor: 'pointer' }}>{text}</a>
        )
      },
      {
        title: '代码收到时间',
        dataIndex: 'codeReceivedTime',
        key: 'codeReceivedTime',
      },
      {
        title: '持续时长',
        dataIndex: 'duration',
        key: 'duration',
        render: (text) => {
          let icon = null;
          
          if (text >= 12) {
            // 大于等于12小时显示红色感叹号
            icon = <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />;
          } else if (text >= 2) {
            // 大于等于2小时小于12小时显示黄色感叹号
            icon = <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: '8px' }} />;
          }
          
          return (
            <span>
              {icon}{text}小时
            </span>
          );
        }
      }
    ];

    // 处理数据源，添加随机的报文类型和海关状态
    const getICS2WarningData = () => {
      return filteredWarnings.map(item => ({
        ...item,
        messageType: getRandomMessageType(),
        customsStatus: getRandomCustomsStatus(),
        mrn: `${Random.pick(['BE', 'FR', 'DE', 'IT', 'ES', 'NL'])}${Random.integer(10000000, 99999999)}`,
        customsCode: Random.pick(['N99', 'N03', 'R01'])
      }));
    };

    // 处理数据源，添加随机的报文类型和海关状态
    const getICS2DeclarationData = () => {
      return filteredDeclarations.map(item => ({
        ...item,
        messageType: getRandomMessageType(),
        mrn: `${Random.pick(['BE', 'FR', 'DE', 'IT', 'ES', 'NL'])}${Random.integer(10000000, 99999999)}`,
        customsStatus: getRandomCustomsStatus(),
        customsCode: Random.pick(['N99', 'N03', 'R01'])
      }));
    };

    // ICS2专用的最近申报记录表格列配置
    const ics2DeclarationColumns = [
      {
        title: 'HBL',
        dataIndex: 'hbl',
        key: 'hbl',
        render: (text) => (
          <a style={{ color: '#1890ff', cursor: 'pointer' }}>{text}</a>
        )
      },
      {
        title: 'MBL',
        dataIndex: 'mbl',
        key: 'mbl',
      },
      {
        title: '报文类型',
        dataIndex: 'messageType',
        key: 'messageType',
        render: (type) => {
          return <Tag color="blue">{type}</Tag>;
        }
      },
      {
        title: 'MRN#',
        dataIndex: 'mrn',
        key: 'mrn',
        render: (text) => {
          const formattedMrn = text ? text.toUpperCase() : '';
          return <span>{formattedMrn}</span>;
        }
      },
      {
        title: '状态',
        dataIndex: 'customsStatus',
        key: 'customsStatus',
        render: (status) => {
          let color = 'default';
          switch (status) {
            case '申报不完整':
              color = 'warning';
              break;
            case '需补充信息':
              color = 'processing';
              break;
            case '要求安检':
              color = 'error';
              break;
            case '禁止装载':
              color = 'error';
              break;
            case '海关管制':
              color = 'error';
              break;
            default:
              color = 'default';
          }
          return <Tag color={color}>{status}</Tag>;
        }
      },
      {
        title: '分公司',
        dataIndex: 'branch',
        key: 'branch',
      },
      {
        title: '创建人',
        dataIndex: 'creator',
        key: 'creator',
      },
      {
        title: '海关代码',
        dataIndex: 'customsCode',
        key: 'customsCode',
        render: (text) => (
          <a style={{ color: '#1890ff', cursor: 'pointer' }}>{text}</a>
        )
      }
    ];

    return (
      <>
        {renderTimeSelector()}
        
        {/* 数据概览卡片 */}
      <Row gutter={[16, 16]} className="data-overview">
          <Col span={4}>
            <Card 
              className={`stats-card info-card ${trendMetric === 'total' ? 'active' : ''}`}
              onClick={() => handleMetricChange('total')}
            >
            <Statistic
                title="总申报单量"
                value={data.overview.totalDeclarations}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
                prefix={<SafetyOutlined />}
            />
          </Card>
        </Col>
          <Col span={4}>
            <Card 
              className={`stats-card ${trendMetric === 'pending' ? 'active' : ''}`}
              onClick={() => handleMetricChange('pending')}
            >
            <Statistic
                title="发送中"
                value={data.overview.pendingReview}
                precision={0}
                valueStyle={{ color: '#faad14' }}
                prefix={<SendOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card 
              className={`stats-card ${trendMetric === 'approved' ? 'active' : ''}`}
              onClick={() => handleMetricChange('approved')}
            >
              <Statistic
                title="接收成功"
              value={data.overview.approved}
              precision={0}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
          <Col span={4}>
            <Card 
              className={`stats-card ${trendMetric === 'matched' ? 'active' : ''}`}
              onClick={() => handleMetricChange('matched')}
            >
              <Statistic
                title="匹配成功"
                value={getMatchValue()}
                precision={0}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckSquareOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card 
              className={`stats-card error-card ${trendMetric === 'receive_fail' ? 'active' : ''}`}
              onClick={() => handleMetricChange('receive_fail')}
            >
              <Statistic
                title="接收失败"
                value={data.overview.receiveFailed || 25}
                precision={0}
                valueStyle={{ color: '#ff7875' }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card 
              className={`stats-card warning-card ${trendMetric === 'warning' ? 'active' : ''}`}
              onClick={() => handleMetricChange('warning')}
            >
              <Statistic
                title={
                  <div>
                    <span style={{ marginRight: '8px' }}>异常预警</span>
                    <Radio.Group 
                      size="small" 
                      value={warningType} 
                      onChange={(e) => handleWarningTypeChange(e.target.value)}
                      style={{ marginLeft: '4px' }}
                      buttonStyle="solid"
                      className="warning-type-tabs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Radio.Button value="rfi">RFI</Radio.Button>
                      <Radio.Button value="rfs">RFS</Radio.Button>
                      <Radio.Button value="other">其他</Radio.Button>
                    </Radio.Group>
                  </div>
                }
                value={data.overview.abnormalWarnings}
                precision={0}
                valueStyle={{ color: '#cf1322' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
        
        {/* 图表区域 */}
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card className="chart-container">
              <ReactECharts option={trendChartOption} style={{ height: '350px' }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card className="chart-container">
              <ReactECharts option={euEntryChartOption} style={{ height: '350px' }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card className="chart-container" onClick={(e) => e.stopPropagation()}>
              <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <Radio.Group 
                  value={portType} 
                  onChange={(e) => handlePortTypeChange(e.target.value)}
                  buttonStyle="solid"
                  className="port-type-tabs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Radio.Button value="origin">起运港</Radio.Button>
                  <Radio.Button value="destination">目的港</Radio.Button>
                </Radio.Group>
              </div>
              <ReactECharts option={portDistributionChartOption} style={{ height: '320px' }} />
            </Card>
          </Col>
        </Row>
        
        {/* 表格数据 */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card 
              title="异常预警列表" 
              className="table-card"
              id="warning-table-section"
              ref={warningTableRef}
            >
              {filteredWarnings.length > 0 ? (
                <Table 
                  columns={ics2WarningColumns} 
                  dataSource={getICS2WarningData()} 
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  className="styled-table"
                  bordered={false}
                  size="middle"
                />
              ) : emptyTableContent}
            </Card>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="最近申报记录" className="table-card">
              {filteredDeclarations.length > 0 ? (
                <Table 
                  columns={ics2DeclarationColumns} 
                  dataSource={getICS2DeclarationData()} 
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  className="styled-table"
                  bordered={false}
                  size="middle"
                />
              ) : emptyTableContent}
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  // 渲染AFR面板
  const renderAFRPanel = () => {
    // 生成随机的海关代码
    const getRandomCustomsCode = () => {
      const codes = ['DNL', 'HLD', 'DNU'];
      return codes[Math.floor(Math.random() * codes.length)];
    };

    // 生成随机的状态
    const getRandomStatus = () => {
      const statuses = ['接收成功', '修改成功', '删除成功'];
      return statuses[Math.floor(Math.random() * statuses.length)];
    };

    // 生成随机的异常预警
    const getRandomWarning = () => {
      const warnings = ['', 'HLD', 'DNL', 'DNU'];
      return warnings[Math.floor(Math.random() * warnings.length)];
    };

    // AFR专用的异常预警表格列配置
    const afrWarningColumns = [
      {
        title: 'HBL',
        dataIndex: 'hbl',
        key: 'hbl',
        render: (text) => (
          <a style={{ color: '#1890ff', cursor: 'pointer' }}>{text}</a>
        )
      },
      {
        title: 'MBL',
        dataIndex: 'mbl',
        key: 'mbl',
      },
      {
        title: '分公司',
        dataIndex: 'branch',
        key: 'branch',
      },
      {
        title: '创建人',
        dataIndex: 'creator',
        key: 'creator',
      },
      {
        title: '海关代码',
        dataIndex: 'customsCode',
        key: 'customsCode',
        render: (text) => (
          <a style={{ color: '#1890ff', cursor: 'pointer' }}>{text}</a>
        )
      },
      {
        title: '代码收到时间',
        dataIndex: 'codeReceivedTime',
        key: 'codeReceivedTime',
      },
      {
        title: '持续时长',
        dataIndex: 'duration',
        key: 'duration',
        render: (text) => {
          let icon = null;
          
          if (text >= 12) {
            icon = <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />;
          } else if (text >= 2) {
            icon = <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: '8px' }} />;
          }
          
          return (
            <span>
              {icon}{text}小时
            </span>
          );
        }
      }
    ];

    // 处理数据源，添加随机的海关代码
    const getAFRWarningData = () => {
      return filteredWarnings.map(item => ({
        ...item,
        customsCode: getRandomCustomsCode()
      }));
    };

    // AFR专用的最近申报记录表格列配置
    const afrDeclarationColumns = [
      {
        title: 'HBL',
        dataIndex: 'hbl',
        key: 'hbl',
        render: (text) => (
          <a style={{ color: '#1890ff', cursor: 'pointer' }}>{text}</a>
        )
      },
      {
        title: 'MBL',
        dataIndex: 'mbl',
        key: 'mbl',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (status) => {
          let color = '';
          let icon = null;
          
          switch (status) {
            case '接收成功':
              color = 'green';
              icon = <CheckCircleOutlined />;
              break;
            case '修改成功':
              color = 'blue';
              icon = <CheckSquareOutlined />;
              break;
            case '删除成功':
              color = 'red';
              icon = <CloseCircleOutlined />;
              break;
            default:
              color = 'default';
          }
          
          return (
            <Tag color={color} icon={icon}>{status}</Tag>
          );
        }
      },
      {
        title: '分公司',
        dataIndex: 'branch',
        key: 'branch',
      },
      {
        title: '创建人',
        dataIndex: 'creator',
        key: 'creator',
      },
      {
        title: '异常预警',
        dataIndex: 'warning',
        key: 'warning',
        render: (text) => {
          if (!text || text === '') return <span>-</span>;
          
          return (
            <a style={{ color: '#1890ff', cursor: 'pointer' }}>{text}</a>
          );
        }
      }
    ];

    // 处理数据源，添加随机的状态和异常预警
    const getAFRDeclarationData = () => {
      return filteredDeclarations.map(item => ({
        ...item,
        status: getRandomStatus(),
        warning: getRandomWarning()
      }));
    };

    return (
      <>
        {renderTimeSelector()}
        
        {/* 数据概览卡片 */}
        <Row gutter={[16, 16]} className="data-overview">
          <Col span={4}>
            <Card 
              className={`stats-card info-card ${trendMetric === 'total' ? 'active' : ''}`}
              onClick={() => handleMetricChange('total')}
            >
              <Statistic
                title="总申报单量"
                value={data.overview.totalDeclarations}
                precision={0}
                valueStyle={{ color: '#1890ff' }}
                prefix={<SafetyOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card 
              className={`stats-card ${trendMetric === 'pending' ? 'active' : ''}`}
              onClick={() => handleMetricChange('pending')}
            >
              <Statistic
                title="发送中"
                value={data.overview.pendingReview}
                precision={0}
                valueStyle={{ color: '#faad14' }}
                prefix={<SendOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card 
              className={`stats-card ${trendMetric === 'approved' ? 'active' : ''}`}
              onClick={() => handleMetricChange('approved')}
            >
              <Statistic
                title="接收成功"
                value={data.overview.approved}
                precision={0}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card 
              className={`stats-card ${trendMetric === 'matched' ? 'active' : ''}`}
              onClick={() => handleMetricChange('matched')}
            >
              <Statistic
                title="匹配成功"
                value={data.overview.approved * 0.85}
              precision={0}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckSquareOutlined />}
            />
          </Card>
        </Col>
          <Col span={4}>
            <Card 
              className={`stats-card error-card ${trendMetric === 'receive_fail' ? 'active' : ''}`}
              onClick={() => handleMetricChange('receive_fail')}
            >
              <Statistic
                title="接收失败"
                value={data.overview.receiveFailed || 25}
                precision={0}
                valueStyle={{ color: '#ff7875' }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card 
              className={`stats-card warning-card ${trendMetric === 'warning' ? 'active' : ''}`}
              onClick={() => handleMetricChange('warning')}
            >
            <Statistic
                title={
                  <div>
                    <span style={{ marginRight: '8px' }}>异常预警</span>
                    <Radio.Group 
                      size="small" 
                      value={warningType} 
                      onChange={(e) => handleWarningTypeChange(e.target.value)}
                      style={{ marginLeft: '4px' }}
                      buttonStyle="solid"
                      className="warning-type-tabs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Radio.Button value="dnl">DNL</Radio.Button>
                      <Radio.Button value="hld">HLD</Radio.Button>
                      <Radio.Button value="dnu">DNU</Radio.Button>
                    </Radio.Group>
                  </div>
                }
                value={data.overview.abnormalWarnings}
                precision={0}
                valueStyle={{ color: '#cf1322' }}
                prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      {/* 图表区域 */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card className="chart-container">
            <ReactECharts option={trendChartOption} style={{ height: '350px' }} />
          </Card>
        </Col>
        <Col span={12}>
            <Card className="chart-container" onClick={(e) => e.stopPropagation()}>
              <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <Radio.Group 
                  value={portType} 
                  onChange={(e) => handlePortTypeChange(e.target.value)}
                  buttonStyle="solid"
                  className="port-type-tabs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Radio.Button value="origin">起运港</Radio.Button>
                  <Radio.Button value="destination">目的港</Radio.Button>
                </Radio.Group>
              </div>
              <ReactECharts option={portDistributionChartOption} style={{ height: '320px' }} />
          </Card>
        </Col>
      </Row>
      
      {/* 表格数据 */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
            <Card 
              title="异常预警列表" 
              className="table-card"
              id="warning-table-section"
              ref={warningTableRef}
            >
              {filteredWarnings.length > 0 ? (
            <Table 
                  columns={afrWarningColumns} 
                  dataSource={getAFRWarningData()} 
              rowKey="id"
              pagination={{ pageSize: 5 }}
                  className="styled-table"
                  bordered={false}
                  size="middle"
            />
              ) : emptyTableContent}
          </Card>
        </Col>
      </Row>
      
        {/* 最近申报记录表格 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="最近申报记录" className="table-card">
              {filteredDeclarations.length > 0 ? (
            <Table 
                  columns={afrDeclarationColumns} 
                  dataSource={getAFRDeclarationData()} 
              rowKey="id"
              pagination={{ pageSize: 5 }}
                  className="styled-table"
                  bordered={false}
                  size="middle"
            />
              ) : emptyTableContent}
          </Card>
        </Col>
      </Row>
      </>
    );
  };

  // 渲染eManifest面板
  const renderEManifestPanel = () => {
    return renderAMSPanel(); // 复用AMS面板的内容
  };

  // 渲染ACI面板
  const renderACIPanel = () => {
    return renderAMSPanel(); // 复用AMS面板的内容
  };

  // 渲染当前活动面板
  const renderActivePanel = () => {
    switch (activeTab) {
      case 'AMS':
        return renderAMSPanel();
      case 'ISF':
        return renderISFPanel();
      case 'ICS2':
        return renderICS2Panel();
      case 'AFR':
        return renderAFRPanel();
      case 'eManifest':
        return renderEManifestPanel();
      case 'ACI':
        return renderACIPanel();
      default:
        return renderAMSPanel();
    }
  };

  // 预警记录表格列配置
  const warningColumns = [
    {
      title: 'HBL',
      dataIndex: 'hbl',
      key: 'hbl',
      render: (text) => (
        <a style={{ color: '#1890ff', cursor: 'pointer' }}>{text}</a>
      )
    },
    {
      title: 'MBL',
      dataIndex: 'mbl',
      key: 'mbl',
    },
    {
      title: 'Vessel',
      dataIndex: 'vessel',
      key: 'vessel',
    },
    {
      title: 'Voyage',
      dataIndex: 'voyage',
      key: 'voyage',
    },
    {
      title: 'ETD',
      dataIndex: 'etd',
      key: 'etd',
    },
    {
      title: '分公司',
      dataIndex: 'branch',
      key: 'branch',
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
    },
    {
      title: '海关代码',
      dataIndex: 'customsCode',
      key: 'customsCode',
      render: (text) => (
        <a style={{ color: '#1890ff', cursor: 'pointer' }}>{text}</a>
      )
    },
    {
      title: '代码收到时间',
      dataIndex: 'codeReceivedTime',
      key: 'codeReceivedTime',
    },
    {
      title: '持续时长',
      dataIndex: 'duration',
      key: 'duration',
      render: (text) => {
        let icon = null;
        
        if (text >= 12) {
          // 大于等于12小时显示红色感叹号
          icon = <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />;
        } else if (text >= 2) {
          // 大于等于2小时小于12小时显示黄色感叹号
          icon = <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: '8px' }} />;
        }
        
        return (
          <span>
            {icon}{text}小时
          </span>
        );
      }
    }
  ];

  // 最近申报表格列配置
  const declarationColumns = [
    {
      title: 'HBL',
      dataIndex: 'hbl',
      key: 'hbl',
      render: (text) => (
        <a style={{ color: '#1890ff', cursor: 'pointer' }}>{text}</a>
      )
    },
    {
      title: 'MBL',
      dataIndex: 'mbl',
      key: 'mbl',
    },
    {
      title: 'Vessel',
      dataIndex: 'vessel',
      key: 'vessel',
    },
    {
      title: 'Voyage',
      dataIndex: 'voyage',
      key: 'voyage',
    },
    {
      title: 'ETD',
      dataIndex: 'etd',
      key: 'etd',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        let icon = null;
        
        switch (status) {
          case '发送中':
            color = 'gold';
            icon = <SendOutlined />;
            break;
          case '接收成功':
            color = 'green';
            icon = <CheckCircleOutlined />;
            break;
          case '1Y+3Z':
            color = 'blue';
            icon = <CheckSquareOutlined />;
            break;
          case '仅1Y':
            color = 'cyan';
            icon = <CheckSquareOutlined />;
            break;
          case '仅3Z':
            color = 'geekblue';
            icon = <CheckSquareOutlined />;
            break;
          default:
            color = 'default';
        }
        
        return (
          <Tag color={color} icon={icon}>{status}</Tag>
        );
      }
    },
    {
      title: '分公司',
      dataIndex: 'branch',
      key: 'branch',
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
    },
    {
      title: '异常预警',
      dataIndex: 'warning',
      key: 'warning',
      render: (text) => {
        if (!text || text === '') return <span>-</span>;
        
        return (
          <a style={{ color: '#1890ff', cursor: 'pointer' }}>{text}</a>
        );
      }
    }
  ];

  // 表格数据为空时的显示内容
  const emptyTableContent = (
    <div className="empty-data-container">
      <ExclamationCircleOutlined />
      <p>没有符合条件的数据，请调整筛选条件</p>
    </div>
  );

  return (
    <div className="dashboard">
      <Title level={2} style={{ textAlign: 'center' }}>实时看板</Title>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 20 }}>
        实时数据更新于: {new Date().toLocaleString()}
      </Text>
      
      <Tabs 
        items={tabItems} 
        activeKey={activeTab} 
        onChange={handleTabChange} 
        size="large"
        style={{ marginBottom: 16 }}
      />
      
      {renderActivePanel()}
    </div>
  );
}

export default Dashboard; 