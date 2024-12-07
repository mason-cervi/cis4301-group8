import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

const AreaChartComponent = ({ data, choice }) => {
  // Group data by year
  const groupedData = data.reduce((acc, item) => {
    const year = item.Year;
    acc[year] = acc[year] || {};
    acc[year][`${item.State} - ${item['Income Bracket']}`] = (item[choice] / 1000000000).toFixed(2);
    return acc;
  }, {});

  // Transform grouped data into Recharts format
  const transformedData = Object.keys(groupedData).map((year) => ({
    Year: parseInt(year),
    ...groupedData[year],
  }));

  // Generate Area components dynamically
  const areas = Object.keys(groupedData[Object.keys(groupedData)[0]]).map((key, index) => (
    <Area
      key={key}
      type="monotone"
      dataKey={key}
      stackId="a"
      name={key}
      stroke={colors[index % colors.length]}
      fill={colors[index % colors.length]}
      fillOpacity={0.3}
    />
  ));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={transformedData} stackOffset="none">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="Year" />
        <YAxis />
        <Tooltip />
        <Legend />
        {areas}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChartComponent;