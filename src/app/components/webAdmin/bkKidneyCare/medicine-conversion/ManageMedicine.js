import React from 'react';
import { Divider, Form, Modal, Popconfirm, Table, Tag } from 'antd';
import DynamicFieldsForm from '../../../common/DynamicFieldsForm';
import {
    ERROR_MSG_TYPE,
    INPUT_FIELD,
    MULTI_SELECT_FIELD, QUILL_TEXT_FIELD,
    SELECT_FIELD, SINGLE_IMAGE_UPLOAD_FIELD, SUCCESS_MSG_TYPE,
    TEXT_FIELD,
} from '../../../../constants/dataKeys';
import {
    CONEVRSION_LIST_API,
    CONVERSION_DISEASE_API,
    CONVERSION_MEDICINE_API,
    CONVERSION_SYMPTOM_API,
} from '../../../../constants/api';
import { displayMessage, getAPI, postAPI } from '../../../../utils/common';
import CustomizedTable from '../../../common/CustomizedTable';

export default class ManageMedicine extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            diseaseList: [],
            symptomsList: [],
            medicineList: [],
            medicineLoading: false,
            pagination: {
                pageSizeOptions: ['10', '20', '30', '40', '50', '100'],
                position: 'both',
                pageSize: 40,
                showSizeChanger: true,
                size: 'small',
                showQuickJumper: true,
                showTotal(total, range) {
                    return <Tag>Showing <b>{range[0]}</b> to <b>{range[1]}</b> of <b>{total}</b> items</Tag>;
                },
            },
        };
    }

    componentDidMount() {
        this.loadConversionMedicineList();
    }

    handleTableChange = (pagination, filters, sorter) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        pager.pageSize = pagination.pageSize;
        this.setState({
            pagination: pager,
        });
        this.loadConversionMedicineList(pagination.current);
    };

    loadConversionMedicineList = (page = 1) => {
        const that = this;
        that.setState({
            medicineLoading: true,
        });
        const successFn = function(data) {
            that.setState(function(prevState) {
                return {
                    pagination: { ...prevState.pagination, current: data.current, total: data.count },
                    medicineList: data.results,
                    medicineLoading: false,
                };
            });
        };
        const errorFn = function() {
            that.setState({
                medicineLoading: false,
            });
            displayMessage(ERROR_MSG_TYPE, 'Medicine List Loading Failed.');
        };
        const params = {
            page,
        };
        getAPI(CONVERSION_MEDICINE_API, successFn, errorFn, params);
    };

    deleteObject(record) {
        const that = this;
        const reqData = record;
        reqData.is_active = false;
        const successFn = function(data) {
            that.loadConversionMedicineList();
        };
        const errorFn = function() {
        };
        postAPI(CONVERSION_MEDICINE_API, reqData, successFn, errorFn);
    }

    editModalToggle = (data) => {
        this.setState({
            editData: data,
        });
    };

    render() {
        const that = this;
        const { medicineLoading, medicineList, editData, pagination } = this.state;
        const MedicineFormLayout = Form.create()(DynamicFieldsForm);
        const formFields = [{
            label: 'Medicine Name',
            key: 'name',
            placeholder: 'Medicine Name',
            required: true,
            type: INPUT_FIELD,
            initialValue: editData ? editData.name : null,
        }, {
            label: 'Medicine Type',
            key: 'medicine_type',
            type: SELECT_FIELD,
            required: true,
            options: [{ label: 'Ayurveda', value: 'Ayurveda' }, { label: 'Allopath', value: 'Allopath' }],
            initialValue: editData ? editData.medicine_type : null,
        }, {
            label: 'Medicine Image',
            key: 'image',
            required: true,
            type: SINGLE_IMAGE_UPLOAD_FIELD,
            initialValue: editData ? editData.image : null,
        }, {
            label: 'Medicine Description',
            key: 'description',
            placeholder: 'Description',
            required: true,
            type: QUILL_TEXT_FIELD,
            initialValue: editData ? editData.description : null,
        }, {
            label: 'Benefit / Side Effect',
            key: 'benefit',
            placeholder: 'Benefit for Ayurveda and Side Effects in case of Allopath Medicine',
            required: true,
            type: QUILL_TEXT_FIELD,
            initialValue: editData ? editData.benefit : null,
        }];
        const formCreateProps = {
            action: CONVERSION_MEDICINE_API,
            method: 'post',
            successFn() {
                that.loadConversionMedicineList();
                displayMessage(SUCCESS_MSG_TYPE, 'Medicine Added Successfully!!');
            },
            errorFn() {
                displayMessage(ERROR_MSG_TYPE, 'Medicine Adding Failed!!');
            },
        };
        const medicineColumns = [{
            title: 'Name',
            key: 'name',
            dataIndex: 'name',
        }, {
            title: 'Type',
            key: 'medicine_type',
            dataIndex: 'medicine_type',
        }, {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <span>
                    <a onClick={() => this.editModalToggle(record)}>
                Edit</a>
                <Divider type="vertical"/>
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
                <MedicineFormLayout fields={formFields} formProp={formCreateProps}/>
                <Divider/>
                <Table
                    loading={medicineLoading}
                    dataSource={medicineList}
                    columns={medicineColumns}
                    pagination={pagination}
                    onChange={this.handleTableChange}
                />
                <Modal visible={!!editData} onCancel={() => this.editModalToggle(null)} footer={null}>
                    <MedicineFormLayout
                        fields={formFields}
                        formProp={formCreateProps}
                        defaultValues={[{ key: 'id', value: editData ? editData.id : null }]}
                        title="Edit Medicine"
                    />
                </Modal>
            </div>
        );
    }

}


