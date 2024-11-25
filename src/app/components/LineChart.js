import React from 'react';
import { Line } from '@ant-design/charts';

const LineChart = ({ data }) => {
  const config = {
    data,
    xField: 'year',
    yField: 'value',
    seriesField: 'category',
  };
  
  return <Line {...config} />;
};

export default LineChart;