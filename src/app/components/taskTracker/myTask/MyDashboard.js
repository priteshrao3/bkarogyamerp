import React, { Component } from 'react'
import { Progress,Row, Col } from 'antd';
import {getAPI, interpolate} from "../../../utils/common";
import {TASK} from "../../../constants/api";
import CurrentTask from './CurrentTask';
import { result } from 'lodash';

export class MyDashboard extends Component {
  
    constructor(props) {
        super(props);
        this.state = {
            visibleCommentModal: false,
            numberoftask: 0,
            loading: false,
            pointdata: null,
            targetdata: null,
            currenttask:[]
            
        }
    }
    componentDidMount() {
        this.loadTask();
    }

    loadTask = (page = 1) => {
        const that = this;
        that.setState({
            loading: true
        })
        const successFn = function (data) {
            that.setState({
                currenttask: data.results,
                nextTaskPage: data.next,
                loading: false,
                numberoftask : data.count
            })
           
        }

        const errorFn = function (error) {
            that.setState({
                loading: false
            })

        }
        const params = {
            page,
            assignee: that.props.user.id,
            incomplete: true
        }
        getAPI(TASK, successFn, errorFn, params)
    }


    render() {
        const { currenttask,numberoftask } = this.state;
        console.log(this.state)
        let eftarget = 0 ;
        let retarget = 0;
        let resultpoint = 0;
        const totaleffertScore = currenttask.reduce((total, task) => {
            eftarget += task.effert_target
            return parseInt(total) + task.reccuringtarget_data.reduce((sum, recurringTarget) => {
              return sum + parseInt(recurringTarget.effert_score);
            }, 0);
          }, 0);
          const totalResultScore = currenttask.reduce((total, task) => {
            retarget  += task.result_target
            return  total + task.reccuringtarget_data.reduce((sum, recurringTarget) => {
              return sum + parseInt( recurringTarget.result_score);
            }, 0);
          }, 0);

          const totalefpoint = currenttask.reduce((total, task) => {
            let eftp = 0;
            if(task.point_data !== null){

                 eftp = task.point_data.reduce((curr, data)=>{
                 console.log(`${data.result_point} //// ${data.effert_point}`)
                 resultpoint = parseInt( resultpoint) + parseInt( data.result_point)
                 return  parseInt(curr) + parseInt(data.effert_point)
                } , 0 )
                
            } 
            console.log(eftp);
           return parseInt( total )+ parseInt( eftp);
        }, 0);
       
       
    return (
      <div>

        <Row>
        <Col span={6} style={{textAlign:'center'}}>
          <Row>
        <Progress type="circle" percent={numberoftask} format={percent => `${percent} Task`} />
            
            </Row> 
        <Row >
        <strong>
            Active Task
        </strong>
            </Row> 
        </Col>
        <Col span={6} style={{textAlign:'center'}}>
          <Row>
        <Progress type="circle" percent={((totaleffertScore/eftarget)*100).toFixed()} />
            {/* {totaleffertScore}{eftarget} */}
            </Row> 
        <Row >
        <strong>
           
            Overall Effert Score
        </strong>
            </Row> 
        </Col>
        <Col span={6} style={{textAlign:'center'}}>
          <Row>
        <Progress type="circle" percent={((totalResultScore/retarget)*100).toFixed()} strokeColor={'green'}  />
            
            </Row> 
        <Row >
        <strong>
            {/* {`${retarget}/ ${totalResultScore}`} */}
            Overall Result Score
        </strong>
            </Row> 
        </Col>


        <Col span={6}>
        
        
        </Col>

        <div style={{fontSize:30, fontWeight:'bold'}}>

             {`Effert Point:${totalefpoint}`}
        </div>
        <div style={{fontSize:30, fontWeight:'bold'}}>

            {`Result Point:${resultpoint}`}
            </div>

  
        </Row>

      </div>
    )
  }
}

export default MyDashboard