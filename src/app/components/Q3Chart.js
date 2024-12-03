import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AreaChartComponent = ({ data }) => {
  // Sort data by year to ensure correct x-axis ordering
  
  const sortedData = [...data].sort((a, b) => a.year - b.year);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={sortedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Legend />
        
        <Area
          type="monotone"
          dataKey="Average Nominal Income"
          name="Nominal Income"
          stroke="#1f77b4"
          fill="#1f77b4"
          fillOpacity={0.3}
        />
        <Area
          type="monotone"
          dataKey="Average Real Income"
          name="Real Income"
          stroke="#ff7f0e"
          fill="#ff7f0e"
          fillOpacity={0.1}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChartComponent;