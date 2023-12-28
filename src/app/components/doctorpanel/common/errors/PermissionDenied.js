import React from "react";
import {Button, Col, Row} from "antd";
import {Link} from "react-router-dom";
import img403 from '../../../../assets/img/kidneycarelogo.png';

class PermissionDenied extends React.Component {
    render() {
        return <Row style={{marginTop: '20px'}}>
            <Col xs={24} sm={24} md={24} lg={12} xl={12} style={{textAlign: 'center', float: 'right'}}>
                <h1><b>403</b></h1>
                <h2>Permission Denied</h2>
                <h4><Link to="/"><Button type="primary">Go to Home</Button></Link></h4>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12} style={{textAlign: 'center'}}>
                <img src={img403} alt=""/>
            </Col>
        </Row>
    }
}

export default PermissionDenied;
