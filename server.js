var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;
app.get('/', function(req, res){
	res.send('Todo api root!');
});

app.use(bodyParser.json());
//Get todos
app.get('/todos', function(req, res){
	var queryParams = req.query;
	var filteredTodos = todos;
	if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true'){
		filteredTodos = _.where(todos, {completed: true})
	}else if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'false'){
		filteredTodos = _.where(todos, {completed: false})
	}
	if(queryParams.hasOwnProperty('q') && queryParams.q.length > 0){
		 filteredTodos = _.filter(filteredTodos, function(todo){
			return todo.description.toLowerCase().indexOf(queryParams.q) > -1;
		});
	}
	res.json(filteredTodos);
	
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
				msg: "TSomething went wrong"
			}
		res.json(response);
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
		res.json(response);
	});	
});

//delete a todod
app.delete('/todo/:id', function(req, res){
	
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos,{id: todoId} );
	if(!matchedTodo){
		res.status(400).json({"error": "No TODO item found with id " + todoId});
	}else{
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	}
	
});

//update a todo item
app.put('/todo/:id', function(req, res){
	var body = _.pick(req.body, 'description', 'completed');
	var validAttribute = {};
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});
	
	if(!matchedTodo){
		res.status(404).json({"error": "No TODO item found with id " + todoId});
	}
	if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
		validAttribute.completed = body.completed;
	}else if(body.hasOwnProperty('completed')){
		return res.status(400).send();
	}
	if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0){
		validAttribute.description = body.description;
	}else if(body.hasOwnProperty('description')){
		return res.status(400).send();
	}
	_.extend(matchedTodo, validAttribute);
	res.json(matchedTodo);
});
db.sequelize.sync().then(function(){
	app.listen(PORT, function(){
		console.log('App is listening on port: ' + PORT);
	})
});