import React from "react";
import {
    Alert,
    AutoComplete,
    Avatar,
    Button,
    Card,
    Col,
    DatePicker,
    Divider,
    Form,
    Icon,
    Input,
    InputNumber,
    List,
    message,
    Popconfirm,
    Radio,
    Row,
    Select,
    Table,
    Upload
} from "antd";
import moment from "moment";
import { displayMessage, getAPI, interpolate, makeFileURL, makeURL, postAPI } from "../../../utils/common";
import {
    BED_PACKAGES,
    BOOK_SEAT,
    CHECK_SEAT_AVAILABILITY,
    DISEASE_LIST,
    FILE_UPLOAD_API,
    MEDICINE_PACKAGES,
    PATIENT_PROFILE,
    PAYMENT_MODES,
    SEARCH_PATIENT
} from "../../../constants/api";
// import {Booking_Type} from "../../constants/hardData";
import { ERROR_MSG_TYPE, SUCCESS_MSG_TYPE } from "../../../constants/dataKeys";
import _get from "lodash/get";

const { Meta } = Card;
const InputGroup = Input.Group;
let id = 1;

class BedBookingForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            packages: [],
            totalPayableAmount: 0,
            totalPayingAmount: 0,
            patientList: [],
            paymentModes: [],
            medicinePackage: [],
            medicineItem: [],
            diseases: [],
            patientBelongToOtherState: _get(props, "activePracticeData.reg_state") != _get(props, "currentPatient.state")
            // choosePkg:{},


        };
    }

    componentDidMount() {
        if (this.props.currentPatient)
            this.handlePatientSelect(this.props.currentPatient.id);
        this.loadPackages();
        this.loadPaymentModes();
        this.loadMedicinePackages();
        this.loadDiseases();
    }

    loadPackages = () => {
        const that = this;
        const successFn = function(data) {
            that.setState({
                packages: data
            });
        };
        const errorFn = function() {
        };
        getAPI(interpolate(BED_PACKAGES, [this.props.active_practiceId]), successFn, errorFn);

    };

    loadDiseases = () => {
        const that = this;
        const successFn = function(data) {
            that.setState({
                diseases: data
            });
        };
        const errorFn = function() {
        };
        getAPI(interpolate(DISEASE_LIST, [this.props.active_practiceId]), successFn, errorFn);

    };

    loadMedicinePackages() {
        const that = this;
        const successFn = function(data) {
            that.setState({
                medicinePackage: data
            });
        };
        const errorFn = function() {

        };
        getAPI(interpolate(MEDICINE_PACKAGES, [this.props.active_practiceId]), successFn, errorFn);
    }

    searchPatient = (value) => {
        const that = this;
        const successFn = function(data) {
            if (data) {
                that.setState({
                    patientList: data,
                    ptr: data

                });
            }
        };
        const errorFn = function() {
        };
        getAPI(interpolate(SEARCH_PATIENT, [value]), successFn, errorFn);
    };

    handlePatientSelect = (event) => {
        if (event) {
            const that = this;
            const successFn = function(data) {
                that.setState({
                    patientDetails: data
                });
            };
            const errorFn = function() {
            };
            getAPI(interpolate(PATIENT_PROFILE, [event]), successFn, errorFn);
        }
    };

    loadPaymentModes() {
        const that = this;
        const successFn = function(data) {
            that.setState({
                paymentModes: data
            });
        };
        const errorFn = function() {
        };
        getAPI(interpolate(PAYMENT_MODES, [this.props.active_practiceId]), successFn, errorFn);
    }

    checkBedStatus = (type, value) => {
        const that = this;
        that.handleRoomType();
        this.setState({
            [type]: value
        }, function() {

            const successFn = function(data) {
                that.setState({
                    availabilitySeatTatkal: data.TATKAL,
                    availabilitySeatNormal: data.NORMAL
                });
                const currentSelected = that.props.form.getFieldValue("seat_type");
                if (!data[currentSelected]) {
                    that.props.form.setFieldsValue({
                        seat_type: null
                    });
                    that.calculateTotalAmount();
                }
            };
            that.calculateTotalAmount();
            const errorFn = function() {

            };
            const { from_date, bed_package } = that.state;
            if (from_date && bed_package) {
                let to_date = null;
                that.state.packages.forEach(function(pkgObj) {
                    if (bed_package == pkgObj.id) {
                        to_date = moment(from_date).add(pkgObj.no_of_days - 1, "day");
                    }
                });
                if (from_date && to_date && bed_package) {
                    const { setFieldsValue } = that.props.form;
                    setFieldsValue({
                        to_date
                    });
                    getAPI(interpolate(CHECK_SEAT_AVAILABILITY, [that.props.active_practiceId]), successFn, errorFn, {
                        start: moment(from_date).format("YYYY-MM-DD"),
                        end: moment(to_date).format("YYYY-MM-DD"),
                        bed_package
                    });
                }
            }
        });
    };


    handleSubmit = (e) => {
        this.setState({
            loading: true
        });
        const that = this;
        const details = [];
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const { label, value } = values;

                // label.map((key,i)=>
                //     details.push({'key':key, 'value': value[i]})
                // );
                const reqData = {
                    ...values,
                    to_date: moment(values.to_date).format("YYYY-MM-DD"),
                    from_date: moment(values.from_date).format("YYYY-MM-DD"),
                    paid: false,
                    total_price: this.state.totalPayableAmount,
                    date: moment().format("YYYY-MM-DD"),
                    total_tax: this.state.tax,
                    patient: this.state.patientDetails.id,
                    rest_diseases: values.rest_diseases ? values.rest_diseases.join(",") : null,
                    report_upload: values.file && values.file.file.response ? values.file.file.response.image_path : null
                };
                let medicinePackages = [];
                that.state.choosePkg.forEach(function(packageItem) {
                    if (packageItem.type == "MEDICINE") {
                        medicinePackages.push({
                            medicine: packageItem.id,
                            quantity: packageItem.quantity,
                            unit_cost: packageItem.price,
                            total_price: packageItem.price_with_tax,
                            taxes: that.state.patientBelongToOtherState ? packageItem.state_taxes.map(tax => tax.id) : packageItem.taxes.map(tax => tax.id)
                        });
                    } else {
                        reqData.taxes = that.state.patientBelongToOtherState ? packageItem.state_taxes.map(tax => tax.id) : packageItem.taxes.map(tax => tax.id);
                    }
                });
                reqData.medicines = medicinePackages;
                // delete reqData.medicines;
                delete reqData.label;
                delete reqData.value;
                delete reqData.keys;

                const successFn = function(data) {
                    displayMessage(SUCCESS_MSG_TYPE, "Saved Successfully!!");
                    if (that.props.history) {
                        // that.props.history.goBack();
                        that.props.history.replace(`/erp/patient/${that.props.match.params.id}/booking`);
                    }
                    if (that.props.loadData) {
                        that.props.loadData();
                    }
                };
                const errorFn = function() {
                    displayMessage(ERROR_MSG_TYPE, "Something went wrong!!");
                };
                postAPI(interpolate(BOOK_SEAT, [this.props.active_practiceId]), reqData, successFn, errorFn);
            }
        });


    };

    handleClick = (e) => {
        this.setState({
            patientDetails: null
        });

    };

    handleRoomType = (name, value) => {
        const that = this;
        this.setState({
            [name]: value
        }, function() {
            that.calculateTotalAmount();
        });

    };

    calculateTotalAmount = () => {
        const that = this;
        that.setState(function(prevSate) {
            let payAmount = 0;
            let total_tax = 0;
            let bedPkg = {};
            let medicinePkg = [];
            let total_medicine_price = 0;
            prevSate.packages.forEach(function(item) {
                if (prevSate.bed_package == item.id) {
                    if (prevSate.seat_type == "NORMAL") {
                        payAmount = item.normal_price + item.normal_tax_value;
                        total_tax += item.normal_tax_value;
                        bedPkg = {
                            ...item,
                            type: "BED",
                            price_with_tax: payAmount,
                            tax: item.normal_tax_value,
                            price: item.normal_price,
                            _id: Math.random().toFixed(7)
                        };
                        medicinePkg = [bedPkg];
                    }
                    if (prevSate.seat_type == "TATKAL") {
                        payAmount = item.tatkal_price + item.tatkal_tax_value;
                        total_tax += item.tatkal_tax_value;
                        bedPkg = {
                            ...item,
                            type: "BED",
                            price_with_tax: payAmount,
                            tax: item.tatkal_tax_value,
                            price: item.tatkal_price,
                            _id: Math.random().toFixed(7)
                        };
                        medicinePkg = [bedPkg];
                    }
                }
            });
            let addedPackages = {};
            prevSate.medicinePackage.forEach(function(item) {
                prevSate.medicineItem.forEach(function(ele) {
                    if (item.id == ele && !addedPackages[item.id]) {
                        let quantity = item.quantity || 1;
                        total_medicine_price += (item.final_price * quantity);
                        total_tax += (item.tax_value * quantity);
                        medicinePkg = [...medicinePkg, {
                            ...item,
                            medicine: item.id,
                            quantity: quantity,
                            type: "MEDICINE",
                            price_with_tax: (item.final_price * quantity),
                            tax: (item.tax_value * quantity),
                            _id: Math.random().toFixed(7),
                            children: null
                        }];
                        addedPackages[item.id] = true;
                        if (item.children) {
                            item.children.forEach(function(childPackage) {
                                if (!addedPackages[childPackage.id]) {
                                    medicinePkg = [...medicinePkg, {
                                        ...childPackage,
                                        medicine: childPackage.id,
                                        quantity: quantity,
                                        type: "MEDICINE",
                                        price_with_tax: 0,
                                        tax: 0,
                                        price: 0,
                                        _id: Math.random().toFixed(7),
                                        children: null,
                                        disabled: true
                                    }];
                                    addedPackages[childPackage.id] = true;
                                }
                            });

                        }
                    }
                });
            });
            return {
                totalPayableAmount: payAmount + total_medicine_price,
                tax: total_tax,
                choosePkg: [...medicinePkg]
            };
        });
    };

    setPaymentAmount = (value) => {
        const that = this;
        this.setState({
            totalPayingAmount: value
        }, function() {
            that.calculateTotalAmount();
        });
    };

    handleMedicineSelect = (e) => {
        const value = e;
        this.setState({
            medicineItem: value
        }, function() {
            this.calculateTotalAmount();
        });
    };

    changeDiscount = (id, value) => {
        const that = this;
        that.setState(function(prevState) {
            const newTableValue = [];
            prevState.medicinePackage.forEach(function(tableObj) {
                if (tableObj.id == id) {
                    newTableValue.push({ ...tableObj, discount: value });
                } else {
                    newTableValue.push(tableObj);
                }
            });
            return { medicinePackage: newTableValue };
        }, function() {
            that.calculateTotalAmount();
        });
    };
    changeQuantity = (id, value) => {
        const that = this;
        that.setState(function(prevState) {
            const newTableValue = [];
            prevState.medicinePackage.forEach(function(tableObj) {
                if (tableObj.id == id) {
                    newTableValue.push({ ...tableObj, quantity: value });
                } else {
                    newTableValue.push(tableObj);
                }
            });
            return { medicinePackage: newTableValue };
        }, function() {
            that.calculateTotalAmount();
        });
    };
    addNewFields = () => {
        const { form } = this.props;
        const keys = form.getFieldValue("keys");
        const nextKeys = keys.concat(id++);
        form.setFieldsValue({
            keys: nextKeys
        });
    };

    removeNewOptionField = (k) => {
        const { form } = this.props;
        const keys = form.getFieldValue("keys");
        if (keys.length === 1) {
            return;
        }

        form.setFieldsValue({
            keys: keys.filter(key => key !== k)
        });
    };

    render() {
        const BOOKING_TYPE = [{
            value: "NORMAL",
            is_or_not: !!(this.state.availabilitySeatNormal && this.state.availabilitySeatNormal.available)
        }, {
            value: "TATKAL",
            is_or_not: !!(this.state.availabilitySeatTatkal && this.state.availabilitySeatTatkal.available)
        }];

        const that = this;
        const { getFieldDecorator, getFieldValue } = this.props.form;
        const formItemLayout = ({
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 }
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 14 }
            }
        });
        const formPatients = ({
            wrapperCol: {
                xs: { offset: 6, span: 24 },
                sm: { offset: 6, span: 14 }
            }
        });

        const columns = [{
            title: "Item",
            key: "name",
            dataIndex: "name"
        }, {
            title: "Normal Price",
            key: "normal_price",
            dataIndex: "normal_price",
            render: (value, record) => (<p>{value ? (value).toFixed(2) : "--"}</p>)
        }, {
            title: "Tatkal Price",
            key: "tatkal_price",
            dataIndex: "tatkal_price",
            render: (value, record) => (<p>{value ? (value).toFixed(2) : "--"}</p>)
        }, {
            title: "Quantity",
            key: "quantity",
            width: 100,
            dataIndex: "quantity",
            render: (item, record) => (record.type == "BED" ? 1 :
                <Form.Item
                    key={`quantity[${record.id}]`}
                    {...formItemLayout}
                >
                    {getFieldDecorator(`quantity[${record.id}]`, {
                        initialValue: record.quantity,
                        validateTrigger: ["onChange", "onBlur"]
                    })(
                        <InputNumber min={1} max={100} placeholder="quantity" size="small" value={record.quantity}
                                     onChange={(value) => that.changeQuantity(record.id, value)}
                                     disabled={record.disabled}/>
                    )}
                </Form.Item>)
        }, {
            title: "Discount",
            key: "discount",
            width: 100,
            dataIndex: "discount",
            render: (item, record) => (
                <Form.Item
                    key={`discount[${record.id}]`}
                    {...formItemLayout}
                >
                    {getFieldDecorator(`discount[${record.id}]`, {
                        initialValue: record.discount,
                        validateTrigger: ["onChange", "onBlur"]
                    })(
                        <InputNumber min={1} max={100} placeholder="discount" size="small" value={record.quantity}
                                     onChange={(value) => that.changeDiscount(record.id, value)}
                                     disabled={record.disabled}/>
                    )}
                </Form.Item>)
        }, {
            title: "Price",
            key: "price",
            dataIndex: "price",
            render: (value, record) => (<p>{value ? (value).toFixed(2) : "--"}</p>)
        }, {
            title: "Tax",
            key: "tax",
            dataIndex: "tax",
            render: (value, record) => (<p>{value ? (value).toFixed(2) : "--"}</p>)
        }, {
            title: "Total Amount",
            key: "price_with_tax",
            dataIndex: "price_with_tax",
            render: (value, record) => (<p>{value ? (value).toFixed(2) : "--"}</p>)
        }];
        const singleUploadprops = {
            name: "image",
            data: {
                name: "hello"
            },
            action: makeURL(FILE_UPLOAD_API),
            headers: {
                authorization: "authorization-text"
            },
            onChange(info) {
                if (info.file.status !== "uploading") {

                }
                if (info.file.status === "done") {
                    message.success(`${info.file.name} file uploaded successfully`);
                } else if (info.file.status === "error") {
                    message.error(`${info.file.name} file upload failed.`);
                }
            }
        };


        getFieldDecorator("keys", { initialValue: [0] });
        const keys = getFieldValue("keys");

        const chooseOption = keys.map((k, index) => (
            <Row key={k}>
                <Col span={8}>
                    <Form.Item label="">
                        {getFieldDecorator(`label[${k}]`)
                        (<Input placeholder="name"/>)}
                    </Form.Item>

                </Col>

                <Col span={8}>
                    <Form.Item label="">
                        {getFieldDecorator(`value[${k}]`)
                        (<Input placeholder="value"/>)}
                    </Form.Item>

                </Col>
                <Col span={8}>
                    {index ? (
                        <Button
                            onClick={() => this.removeNewOptionField(k)}
                            size="small"
                            type="danger"
                            style={{ margin: 5 }}
                            icon="close"
                            shape="circle"
                        />
                    ) : null}

                    {index == keys.length - 1 ? (
                            <Button type="dashed" style={{ marginTop: "3px" }} onClick={this.addNewFields}>
                                <Icon type="plus"/> Add field
                            </Button>
                        )
                        : null}
                </Col>

            </Row>
        ));
        return (
            <div>
                <Card title="Book a Seat/Bed">
                    <Form>
                        <Row>
                            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                                <div style={{ paddingRight: "10px" }}>

                                    {this.state.patientDetails ? (
                                            <Form.Item
                                                key="id"
                                                value={this.state.patientDetails ? this.state.patientDetails.id : ""}
                                                {...formPatients}
                                            >
                                                <Card bordered={false} style={{ background: "#ECECEC" }}>
                                                    <Meta
                                                        avatar={(this.state.patientDetails.image ?
                                                            <Avatar src={makeFileURL(this.state.patientDetails.image)}/> : (
                                                                <Avatar style={{ backgroundColor: "#87d068" }}>
                                                                    {this.state.patientDetails.user.first_name ? this.state.patientDetails.user.first_name.charAt(0) :
                                                                        <Icon type="user"/>}
                                                                </Avatar>
                                                            ))}
                                                        title={this.state.patientDetails.user.first_name}
                                                        description={this.state.patientDetails.user.mobile}
                                                    />
                                                    {/* <Button onClick={this.handleClick} icon="close-circle" */}
                                                    {/*        type={"danger"}/> */}
                                                    {/* <Button type="primary" style={{float: 'right'}} onClick={this.handleClick}>Add New
                                                Patient</Button> */}
                                                </Card>
                                            </Form.Item>
                                        )
                                        : (
                                            <div>
                                                <Form.Item label="Patient" {...formItemLayout}>
                                                    {getFieldDecorator("patient", {
                                                        rules: [{ required: true, message: "this field required" }]
                                                    })
                                                    (<AutoComplete
                                                        placeholder="Patient Name"
                                                        showSearch
                                                        onSearch={this.searchPatient}
                                                        defaultActiveFirstOption={false}
                                                        showArrow={false}
                                                        filterOption={false}
                                                        onSelect={this.handlePatientSelect}
                                                    >
                                                        {this.state.patientList.map((option) => (
                                                            <AutoComplete.Option
                                                                value={option ? option.id.toString() : ""}
                                                            >
                                                                <List.Item style={{ padding: 0 }}>
                                                                    <List.Item.Meta
                                                                        avatar={option.image ? (
                                                                                <Avatar
                                                                                    style={{ backgroundColor: "#ffff" }}
                                                                                    src={makeFileURL(option.image)}
                                                                                />
                                                                            ) :
                                                                            <Icon type="user"/>}
                                                                        title={`${option.user.first_name} (${option.user.id})`}
                                                                        description={
                                                                            <small>{option.user.mobile}</small>}
                                                                    />

                                                                </List.Item>
                                                            </AutoComplete.Option>
                                                        ))}
                                                    </AutoComplete>)}

                                                    {this.state.ptr ? (
                                                        <Alert
                                                            message="Patient Not Found !!"
                                                            description="Please Search another patient or create new patient."
                                                            type="error"
                                                        />
                                                    ) : null}
                                                </Form.Item>
                                            </div>
                                        )}

                                    <Form.Item label="Bed Package" {...formItemLayout}>
                                        {getFieldDecorator("bed_package", {
                                            rules: [{ required: true, message: "this field required!" }]
                                        })
                                        (<Select onChange={(value) => that.checkBedStatus("bed_package", value)}>
                                            {that.state.packages.map(room => (
                                                <Select.Option
                                                    value={room.id}
                                                >{room.name}
                                                </Select.Option>
                                            ))}
                                        </Select>)}
                                    </Form.Item>
                                    <Form.Item label="Book From" {...formItemLayout}>
                                        {getFieldDecorator("from_date", {
                                            rules: [{ required: true, message: "Input From Date!" }]
                                        })
                                        (<DatePicker
                                            onChange={(value) => that.checkBedStatus("from_date", value)}
                                            format="DD-MM-YYYY"
                                            allowClear={false}
                                        />)}
                                    </Form.Item>
                                    <Form.Item label="Book To" {...formItemLayout}>
                                        {getFieldDecorator("to_date", {
                                            rules: [{ required: true, message: "Input To Date!" }]
                                        })
                                        (<DatePicker disabled format="DD-MM-YYYY"/>)}
                                    </Form.Item>

                                    <Form.Item label="Booking Type" {...formItemLayout}>
                                        {getFieldDecorator("seat_type", {
                                            rules: [{
                                                required: true, message: "this field required"
                                            }]
                                        })(<Radio.Group
                                                onChange={(e) => this.handleRoomType("seat_type", e.target.value)}
                                            >
                                                {BOOKING_TYPE.map((seat_type) => (
                                                    <Radio
                                                        value={seat_type.is_or_not ? seat_type.value : ""}
                                                        disabled={!seat_type.is_or_not}
                                                    >{seat_type.value}
                                                    </Radio>
                                                ))}
                                            </Radio.Group>
                                        )}
                                    </Form.Item>
                                    <Form.Item label="Medicine  Package" {...formItemLayout}>
                                        {getFieldDecorator("medicines", {})
                                        (<Select mode="multiple" onChange={this.handleMedicineSelect}>
                                            {that.state.medicinePackage.map(item => (
                                                <Select.Option
                                                    value={item.id}
                                                >{item.name}
                                                </Select.Option>
                                            ))}
                                        </Select>)}
                                    </Form.Item>

                                    <Form.Item label="Pay Now : " {...formItemLayout}>
                                        {getFieldDecorator("pay_value", {
                                            rules: [{
                                                required: true,
                                                message: "this field is required"
                                            }],
                                            initialValue: this.state.totalPayingAmount ? this.state.totalPayingAmount : null
                                        })
                                        (
                                            <InputNumber
                                                min={0}
                                                step={1}
                                                max={this.state.totalPayableAmount}
                                                onChange={this.setPaymentAmount}
                                            />
                                        )}
                                    </Form.Item>
                                    <Form.Item label="Payment Mode" {...formItemLayout}>
                                        {getFieldDecorator("payment_mode", {
                                            rules: [{ required: true, message: "this field required" }]
                                        })
                                        (<Select
                                            showSearch
                                            filterOption={(input, option) =>
                                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                        >
                                            {this.state.paymentModes.map(type => (
                                                <Select.Option
                                                    value={type.id}
                                                >{type.mode}
                                                </Select.Option>
                                            ))}
                                        </Select>)}
                                    </Form.Item>

                                    {/* <Col span={7} style={{float:"right"}}>
                                    <Form.Item>
                                        <Popconfirm
                                            title={"Are you sure to take payment of INR " + this.state.totalPayingAmount + "?"}  onConfirm={this.handleSubmit}>
                                            <Button type={'primary'}>Submit</Button>
                                        </Popconfirm>
                                        {that.props.history ?
                                            <Button style={{margin: 5}}
                                                    onClick={() => that.props.history.goBack()}>
                                                Cancel
                                            </Button> : null}
                                    </Form.Item>
                                </Col>  */}


                                    <Divider>Patient Details</Divider>
                                    <Form.Item label="Creatinine Level" {...formItemLayout}>
                                        {getFieldDecorator("creatinine", {
                                            // rules: [{required: true, message: 'this field required'}],
                                        })
                                        (<Input/>)}
                                    </Form.Item>
                                    <Form.Item label="Urea Level" {...formItemLayout}>
                                        {getFieldDecorator("urea_level", {
                                            // rules: [{required: true, message: 'this field required'}],
                                        })
                                        (<Input/>)}
                                    </Form.Item>
                                    <Form.Item label="Currently on Dialysis?" {...formItemLayout}>
                                        {getFieldDecorator("dialysis", {
                                            // rules: [{required: true, message: 'this field required'}],
                                        })
                                        (<Select
                                            showSearch
                                            filterOption={(input, option) =>
                                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                        >
                                            <Select.Option
                                                value
                                            >YES
                                            </Select.Option>
                                            <Select.Option
                                                value={false}
                                            >NO
                                            </Select.Option>
                                        </Select>)}
                                    </Form.Item>
                                    <Form.Item label="Diseases" {...formItemLayout}>
                                        {getFieldDecorator("other_diseases", {
                                            // rules: [{required: true, message: 'this field required'}],
                                        })
                                        (<Select
                                            showSearch
                                            mode="multiple"
                                            filterOption={(input, option) =>
                                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                        >
                                            {this.state.diseases.map(item => (
                                                <Select.Option
                                                    value={item.id}
                                                >{item.name}
                                                </Select.Option>
                                            ))}
                                        </Select>)}
                                    </Form.Item>
                                    <Form.Item label="Other Diseases" {...formItemLayout}>
                                        {getFieldDecorator("rest_diseases", {
                                            // rules: [{required: true, message: 'this field required'}],
                                        })
                                        (<Select mode="tags"/>)}
                                    </Form.Item>
                                    <Form.Item label="Upload Report" {...formItemLayout}>
                                        {getFieldDecorator("file", {
                                            // rules: [{required: true, message: 'this field required'}],
                                        })
                                        (<Upload {...singleUploadprops}>
                                            <Button>
                                                <Icon type="upload"/> Select File
                                            </Button>

                                        </Upload>)}
                                    </Form.Item>
                                </div>

                            </Col>
                            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                                <Divider>Item Details</Divider>
                                <Table
                                    pagination={false}
                                    columns={columns}
                                    size="small"
                                    dataSource={this.state.choosePkg}
                                />

                                <Divider>Extra Details</Divider>
                                <Card>

                                    {chooseOption}
                                    {/* <Col span={8}> */}
                                    {/*    <Button type="dashed" style={{marginTop:'3px'}} onClick={this.addNewFields}> */}
                                    {/*        <Icon type="plus" /> Add field */}
                                    {/*    </Button> */}

                                    {/* </Col> */}
                                </Card>


                            </Col>
                            <Col span={24}>
                                <h3>Grand Total: <b>{this.state.totalPayableAmount.toFixed(2)}</b></h3>
                                <Form.Item>
                                    <Popconfirm
                                        title={`Are you sure to take payment of INR ${this.state.totalPayingAmount}?`}
                                        onConfirm={this.handleSubmit}
                                    >
                                        <Button type="primary">Submit</Button>
                                    </Popconfirm>
                                    {that.props.history ? (
                                        <Button
                                            style={{ margin: 5 }}
                                            onClick={() => that.props.history.goBack()}
                                        >
                                            Cancel
                                        </Button>
                                    ) : null}
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Card>
            </div>
        );
    }
}

export default Form.create()(BedBookingForm);
