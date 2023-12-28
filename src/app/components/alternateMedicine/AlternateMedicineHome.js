import React from "react";
import {Button, Card, Icon, Row, Input, Table, Select} from "antd";
import {Switch, Route, Link} from "react-router-dom";
import {getAPI} from "../../utils/common";
import {ALTERNATE_MEDICINE} from "../../constants/api";
import InfiniteFeedLoaderButton from "../common/InfiniteFeedLoaderButton";
import AddOrEditMedicine from "./AddOrEditMedicine";

const {Search} = Input;
export default class AlternateMedicineHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            medicineList: [],
            searchType: 'allopath',
            searchString: '',
        }
    }

    componentDidMount() {
        this.loadMedicines();
    }

    loadMedicines = (page = 1) => {
        const that = this;
        that.setState({
            loading: true
        })
        const successFn = function (data) {
            that.setState({
                medicineList: data.results,
                total: data.count,
                nextPage: data.next,
                current: data.current,
                loading: false
            })
        }
        const errorFn = function () {
            that.setState({
                loading: false
            })
        }
        const params = {
            page
        }
        if (that.state.searchString) {
            params[that.state.searchType] = that.state.searchString
        }
        getAPI(ALTERNATE_MEDICINE, successFn, errorFn, params);
    }

    setSearchParams = (type, value) => {
        console.log(value)
        const that = this;
        this.setState({
            [type]: value
        }, function () {
            that.loadMedicines()
        })
    }

    render() {
        let i = 0;
        const that = this;
        const columns = [{
            title: 'S. No.',
            dataIndex: 'no',
            key: 'no',
            render: () => <span>{++i}</span>
        }, {
            title: 'Ayurveda Medicine',
            dataIndex: 'ayurveda',
            key: 'ayurveda',
        }, {
            title: 'Allopath Medicine',
            dataIndex: 'allopath',
            key: 'allopath',
        }];
        return (
<div style={{margin: 20}}>
            <Switch>
                <Route path="/erp/alternate-medicine/add" render={()=><AddOrEditMedicine {...that.props} />} />
                <Route>
                    <Card>
                        <h2>Alternate Medicines (Ayurveda - Allopath)
                            <Link to="/erp/alternate-medicine/add">
                            <Button type="primary" style={{float: 'right'}}>
                                <Icon type="plus" /> Add Medicine
                            </Button>
                            </Link>
                        </h2>

                        <Row>
                            <Input
                              value={this.state.searchString}
                              placeholder="Search Medicine..."
                              onChange={e => this.setSearchParams('searchString', e.target.value)}
                              style={{width: 250, margin: 10}}
                            />
                            <Select
                              style={{width: 250, margin: 10}}
                              value={this.state.searchType}
                              onChange={(value) => this.setSearchParams('searchType', value)}
                            >
                                <Select.Option value="allopath">Allopath Medicine</Select.Option>
                                <Select.Option value="ayurveda">Ayurveda Medicine</Select.Option>
                            </Select>
                        </Row>
                        <Table
                          hideReport
                          dataSource={this.state.medicineList}
                          loading={this.state.loading}
                          pagination={false}
                          columns={columns}
                        />
                        <InfiniteFeedLoaderButton
                          loading={this.state.loading}
                          loaderFunction={() => that.loadMedicines(that.state.nextPage)}
                          hidden={!this.state.nextPage}
                        />
                    </Card>
                </Route>
            </Switch>
</div>
)
    }
}