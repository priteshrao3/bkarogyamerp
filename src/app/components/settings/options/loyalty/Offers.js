import React from "react";
import {Button, Card, Divider, Icon, Popconfirm, Row,} from "antd";
import {Link} from "react-router-dom";
import {OFFERS} from "../../../../constants/api";
import {getAPI, interpolate, postAPI} from "../../../../utils/common";
import CustomizedTable from "../../../common/CustomizedTable";
import AddOffer from "./AddOffer";

class Offers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            offers: null,
            loading: true
        }
        this.loadData = this.loadData.bind(this);
        this.deleteObject = this.deleteObject.bind(this);
    }

    componentWillMount() {
        this.loadData()
    }

    loadData() {
        const that = this;
        const successFn = function (data) {
            console.log("get table");
            that.setState({
                offers: data,
                loading: false
            })
        };
        const errorFn = function () {
            that.setState({
                loading: true
            })
        };
        getAPI(interpolate(OFFERS, [this.props.active_practiceId]), successFn, errorFn);
    }

    deleteObject(record) {
        const that = this;
        const reqData = record;
        reqData.is_active = false;
        const successFn = function (data) {
            that.loadData();
        }
        const errorFn = function () {
        }
        postAPI(interpolate(OFFERS, [this.props.active_practiceId]), reqData, successFn, errorFn);
    }

    render() {
        const that = this;
        const columns = [{
            title: 'Name',
            dataIndex: 'code',
            key: 'code',
        }, {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        }, {
            title: 'Discount',
            dataIndex: 'discount',
            key: 'discount',
        }, {
            title: 'Discount Unit',
            dataIndex: 'unit',
            key: 'unit'
        }, {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <Popconfirm
                  title="Are you sure delete this Offer?"
                  onConfirm={() => that.deleteObject(record)}
                  okText="Yes"
                  cancelText="No"
                >
                    <a>
                        Delete
                    </a>
                </Popconfirm>
            ),
        }];
        return (
<Row>
            {/* <h2>All Offers */}
            {/* <Link to="/settings/loyalty/add"> */}
            {/* <Button type="primary" style={{float: 'right'}}> */}
            {/* <Icon type="plus"/>&nbsp;Add */}
            {/* </Button> */}
            {/* </Link> */}
            {/* </h2> */}
            <AddOffer {...this.props} loadData={this.loadData} />
            <Divider />
            <CustomizedTable loading={this.state.loading} columns={columns} dataSource={this.state.offers} />
</Row>
)
    }
}

export default Offers;
