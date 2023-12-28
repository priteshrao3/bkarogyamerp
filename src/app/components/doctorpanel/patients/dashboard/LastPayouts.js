import React from "react";
import {Card, Table} from "antd";
import {getAPI, interpolate} from "../../../../utils/common";
import {WALLET_LEDGER} from "../../../../constants/api";

export default class LastPayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            payoutDetails: []
        }
        this.loadPayoutData();
    }
    loadPayoutData = ()=>{
        let that = this;
        that.setState({
            loading:true
        })
        let successFn = function(data){
            that.setState({
                payoutDetails:data.results,
                loading:false
            })
        }
        let errorFn = function(){
            that.setState({
                loading:false
            })
        }
        getAPI(interpolate(WALLET_LEDGER,[this.props.currentPatient.id]),successFn,errorFn,{
            page_size:5,
            page:1,
            sort:'date',
            ledger_type:'Payout'
        })
    }
    render() {
        let columns = [{
            title: 'Date',
            dataIndex: '',
            key: 'date',
            align:'center'
        }, {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            align:'right'
        }]
        return <div>
            <Card bodyStyle={{padding: 0}} title={"Last 5 Payouts"} style={{marginBottom:20}} loading={this.state.loading}>
                <Table columns={columns} dataSource={this.state.payoutDetails}/>
            </Card>
        </div>
    }
}