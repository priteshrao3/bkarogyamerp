import { displayMessage, getAPI, interpolate, postAPI } from "../../../../utils/common";
import { Button, Divider, Form, Modal, Popconfirm, Tag } from "antd";
import {
    INPUT_FIELD,
    MULTI_SELECT_FIELD,
    NUMBER_FIELD,
    SELECT_FIELD,
    SUCCESS_MSG_TYPE
} from "../../../../constants/dataKeys";
import { HSN_CODES, TAXES } from "../../../../constants/api";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import CustomizedTable from "../../../common/CustomizedTable";
import React from "react";

export default class HSNCodes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            taxes:[],
            codes: []
        };
    }

    componentDidMount() {
        this.loadHSNData();
        this.loadTaxes();
    }
    loadTaxes() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                taxes: data,
            })
        };
        const errorFn = function () {

        };
        getAPI(interpolate(TAXES, [this.props.active_practiceId]), successFn, errorFn);
    }
    loadHSNData = (page = 1) => {
        let that = this;
        that.setState({
            loading:true
        })
        let successFn = function(data) {
            that.setState({
                codes: data,
                loading:false
            });
        };
        let errorFn = function() {
            that.setState({
                loading:false
            })
        };
        getAPI(HSN_CODES, successFn, errorFn,{practice:this.props.active_practiceId});
    };

    deleteObject(record) {
        const that = this;
        const reqData = record;
        reqData.is_active = false;
        const successFn = function (data) {
            that.loadHSNData();
        }
        const errorFn = function () {
        };
        postAPI(HSN_CODES, reqData, successFn, errorFn,{practice:this.props.active_practiceId})
    }
    render() {
        const that = this;
        const {taxes} = this.state;
        const columns = [{
            title: "HSN Code",
            dataIndex: "code",
            key: "code"
        }, {
            title: "Same State Tax",
            dataIndex: "taxes_data",
            key: "taxes_data",
            render: (value, record) => (<span>{value.map(item=><Tag>{item.name}@{item.tax_value}%</Tag>)}</span>)
        }, {
            title: "Other State Tax",
            dataIndex: "state_taxes_data",
            key: "state_taxes_data",
            render: (value, record) => (<span>{value.map(item=><Tag>{item.name}@{item.tax_value}%</Tag>)}</span>)
        }, {
            title: "Actions",
            key: "action",
            render: (text, record) => (
                <span>
              {/* <a onClick={() => this.editTax(record)}>  Edit</a> */}
                    {/* <Divider type="vertical"/> */}
                    <Popconfirm
                        title="Are you sure delete this?"
                        onConfirm={() => that.deleteObject(record)}
                        okText="Yes"
                        cancelText="No"
                    >
                      <a>Delete</a>
                    </Popconfirm>
                </span>
            )
        }];
        const fields = [{
            label: "HSN CODE",
            key: "code",
            placeholder: "HSN Code",
            required: true,
            type: INPUT_FIELD
        }, {
            label: "Same State Tax",
            key: "taxes",
            required: true,
            type: MULTI_SELECT_FIELD,
            options:taxes.map(item=>{return {label:item.name+" ("+item.tax_value+"%)",value:item.id}})
        }, {
            label: "Other State Tax",
            key: "state_taxes",
            required: true,
            type: MULTI_SELECT_FIELD,
            options:taxes.map(item=>{return {label:item.name+" ("+item.tax_value+"%)",value:item.id}})
        }];
        const editfields = [{
            label: "Tax name",
            key: "name",
            required: true,
            initialValue: this.state.editingName,
            type: INPUT_FIELD
        }, {
            label: "Tax Value",
            key: "tax_value",
            follow: "%",
            max: 100,
            min: 0,
            required: true,
            initialValue: this.state.editingValue,

            type: NUMBER_FIELD
        }];
        const formProp = {
            successFn(data) {
                that.loadHSNData();
                displayMessage(SUCCESS_MSG_TYPE, "success");
            },
            errorFn() {

            },
            action: HSN_CODES,
            method: "post"
        };
        const defaultValues = [{ "key": "practice", "value": this.props.active_practiceId }];
        const editFormDefaultValues = [{ "key": "practice", "value": this.props.active_practiceId }, {
            "key": "id",
            "value": this.state.editingId
        }];
        const TestFormLayout = Form.create()(DynamicFieldsForm);
        return (
            <div>
                <TestFormLayout defaultValues={defaultValues} formProp={formProp} fields={fields} {...this.props} />
                <Divider/>
                <CustomizedTable loading={this.state.loading} columns={columns} dataSource={this.state.codes}/>
                <Modal
                    title="Edit Tax"
                    visible={this.state.visible}
                    footer={null}
                    onCancel={this.handleCancel}
                >
                    <TestFormLayout defaultValues={editFormDefaultValues} formProp={formProp} fields={editfields}/>
                    <Button key="back" onClick={this.handleCancel}>Return</Button>,

                </Modal>
            </div>
        );
    }
}
