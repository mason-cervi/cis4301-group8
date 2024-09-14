import { Card } from 'antd';

export default function Home() {
  return (
      <div className="items-center justify-center min-h-screen text-center">
        <div className="mt-10 mb-1">
          <h1 className="text-2xl">Trend Analysis of Income Tax Data</h1>
        </div>
        <div>
          <p>Impact of Macroeconomic Indicators and Economic Cycles</p>
        </div>
      <div className="flex p-16">
        <div className="m-5">
          <Card title="Purpose" bordered={true}>
          <p>Our project aims to explore the relationship between 
            individual income and broader economic trends. This involves analyzing tax 
            data collected over time, allowing for in-depth queries on how income is both 
            affected by and influences macroeconomic events and indicators.
          </p>
          </Card>
        </div>
        <div className="m-5">
          <Card title="Data details" bordered={true}>
          <p>We chose to use IRS income tax data ranging between the years 2009 - 2021 as our 
            primary source of data as Income distribution and its variation over time 
            across different geographic regions and demographic groups would likely provide 
            interesting insights into the economy over a period of twenty four years. The 
            data also allows us to examine the effects of economic events, policies and programs 
            and shifts in income across different sectors over time. Moreover, the dataset also 
            encompasses records in the degree of magnitude that the project requirements specify. 
          </p>
          </Card>
        </div>
      </div>
      </div>
  );
}
