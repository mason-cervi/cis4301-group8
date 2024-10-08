import { Card, Row, Col } from 'antd';
import { DollarOutlined, SmileOutlined, LineChartOutlined, BankOutlined, ThunderboltOutlined } from '@ant-design/icons';
import Link from 'next/link';

const ClickableCards = () => {
  const data = [
    {
      title: 'Income Data',
      icon: <DollarOutlined style={{ fontSize: '48px' }} />,
      link: '/income-data'
    },
    {
      title: 'Dependent Care',
      icon: <SmileOutlined style={{ fontSize: '48px' }} />,
      link: '/dependent-care'
    },
    {
      title: 'Inflation',
      icon: <LineChartOutlined style={{ fontSize: '48px' }} />,
      link: '/inflation'
    },
    {
      title: 'Monetary Policy',
      icon: <BankOutlined style={{ fontSize: '48px' }} />,
      link: '/monetary-policy'
    },
    {
      title: 'Energy',
      icon: <ThunderboltOutlined style={{ fontSize: '48px' }} />,
      link: '/energy'
    },
  ];

  return (
    <div className="m-10">
    <Row gutter={[16, 16]} justify="center" align="middle">
      {data.map((item, index) => (
        <Col span={4} key={index}>
          <Link href={item.link} passHref>
          <Card
            hoverable
            bordered={true}
            cover={item.icon}
            style={{ textAlign: 'center'}}
            title={<span style={{ fontSize: '12px' }}>{item.title}</span>}
          >
          </Card>
          </Link>
        </Col>
      ))}
    </Row>
    </div>
  );
};

export default function HomePage() {
  return (
      <div className="items-center justify-center min-h-screen text-center">
        <div className="mt-10 mb-1">
          <h1 className="text-4xl font-bold font-roboto">Dollartrend</h1>
        </div>
        <div>
          <p>Learn about your money and economic trends from</p>
        </div>
        <div>Analysis of Income Data</div>
        <div><ClickableCards /></div>
      </div>
  );
}
