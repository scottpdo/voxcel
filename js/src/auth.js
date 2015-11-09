module.exports = function AuthManager(ref) {

    var user = false;

    function login(obj) {
        var success = obj.success,
            error = obj.error;
        ref.authWithOAuthPopup('google', function(err, authData) {
            if (err) {
                return error(err);
            } else {
                user = {
                    id: authData.auth.uid.replace('google:', ''),
                    name: authData.google.displayName,
                    photo: authData.google.profileImageURL
                };
                return success(user);
            }
        });
    }

    function getUser(key) {
        if ( key && user[key] ) {
            return user[key];
        } else if ( key && !user[key] ) {
            console.warn('Could not find ' + key + ' on the user. Returning the entire user object instead.');
        }
        return user;
    }

    return {
        login: login,
        getUser: getUser
    };
}
