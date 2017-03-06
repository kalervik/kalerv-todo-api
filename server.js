var express = require('express');
var app = express();
var bodyParser = require('body-parser');
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
	var id = parseInt(req.params.id, 10);
	var matchedTodo;
	todos.forEach(function(todo){
		if(id === todo.id){
			matchedTodo = todo;
		}
	});
	if(matchedTodo){
		res.json(matchedTodo);
	}else{
		res.json({
			status: 404,
			msg: "No todo found with Id: " + id
		});
	}
});

//post a todo

app.post('/todos', function(req, res){
	console.log(req.body);
	 var todo = {
		 id: todoNextId,
		 description: req.body.description,
		 completed: req.body.completed
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


app.listen(PORT, function(){
	console.log('App is listening on port: ' + PORT);
})