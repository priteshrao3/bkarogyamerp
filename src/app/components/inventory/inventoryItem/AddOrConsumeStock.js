import React from "react";
import {
    Affix,
    AutoComplete,
    Button,
    Card,
    Col,
    DatePicker, Divider,
    Form,
    Icon,
    Input,
    InputNumber,
    List,
    message,
    Row,
    Select, Spin,
    Table,
    Tabs,
    Upload
} from "antd";
import moment from "moment";
import {displayMessage, getAPI, interpolate, makeURL, postAPI} from "../../../utils/common";

import {ADD_STOCK, CONSUME_STOCK, INVENTORY_ITEM_TYPE, TYPE_OF_CONSUMPTION} from "../../../constants/hardData";
import {
    BULK_STOCK_ENTRY,
    FILE_UPLOAD_API,
    INVENTORY_ITEM_API,
    SEARCH_THROUGH_QR,
    SUPPLIER_API
} from "../../../constants/api";

const {Search} = Input;
const {MonthPicker} = DatePicker;
const {TabPane} = Tabs;

const tableFormFields = {
    _id: null,
    quantity: 0,
    batch: null
};

class AddOrConsumeStock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: {},
            classType: props.type,
            tableFormValues: [],
            maxQuantityforConsume: {},
            searchStrings: {},
            tempValues: {},
            supplierList: [],
            customSupplier: false,
            qrValue: '',
            loading: true,
        }
        this.loadSupplierList = this.loadSupplierList.bind(this);
    }

    componentDidMount() {
        this.loadInventoryItemList();
        this.loadSupplierList();
    }

    changeSupplierType = (value) => {
        this.setState({
            customSupplier: !!value
        })
    }

    loadSupplierList() {
        const that = this;
        const params = {practice: this.props.active_practiceId}
        const successFn = function (data) {
            that.setState({
                supplierList: data
            })
        }
        const errorFn = function () {

        }
        getAPI(interpolate(SUPPLIER_API, [this.props.active_practiceId]), successFn, errorFn, params);
        // getAPI(SUPPLIER_API, successFn, errorFn, {
        //     practice: this.props.active_practiceId
        // })
    }

    loadInventoryItemList() {
        const that = this;
        INVENTORY_ITEM_TYPE.forEach(function (type) {
            that.loadItemsList(type.value)
        });
    }

    loadItemsList = (type, page = 1) => {
        const that = this;
        const successFn = function (recData) {
            const data = recData;
            that.setState(function (prevState) {
                return {
                    items: {
                        ...prevState.items,
                        [type]: {...prevState.items[type], ...data},
                    },
                    loading: false,
                }
            });
        }
        const errorFn = function () {
        }
        const params = {
            maintain_inventory: true,
            practice: this.props.active_practiceId,
            item_type: type,
            page
        }
        if (that.state.searchStrings[type]) {
            params.item_name = that.state.searchStrings[type]
        }
        getAPI(INVENTORY_ITEM_API, successFn, errorFn, params);
    }

    remove = (k) => {
        this.setState(function (prevState) {
            const newTableFormValues = [];
            prevState.tableFormValues.forEach(function (formValue) {
                if (formValue._id != k)
                    newTableFormValues.push(formValue);
            });
            // console.log(prevState.tableFormValues, k);
            return {
                tableFormValues: newTableFormValues
            }
        });
    }

    add = (item, randId = Math.random().toFixed(7)) => {
        this.setState(function (prevState) {
            return {
                tableFormValues: [{
                    ...tableFormFields,
                    ...item,
                    _id: randId,
                }, ...prevState.tableFormValues]
            }
        });
    };

    handleSubmit = (e) => {
        const that = this;
        this.setState({
            loading: true,
        });
        if (e.keyCode == 13) {
            return false;
        }
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const reqData = [];

                that.state.tableFormValues.forEach(function (item) {
                    let itemObject = {
                        item_add_type: that.state.classType,
                        inventory_item: item.id,
                        remarks : values.remarks,
                        quantity: values.quantity[item._id],
                        batch_number: values.batch[item._id],
                        date: moment(values.date).format('YYYY-MM-DD'),
                        bill_number: values.bill_number,
                        bill_file: values.file && values.file.file.response ? values.file.file.response.image_path : null
                    };

                    if (that.state.classType == ADD_STOCK) {
                        itemObject = {
                            ...itemObject,
                            expiry_date: moment(values.expiry_date[item._id]).format('YYYY-MM-DD'),
                            unit_cost: values.unit_cost[item._id],
                            total_cost: values.unit_cost[item._id] * values.quantity[item._id],
                        }
                        if (values.supplier) {
                            itemObject.supplier = values.supplier;
                        } else if (values.supplier_name) {
                            itemObject.supplier_name = values.supplier_name;
                        }
                    } else if (that.state.classType == CONSUME_STOCK) {
                        itemObject.type_of_consumption = values.type_of_consumption;
                    }
                    reqData.push(itemObject);
                });
                reqData.date = moment(values.date).isValid() ? moment(values.date).format() : null;
                if (that.state.customSupplier) {
                    reqData.supplier_name = values.supplier_name;
                } else {
                    reqData.supplier = values.supplier;
                }
                const successFn = function (data) {

                    displayMessage("Inventory updated successfully");
                    that.props.loadData();
                    that.props.history.replace('/erp/inventory');
                };
                const errorFn = function () {
                    that.setState({
                        loading: false,
                    });
                };
                postAPI(BULK_STOCK_ENTRY, reqData, successFn, errorFn);
            }
        });
    };

    changeMaxQuantityforConsume(recordId, batch) {
        this.setState(function (prevState) {
            const newMaxQuantityforConsume = {...prevState.maxQuantityforConsume}
            prevState.tableFormValues.forEach(function (formValue) {
                if (formValue._id == recordId)
                    formValue.item_type_stock.item_stock.forEach(function (stock) {
                        if (stock.batch_number == batch)
                            newMaxQuantityforConsume[recordId] = stock.quantity || 0
                    })
            });
            return {
                maxQuantityforConsume: newMaxQuantityforConsume
            }
        });
    }

    searchValues = (type, value) => {
        const that = this;
        this.setState(function (prevState) {
            const searchValues = {...prevState.searchStrings};
            searchValues[type] = value;
            return {searchStrings: searchValues}
        }, function () {
            that.loadItemsList(type);
        });
    }

    filterValues = (type) => {
        this.setState(function (prevState) {
            let filteredItemOfGivenType = [];
            if (prevState.items[type]) {
                if (prevState.searchStrings[type]) {
                    prevState.items[type].forEach(function (item) {
                        if (item.name
                            .toString()
                            .toLowerCase()
                            .includes(prevState.searchStrings[type].toLowerCase())) {
                            filteredItemOfGivenType.push(item);
                        }
                    });
                } else {
                    filteredItemOfGivenType = prevState.items[type];
                }
            }
            return {
                filteredItems: {...prevState.filteredItems, [type]: filteredItemOfGivenType}
            }
        });
    }

    storeValue = (type, id, value) => {
        const that = this;
        this.setState(function (prevState) {
            return {tempValues: {...prevState.tempValues, [type.toString() + id.toString()]: value}}
        });
        if (type == 'batch') {
            const {setFieldsValue} = that.props.form;
            that.state.tableFormValues.forEach(function (item) {
                if (item._id == id) {
                    if (item.item_type_stock.batch_number) {
                        item.item_type_stock.batch_number.forEach(function (batch) {
                            setFieldsValue({[`expiry_date[${id}]`]: batch.expiry_date && moment(batch.expiry_date).isValid() ? moment(batch.expiry_date) : null});
                        })
                    }
                }
            })

        }
    }

    addItemThroughQR = (value) => {
        const that = this;
        that.setState({
            loadingQr: true,
        });
        const qrSplitted = value.split('*');
        const successFn = function (data) {
            const item = data;
            const {setFieldsValue, getFieldsValue, getFieldValue} = that.props.form;
            const randomId = Math.random().toFixed(7);
            let flag = true
            that.state.tableFormValues.forEach(function (row) {
                if (row.item_name == qrSplitted[0]) {
                    const {_id} = row;
                    const batch = getFieldsValue(`batch[${_id}]`);
                    if (batch == qrSplitted[3]) {
                        const quantity = getFieldsValue(`quantity[${_id}]`);
                        flag = false
                        setFieldsValue({
                            [`quantity[${_id}]`]: quantity + 1
                        });
                        that.storeValue('quantity', _id, value);
                    }
                }
            })
            if (flag) {
                that.add(data, randomId);
                that.storeValue('batch', randomId, qrSplitted[1]);
                that.storeValue('unit_cost', randomId, qrSplitted[3]);
                const fieldsToBeSet = {
                    [`batch[${randomId}]`]: qrSplitted[1],
                    [`expiry_date[${randomId}]`]: moment(qrSplitted[2], 'MM/YY')
                };
                if (that.state.classType == CONSUME_STOCK)
                    fieldsToBeSet[`unit_cost[${randomId}]`] = qrSplitted[3]
                setFieldsValue(fieldsToBeSet)
            }
            console.log(getFieldsValue(), {
                [`batch[${randomId}]`]: qrSplitted[0]
            });
            that.setState(function (prevState) {

                // if (prevState.items && prevState.items[INVENTORY]) {
                //     prevState.items[INVENTORY].forEach(function (inventItem) {
                //         console.log(item.inventory_item)
                //         if (inventItem.id == item.inventory_item) {
                //             console.log(inventItem);
                //             that.add({...inventItem, item_type: INVENTORY});
                //
                //         }
                //     })
                // }
                return {
                    loadingQr: false,
                    qrValue: ''
                }
            });
        }
        const errorFn = function () {

        }
        getAPI(SEARCH_THROUGH_QR, successFn, errorFn, {qr: value, form: 'Inventory'})
    }

    setQrValue = (e) => {
        const {value} = e.target;
        this.setState({
            qrValue: value
        })
    }

    render() {
        const that = this;
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 4},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 20},
            },
        };
        const formItemLayoutWithOutLabel = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 4},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 20},
            },
        };
        const singleUploadprops = {
            name: 'image',
            data: {
                name: 'hello'
            },
            action: makeURL(FILE_UPLOAD_API),
            headers: {
                authorization: 'authorization-text',
            },
            onChange(info) {
                if (info.file.status !== 'uploading') {

                }
                if (info.file.status === 'done') {
                    message.success(`${info.file.name} file uploaded successfully`);
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} file upload failed.`);
                }
            },
        };
        getFieldDecorator('keys', {initialValue: []});
        let consumeRow = [{
            title: 'Item Name',
            key: 'item_name',
            dataIndex: 'name'
        }];
        if (this.state.classType == ADD_STOCK) {
            consumeRow = consumeRow.concat([{
                title: 'Quantity',
                key: 'quantity',
                dataIndex: 'quantity',
                render: (item, record) => (
<Form.Item
  key={`quantity[${record._id}]`}
  {...formItemLayout}
>
                    {getFieldDecorator(`quantity[${record._id}]`, {
                        validateTrigger: ['onChange', 'onBlur'],
                        rules: [{
                            required: true,
                            message: "This field is required.",
                        }],
                    })(
                        <InputNumber
                          min={0}
                          placeholder="quantity"
                          onChange={(value) => this.storeValue('quantity', record._id, value)}
                        />
                    )}
</Form.Item>
)
            }, {
                title: 'Batch',
                key: 'batch',
                dataIndex: 'batch',
                render: (item, record) => (
<Form.Item
  key={`batch[${record._id}]`}
  {...formItemLayout}
>
                    {getFieldDecorator(`batch[${record._id}]`, {
                        validateTrigger: ['onChange', 'onBlur'],
                        rules: [{
                            required: true,
                            message: "This field is required.",
                        }],
                    })(
                        <AutoComplete
                          placeholder="Batch Number"
                          onChange={(value) => this.storeValue('batch', record._id, value)}
                          dataSource={record.item_type_stock && record.item_type_stock.item_stock ? record.item_type_stock.item_stock.map(itemStock => itemStock.batch_number ? itemStock.batch_number : '--') : []}
                        />
                    )}
</Form.Item>
)
            }, {
                title: 'Expiry Date',
                key: 'expiry',
                dataIndex: 'expiry',
                render: (item, record) => (
<Form.Item
  key={`expiry_date[${record._id}]`}
  {...formItemLayout}
>
                    {getFieldDecorator(`expiry_date[${record._id}]`, {
                        rules: [{
                            required: true,
                            message: "This field is required.",
                        }],
                        initialValue: moment(new Date())
                    })(
                        <MonthPicker allowClear={false} />
                    )}
</Form.Item>
)
            }, {
                title: 'Unit Cost',
                key: 'unit_cost',
                dataIndex: 'unit_cost',
                render: (item, record) => (
<Form.Item
  key={`unit_cost[${record._id}]`}
  {...formItemLayout}
>
                    {getFieldDecorator(`unit_cost[${record._id}]`, {
                        // validateTrigger: ['onChange', 'onBlur'],
                        rules: [{
                            required: true,
                            message: "This field is required.",
                        }],
                    })(
                        <InputNumber
                          placeholder="Unit Cost"
                          onChange={(value) => this.storeValue('unit_cost', record._id, value)}
                        />
                    )}
</Form.Item>
)
            }, {
                title: 'Total Cost',
                key: 'total_cost',
                dataIndex: 'total_cost',
                render: (item, record) =>
                    <span>{this.state.tempValues[`unit_cost${  record._id}`] && this.state.tempValues[`quantity${  record._id}`] ? this.state.tempValues[`unit_cost${  record._id}`] * this.state.tempValues[`quantity${  record._id}`] : '--'}</span>
            }]);
        } else if (this.state.classType == CONSUME_STOCK) {
            consumeRow = consumeRow.concat([{
                title: 'Batch',
                key: 'batch',
                dataIndex: 'batch',
                render: (item, record) => (
<Form.Item
  key={`batch[${record._id}]`}
  {...formItemLayout}
>
                    {getFieldDecorator(`batch[${record._id}]`, {
                        validateTrigger: ['onChange', 'onBlur'],
                        rules: [{
                            required: true,
                            message: "This field is required.",
                        }],
                    })(
                        <Select
                          placeholder="Batch Number"
                          onChange={(value) => that.changeMaxQuantityforConsume(record._id, value)}
                        >
                            {record.item_type_stock && record.item_type_stock.item_stock && record.item_type_stock.item_stock.map(stock => (
                                <Select.Option value={stock.batch_number}>
                                    #{stock.batch_number} ({stock.quantity})
                                </Select.Option>
                              ))}
                        </Select>
                    )}
</Form.Item>
)
            }, {
                title: 'Quantity',
                key: 'quantity',
                dataIndex: 'quantity',
                render: (item, record) => (
<Form.Item
  key={`quantity[${record._id}]`}
  {...formItemLayout}
>
                    {getFieldDecorator(`quantity[${record._id}]`, {
                        validateTrigger: ['onChange', 'onBlur'],
                        rules: [{
                            required: true,
                            message: "This field is required.",
                        }],
                    })(
                        <InputNumber min={0} max={this.state.maxQuantityforConsume[record._id]} placeholder="quantity" />
                    )}
</Form.Item>
)
            },]);
        }
        consumeRow = consumeRow.concat([{
            title: 'Action',
            key: '_id',
            dataIndex: '_id',
            render: (value, record) => <a onClick={() => that.remove(record._id)}>Delete</a>
        }]);
        return (
<div>
            <Spin spinning={this.state.loading}>
                <Card
                  title={`${this.state.classType  } Stock`}
                  extra={(
                    <Search
                      loading={this.state.loadingQr}
                      value={this.state.qrValue}
                      onChange={this.setQrValue}
                      placeholder="Search QR Code"
                      onSearch={this.addItemThroughQR}
                      style={{width: 200}}
                    />
                  )}
                >
                    <Row gutter={16}>
                        <Col span={7}>
                            <Tabs size="small" type="card">
                                {INVENTORY_ITEM_TYPE.map(itemType => (
<TabPane tab={itemType.label} key={itemType.value}>
                                    <div style={{backgroundColor: '#ddd', padding: 8}}>
                                        <Input.Search
                                          key={itemType.label}
                                          placeholder={`Search in ${  itemType.label  }...`}
                                          onSearch={value => this.searchValues(itemType.label, value)}
                                        />
                                    </div>
                                    <List
                                      size="small"
                                      itemLayout="horizontal"
                                      dataSource={this.state.items && this.state.items[itemType.value] ? this.state.items[itemType.value].results : []}
                                      renderItem={item => (
                                              <List.Item>
                                                  <List.Item.Meta
                                                    title={`${item.name} (${item.total_quantity})`}
                                                    description={item.item_type_stock.item_stock && item.item_type_stock.item_stock.map((stock) =>
                                                          <span>#{stock.batch_number}<br /></span>)}
                                                  />
                                                  <Button
                                                    type="primary"
                                                    size="small"
                                                    shape="circle"
                                                    onClick={() => this.add(item)}
                                                    icon="arrow-right"
                                                  />
                                              </List.Item>
)}
                                    />
                                    {this.state.items && this.state.items[itemType.value] ? (
                                        <div style={{textAlign: 'center'}}>
                                            <a
                                              style={{margin: 5}}
                                              disabled={!this.state.items[itemType.value].previous}
                                              onClick={() => this.loadItemsList(itemType.value, this.state.items[itemType.value].previous)}
                                            >
                                                <Icon type="left" />Previous
                                            </a>
                                            <Divider type="vertical" />
                                            <a
                                              style={{margin: 5}}
                                              disabled={!this.state.items[itemType.value].next}
                                              onClick={() => this.loadItemsList(itemType.value, this.state.items[itemType.value].next)}
                                            >
                                                Next<Icon type="right" />
                                            </a>
                                        </div>
                                      ) : null}
</TabPane>
))}
                            </Tabs>
                        </Col>
                        <Col span={17}>
                            <Form onSubmit={this.handleSubmit}>
                                {this.state.classType == CONSUME_STOCK ? (
                                    <Row>
                                        <Col span={16}>
                                            <Form.Item
                                              key="type_of_consumption"
                                              label="Type of Consumption"
                                              {...{
                                                    labelCol: {span: 6},
                                                    wrapperCol: {span: 14},
                                                }}
                                            >
                                                {getFieldDecorator(`type_of_consumption`, {
                                                    validateTrigger: ['onChange', 'onBlur'],
                                                    rules: [{
                                                        required: true,
                                                        message: "This field is required.",
                                                    }],
                                                })(
                                                    <Select>
                                                        {TYPE_OF_CONSUMPTION.map(item => (
<Select.Option
  value={item.value}
>{item.label}
</Select.Option>
))}
                                                    </Select>
                                                )}
                                            </Form.Item>
                                        </Col>
                                        {/* <Col span={8}> */}
                                        {/* <Search */}
                                        {/* loading={this.state.loadingQr} */}
                                        {/* value={this.state.qrValue} */}
                                        {/* onChange={this.setQrValue} */}
                                        {/* placeholder="Search QR Code" */}
                                        {/* onSearch={this.addItemThroughQR} */}
                                        {/* style={{width: 200}} */}
                                        {/* /> */}
                                        {/* </Col> */}
                                    </Row>
                                  )
                                    : null}

                                {/* {this.state.classType == CONSUME_STOCK ? */}
                                {/* <Form.Item */}
                                {/* key={`supplier`} */}
                                {/* label={"Supplier"} */}
                                {/* {...{ */}
                                {/* labelCol: {span: 6}, */}
                                {/* wrapperCol: {span: 14}, */}
                                {/* }}> */}
                                {/* {getFieldDecorator(`addedOn`, { */}
                                {/* validateTrigger: ['onChange', 'onBlur'], */}
                                {/* rules: [{ */}
                                {/* message: "This field is required.", */}
                                {/* }], */}
                                {/* })( */}
                                {/* <Select> */}
                                {/* /!*{this.state.suppliersList && this.state.suppliersList.map(item =>*!/ */}
                                {/* /!*<Select.Option*!/ */}
                                {/* /!*value={item.id}>{item.name}</Select.Option>)}*!/ */}
                                {/* </Select> */}
                                {/* )} */}
                                {/* </Form.Item> */}
                                {/*: null} */}

                                <Table
                                  pagination={false}
                                  bordered
                                  rowKey={record => record._id}
                                  dataSource={this.state.tableFormValues}
                                  columns={consumeRow}
                                />
                                {/* <List>{formItems}</List> */}

                                <Affix offsetBottom={0}>
                                    <Card>
                                        <Row>
                                            <Col span={8}>
                                                <Form.Item
                                                  key="remarks"
                                                  label='Notes'
                                                  {...{
                                                        labelCol: {span: 24},
                                                        wrapperCol: {span: 24},
                                                    }}
                                                >
                                                    {getFieldDecorator(`remarks`, {
                                                    })(
                                                        <Input.TextArea />
                                                    )}
                                                </Form.Item>
                                                <Form.Item {...formItemLayoutWithOutLabel}>
                                                    <Button type="primary" htmlType="submit">Submit</Button>
                                                    {that.props.history ? (
                                                        <Button
                                                          style={{margin: 5}}
                                                          onClick={() => that.props.history.goBack()}
                                                        >
                                                            Cancel
                                                        </Button>
                                                      ) : null}
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item
                                                  key="date"
                                                  label={this.state.classType == ADD_STOCK ? "Added On" : "Consumed On"}
                                                  {...{
                                                        labelCol: {span: 10},
                                                        wrapperCol: {span: 14},
                                                    }}
                                                >
                                                    {getFieldDecorator(`date`, {
                                                        // validateTrigger: ['onChange', 'onBlur'],
                                                        rules: [{
                                                            required: true,
                                                            message: "This field is required.",
                                                        }],
                                                        initialValue: moment(),
                                                    })(
                                                        <DatePicker allowClear={false} />
                                                    )}
                                                </Form.Item>

                                                <Form.Item
                                                  key="bill_number"
                                                  label='Bill Number'
                                                  {...{
                                                        labelCol: {span: 10},
                                                        wrapperCol: {span: 14},
                                                    }}
                                                >
                                                    {getFieldDecorator(`bill_number`, {
                                                        validateTrigger: ['onChange', 'onBlur'],
                                                        rules: [{
                                                            required: true,
                                                            message: "This field is required.",
                                                        }],

                                                    })(
                                                        <Input />
                                                    )}
                                                </Form.Item>


                                                {this.state.classType == ADD_STOCK ? (
<div>
                                                    {this.state.customSupplier ? (
                                                        <Form.Item
                                                          key="supplier_name"
                                                          label="Supplier"
                                                          {...{
                                                                labelCol: {span: 10},
                                                                wrapperCol: {span: 14},
                                                            }}
                                                        >
                                                            {getFieldDecorator(`supplier_name`, {
                                                                validateTrigger: ['onChange', 'onBlur'],
                                                                rules: [{
                                                                    required: true,
                                                                    message: "This field is required.",
                                                                }],
                                                            })(
                                                                <Input />
                                                            )}
                                                            {this.state.customSupplier ?
                                                                <a onClick={() => this.changeSupplierType(false)}>Cancel</a> : null}
                                                        </Form.Item>
                                                      ) : (
<Form.Item
  key="supplier"
  label="Supplier"
  {...{
                                                                labelCol: {span: 10},
                                                                wrapperCol: {span: 14},
                                                            }}
>
                                                            {getFieldDecorator(`supplier`, {
                                                                validateTrigger: ['onChange', 'onBlur'],
                                                                rules: [{
                                                                    required: true,
                                                                    message: "This field is required.",
                                                                }],
                                                            })(<Select>
                                                                {this.state.supplierList.map(item => (
<Select.Option
  value={item.id}
>
                                                                    {item.name}
</Select.Option>
))}
                                                               </Select>)}
                                                            {this.state.customSupplier ? null : (
                                                                <a onClick={() => this.changeSupplierType(true)}>Add
                                                                    New
                                                                </a>
                                                              )}
</Form.Item>
)} 
</div>
) : null}
                                            </Col>
                                            <Col span={6} offset={2}>
                                                <Form.Item key="file" {...formItemLayout}>
                                                    {getFieldDecorator('file', {})(
                                                        <Upload {...singleUploadprops}>
                                                            <Button>
                                                                <Icon type="upload" /> Select File
                                                            </Button>

                                                        </Upload>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                            {this.state.classType == ADD_STOCK ? (
                                                <Col style={{textAlign: 'center'}} span={8}>

                                                    <h3>Grand
                                                        Total: <b>{this.state.tableFormValues.reduce(function (total, item) {
                                                            if (that.state.tempValues[`quantity${  item._id}`] && that.state.tempValues[`unit_cost${  item._id}`]) {
                                                                return total + (that.state.tempValues[`quantity${  item._id}`] * that.state.tempValues[`unit_cost${  item._id}`])
                                                            }
                                                            return total
                                                        }, 0)}
                                                               </b>
                                                    </h3>
                                                </Col>
                                              )
                                                : null}

                                        </Row>
                                    </Card>
                                </Affix>

                            </Form>

                        </Col>
                    </Row>
                </Card>
            </Spin>
</div>
)

    }
}

export default Form.create()(AddOrConsumeStock);
