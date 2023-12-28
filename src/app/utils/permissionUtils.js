export const hideMobile = function (mobile) {
    const hideString = '*';
    if (mobile && mobile.length > 8) {
        return mobile.substring(0, 3) + hideString.repeat(mobile.length - 5) + mobile.substring(mobile.length - 2);
    }
    return mobile;
}
export const hideEmail = function (email) {
    const hideString = '*';
    if (email && email.length > 8) {
        return email.substring(0, 3) + hideString.repeat(email.length - email.indexOf('@') - 4) + email.substring(email.length - email.indexOf('@') - 4);
    }
    return email;
}
