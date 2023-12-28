import React from "react";
import {Col, Row} from "antd";
import MonthlyTurnoverDashboardWidget from "./MonthlyTurnoverDashboardWidget";
import LastPayout from "./LastPayouts";
import TopAdvisors from "./TopAdvisors";

export default class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        return <div>
            <h2>Advisor Dashboard</h2>
            <Row gutter={16} style={{marginBottom:20}}>
                <Col xs={24} sm={24} md={16} lg={16}>
                    <MonthlyTurnoverDashboardWidget {...this.props}/>
                </Col>
                <Col xs={24} sm={24} md={8} lg={8}>
                    <LastPayout {...this.props}/>
                </Col>
            </Row>
            <Row>
                <Col xs={24} sm={24} md={16} lg={16}>
                    <TopAdvisors {...this.props}/>
                </Col>
            </Row>
        </div>
    }
}