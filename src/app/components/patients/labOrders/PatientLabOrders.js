import React from "react";
import {Card, Button, Icon, Table, Divider, Checkbox} from "antd";
import {Link} from "react-router-dom";
import moment from "moment";
import {Route, Switch} from "react-router";
import  AddPatientLabOrders from "./AddPatientLabOrders";

class PatientLabOrders extends React.Component{
	constructor(props){
        super(props);
        this.state={
            currentPatient: this.props.currentPatient,
            active_practiceId: this.props.active_practiceId,
        	loading:false,
        }
    }

    render(){
    	const columns = [{
            title: 'Time',
            dataIndex: 'created_at',
            key: 'name',
            render: created_at => <span>{moment(created_at).format('LLL')}</span>,
        }, {
            title: 'Drug',
            key: 'drug',

        }, {
            title: 'Quantity',
            dataIndex: 'qunatity',
            key: 'quantity',
        }, {
            title: 'Cost Per  Unit',
            dataIndex: 'cost',
            key: 'cost',
        }, {
            title: 'Completed',
            key: 'is_completed',
            render: (text, record) => (
                <Checkbox checked={record.is_completed} />
            )
        }, {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <span>
                <a onClick={() => this.editPrescriptionData(record)}>Edit</a>
                <Divider type="vertical" />
                <a href="javascript:;">Delete</a>
                </span>
            ),
        }];

    	return (
<div><Switch>
              <Route
                exact
                path='/erp/patient/:id/emr/labtrackings/add'
                render={(route) => <AddPatientLabOrders {...this.state} {...route} />}
              />
              <Card
                title={this.state.currentPatient?`${this.state.currentPatient.user.first_name  } Lab Order`:"Patients Lab Order"}
                extra={(
<Button.Group>
                    <Link to={`/erp/patient/${this.props.match.params.id}/emr/labtrackings/add`}><Button><Icon type="plus" />Add</Button></Link>
</Button.Group>
)}
              >

                  <Table loading={this.state.loading} columns={columns} dataSource={this.state.payments} />

              </Card>
     </Switch>

</div>
)
    }

}

export default PatientLabOrders;
