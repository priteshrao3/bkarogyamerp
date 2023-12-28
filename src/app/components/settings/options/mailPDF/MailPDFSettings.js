import React from "react";
import {Card} from 'antd';
import PrintSettings from "../printout/PrintSettings";

export default class MailPDFSettings extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
<div>
            <h2>Email PDF Settings</h2>
            <Card>
                <PrintSettings
                  sub_type="INVOICE"
                  active_practiceId={this.props.active_practiceId}
                  type="MAIL"
                />
            </Card>
</div>
)
    }
}
