import React from "react";
import {DatePicker, Layout, Select} from "antd";
import moment from "moment";

const {Header} = Layout;
const {RangePicker} = DatePicker;
const dateFormat = 'DD/MM/YYYY';

export default class ReportsHeader extends React.Component {
    constructor(props) {
        super(props);
        this.changeReport = this.changeReport.bind(this);
    }

    changeReport(evt) {
        // console.log(evt);
        this.props.history.push(evt);
    }

    render() {
        const that = this;
        const reportCategory = [{
            name: 'Daily Summary',
            value: '/erp/reports/summary',
            active: that.props.activePracticePermissions.ReportsDailySummary || that.props.allowAllPermissions
        }, {
            name: 'Income',
            value: '/erp/reports/income',
            active: that.props.activePracticePermissions.ReportsIncome || that.props.allowAllPermissions
        }, {
            name: 'Payments',
            value: '/erp/reports/payments',
            active: that.props.activePracticePermissions.ReportsPayments || that.props.allowAllPermissions
        }, {
            name: 'Appointment',
            value: '/reports/appointments',
            active: that.props.activePracticePermissions.ReportsAppointments || that.props.allowAllPermissions
        }, {
            name: 'Patients',
            value: '/erp/reports/patients',
            active: that.props.activePracticePermissions.ReportsPatients || that.props.allowAllPermissions
        }, {
            name: 'Amount Due',
            value: '/erp/reports/amountdue',
            active: that.props.activePracticePermissions.ReportsAmountDue || that.props.allowAllPermissions
        }, {
            name: 'Expenses',
            value: '/erp/reports/expenses',
            active: that.props.activePracticePermissions.ReportsExpenses || that.props.allowAllPermissions
        }, {
            name: 'Inventory',
            value: '/erp/reports/inventory',
            active: that.props.activePracticePermissions.ReportsInventory || that.props.allowAllPermissions
        }, {
            name: 'EMR',
            value: '/erp/reports/emr',
            active: that.props.activePracticePermissions.ReportsEMR || that.props.allowAllPermissions
        }, {
            name: 'Bed Booking',
            value: '/erp/reports/bed_booking',
            active: that.props.activePracticePermissions.ReportsBedBooking || that.props.allowAllPermissions
        }, {
            name: 'Inventory Retails',
            value: '/erp/reports/inventoryretails',
            active: that.props.activePracticePermissions.ReportsInventoryRetail || that.props.allowAllPermissions
        },{
            name: 'MLM ',
            value: '/erp/reports/mlm',
            active: that.props.activePracticePermissions.ReportsMLMReport || that.props.allowAllPermissions
        },{
            name: 'Invoice Returns ',
            value: '/erp/reports/invoice-return',
            active: that.props.activePracticePermissions.ReportsInventoryRetail || that.props.allowAllPermissions
        },{
            name: 'Task Track',
            value: '/erp/reports/tasks',
            active: that.props.activePracticePermissions.ReportsTaskTrack || that.props.allowAllPermissions
        },{
            name:'Suggestions',
            value:'/erp/reports/suggestions',
            active: that.props.activePracticePermissions.ReportsSuggestions || that.props.allowAllPermissions
        }];
        return (
<Header style={{background: '#fff'}}>
            <ul style={{listStyle: 'none'}}>
                <li style={{display: 'inline'}}>
                    Select Report Category &nbsp;
                </li>
                <li style={{display: 'inline'}}>
                    <Select
                      style={{minWidth: '200px'}}
                      defaultValue={reportCategory[3].name}
                      value={this.props.history.location.pathname}
                      onChange={this.changeReport}
                    >
                        {reportCategory.map((item) => (
<Select.Option
  value={item.value}
  disabled={!item.active}
>{item.name}
</Select.Option>
))}
                    </Select>
                </li>
                <li style={{display: 'inline', float: 'right'}}>
                    <RangePicker
                      allowClear={false}
                      onChange={(date, dateString) => that.props.reportsDateRange(dateString)}
                      defaultValue={[moment(), moment()]}
                      format={dateFormat}
                    />
                </li>
            </ul>
</Header>
)
    }
}
