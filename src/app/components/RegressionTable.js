'use client';

import { useState, useEffect } from 'react';
import * as ss from 'simple-statistics';
import { Table } from 'antd';

const RegressionTable = ({ data, dep, indep }) => {
        const [regressionResults, setRegressionResults] = useState([]);
        const [columns, setColumns] = useState([]);
    
        useEffect(() => {
        const regressionPoints = data.map(item => [item[dep], item[indep]]);
        
        const regression = ss.linearRegression(regressionPoints);
        const regressionLine = ss.linearRegressionLine(regression);
    
        const rSquared = ss.rSquared(regressionPoints, regressionLine);
    
        const analysisResults = [
          {
            key: '1',
            "Intercept (β₀)": regression.b.toFixed(4),
            "Slope (β₁)": regression.m.toFixed(4),
            "R-squared (R²)": rSquared.toFixed(4),
            "Total Observations": data.length
          }
        ];

        const cols = [
            {
              title: "Intercept (β₀)",
              dataIndex: "Intercept (β₀)",
              key: "Intercept (β₀)",
            },
            {
              title: "Slope (β₁)",
              dataIndex: "Slope (β₁)",
              key: "Slope (β₁)",
            },
            {
              title: "R-squared (R²)",
              dataIndex: "R-squared (R²)",
              key: "R-squared (R²)",
            },
            {
              title: "Total Observations",
              dataIndex: "Total Observations",
              key: "Total Observations",
            }
          ];



        setColumns(cols);
        setRegressionResults(analysisResults);
      }, [data]);
    
      return (<div className='mt-8 ml-20 mr-20 mb-20'>
      <Table 
        columns={columns} 
        dataSource={regressionResults}
        pagination={{ 
            showPagination: false,
            hideOnSinglePage: true 
          }}
      />
      </div>);
    };

export default RegressionTable;