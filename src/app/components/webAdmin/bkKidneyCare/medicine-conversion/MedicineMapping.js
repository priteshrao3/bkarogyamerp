import React from 'react';
import {Divider, Form, Modal, Popconfirm, Table, Tag} from "antd";
import {
    CONEVRSION_LIST_API, CONVERSION_DETAIL_API,
    CONVERSION_DISEASE_API,
    CONVERSION_MEDICINE_API,
    MEDICINE_PACKAGES
} from "../../../../constants/api";
import {displayMessage, getAPI, interpolate, postAPI, putAPI} from "../../../../utils/common";
import {
    ERROR_MSG_TYPE,
    INPUT_FIELD,
    MULTI_SELECT_FIELD, SEARCH_FIELD,
    SELECT_FIELD, SINGLE_IMAGE_UPLOAD_FIELD,
    SUCCESS_MSG_TYPE, TEXT_FIELD
} from "../../../../constants/dataKeys";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import CustomizedTable from "../../../common/CustomizedTable";
import {ALLOPATH_TEXT, AYURVEDA_TEXT} from "../../../../constants/hardData";

export default class MedicineMapping extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            medicineMappingList: [],
            medicineMappingLoading: false,
            diseaseList: [],
            [ALLOPATH_TEXT]: [],
            [AYURVEDA_TEXT]: [],
            editData: null
        }
    }

    componentDidMount() {
        this.loadConversionMedicineMappingList();
        this.loadConversionDiseaseList();
    }

    loadConversionDiseaseList = () => {
        const that = this;
        const successFn = function (data) {
            that.setState({
                diseaseList: data
            })
        }
        const errorFn = function () {
            displayMessage(ERROR_MSG_TYPE, "Disease List Loading Failed.");
        }
        getAPI(CONVERSION_DISEASE_API, successFn, errorFn)
    }

    loadConversionMedicineMappingList = () => {
        const that = this;
        that.setState({
            medicineMappingLoading: true
        })
        const successFn = function (data) {
            that.setState({
                medicineMappingList: data.results,
                medicineMappingLoading: false
            })
        }
        const errorFn = function () {
            that.setState({
                medicineMappingLoading: false
            })
            displayMessage(ERROR_MSG_TYPE, "Medicine Mapping List Loading Failed.");
        }
        getAPI(CONEVRSION_LIST_API, successFn, errorFn)
    }


    deleteObject(record) {
        const that = this;
        const reqData = record;
        reqData.is_active = false;
        const successFn = function (data) {
            that.loadConversionMedicineMappingList();
        }
        const errorFn = function () {
        }
        putAPI(interpolate(CONVERSION_DETAIL_API, [record.id]), reqData, successFn, errorFn);
    }

    editModalToggle = (data) => {
        this.setState({
            editData: data
        });
    }

    render() {
        const that = this;
        const {diseaseList, medicineMappingList, medicineMappingLoading, editData} = this.state;
        const MedicineMappingFormLayout = Form.create()(DynamicFieldsForm);
        const formFields = [{
            label: 'Ayurveda Medicine',
            key: 'ayurveda',
            type: SEARCH_FIELD,
            mode: "multiple",
            required: true,
            options: {label: 'name', value: 'id'},
            initialValue: editData ? editData.ayurveda : [],
            searchAPI: CONVERSION_MEDICINE_API,
            searchKey: 'name_contains',
            searchDefaultParams: {medicine_type: AYURVEDA_TEXT},
            searchInitialFields: editData ? editData.ayurveda_data : []
        }, {
            label: 'Allopath Medicine',
            key: 'allopath',
            type: SEARCH_FIELD,
            required: true,
            mode: "multiple",
            options: {label: 'name', value: 'id'},
            initialValue: editData ? editData.allopath : [],
            searchAPI: CONVERSION_MEDICINE_API,
            searchKey: 'name_contains',
            searchDefaultParams: {medicine_type: ALLOPATH_TEXT},
            searchInitialFields: editData ? editData.allopath_data : []
        }, {
            label: 'Diseases',
            key: 'diseases',
            type: MULTI_SELECT_FIELD,
            required: true,
            options: diseaseList.map(item => {
                return {label: item.name, value: item.id}
            }),
            initialValue: editData ? editData.diseases : []
        }];
        const formCreateProps = {
            action: CONEVRSION_LIST_API,
            method: 'post',
            successFn() {
                that.loadConversionMedicineMappingList();
                displayMessage(SUCCESS_MSG_TYPE, "Medicine Mapping Added Successfully!!");
            },
            errorFn() {
                displayMessage(ERROR_MSG_TYPE, "Medicine Map Adding Failed!!");
            }
        };
        const tableColumns = [{
            title: 'Ayurveda Medicine',
            dataIndex: 'ayurveda_data',
            key: 'ayurveda_data',
            render: (item) => <span>{item ? item.map(med => <Tag>{med.name}</Tag>) : null}</span>
        }, {
            title: 'Allopath Medicine',
            dataIndex: 'allopath_data',
            key: 'allopath_data',
            render: (item) => <span>{item ? item.map(med => <Tag>{med.name}</Tag>) : null}</span>
        }, {
            title: 'Disease',
            dataIndex: 'diseases_data',
            key: 'diseases_data',
            render: (item) => <span>{item ? item.map(med => <Tag>{med.name}</Tag>) : null}</span>
        }, {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <span>
                    <a onClick={() => this.editModalToggle(record)}>
                Edit</a>
                <Divider type="vertical" />
                  <Popconfirm
                    title="Are you sure delete this item?"
                    onConfirm={() => that.deleteObject(record)}
                    okText="Yes"
                    cancelText="No"
                  >
                      <a>Delete</a>
                  </Popconfirm>
                </span>
            ),
        }];
        return (
            <div>
                <MedicineMappingFormLayout formProp={formCreateProps} fields={formFields} />
                <Divider />
                <Table
                  loading={medicineMappingLoading}
                  dataSource={medicineMappingList}
                  columns={tableColumns}
                />
                <Modal visible={!!editData} onCancel={() => this.editModalToggle(null)} footer={null}>
                    <MedicineMappingFormLayout
                      formProp={{
                            ...formCreateProps,
                            action: interpolate(CONVERSION_DETAIL_API, [editData ? editData.id : null]),
                            method: 'put'
                        }}
                      fields={formFields}
                      defaultValues={[{key: 'id', value: editData ? editData.id : null}]}
                      title="Edit Medicine Mapping"
                    />
                </Modal>
            </div>
        )

    }
}
