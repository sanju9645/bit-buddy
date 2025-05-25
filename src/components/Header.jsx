import React from "react";
import  Logo  from '../assets/logo.svg'; // Assuming the logo is an SVG file
import { Typography, Layout, theme } from "antd";

const { Header } = Layout;
const { Title } = Typography;

function HeaderSection() {
  return (
    <Layout>
      <Header className="header-container">
        <img className="header-logo" src={Logo}/>
        <Title level={3} className="header-title">Bit Buddy</Title>
      </Header>
    </Layout>
  );
}

export default HeaderSection;
