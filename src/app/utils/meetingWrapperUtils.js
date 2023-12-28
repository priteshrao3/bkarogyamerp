import { getAPI } from "./common";
import { USER_DATA } from "../constants/api";

export const checkUserAuthorisation = function(that,successCallBack){
    that.setState({
        loadingAuthUser:true
    });
    let successFn = function (data){
        that.setState({
            loadingAuthUser:false,
            userAuthDetails:{...data.user,patient:data.patient} || null,
        });
        if(successCallBack)
            successCallBack();
    }
    let errorFn = function (){
        that.setState({
            loadingAuthUser:false,
        });
    }
    getAPI(USER_DATA,successFn,errorFn,{},{Authorization:`Token ${that.state.token}`})
}
