import {Layout, Menu, Carousel, Button, Dropdown , Card, Col, Row, Input  } from 'antd';
import React from 'react';


const { Header, Footer} = Layout;

React.CSSProperties = {
  height: '160px',
  color: '#fff',
  lineHeight: '160px',
  textAlign: 'center',
  background: '#364d79',
};

const Homebase = () => (
  
<Layout className="layout">

<Header className='flex justify-between items-center' style={{ background: 'lightblue' }}>
      <div className="logo" style={{float: 'left',
            width: '50px',
            height: '50px',
            margin: '16px 24px 16px 0',
            background: 'rgba(255, 255, 255, 0.3)',}} >
              <img src="favicon.png" alt="Your Logo" />
            </div>

            <div style={{ display: 'flex', alignItems: 'left' }}>
              <Button className="left-aligned-button">Medicines</Button>
              <Input className="mr-64" placeholder="Search for medicines" style={{ width: '350px' }} />
            </div>

            <div
            defaultSelectedKeys={['2']}>
            <Button className='mr-1 rounded-xl border-blue-700 border-4'>Need Help?</Button>
            <Button type="primary">Login/Signup</Button>
            </div>
      
    </Header><br/><br/>
    
      <div>
        <Menu
          theme="light"
          mode="horizontal"
          style={{ display: 'flex', justifyContent: 'center', color: 'black' }}
          defaultSelectedKeys={['2']}>
            <Menu.Item>Buy Medicines</Menu.Item>
            <Menu.Item>Feed</Menu.Item>
            <Menu.Item>Webinar</Menu.Item>
            <Menu.Item>Quiz</Menu.Item>
            <Menu.Item>Bk Partner</Menu.Item>
            <Menu.Item>Learning</Menu.Item>
            <Menu.Item>My Orders</Menu.Item>
            <Menu.Item>Arogyam Tool</Menu.Item>
            <Menu.Item>Blogs</Menu.Item>
            <Menu.Item>Find clinics</Menu.Item>
            <Menu.Item>Find Doctors</Menu.Item>
        </Menu>
      </div>

      <div>
        <Menu
          theme="light"
          mode="horizontal"
          style={{ display: 'flex', justifyContent: 'center' }}
          defaultSelectedKeys={['2']}>
            
            <Menu.Item style={{ color: 'black' }}>All Medicines</Menu.Item>
            <Menu.Item style={{ color: 'black' }}>Brand</Menu.Item>
            <Menu.Item style={{ color: 'black' }}>Classical Medicines</Menu.Item>
            <Menu.Item style={{ color: 'black' }}>Petented Medicines</Menu.Item>
            <Menu.Item style={{ color: 'black' }}>Treatments</Menu.Item>
            <Menu.Item style={{ color: 'black' }}>Services</Menu.Item>
            <Menu.Item style={{ color: 'black' }}>Offers</Menu.Item>
        </Menu>
      </div>
    
      <div>
        <Carousel autoplay>
          <img src="baner.jpg" alt="Your Logo" />
          <img src="baner.jpg" alt="Your Logo" />
          <img src="baner.jpg" alt="Your Logo" />
          <img src="baner.jpg" alt="Your Logo" />
        </Carousel>
      </div>

      <div>
      <h1 className=''>This is a heading.</h1>
       <Row gutter={16}>
          <Col span={6}>
            <Card>
            
              <button>learn more</button>
            <div className="logo" style={{float: 'left',
            width: '250px',
            height: '120px',
            margin: '16px 24px 16px 0',
            background: 'rgba(255, 255, 255, 0.3)',}} >
              <img src="baner.jpg" alt="Your Logo" />
            </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card title="Card title" bordered={false}>
              Card content
            </Card>
          </Col>
          <Col span={6}>
            <Card title="Card title" bordered={false}>
              Card content
            </Card>
          </Col>
          <Col span={6}>
            <Card title="Card title" bordered={false}>
              Card content
            </Card>
          </Col>
          
        </Row>
      </div>
      
    <Footer
      style={{
        textAlign: 'center',
      }}
    >
    </Footer>
  </Layout>
);

export default Homebase;






