var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;
app.get('/', function(req, res){
	res.send('Todo api root!');
});

app.use(bodyParser.json());
//Get todos
app.get('/todos', function(req, res){
	var query = req.query;
	var where = {};
	if(query.hasOwnProperty('completed') && query.completed === 'true'){
		where.completed = true;
	}else if(query.hasOwnProperty('completed') && query.completed === 'false'){
		where.completed = false;
	}
	if(query.hasOwnProperty('q') && query.q.length > 0){
		where.description = {
			$like: '%' + query.q + '%'
		}
	}
	db.todo.findAll({
		where: where
	}).then(function(todos){
		var response = {
				success: true,
				data: todos,
				msg: "Todos found."
			}
			res.json(response);
	},function(e){
		var response = {
				status: 500,
				success: false,
				msg: "Something went wrong"
			}
		res.status(500).json(response);
	});
	
});
//get todo by id
app.get('/todo/:id', function(req, res){
	var todoId = parseInt(req.params.id, 10);
	db.todo.findById(todoId).then(function(todo){
		if(!!todo){
			var response = {
				success: true,
				data: todo.toJSON(),
				msg: "Todo found."
			}
			res.json(response);
		}else{
			var response = {
				status: 400,
				success: false,
				msg: "Todo not found with Todo Id: " + todoId
			}
		res.json(response);
		}
	},function(e){
		var response = {
				status: 500,
				success: false,
				msg: "Something went wrong"
			}
		res.status(500).json(response);
	});
});

//post a todo

app.post('/todos', function(req, res){
	var body = _.pick(req.body, 'description', 'completed');
	db.todo.create(body).then(function(todo){
		if(todo){
			var response = {
				success: true,
				data: todo.toJSON(),
				msg: "Todo created Successfully."
			}
			res.json(response);
		}else{
			var response = {
				status: 400,
				success: false,
				msg: "Something went wrong. Todo can not be created."
			}
		res.json(response);
		}
	},function(e){
		var response = {
				status: 400,
				success: false,
				msg: e.message
			}
		res.status(400).json(response);
	});	
});

//delete a todo
app.delete('/todo/:id', function(req, res){
	
	var todoId = parseInt(req.params.id, 10);
	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function(rowsDeleted){
		if(rowsDeleted === 0){
			var response = {
				status: 404,
				success: false,
				msg: 'No Todo found with ID:' + todoId
			}
			res.status(404).json(response);
		}else{
			var response = {
				status: 200,
				success: true,
				msg: 'Todo deleted with ID:' + todoId
			}
			res.status(200).json(response);
		}
	},function(e){
		var response = {
				status: 500,
				success: false,
				msg: e.message
			}
		res.status(500).json(response);
	});
	
});

//update a todo item
app.put('/todo/:id', function(req, res){
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};
	var todoId = parseInt(req.params.id, 10);
	
	if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
		attributes.completed = body.completed;
	}
	if(body.hasOwnProperty('description')){
		attributes.description = body.description;
	}
	db.todo.findById(todoId).then(function(todo){
		if(todo){
			todo.update(attributes).then(function(todo){
				var response = {
					status: 200,
					success: true,
					data: todo.toJSON(),
					msg: 'Todo Updated'
				}
				res.status(200).json(response);
			},function (e){
				res.status(404).send();
			});
		}else{
			res.status(404).send();
		}
	},function(e){
		res.status(500).send();
	});
});

//add user
app.post('/users', function(req, res){
	var body = _.pick(req.body, 'email', 'password');
	db.user.create(body).then(function(user){
		if(user){
			var response = {
				success: true,
				data: user.toPublicJSON(),
				msg: "User created Successfully."
			}
			res.json(response);
		}
	},function(e){
		var response = {
				status: 400,
				success: false,
				msg: e
			}
		res.status(400).json(response);
	});
});
//log user
app.post('/users/login',function(req, res){
	var body = _.pick(req.body, 'email', 'password');
    console.log(typeof db.user.authenticate);
    db.user.authenticate(body).then(function(user){
        res.json(user.toPublicJSON());
    },function(e){
        res.status(401).send();
    });

});
db.sequelize.sync().then(function(){
	app.listen(PORT, function(){
		console.log('App is listening on port: ' + PORT);
	})
});