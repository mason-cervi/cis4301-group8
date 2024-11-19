'use client';

import { useState } from 'react';
import { Button, Slider, Select } from 'antd';
import DataTable from './DataTable';

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const Dashboard = () => {
  const [range, setRange] = useState([2009, 2021]);
  const [US_state, setUS_State] = useState(['FL']);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUS_StateChange = (value) => {
    setUS_State(value);
  }

  const handleSliderChange = (value) => {
    setRange(value);
}

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    const statesQuery = US_state.join(",");
    
    try {
      const response = await fetch(`/api/tax_stats?startYear=${range[0]}&endYear=${range[1]}&state=${statesQuery}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonData = await response.json();
      setData(jsonData);
      console.log(data[0]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 items-center justify-center text-center mt-10">
        <div className="mb-16">
        <div className="text-center mt-8 mb-8 font-light text-sm">
                Selected states to analyze:
            </div>
        <Select
          mode='multiple'
          defaultValue={US_state}
          onChange={handleUS_StateChange}
          style={{ width: 120 }}
          options={states.map(state => ({ 
            value: state, 
            label: state 
          }))}
        />
        </div>
        <div className="mr-48 ml-48 mb-16">
            <Slider
                range
                step={1}
                value={range}
                min={2009}
                max={2021}
                onChange={handleSliderChange}
                className="custom-slider"
            />
            <div className="text-center mt-8 mb-8 font-light text-sm">
                Selected range: {range[0]} - {range[1]}
            </div>
        </div>
      <div className="mb-32">
        <Button 
          onClick={fetchData}
          disabled={isLoading}
          className="w-full md:w-auto"
        >
          {isLoading ? 'Loading...' : 'Fetch Data'}
        </Button>
      </div>
      <div>
        {data.length !== 0 && <DataTable jsonData={data} />}
      </div>

      {error && (
        <div className="text-red-500">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default Dashboard;