var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [
	{
		id: 1, 
		description: "Watering the garden!",
		completed: false
	},
	{
		id: 2, 
		description: "Goto market!",
		completed: false
	}
];
app.get('/', function(req, res){
	res.send('Todo api root!');
});

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


app.listen(PORT, function(){
	console.log('App is listening on port: ' + PORT);
})