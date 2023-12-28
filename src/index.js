import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { Spin } from "antd";
import * as serviceWorker from "./serviceWorker";
import "./app/assets/custom.css";
import { Route, Switch } from "react-router";


const MeetingWrapper = React.lazy(() => import("./app/components/conference/meetingWrapper/MeetingWrapper"));

const App = React.lazy(() => import("./App"));
if (process.env.REACT_APP_PROD_DESIGN)
    require("./app/assets/theme.less");
else
    require("antd/dist/antd.min.css");


ReactDOM.render(
    <Router>
        <GoogleReCaptchaProvider
            reCaptchaKey="6LdU7PQUAAAAAEXG4_pNtgUFV510vUr_tw-ilk2R"
        >
            <Switch>
                {/* <Route exact path={"/meeting/:meetingId"} render={(route) => <Suspense fallback={(
                    <Spin size="large">
                        <div style={{ width: "100vw", height: "100vh" }}/>
                    </Spin>
                )}
                >
                    <MeetingWrapper {...route}/>
                </Suspense>}>
                </Route> */}
                <Route render={() => <Suspense fallback={(
                    <Spin size="large">
                        <div style={{ width: "100vw", height: "100vh" }}/>
                    </Spin>
                )}
                >
                    <App/>
                </Suspense>}>
                </Route>


                
            </Switch>

        </GoogleReCaptchaProvider>
    </Router>,
    document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
