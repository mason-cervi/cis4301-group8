'use client';

import { useState } from 'react';
import { Button, Slider, Select } from 'antd';
import DataTable from '../DataTable';
import AreaChartComponent from '../LineChart';
import StateMap from '../StateMap';

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
  const [chartData, setchartData] = useState([]);
  const [chartSelection, setChartSelection] = useState("Low Income");

  const handleUS_StateChange = (value) => {
    setUS_State(value);
  }

  const handleSliderChange = (value) => {
    setRange(value);
}

  const handlechartSelectionChange = (value) => {
    setChartSelection(value);

    setchartData((data.map(row => {
      if (row['Income Bracket'] === value) {
        return {
          year: row.Year,
          value: row['Number of People'] / 1000,
          category: row.State,
        };
      } else {
        return null;
      }
    }).filter(row => row !== null)));
}

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    const statesQuery = US_state.join(",");

    if (US_state.length === 0) {
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`/api/tax_stats?queryId=5&startYear=${range[0]}&endYear=${range[1]}&state=${statesQuery}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonData = await response.json();
      setData(jsonData);

      setchartData(jsonData.map(row => {
        if (row['Income Bracket'] === 'Low Income') {
          return {
            year: row.Year,
            value: row['Number of People'] / 1000,
            category: row.State,
          };
        } else {
          return null;
        }
      }).filter(row => row !== null));
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
        <div className="mb-8">
        <div className="grid grid-cols-5 items-center">
          <div className="col-span-2 flex flex-col items-center w-full pt-4">
          <span className="text-center font-light mb-8">Select states to display:</span>
          <Select
            mode='multiple'
            maxTagCount={10}
            defaultValue={US_state}
            onChange={handleUS_StateChange}
            style={{ width: 120 }}
            options={states.map(state => ({ 
              value: state, 
              label: state 
            }))}
          />
          </div>
          <div className="col-span-3 flex justify-center mr-10 ml-10">
          <StateMap selectedStates={US_state} />
          </div>
        </div>
        </div>
        <div className="font-light text-left ml-48 pb-6">
          Select a range of years from 2009 to 2021:
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
          className="w-full md:w-auto mb-32"
        >
          {isLoading ? 'Loading...' : 'Fetch Data'}
        </Button>
      </div>
      <div className="mb-8 font-light flex items-center justify-between">
        <div className="flex-1 text-center">
          {data.length !== 0 && <>Income Distribution: {chartSelection} (in thousands of people)</>}
        </div>

        <div className="flex-none mr-28">
          {data.length !== 0 && <Select
            maxTagCount={10}
            defaultValue={chartSelection}
            onChange={handlechartSelectionChange}
            style={{ width: 300 }}
            options={[
                { value: 'Low Income', label: 'Low Income' },
                { value: 'Middle Income', label: 'Middle Income' },
                { value: 'High Income', label: 'High Income' },
            ]}
          />}
        </div>
      </div>
      <div className="mb-16 m-20">
        {data.length !== 0 && <AreaChartComponent
          data={chartData} />}
      </div>
      <div className="mb-8">
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