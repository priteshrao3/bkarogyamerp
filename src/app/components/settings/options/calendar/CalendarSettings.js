import React from "react";
import {Form, Button, Card, Icon, Tabs, Divider, Tag, Row, Table} from "antd";
import {Link} from "react-router-dom";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {CHECKBOX_FIELD, INPUT_FIELD, RADIO_FIELD, SELECT_FIELD} from "../../../../constants/dataKeys";
import PracticeTimings from "./PracticeTimings";
// import CancelledInvoice from "./CancelledInvoice";
import AppointmentCategories from "./AppointmentCategories";
import {TAXES} from "../../../../constants/api"
import {getAPI, interpolate} from "../../../../utils/common";

const {TabPane} = Tabs;


class CalendarSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            defaultActiveKey: this.props.location.hash
        }
    }

    render() {
        return (
<div>
            <h2>Calendar Settings</h2>
            <Row>
                <Card>
                    <Tabs defaultActiveKey={this.state.defaultActiveKey}>
                        <TabPane tab={<span><Icon type="schedule" />Calender Timings Settings</span>} key="#timings">
                            <PracticeTimings {...this.state} {...this.props} />
                        </TabPane>
                        <TabPane
                          tab={<span><Icon type="reconciliation" />Appointment Categories</span>}
                          key="#categories"
                        >
                            <AppointmentCategories {...this.props} />
                        </TabPane>
                    </Tabs>
                </Card>
            </Row>
</div>
)
    }
}

export default CalendarSettings;
