import moment from 'moment';
import { postOuterAPI } from '../../app/utils/common';
import CONFIG from '../../app.config';
import { loggedInUser } from '../../app/utils/auth';

export const logErrorToSlackChannel = function(error, errorInfo) {
    const crashData = {
        text: error.toString(),
        attachments: [
            {
                color: '#36a64f',
                author_name: window.location.hostname,
                author_link: 'http://flickr.com/bobby/',
                author_icon: `${window.location.hostname}/favicon.ico`,
                title: 'BK ERP Admin Application Crash Error',
                text: errorInfo.componentStack,
                fields: [
                    {
                        title: 'Priority',
                        value: 'High',
                        short: false,
                    },
                    {
                        title: 'Domain',
                        value: window.location.hostname,
                        short: false,
                    },
                    {
                        title: 'Path',
                        value: window.location.pathname,
                        short: false,
                    },
                    {
                        title: 'User',
                        value: loggedInUser(),
                        short: false,
                    },
                    {
                        title: 'Build Veriosn',
                        value: process.env.REACT_APP_VERSION,
                        short: false,
                    },
                ],
                ts: moment().format('X'),
            },
        ],
    };
    const successFn = function() {
        // eslint-disable-next-line
        console.log('The above error has been notified to devs.');
    };
    const errorFn = function() {
        // eslint-disable-next-line
        console.log('The above error notifications failed');
    };
    if (
        (CONFIG.prodDomain &&
            CONFIG.crashHandling.slack.sendOnProduction &&
            CONFIG.prodDomain.indexOf(window.location.hostname) > -1) ||
        CONFIG.crashHandling.slack.sendOnDevelopment
    ) {
        postOuterAPI(CONFIG.crashHandling.slack.webHookUrl, crashData, successFn, errorFn, {
            'Content-type': 'application/x-www-form-urlencoded',
        });
    }
};
