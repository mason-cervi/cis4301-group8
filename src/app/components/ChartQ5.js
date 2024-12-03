import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AreaChartComponent = ({ data }) => {
  // Group data by year and state
  const groupedData = data.reduce((acc, item) => {
    const existingEntry = acc.find(entry => 
      entry.year === item.year && entry.state === item.category
    );
    
    if (existingEntry) {
      existingEntry.value = item.value;
    } else {
      acc.push({
        year: item.year,
        state: item.category,
        value: item.value
      });
    }
    
    return acc;
  }, []);

  // Sort data by year to ensure correct x-axis ordering
  const sortedData = groupedData.sort((a, b) => a.year - b.year);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={sortedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis label={{ value: 'Number of Individuals under Bracket', angle: -90, position: 'insideLeft' }} />
        <Tooltip 
          labelFormatter={(value) => `Year: ${value}`}
          formatter={(value, name, props) => [
            value.toLocaleString(), 
            `${props.payload.state} Returns`
          ]}
        />
        <Legend />
        
        <Area
          type="monotone"
          dataKey="value"
          name="Number of Returns"
          stroke="#1f77b4"
          fill="#1f77b4"
          fillOpacity={0.3}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChartComponent;