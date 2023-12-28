import React, { Component } from 'react';
import { Card, Icon, Tabs, Row } from "antd";
import CountrySetting from './CountrySetting';
import StateSetting from './StateSetting';
import CitySetting from './CitySetting';

const { TabPane } = Tabs;

class AddressSettings extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        return (
            <div>
                <Row>
                    <h2>Address Settings</h2>
                    <Card>
                        <Tabs defaultActiveKey="address">
                            <TabPane tab={<span>Country</span>} key="country">
                                <CountrySetting {...this.props} />
                            </TabPane>

                            <TabPane tab={<span>State</span>} key="state">
                                <StateSetting {...this.props} />
                            </TabPane>

                            <TabPane tab={<span>City </span>} key="city">
                                <CitySetting {...this.props} />
                            </TabPane>

                        </Tabs>
                    </Card>
                </Row>
            </div>
        );
    }

}

export default AddressSettings
