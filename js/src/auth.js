let AuthManager = (ref) => {

    let user = false;
    let listeners = {
        login: [],
        logout: []
    };

    let on = (which, cb) => {
        if ( ['login', 'logout'].indexOf(which) < 0 ) {
            throw new Error('AuthManager must listen for the "login" or "logout" event.');
        }
        listeners[which].push(cb);
    };

    let login = (obj) => {

        var success = obj.success,
            error = obj.error;
        
        ref.authWithOAuthPopup('google', (err, authData) => {
            if (err) {

                return error ? error(err) : null;
                
            } else {
                
                user = {
                    id: authData.auth.uid.replace('google:', ''),
                    name: authData.google.displayName,
                    photo: authData.google.profileImageURL
                };

                listeners.login.forEach(cb => {
                    cb(user);
                });

                return success ? success(user) : null;
            }
        });
    };

    let logout = () => {
        ref.unauth();

        listeners.logout.forEach(cb => {
            cb();
        });
    };

    let getUser = (key) => {
        if ( key && user[key] ) {
            return user[key];
        } else if ( key && !user[key] ) {
            console.warn('Could not find ' + key + ' on the user. Returning the entire user object instead.');
        }
        return user;
    };

    return {
        on,
        login,
        logout,
        getUser
    };
};

export default AuthManager;
