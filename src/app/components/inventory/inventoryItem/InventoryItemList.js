import React from 'react';
import {
    Button,
    Card,
    Col,
    Divider,
    Icon,
    Input,
    Modal,
    Popconfirm,
    Radio,
    Row,
    Select,
    Spin,
    Statistic,
    Table,
    Tag,
} from 'antd';
import { Link, Route, Switch } from 'react-router-dom';
import moment from 'moment';
import {
    getAPI,
    interpolate,
    putAPI,
    startLoadingMessage,
    stopLoadingMessage,
} from '../../../utils/common';
import {
    INVENTORY_ITEM_API,
    SINGLE_INVENTORY_ITEM_API,
    INVENTORY_ITEM_EXPORT,
    PRODUCT_MARGIN,
    INVENTORY_STOCK_TOTAL_COST,
} from '../../../constants/api';
import AddorEditInventoryItem from './AddorEditInventoryItem';
import AddOrConsumeStock from './AddOrConsumeStock';
import { ADD_STOCK, CONSUME_STOCK, INVENTORY_ITEM_TYPE } from '../../../constants/hardData';
import InfiniteFeedLoaderButton from '../../common/InfiniteFeedLoaderButton';
import PermissionDenied from '../../common/errors/PermissionDenied';
import { ASCENDING_ORDER, ERROR_MSG_TYPE, SUCCESS_MSG_TYPE } from '../../../constants/dataKeys';
import { BACKEND_BASE_URL } from '../../../config/connect';

export default class InventoryItemList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inventoryItems: [], // All List
            inventoryItemList: [], // Filtered List
            stockModalVisibility: false,
            itemTypeFilter: 'ALL',
            itemStockFilter: 'ALL',
            loading: true,
            nextItemPage: null,
            productMargin: [],
            inventoryModal: false,
            inventoryItemObj: null,
            inventoryTotal: null,
        };
        this.loadData = this.loadData.bind(this);
        this.showAddOrConsumeModal = this.showAddOrConsumeModal.bind(this);
        this.setActionType = this.setActionType.bind(this);
        this.changeFilter = this.changeFilter.bind(this);
        this.deleteObject = this.deleteObject.bind(this);
        this.excelExport = this.excelExport.bind(this);
        this.pdfExport = this.pdfExport.bind(this);
    }

    componentDidMount() {
        this.loadData();
        this.loadProductMargin();
    }

    loadProductMargin = () => {
        const that = this;
        const successFn = function(data) {
            that.setState({
                productMargin: data,
            });
        };
        const errorFn = function() {};
        getAPI(PRODUCT_MARGIN, successFn, errorFn);
    };

    loadInventoryTotal = () => {
        const that = this;
        const successFn = function(data) {
            that.setState({
                inventoryTotal: data.total_price,
            });
        };
        const errorFn = function() {};
        getAPI(INVENTORY_STOCK_TOTAL_COST, successFn, errorFn, {
            practice: this.props.active_practiceId,
        });
    };

    loadData(page = 1) {
        const that = this;
        that.setState({
            loading: true,
        });
        that.loadInventoryTotal();
        const successFn = function(recData) {
            const data = recData.results;
            that.setState(function(prevState) {
                if (recData.current === 1) {
                    return {
                        inventoryItems: data,
                        loading: false,
                        nextItemPage: recData.next,
                    };
                }
                return {
                    inventoryItems: [...prevState.inventoryItems, ...data],
                    loading: false,
                    nextItemPage: recData.next,
                };
            });
        };
        const errorFn = function() {
            that.setState({
                loading: false,
            });
        };
        const reqParams = {
            maintain_inventory: true,
            practice: this.props.active_practiceId,
            page,
            sort: ASCENDING_ORDER,
            on: 'total_quantity',
        };
        if (that.state.itemTypeFilter !== 'ALL') {
            reqParams.item_type = that.state.itemTypeFilter;
        }
        if (that.state.itemStockFilter !== 'ALL') {
            reqParams.filter_type = that.state.itemStockFilter;
        }
        if (that.state.filterItemName) {
            reqParams.item_name = that.state.filterItemName;
        }
        if (that.state.filterItemCode) {
            reqParams.code = that.state.filterItemCode;
        }
        if (that.state.filterMLM) {
            reqParams.margin = that.state.filterMLM;
        }
        getAPI(INVENTORY_ITEM_API, successFn, errorFn, reqParams);
    }

    deleteObject(value) {
        const that = this;
        const reqData = {
            is_active: false,
        };
        const successFn = function() {
            that.loadData();
        };
        const errorFn = function() {};
        putAPI(interpolate(SINGLE_INVENTORY_ITEM_API, [value]), reqData, successFn, errorFn);
    }

    setActionType(type, itemId) {
        this.setState({
            itemId,
            actionType: type,
        });
        this.showAddOrConsumeModal(true);
    }

    showAddOrConsumeModal(type) {
        this.setState({
            stockModalVisibility: type,
        });
    }

    changeFilter = e => {
        const that = this;
        this.setState(
            {
                [e.target.name]: e.target.value,
            },
            function() {
                that.loadData();
            },
        );
    };

    changeInventoryFilters = (key, value) => {
        const that = this;
        that.setState(
            {
                [key]: value,
            },
            function() {
                that.loadData();
            },
        );
    };

    excelExport() {
        const that = this;
        const msg = startLoadingMessage('Generating Report...');
        const successFn = function(data) {
            stopLoadingMessage(msg, SUCCESS_MSG_TYPE, 'Report Generated Successfully!!');
            if (data.report_csv) window.open(BACKEND_BASE_URL + data.report_csv);
        };
        const errorFn = function() {
            stopLoadingMessage(msg, ERROR_MSG_TYPE, 'Report Generation Failed!!');
        };
        const reqParams = {
            maintain_inventory: true,
            practice: this.props.active_practiceId,
            sort: ASCENDING_ORDER,
            on: 'total_quantity',
        };
        if (that.state.itemTypeFilter !== 'ALL') {
            reqParams.item_type = that.state.itemTypeFilter;
        }
        if (that.state.itemStockFilter !== 'ALL') {
            reqParams.filter_type = that.state.itemStockFilter;
        }
        if (that.state.filterItemName) {
            reqParams.item_name = that.state.filterItemName;
        }
        if (that.state.filterItemCode) {
            reqParams.code = that.state.filterItemCode;
        }
        if (that.state.filterMLM) {
            reqParams.margin = that.state.filterMLM;
        }
        getAPI(INVENTORY_ITEM_EXPORT, successFn, errorFn, reqParams);
    }

    pdfExport() {
        const that = this;
        const msg = startLoadingMessage('Generating Report...');
        const successFn = function(data) {
            stopLoadingMessage(msg, SUCCESS_MSG_TYPE, 'Report Generated Successfully!!');
            if (data.report_pdf) window.open(BACKEND_BASE_URL + data.report_pdf);
        };
        const errorFn = function() {
            stopLoadingMessage(msg, ERROR_MSG_TYPE, 'Report Generation Failed!!');
        };
        const reqParams = {
            maintain_inventory: true,
            practice: this.props.active_practiceId,
            sort: ASCENDING_ORDER,
            on: 'total_quantity',
        };
        if (that.state.itemTypeFilter !== 'ALL') {
            reqParams.item_type = that.state.itemTypeFilter;
        }
        if (that.state.itemStockFilter !== 'ALL') {
            reqParams.filter_type = that.state.itemStockFilter;
        }
        if (that.state.filterItemName) {
            reqParams.item_name = that.state.filterItemName;
        }
        if (that.state.filterItemCode) {
            reqParams.code = that.state.filterItemCode;
        }
        if (that.state.filterMLM) {
            reqParams.margin = that.state.filterMLM;
        }
        getAPI(INVENTORY_ITEM_EXPORT, successFn, errorFn, reqParams);
    }

    inventoryItemModalOpen = item => {
        this.setState({
            inventoryModal: true,
            inventoryItemObj: item,
        });
    };

    inventoryItemModalClose = () => {
        this.setState({
            inventoryModal: false,
        });
    };

    render() {
        const taxesdata = {};
        if (this.state.taxes_list) {
            this.state.taxes_list.forEach(function(tax) {
                taxesdata[tax.id] = tax;
            });
        }
        const manufacturerData = {};
        if (this.state.manufacture_list) {
            this.state.manufacture_list.forEach(function(manufacturer) {
                manufacturerData[manufacturer.id] = manufacturer.name;
            });
        }
        const vendorData = {};
        if (this.state.vendor_list) {
            this.state.vendor_list.forEach(function(vendor) {
                vendorData[vendor.id] = vendor.name;
            });
        }
        const that = this;
        const columns = [
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                render: (value, record) => (
                    <a onClick={() => this.inventoryItemModalOpen(record)}>
                        <span>{record.name}</span>
                    </a>
                ),
            },
            {
                title: 'HSN',
                dataIndex: 'hsn_data',
                key: 'hsn_data',
                render: (value,record) => <span>{value ? value.code : null}</span>
            },
            {
                title: 'Inventory Stock',
                dataIndex: 'total_quantity',
                key: 'total_quantity',
                render: (value, record) => (
                    <span>
                        {value}{' '}
                        {value <= record.re_order_level ? <Tag color="#f50">Low</Tag> : null}
                    </span>
                ),
            },
            {
                title: 'Expired Stock',
                dataIndex: 'item_type_stock',
                key: 'expired_stock',
                export(itemTypeStock) {
                    let totalStock = 0;
                    const currentDate = moment();
                    if (itemTypeStock.item_stock)
                        itemTypeStock.item_stock.forEach(function(stock) {
                            if (currentDate >= moment(stock.expiry_date, 'YYYY-MM-DD'))
                                totalStock += Number.isInteger(stock.quantity) ? stock.quantity : 0;
                        });
                    return totalStock;
                },
                render(itemTypeStock) {
                    let totalStock = 0;
                    const currentDate = moment();
                    if (itemTypeStock.item_stock)
                        itemTypeStock.item_stock.forEach(function(stock) {
                            if (currentDate >= moment(stock.expiry_date, 'YYYY-MM-DD'))
                                totalStock += Number.isInteger(stock.quantity) ? stock.quantity : 0;
                        });
                    return <span>{totalStock}</span>;
                },
            },
            {
                title: 'Retail Price (INR)',
                dataIndex: 'retail_without_tax',
                key: 'retail_without_tax',
                render: (value, record) => <span>{record.retail_without_tax}</span>,
            },
            // {
            //     title: 'Tax',
            //     dataIndex: 'taxes',
            //     key: 'taxes',
            //     render: (value, record) => (
            //         <span>
            //             {record.taxes_data &&
            //                 record.taxes_data.map(tax => (
            //                     <Tag>
            //                         <small> {tax ? `${tax.name}@${tax.tax_value}%` : null}</small>
            //                     </Tag>
            //                 ))}
            //         </span>
            //     ),
            // },
                // Edit by Arpit tyagi
            {
                title: 'M.R.P',
                dataIndex: 'retail_with_tax',
                key: 'retail_with_tax',
                render: (value, record) => <span>{record.retail_with_tax}</span>,
            },
            //
            {
                title: 'MLM Margin',
                dataIndex: 'margin_data',
                key: 'margin',
                render: margin => <span>{margin ? margin.name : null}</span>,
            },
            {
                title: 'Item type',
                dataIndex: 'item_type',
                key: 'item_type',
                // render: (value,record) => <span>{record.inventory_item.item_type}</span>
            },
            {
                title: 'Reorder Level',
                dataIndex: 're_order_level',
                key: 're_order_level',
                // render: (value, record) => <span>{record.inventory_item.re_order_level}</span>
            },
            {
                title: 'Manufacturer',
                key: 'manufacturer',
                export(text, record) {
                    return record.manufacturer_data ? record.manufacturer_data.name : '';
                },
                render: (text, record) => (
                    <span> {record.manufacturer_data ? record.manufacturer_data.name : ''}</span>
                ),
            },
            {
                title: 'Stock Cost (INR)',
                key: 'stock_cost',
                // export: function (text, record) {
                //     return record.manufacturer_data ? record.manufacturer_data.name : '';
                // },
                render: (text, record) => (
                    <span>
                        {' '}
                        {record.item_type_stock && record.item_type_stock.item_stock
                            ? record.item_type_stock.item_stock.reduce(
                                  (a, b) => a + b.unit_cost * b.quantity,
                                  0,
                              ).toFixed(2)
                            : ''}
                    </span>
                ),
            },
            {
                title: 'Actions',
                render: item => {
                    return (
                        <div>
                            <Link to={`/erp/inventory/edit/${item.id}`}>Edit</Link>
                            <Divider type="vertical" />
                            {/* <Link to={"/inventory/edit-item-type/" + item.id}>Edit stock type </Link>
                        <Divider type="vertical"/> */}
                            {item.total_quantity === 0 ? (
                                <Popconfirm
                                  title="Are you sure delete this item?"
                                  onConfirm={() => that.deleteObject(item.id)}
                                  okText="Yes"
                                  cancelText="No"
                                >
                                    <a>Delete</a>
                                </Popconfirm>
                            ) : (
                                <Tag color="red">Can Not Delete</Tag>
                            )}
                        </div>
                    );
                },
            },
        ];

        const inventoryItemColumn = [
            {
                title: 'S.No',
                key: 's_no',
                render: (item, record, index) => <span>{index + 1}</span>,
            },
            {
                title: 'Batch Number',
                dataIndex: 'batch_number',
                key: 'batch_number',
            },
            {
                title: 'Quantity',
                dataIndex: 'quantity',
                key: 'quantity',
            },
            {
                title: 'Stock Cost(INR)',
                key: 'stock_cost',
                render: (item, record) => (
                    <span>{(record.quantity * record.unit_cost).toFixed(2)}</span>
                ),
            },
            {
                title: 'Expiry Date',
                key: 'expiry_date',
                render: (item, record) => (
                    <span>{moment(record.expiry_date).format('DD-MM-YYYY')}</span>
                ),
            },
        ];
        return (
            <div>
                <Switch>
                    <Route
                      path="/erp/inventory/add"
                      render={route =>
                            that.props.activePracticePermissions.AddInventoryItem ||
                            that.props.allowAllPermissions ? (
                                <AddorEditInventoryItem
                                  {...route}
                                  {...this.props}
                                  {...this.state}
                                  loadData={this.loadData}
                                />
                            ) : (
                                <PermissionDenied />
                            )}
                    />

                    {/* <Route path="/inventory/edit-item-type/:id"
                       render={(route) => <AddOrConsumeStock key={ADD_STOCK}
                       type={ADD_STOCK}
                       loadData={this.loadData}
                       {...this.state} {...route} {...this.props}/>}/> */}

                    <Route
                      exact
                      path="/erp/inventory/edit/:id"
                      render={route =>
                            that.props.activePracticePermissions.AddInventoryItem ||
                            that.props.allowAllPermissions ? (
                                <AddorEditInventoryItem
                                  {...this.state}
                                  {...this.props}
                                  {...route}
                                  loadData={this.loadData}
                                />
                            ) : (
                                <PermissionDenied />
                            )}
                    />

                    <Route
                      exact
                      path="/erp/inventory/consume-stock"
                      render={route =>
                            that.props.activePracticePermissions.AddInventoryStock ||
                            that.props.allowAllPermissions ? (
                                <AddOrConsumeStock
                                  key={CONSUME_STOCK}
                                  type={CONSUME_STOCK}
                                  loadData={this.loadData}
                                  {...this.state}
                                  {...route}
                                  {...this.props}
                                />
                            ) : (
                                <PermissionDenied />
                            )}
                    />

                    <Route
                      exact
                      path="/erp/inventory/add-stock"
                      render={route =>
                            that.props.activePracticePermissions.ConsumeInventoryStock ||
                            that.props.allowAllPermissions ? (
                                <AddOrConsumeStock
                                  key={ADD_STOCK}
                                  type={ADD_STOCK}
                                  loadData={this.loadData}
                                  {...this.state}
                                  {...route}
                                  {...this.props}
                                />
                            ) : (
                                <PermissionDenied />
                            )}
                    />
                    <Route>
                        <Card
                          title="Inventory List"
                          extra={(
                                <Button.Group>
                                    <Link to="/erp/inventory/add">
                                        <Button
                                          type="primary"
                                          disabled={
                                                !that.props.activePracticePermissions
                                                    .AddInventoryItem &&
                                                !that.props.allowAllPermissions
                                            }
                                        >
                                            <Icon type="plus" /> Add Item
                                        </Button>
                                    </Link>

                                    <Link to="/erp/inventory/add-stock">
                                        <Button
                                          disabled={
                                                !that.props.activePracticePermissions
                                                    .AddInventoryStock &&
                                                !that.props.allowAllPermissions
                                            }
                                          type="primary"
                                        >
                                            Add Stock
                                        </Button>
                                    </Link>
                                    <Link to="/inventory/consume-stock">
                                        <Button
                                          disabled={
                                                !that.props.activePracticePermissions
                                                    .ConsumeInventoryStock &&
                                                !that.props.allowAllPermissions
                                            }
                                          type="primary"
                                        >
                                            Consume Stock
                                        </Button>
                                    </Link>
                                </Button.Group>
                              )}
                        >
                            <Row style={{ marginBottom: 10 }}>
                                <Col span={8}>
                                    <Radio.Group
                                      name="itemTypeFilter"
                                      size="small"
                                      defaultValue="ALL"
                                      buttonStyle="solid"
                                      onChange={this.changeFilter}
                                      style={{ margin: '10px' }}
                                    >
                                        <Radio.Button value="ALL">ALL</Radio.Button>
                                        {INVENTORY_ITEM_TYPE.map(item => (
                                            <Radio.Button value={item.value}>
                                                {item.label}
                                            </Radio.Button>
                                        ))}
                                    </Radio.Group>
                                </Col>
                                <Col span={8} style={{ textAlign: 'center' }}>
                                    <Statistic
                                      title="Inventory Total Cost"
                                      value={this.state.inventoryTotal}
                                      prefix="Rs."
                                    />
                                </Col>
                                <Col span={8}>
                                    <Radio.Group
                                      name="itemStockFilter"
                                      size="small"
                                      defaultValue="ALL"
                                      buttonStyle="solid"
                                      style={{ margin: '10px', float: 'right' }}
                                      onChange={this.changeFilter}
                                    >
                                        <Radio.Button value="ALL">ALL</Radio.Button>
                                        <Radio.Button value="Low">Low</Radio.Button>
                                        <Radio.Button value="Expired">Expired</Radio.Button>
                                    </Radio.Group>
                                </Col>
                            </Row>
                            <Row gutter={16} style={{ marginBottom: 10 }}>
                                <Col span={4}>
                                    <Button.Group size="small">
                                        <Button
                                          disabled={this.state.loading}
                                          type="primary"
                                          onClick={this.excelExport}
                                        >
                                            <Icon type="file-excel" /> Excel
                                        </Button>
                                        <Button
                                          disabled={this.state.loading}
                                          type="primary"
                                          onClick={this.pdfExport}
                                        >
                                            <Icon type="file-pdf" /> PDF
                                        </Button>
                                    </Button.Group>
                                </Col>

                                <Col span={2} style={{ textAlign: 'right' }}>
                                    <b> Item Name</b>
                                </Col>
                                <Col span={4}>
                                    <Input
                                      style={{ width: '100%' }}
                                      value={this.state.filterItemName}
                                      allowClear
                                        // disabled={this.state.loading}
                                      placeholder="Item Name"
                                      onChange={e =>
                                            this.changeInventoryFilters(
                                                'filterItemName',
                                                e.target.value,
                                            )}
                                    />
                                </Col>
                                <Col span={2} style={{ textAlign: 'right' }}>
                                    <b> HSN</b>
                                </Col>
                                <Col span={4}>
                                    <Input
                                      style={{ width: '100%' }}
                                      value={this.state.filterItemCode}
                                      allowClear
                                        // disabled={this.state.loading}
                                      placeholder="HSN Number"
                                      onChange={e =>
                                            this.changeInventoryFilters(
                                                'filterItemCode',
                                                e.target.value,
                                            )}
                                    />
                                </Col>
                                <Col span={2} style={{ textAlign: 'right' }}>
                                    <b> MLM</b>
                                </Col>
                                <Col span={4}>
                                    <Select
                                      style={{ width: '100%' }}
                                      value={this.state.filterMLM}
                                      allowClear
                                        // disabled={this.state.loading}
                                      placeholder="MLM Margin"
                                      onChange={e => this.changeInventoryFilters('filterMLM', e)}
                                    >
                                        {this.state.productMargin.map(item => (
                                            <Select.Option value={item.id}>
                                                {item.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Col>
                                {/* <Col span={8}> */}
                                {/*    <Button type={"primary"} onClick={()=>this.loadData()}> Filter Items</Button> */}
                                {/* </Col> */}
                            </Row>

                            <Row>
                                <Table
                                  bordered
                                  pagination={false}
                                  hideReport
                                  dataSource={this.state.inventoryItems.sort(
                                        (a, b) =>
                                            parseInt(b.total_quantity) - parseInt(a.total_quantity),
                                    )}
                                  columns={columns}
                                />
                                <Spin spinning={this.state.loading}>
                                    <Row />
                                </Spin>
                                <InfiniteFeedLoaderButton
                                  loaderFunction={() => this.loadData(this.state.nextItemPage)}
                                  loading={this.state.loading}
                                  hidden={!this.state.nextItemPage}
                                />
                            </Row>
                            <Modal
                              visible={this.state.stockModalVisibility}
                              title={`Stock${this.state.actionType}`}
                              onOk={() => this.showAddOrConsumeModal(false)}
                              onCancel={() => this.showAddOrConsumeModal(false)}
                              footer={null}
                            >
                                <AddOrConsumeStock
                                  showAddOrConsumeModal={this.showAddOrConsumeModal}
                                  itemId={this.state.itemId}
                                  actionType={this.state.actionType}
                                />
                            </Modal>

                            <Modal
                              title={
                                    this.state.inventoryItemObj
                                        ? `${this.state.inventoryItemObj.name} Details`
                                        : ''
                                }
                              visible={this.state.inventoryModal}
                              onCancel={this.inventoryItemModalClose}
                              footer={null}
                            >
                                <Table
                                  dataSource={
                                        this.state.inventoryItemObj
                                            ? this.state.inventoryItemObj.item_type_stock.item_stock
                                            : []
                                    }
                                  columns={inventoryItemColumn}
                                  pagination={false}
                                />
                            </Modal>
                        </Card>
                    </Route>
                </Switch>
            </div>
        );
    }
}
