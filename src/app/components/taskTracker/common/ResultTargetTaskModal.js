import {Button, Form, Input, Modal} from "antd";
import React from "react";
import DynamicFieldsForm from "../../common/DynamicFieldsForm";
import {INPUT_FIELD} from "../../../constants/dataKeys";
import {interpolate} from "../../../utils/common";
import {COMMENT_TASK, COMPLETE_TASK} from "../../../constants/api";
import {LABEL_FIELD, NUMBER_FIELD, SUCCESS_MSG_TYPE, TEXT_FIELD} from '../../../constants/dataKeys';
import {displayMessage, getAPI, postAPI} from '../../../utils/common';
import moment from 'moment';

export default class ResultTargetTaskModal extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            open: this.props.open,
            filterStrings: {
                date: moment().format('YYYY-MM-DD'),
            },
            taskid : this.props.taskId,
            taskname : this.props.taskname,
            tdata : this.props.tdata
        }
        
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (this.props.open != nextProps.open) {
            console.log(this.props.taskId);
            this.setState({
                open: nextProps.open,
                
            })
        }
    }


    componentDidMount() {

        this.loadTargetData();
        this.loadTargetData2();
       
    }


    
    loadTargetData = () => {
        const that = this;
        
        const successFn = function (data) {
            that.setState({
                editRecord: data[0]
            })
        }
        const errorFn = function () {

        }
        getAPI('tasks/tasktarget/', successFn, errorFn, {date:that.state.filterStrings.date,taskid:that.state.taskid});

    }

    loadTargetData2 = () => {
        const that = this;
        
        const successFn = function (data) {
            that.setState({
                editpoint: data[0]
            })
        }
        const errorFn = function () {

        }
        getAPI('tasks/taskpoint/', successFn, errorFn, {date:that.state.filterStrings.date,taskid:that.state.taskid});

    };

     calculatePoints = (totalTasks, totalDays, tasksCompletedOneDay,pointsForAllTasks)=> {
        console.log( `${totalTasks}/${totalDays}/${tasksCompletedOneDay}/ ${pointsForAllTasks}`)
        
        // Calculate points per task for 7 days
        const pointsPerTask = (pointsForAllTasks !== undefined && pointsForAllTasks !== NaN ? pointsForAllTasks : 0 ) / (totalTasks !== undefined && totalTasks !== NaN ? totalTasks : 0 );

  // Calculate points for the given number of tasks completed in one day
        const pointsForOneDay = (pointsPerTask !== undefined && pointsPerTask !== NaN ? pointsPerTask : 0 ) * tasksCompletedOneDay;
       
      
        return pointsForOneDay;
      }


    editTargetPoint = (values) => {
        const that = this;
        const {editpoint} = this.state;
        const {date,effert_score, result_score, task} = values;
        const {tdata} = that.state;
        console.log(tdata.effert_point)
        console.log(tdata.effert_target)
        console.log(tdata.created_at)
        const day = moment(tdata.deadline).diff(tdata.created_at,"days")
        console.log()
        const effertpt = this.calculatePoints(tdata.effert_target,day,effert_score,tdata.effert_point)
        const resultpt = this.calculatePoints(tdata.result_target,day,result_score,tdata.result_point)
        console.log(`  ${effertpt}  //// ${resultpt}  `)

        const reqData =[ {
                id : editpoint ? editpoint.id : null ,
                date: date,
                effert_point: effertpt.toFixed(2) ,
                result_point: resultpt.toFixed(2),
                task: task,
        }]
        const successFn = function (data) {
            console.log(data)
        }
        const errorFn = function () {

        }
        console.log(`post data ${JSON.stringify( reqData)}`)
        postAPI('tasks/taskpoint/', reqData ,successFn, errorFn, );

    }
    

    render() {
        const {open,filterStrings, currentDate, editRecord, visible,} = this.state;
        const that = this;
        const DailyTargetEditForm = Form.create()(DynamicFieldsForm);
        const fields = [{
            label: 'Target Name',
            follow: that.state.taskname ?  that.state.taskname : null,
            type: LABEL_FIELD,
            key: 'name',
        }, {
            label: 'Effert Target Score',
            initialValue: editRecord && editRecord.effert_score ? editRecord.effert_score : null,
            type: NUMBER_FIELD,
            key: 'effert_score',
            required: true,
        },
        {
            label: 'Conversion Result Score',
            initialValue: editRecord && editRecord.result_score ? editRecord.result_score : null,
            type: NUMBER_FIELD,
            key: 'result_score',
            required: true,
        }, {
            label: 'Remark',
            initialValue: editRecord && editRecord.remark ? editRecord.remark : null,
            type: TEXT_FIELD,
            key: 'remark',
            row: 3
        }];
        const formProp = {
            method: 'post',
            action: 'tasks/tasktarget/',
            beforeSend: function (values) {
                that.editTargetPoint(values);
                console.log( ` times on -----  ${values}`)
                return [{
                    ...values,
                    id: editRecord && editRecord.id ? editRecord.id : null,
                }];
            },
            successFn: function (data) {
                displayMessage(SUCCESS_MSG_TYPE, 'Target  Recorded Successfully!!');
                that.props.cancelFn();
                that.props.loaddata();
            },
            errorFn: function () {

            },
        };
        const defaultFields = [{key: 'date', value: filterStrings.date},
            {key: 'task', value: that.state.taskid ? that.state.taskid : null},{key:"created_by",value:this.props.user.id}];
        return (
            <Modal width={800} visible={open} footer={null} title="Add Score to Task" onCancel={this.props.cancelFn}  >
                <DailyTargetEditForm fields={fields} formProp={formProp} defaultValues={defaultFields}/>
                
                {this.props.cancelFn ? <Button onClick={this.props.cancelFn}>Cancel</Button> : null}
            </Modal>
        )
    }
}
