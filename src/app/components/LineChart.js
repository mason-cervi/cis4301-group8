import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AreaChartComponent = ({ data }) => {
  // Group data by year, aggregating values for each category
  const groupedData = data.reduce((acc, item) => {
    const existingEntry = acc.find(entry => entry.year === item.year);
    
    if (existingEntry) {
      existingEntry[item.category] = item.value;
    } else {
      const newEntry = { year: item.year };
      newEntry[item.category] = item.value;
      acc.push(newEntry);
    }
    
    return acc;
  }, []);

  // Sort data by year to ensure correct x-axis ordering
  groupedData.sort((a, b) => a.year - b.year);

  const categories = [...new Set(data.map(item => item.category))];
  const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={groupedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Legend />
        {categories.map((category, index) => (
          <Area
            key={category}
            type="monotone"
            dataKey={category}
            name={category}
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            fillOpacity={0.1}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChartComponent;