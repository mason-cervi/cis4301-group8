import React from 'react';
import { 
  ComposedChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const AreaChartComponent = ({ data, fedFundsData }) => {
  // If no data, return a placeholder or empty chart
  if (!data || data.length === 0) {
    return (
      <ResponsiveContainer width="100%" height={500}>
        <div>No data available</div>
      </ResponsiveContainer>
    );
  }

  // Group data by year, aggregating values for each category
  const groupedData = data.reduce((acc, item) => {
    const existingEntry = acc.find(entry => entry.year === item.year);
    
    if (existingEntry) {
      // Ensure the value is added or created if not exists
      existingEntry[item.category] = (existingEntry[item.category] || 0) + item.value;
    } else {
      const newEntry = { year: item.year };
      newEntry[item.category] = item.value;
      acc.push(newEntry);
    }
    
    return acc;
  }, []);

  // Merge Fed Funds data with grouped data
  const mergedData = groupedData.map(dataItem => {
    const fedFundsItem = fedFundsData.find(fed => fed.year === dataItem.year);
    return {
      ...dataItem,
      FedFundsRate: fedFundsItem ? fedFundsItem.FedFundsRate : null
    };
  });

  // Sort data by year to ensure correct x-axis ordering
  mergedData.sort((a, b) => a.year - b.year);

  // Get unique categories (states) from the data
  const categories = [...new Set(data.map(item => item.category))];
  
  // Color palette
  const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

  return (
    <ResponsiveContainer width="100%" height={500}>
      <ComposedChart data={mergedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        
        {/* Left Y-axis for data values */}
        <YAxis 
          yAxisId="left" 
          label={{ 
            value: '', 
            angle: -90, 
            position: 'insideLeft',
            offset: 10
          }}
        />
        
        {/* Right Y-axis for Fed Funds Rate */}
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          label={{ 
            value: 'Fed Funds Rate (%)', 
            angle: 90, 
            position: 'insideRight',
            offset: 10
          }}
        />
        
        <Tooltip 
          formatter={(value, name, props) => {
            // Custom tooltip formatter to handle different data types
            if (name === 'Federal Funds Rate') {
              return [value.toFixed(2) + '%', name];
            }
            return [value.toFixed(2), name];
          }}
        />
        <Legend />

        {/* Fed Funds Rate as a line on the right Y-axis */}
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="FedFundsRate"
          name="Federal Funds Rate"
          stroke="#FF0000"
          strokeWidth={2}
          dot={false}
        />

        {/* Data categories as area charts on the left Y-axis */}
        {categories.map((category, index) => (
          <Area
            key={category}
            yAxisId="left"
            type="monotone"
            dataKey={category}
            name={category}
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            fillOpacity={0.1}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default AreaChartComponent;