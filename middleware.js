var crypto = require('crypto-js');
module.exports = function (db) {
    return {
        requireAuthentication: function (req, res, next) {
            //get token from request
			var token = req.get('Auth') || '';
			//Find toke from token model
			db.Token.findOne({
				where: {
					tokenHash: crypto.MD5(token).toString()
				}
			}).then(function(tokenInstance){
				if(!tokenInstance){
					throw new Error();
				}
				//we have token active in DB
				req.token = tokenInstance;
				//find the user with this token
				return db.User.findByToken(token);
			}).then(function(user){
				req.user = user;
				next();
			}).catch(function(){
				res.status(401).json({
					success: false,
					msg: "User not authorized."
				});
			});
        }
    };
};