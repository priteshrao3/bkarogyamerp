import React from "react";
import {Button, Card, Icon} from 'antd';

export default class PatientRequiredNoticeCard extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const that = this;
        return (
<Card style={{textAlign: 'center'}}>
            <h2> Please select patient to further continue !!</h2>
            {this.props.togglePatientListModal ? (
                <Button type="primary" onClick={() => that.props.togglePatientListModal(true)}><Icon
                  type="user"
                /> Select Patient
                </Button>
              ) : null}
</Card>
)
    }
}
