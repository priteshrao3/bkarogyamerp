import React from "react";
import {Divider, Popconfirm, Row, Table} from "antd";
import moment from "moment";
import AddOrEdiPromoCode from "./AddOrEdiPromoCode";
import {getAPI, interpolate, postAPI, putAPI} from "../../../../../utils/common";
import {PROMO_CODE, SEND_PROMO_CODE_SMS, SINGLE_PROMO_CODE} from "../../../../../constants/api";
import InfiniteFeedLoaderButton from "../../../../common/InfiniteFeedLoaderButton";


export default class PromoCode extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            promoCode: [],
        };

    }

    componentWillMount() {
        this.loadData();
    }

    loadData = (page = 1) => {
        const that = this;
        this.setState({
            loading: true,
        });

        const successFn = function (data) {
            that.setState({
                promoCode: data.results,
                nextPage: data.next,
                loading: false,
            })
        };
        const errorFn = function () {
            that.setState({
                loading: false,
            })
        };

        getAPI(interpolate(PROMO_CODE, [this.props.active_practiceId]), successFn, errorFn, {
            page,
            practice: this.props.active_practiceId
        });
    };

    deleteObject = (record) => {
        const that = this;
        const reqData = {
            // id:record.id,
            is_active: false
        };
        const successFn = function (data) {
            that.loadData();
        };

        const errorFn = function () {

        };
        putAPI(interpolate(SINGLE_PROMO_CODE, [record.id]), reqData, successFn, errorFn);
    };

    sendSMS = (record) => {
        const that = this;

        const successFn = function (data) {
            that.loadData();
        };

        const errorFn = function () {

        };
        getAPI(interpolate(SEND_PROMO_CODE_SMS, [record.id]),  successFn, errorFn);
    };

    render() {
        const {promoCode, loading} = this.state;

        const columns = [
            {
                title: 'Code Name',
                dataIndex: 'promo_code',
                key: 'promo_code',
            }, {
                title: 'Promo Code Value',
                dataIndex: 'code_value',
                key: 'code_value',
            }, {
                title: 'Type',
                dataIndex: 'code_type',
                key: 'code_type',
            }, {
                title: 'Min Order',
                dataIndex: 'minimum_order',
                key: 'minimum_order',

            }, {
                title: 'Max Discount',
                dataIndex: 'maximum_discount',
                key: 'maximum_discount',

            }, {
                title: 'Expiry Date',
                dataIndex: 'expiry_date',
                render: (item, record) => (moment(record.expiry_date).format('YYYY-MM-DD'))
            }, {
                title: 'Action',
                render: (text, record) => (
                    <div>
                        <Popconfirm
                          title="Are you sure send SMS for this promo code?"
                          onConfirm={() => this.sendSMS(record)}
                          okText="Yes"
                          cancelText="No"
                        >
                            <a>
                                Send SMS
                            </a>
                        </Popconfirm>
                        <Divider type="vertical" />
                        <Popconfirm
                          title="Are you sure delete this promo code?"
                          onConfirm={() => this.deleteObject(record)}
                          okText="Yes"
                          cancelText="No"
                        >
                            <a>
                                Delete
                            </a>
                        </Popconfirm>
                    </div>
                ),
            }

        ];
        return (
            <Row>
                <AddOrEdiPromoCode {...this.props} loadData={this.loadData} />
                <Divider />
                <Table loading={loading} columns={columns} dataSource={promoCode} pagination={false} />
                <InfiniteFeedLoaderButton
                  loading={this.state.loading}
                  hidden={!this.state.nextPage}
                  loaderFunction={() => this.loadData(this.state.nextPage)}
                />
            </Row>
        )
    }
}

