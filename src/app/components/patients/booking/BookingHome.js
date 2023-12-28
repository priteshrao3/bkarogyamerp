import React from "react";
import {Button, Card, Icon, Layout, Tag} from "antd";
import {Route, Switch} from "react-router";
import {Link} from "react-router-dom";
import moment from "moment";
import BedBookingForm from "./BedBookingForm";
import {BED_BOOKING_REPORTS, BOOKING_PDF, INVOICE_PDF_API} from "../../../constants/api";
import {getAPI, interpolate, makeFileURL} from "../../../utils/common";
import CustomizedTable from "../../common/CustomizedTable";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";
import PermissionDenied from "../../common/errors/PermissionDenied";
import {BACKEND_BASE_URL} from "../../../config/connect";

const {Content} = Layout;

export default class BookingHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            bedBookingReports: [],
            patient: this.props.currentPatient || {}
        };
        this.loadBedBookingReport = this.loadBedBookingReport.bind(this);
    }

    componentDidMount() {
        this.loadBedBookingReport();
    }

    loadPDF = (item) => {
        const that = this;
        const successFn = function (data) {
            if (data.report)
                window.open(BACKEND_BASE_URL + data.report);
        }
        const errorFn = function () {

        }
        getAPI(interpolate(BOOKING_PDF, [item.practice.id,item.id]), successFn, errorFn);
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
        getAPI(interpolate(BED_BOOKING_REPORTS, [this.props.active_practiceId]), successFn, errorFn, {
            patients: this.state.patient.id,
            page
        });
    }

    render() {
        const that=this;
        const columns = [{
            title: 'Bed Package',
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

        }, {
            title: 'Total price',
            key: 'total_price',
            dataIndex: 'total_price',
            render: (value) => (<p>{value.toFixed(2)}</p>)

        }, {
            title: 'Payment Status',
            key: 'payment_status',
            dataIndex: 'payment_status'

        }, {
            title: 'Created By',
            key: 'created',
            dataIndex: 'created'

        }, {
            title: 'Report',
            key: 'report_upload',
            dataIndex: 'report_upload',
            render:(value)=>value ? <a href={makeFileURL(value)} target="_blank">File</a> : null
        },{
            title:"Action",
            render:(value,record)=><span>{record.practice ? <a onClick={()=>that.loadPDF(record)}>Print</a>:null}</span>
        }];

        return (
<Content className="main-container" style={{minHeight: 280,}}>
            <Layout>
                <Switch>
                    <Route
                      path="/erp/patient/:patient/booking/bed-booking"
                      render={() =>(that.props.activePracticePermissions.PatientBookings || that.props.allowAllPermissions ?(
<BedBookingForm
  {...this.props}
  bedBooking
  loadData={this.loadBedBookingReport}
/>
):<PermissionDenied />)}
                    />

                    <Route>
                        <div>
                            <h2 />
                            <Card
                              title="Bed Bookings"
                              extra={(
<Link to={`/erp/patient/${  this.state.patient.id  }/booking/bed-booking`}>
                                <Button type="primary" style={{float: 'right'}}>
                                    <Icon type="plus" />&nbsp;Book A Seat
                                </Button>
</Link>
)}
                            >
                                <CustomizedTable
                                  pagination={false}
                                  hideReport
                                  loading={this.state.loading}
                                  columns={columns}
                                  dataSource={this.state.bedBookingReports}
                                />
                                <InfiniteFeedLoaderButton
                                  loaderFunction={() => this.loadBedBookingReport(this.state.nextReport)}
                                  loading={this.state.loading}
                                  hidden={!this.state.nextReport}
                                />
                            </Card>
                        </div>
                    </Route>
                </Switch>
            </Layout>
</Content>
)

    }
}
