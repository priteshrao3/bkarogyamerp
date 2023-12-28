import {Button, Card, Icon} from "antd";
import React from "react";
import {Route, Switch} from "react-router";
import {Link} from "react-router-dom";
import {getAPI} from "../../../utils/common";
import {LAB_API} from "../../../constants/api";
import AddLab from "./AddLab";

export default class LabList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active_practiceId: this.props.active_practiceId,
            lab: null,
            loading:true
        };
        this.loadData = this.loadData.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                lab: data,
                loading:false
            })
        }
        const errorFn = function () {
            that.setState({
                loading:false
            })

        }
        getAPI(LAB_API, successFn, errorFn);
    }

    render() {
        return (
<div><Switch>
            <Route
              exact
              path='/erp/inventory/lab/add'
              render={(route) => <AddLab {...this.state} {...route} />}
            />
            <Route
              exact
              path='/erp/inventory/expenses/lab/:id'
              render={(route) => <AddLab {...this.state} {...route} />}
            />
            <Card
              loading={this.state.loading}
              title="Lab"
              extra={(
<Link to="/erp/inventory/lab/add"> <Button type="primary"><Icon
  type="plus"
/> Add
                               </Button>
</Link>
)}
            />
     </Switch>
</div>
)
    }
}
