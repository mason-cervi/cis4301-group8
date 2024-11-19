import React from 'react';
import { Line } from '@ant-design/charts';

const LineChart = ({ data }) => {
  const config = {
    data,
    xField: 'year',
    yField: 'value',
    seriesField: 'category',
    height: 400,
  };
  
  return <Line {...config} />;
};

export default LineChart;