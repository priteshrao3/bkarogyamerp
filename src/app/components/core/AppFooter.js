import React from "react";
import {Layout, Typography} from 'antd';

const {Text} = Typography;
const {Footer} = Layout;

class AppFooter extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Footer style={{background: 'white',boxShadow: 'rgba(38, 50, 69, 0.2) 0px -4px 5px 2px', zIndex: 1,padding:'5px 10px'}}>
                <span style={{float:'left'}}>Version: <Text type="secondary">{process.env.REACT_APP_VERSION}</Text></span>
                <span style={{float:'right'}}>Powered by: <a target="__blank" href="https://plutonic.co.in">Plutonic Services</a></span>
            </Footer>
        )
    }
}

export default AppFooter;
