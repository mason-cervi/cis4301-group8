import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AreaChartComponent = ({ data }) => {
  const states = [...new Set(data.map(item => item.category))]; 
  const colors = ['#1f77b4', '#ff6347', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#555555', '#bcbd22', '#17becf'];


  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Legend />
        {states.map((state, index) => (
          <Area
            key={state}
            type="monotone"
            dataKey={state}
            data={data.filter(item => item.category === state)}
            name={state}
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            fillOpacity={0.3}
            
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChartComponent;