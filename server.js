var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var _ = require('underscore');
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;
app.get('/', function(req, res){
	res.send('Todo api root!');
});

app.use(bodyParser.json());
//Get todos
app.get('/todos', function(req, res){
	res.json(todos);
});
//get todo by id
app.get('/todo/:id', function(req, res){
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos,{id: todoId} );
	if(matchedTodo){
		res.json(matchedTodo);
	}else{
		var response = {
						status: 404,
						msg: "No todo found with Id: " + id
					};
		res.json(response);
	}
});

//post a todo

app.post('/todos', function(req, res){
	var pickedFields = _.pick(req.body, 'description', 'completed');
	var description =  pickedFields.description.trim();
	var completed = pickedFields.completed;
	if(!_.isBoolean(completed) || !_.isString(description) || description.trim() < 1 ){
		return res.status(400).send();
	}
	 var todo = {
		 id: todoNextId,
		 description: description,
		 completed: completed
	 }
	todos.push(todo);
	todoNextId++;
	var response = {
		status: 200,
		data: todo,
		success: true
	}
	res.json(response);
	
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
})
app.listen(PORT, function(){
	console.log('App is listening on port: ' + PORT);
})