'use client';

import { useState, useEffect} from 'react';
import { Table } from 'antd';

const DataTable = ({jsonData}) => {
    const [columns, setColumns] = useState([]);
    const [data, setData] = useState([]);
  
    useEffect(() => {
      const dataWithKeys = jsonData.map((item, index) => ({
        key: index,
        ...item
      }));
      
      if (jsonData.length > 0) {
        const cols = Object.keys(jsonData[0]).map(key => ({
          title: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
          dataIndex: key,
          key: key,
          sorter: (a, b) => typeof a[key] === 'number' ? a[key] - b[key] : String(a[key]).localeCompare(String(b[key]))
        }));
        setColumns(cols);
      }
      
      setData(dataWithKeys);
    }, [jsonData]);
  
    return (
        <div className='m-20'>
      <Table 
        columns={columns} 
        dataSource={data}
        rowClassName={(record, index) => (index % 2 === 0 ? 'even-row' : 'odd-row')}
        pagination={{ showSizeChanger: true }}
      />
      </div>
    );
};

export default DataTable;