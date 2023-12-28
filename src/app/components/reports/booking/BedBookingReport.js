import React from "react";
import {Select, Tag} from "antd";
import moment from "moment";
import {BED_BOOKING_REPORTS} from "../../../constants/api";
import {getAPI} from "../../../utils/common";
import CustomizedTable from "../../common/CustomizedTable";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";
import {sendReportMail} from "../../../utils/clinicUtils";

export default class BedBookingReport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            bedBookingReports: [],
            packages: [],
            mailingUsersList: this.props.mailingUsersList

        };
        this.loadBedBookingReport = this.loadBedBookingReport.bind(this);
    }

    componentDidMount() {
        this.loadBedBookingReport();
    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate || this.props.bed_packages != newProps.bed_packages || this.props.payment_status != newProps.payment_status
            || this.props.type != newProps.type)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            }, function () {
                that.loadBedBookingReport();
            })

    }

    loadBedBookingReport = (page = 1) => {
        const that = this;
        this.setState({
            loading: true
        })
        const successFn = function (data) {
            if (data.current == 1)
                that.setState({
                    bedBookingReports: data.results,
                    loading: false,
                    nextReport: data.next
                });
            else
                that.setState(function (prevState) {
                        return {
                            bedBookingReports: [...prevState.bedBookingReports, ...data.results],
                            loading: false,
                            nextReport: data.next
                        }
                    }
                );
        };
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        const apiParams = {
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
            page,
            practice: this.props.active_practiceId
        }
        if (this.props.payment_status) {
            apiParams.payment_status = this.props.payment_status
        }
        if (this.props.type) {
            apiParams.type = this.props.type
        }
        if (this.props.bed_packages) {
            apiParams.bed_packages = this.props.bed_packages.join(',');
        }
        getAPI(BED_BOOKING_REPORTS, successFn, errorFn, apiParams);
    };


    sendMail = (mailTo) => {
        const that = this;
        const apiParams = {
            practice: this.props.active_practiceId,
            report_type:this.props.report_type,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
        };

        if (this.props.payment_status) {
            apiParams.payment_status = this.props.payment_status
        }
        if (this.props.type) {
            apiParams.type = this.props.type
        }
        if (this.props.bed_packages) {
            apiParams.bed_packages = this.props.bed_packages.join(',');
        }
        apiParams.mail_to = mailTo;
        sendReportMail(BED_BOOKING_REPORTS,  apiParams)
    };


    render() {
        const that = this;
        let i = 1;
        const columns = [{
            title: 'S. No',
            key: 'sno',
            render: (item, record) => <span> {i++}</span>,
            export: (item, record) => {
                i++
            },
            width: 50
        }, {
            title: 'Patient Name',
            key: 'patient',
            dataIndex: 'patient',
            render:(patient)=>patient ? <span>{patient.user.first_name}&nbsp;({patient.custom_id})</span> : null
        },{
            title: 'Package Name',
            key: 'name',
            dataIndex: 'bed_package.name'
        }, {
            title: 'Medicine Package',
            key: 'medicine',
            dataIndex: 'medicines',
            render: (text, record) => (
<span>{text.map((item) =>
                <Tag>{item.name}</Tag>
            )}
</span>
)
        }, {
            title: 'From ',
            key: 'from_date',
            render: (text, record) => (
                <span>
                {moment(record.from_date).format('LL')}
                </span>
            ),
        }, {
            title: 'To ',
            key: 'to_date',
            render: (text, record) => (
                <span>
                {moment(record.to_date).format('LL')}
                </span>
            ),
        }, {
            title: 'Seat/Bed Type',
            key: 'seat_type',
            dataIndex: 'seat_type'

        }, {
            title: 'Seat Number',
            key: 'seat_no',
            dataIndex: 'seat_no'

        },
            // {
            //     title:'No Of Room',
            //     key:'room',
            //     dataIndex:'bed_package.room'
            // }

            {
                title: 'Total price',
                key: 'total_price',
                dataIndex: 'total_price',
                render: (value) => (<p>{value.toFixed(2)}</p>)

            }, {
                title: 'Payment Status',
                key: 'payment_status',
                dataIndex: 'payment_status'

            }];
        return (
<div>
            <h2>Seat/Bed Booking Report
                <span style={{float: 'right'}}>
                    <p><small>E-Mail To:&nbsp;</small>
                        <Select onChange={(e) => this.sendMail(e)} style={{width: 200}}>
                            {this.state.mailingUsersList.map(item => (
<Select.Option
  value={item.email}
>{item.name}
</Select.Option>
))}
                        </Select>
                    </p>
                </span>
            </h2>
            <CustomizedTable
              hideReport
              pagination={false}
              columns={columns}
              dataSource={this.state.bedBookingReports}
            />
            <InfiniteFeedLoaderButton
              loaderFunction={() => this.loadBedBookingReport(this.state.nextReport)}
              loading={this.state.loading}
              hidden={!this.state.nextReport}
            />
</div>
)
    }
}
