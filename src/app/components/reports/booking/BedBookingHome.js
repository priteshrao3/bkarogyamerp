import React from "react";
import {Button, Card, Col, Radio, Row, Select} from "antd";
import {BED_BOOKING_RELATED_REPORT, OPD_IPD, PAYMENT_STATUS} from "../../../constants/hardData";
import {
    ALL,
    BED_BOOKING_PACKAGE_COUNT,
    DAILY_BOOKING_COUNT,
    MEDICINE_USAGE_COUNT,
    MONTHLY_BOOKING_COUNT
} from "../../../constants/dataKeys";
import {getAPI, interpolate} from "../../../utils/common";
import {BED_PACKAGES} from "../../../constants/api";
import BedBookingReport from "./BedBookingReport";
import DailyBookingCount from "./DailyBookingCount";
import MonthlyBookingCount from "./MonthlyBookingCount";
import MedicineUsageCount from "./MedicineUsageCount";
import BedBookingPackageCount from "./BedBookingPackageCount";

export default class BedBookingHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            report_type:'ALL',
            sidePanelColSpan:4,
            advancedOptionShow: true,
            packages:[],
        };
        this.loadPackages = this.loadPackages.bind(this);
    }

    componentDidMount() {
        this.loadPackages();
    }

    onChangeHandle =(type,value)=>{
        const that=this;
        this.setState({
            [type]:value.target.value,
        })
    };

    loadPackages = () => {
        const that = this;
        const successFn = function (data) {
            that.setState({
                packages: data
            })
        }
        const errorFn = function () {
        }
        getAPI(interpolate(BED_PACKAGES, [this.props.active_practiceId]), successFn, errorFn);

    }

    advancedOption(value){
        this.setState({
            advancedOptionShow:value,
        })
    }

    changeSidePanelSize = (sidePanel) => {
        this.setState({
            sidePanelColSpan: sidePanel ? 0 : 4
        })
    };

    handleChangeOption = (type,value) => {
        const that = this;
        this.setState({
            [type]: value,
        })
    };

    render() {
        const that=this;
        return (
<div>
            <h2>Bed Booking Report <Button
              type="primary"
              shape="round"
              icon={this.state.sidePanelColSpan ? "double-right" : "double-left"}
              style={{float: "right"}}
              onClick={() => this.changeSidePanelSize(this.state.sidePanelColSpan)}
            >Panel
                                   </Button>
            </h2>
            <Card>
                <Row gutter={16}>
                    <Col span={(24 - this.state.sidePanelColSpan)}>
                        {this.state.report_type == ALL?
                            <BedBookingReport {...this.props} {...this.state} />:null}
                        {this.state.report_type == DAILY_BOOKING_COUNT?
                            <DailyBookingCount {...this.props} {...this.state} />:null}
                        {this.state.report_type == MONTHLY_BOOKING_COUNT?
                            <MonthlyBookingCount {...this.props} {...this.state} />:null}
                        {this.state.report_type ==MEDICINE_USAGE_COUNT?
                            <MedicineUsageCount {...this.props} {...this.state} />:null}
                        {this.state.report_type ==BED_BOOKING_PACKAGE_COUNT?
                            <BedBookingPackageCount {...this.props} {...this.state} />:null}

                    </Col>

                    <Col span={this.state.sidePanelColSpan}>
                        <Radio.Group buttonStyle="solid" defaultValue={ALL} onChange={(value)=>this.onChangeHandle('report_type',value)}>
                            <h2>Bed Booking</h2>
                            <Radio.Button
                              style={{width: '100%', backgroundColor: 'transparent', border: '0px'}}
                              value={ALL}
                            >
                                All Bookings
                            </Radio.Button>
                            <p><br /></p>
                            <h2>Related Reports</h2>
                            {BED_BOOKING_RELATED_REPORT.map((item) => (
<Radio.Button
  style={{width: '100%', backgroundColor: 'transparent'}}
  value={item.value}
>
                                {item.name}
</Radio.Button>
))}
                        </Radio.Group>

                        <br />
                        <br />
                        {this.state.advancedOptionShow?(
<>
                            <Button type="link" onClick={(value)=>this.advancedOption(false)}>Hide Advanced Options </Button>
                            <Col> <br />
                                <h4>Bed Package</h4>
                                <Select
                                  style={{minWidth: '200px'}}
                                  mode="multiple"
                                  placeholder="Select Bed Package"
                                  onChange={(value)=>this.handleChangeOption('bed_packages',value)}
                                >
                                    {that.state.packages.map(option => (
<Select.Option
  value={option.id}
>{option.name}
</Select.Option>
))}
                                </Select>

                                <br />
                                <br />
                                <h4>Type</h4>
                                <Select
                                  style={{minWidth: '200px'}}
                                  placeholder="Select type"
                                  defaultValue={ALL}
                                  onChange={(value)=>this.handleChangeOption('type',value)}
                                >
                                    <Select.Option value="">{ALL}</Select.Option>
                                    {OPD_IPD.map(option => (
<Select.Option
  value={option.value}
>{option.label}
</Select.Option>
))}
                                </Select>
                                <br />
                                <br />
                                <h4>Payment Status</h4>
                                <Select
                                  style={{minWidth: '200px'}}
                                  placeholder="Select Payment Status"
                                  defaultValue={ALL}
                                  onChange={(value)=>this.handleChangeOption('payment_status',value)}
                                >
                                    <Select.Option value="">{ALL}</Select.Option>
                                    {PAYMENT_STATUS.map(option => (
<Select.Option
  value={option.value}
>{option.label}
</Select.Option>
))}
                                </Select>



                            </Col>
</>
): <Button type="link" onClick={(value)=>this.advancedOption(true)}>Show Advanced Options </Button>}
                    </Col>
                </Row>
            </Card>
</div>
)
    }
}
