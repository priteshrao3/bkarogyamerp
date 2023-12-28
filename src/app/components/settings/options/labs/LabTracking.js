import React from "react";
import {Card, Tabs} from 'antd';
import LabTest from "./LabTest";
import LabPanel from "./LabPanel";

const {TabPane} = Tabs;
export default class LabTracking extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        return (
<div>
            <h2>Lab Tracking</h2>
            <Card>
                <Tabs>
                    <TabPane key="labTests" tab="Lab Tests">
                        <LabTest {...this.props} />
                    </TabPane>
                    <TabPane key="labPanels" tab="Lab Panels">
                        <LabPanel {...this.props} />
                    </TabPane>
                </Tabs>
            </Card>
</div>
)
    }
}
