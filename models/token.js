var crypto = require('crypto-js');
module.exports = function(sequelize, DataTypes){
	var Token = sequelize.define('token',{
		token:{
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validation:{
				len: [1]
			},
			//hash the data
			set: function(value){
				var hash = crypto.MD5(value).toString();
				this.setDataValue('token', value);
				this.setDataValue('tokenHash', hash);
			}
		},
		tokenHash: DataTypes.STRING
	});
	
	return Token;
}