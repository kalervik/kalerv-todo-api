var bcrypt = require('bcrypt');
var _ = require('underscore');
var crypto = require('crypto-js');
var jwt = require('jsonwebtoken');
module.exports = function(sequelize, DataTypes){
	var user = sequelize.define('user',{
		email:{
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate:{
				isEmail: true
			}
		},
		salt:{
			type: DataTypes.STRING
		},
		passwordHash:{
			type: DataTypes.STRING	
		},
		password:{
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validate:{
				len: [7,100]
			},
			set: function(value){
				var salt = bcrypt.genSaltSync(10);
				var hashedPassword = bcrypt.hashSync(value, salt);
				this.setDataValue('password', value);
				this.setDataValue('salt', salt);
				this.setDataValue('passwordHash', hashedPassword);
			}
		}
	},{
        //this function will run before sending user data to DB
		hooks:{
			beforeValidate: function(user, options){
				//user email
				if(typeof user.email === 'string'){
					user.email = user.email.toLowerCase();
				}
			}
		},
        classMethods:{
          authenticate: function(body){
              return new Promise(function(resolve, reject){
                if(typeof body.email !== 'string' || typeof body.password !== 'string'){
                    return reject();
                }
                user.findOne({
                    where: {email: body.email}
                }).then(function(user){
                    if(!user || !bcrypt.compareSync(body.password, user.get('passwordHash'))){
                        return reject();
                    }
                    resolve(user);
                },function(e){
                    return reject();
                }); 
              });
          }  
        },
		instanceMethods: {
			toPublicJSON : function(){
				var json = this.toJSON();
				return _.pick(json, 'id','email', 'createdAt', 'updatedAt');
			},
            generateToken: function(type){
                if(!_.isString(type)){
                    return undefined;
                }
                try{
                    //generate token and encrypt user data
                    var stringData = JSON.stringify({id: this.get('id'), type: type});
                    var encyptedData = crypto.AES.encrypt(stringData, 'abc123!@#').toString();
                    var token = jwt.sign({
                        token: encyptedData
                    }, 'qwerty098');
                    return token;
                }catch(e){
                    return undefined;
                }
            }
		}
	});
    return user;
} 