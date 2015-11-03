//引入程序包	
var express = require('express')
  , path = require('path')
  , db= require('mysql')
  , parseurl = require('parseurl')
  , session = require('express-session')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);
var port = process.env.PORT || 3000;
var sessionid=null;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

/************添加session支持**************************/
 app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000*3600 }
}));
app.use(function(req, res, next) {
   var views = req.session.views
  if (!views) {
    views = req.session.views = {}
  }
  // get the url pathname 
  var pathname = parseurl(req).pathname
  // count the views 
  views[pathname] = (views[pathname] || 0) + 1
  next()
});
 
 
 /************输出页面**************************/
//app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
// 指定webscoket的客户端的html文件
app.get('/', function(req, res,next){

//每次刷新请求会自己生成一个新的session,如果不加下面代码并不会生成一个新的session
req.session.regenerate(function(err) {
  sessionid=req.sessionID;
});
  
  console.log(sessionid);
  res.sendFile( __dirname + '/views/chat.html');
});

//数据库连接
//var conn = db.createConnection({
//  host     : 'localhost',
//  user     : 'root',
//  password : 'adminrootkl',
//  database : 'ainiku'
//});
//conn.connect();
//conn.query('SELECT * from kl_picture limit 1', function(err, rows, fields) {
//  if (err) throw err;
//  console.log('The solution is: ', rows);
//});
//conn.end();


var numUsers = 0;
var clientLists=new Array();
//WebSocket连接监听
io.on('connection', function (socket) {
  //通知客户端已连接
  console.log(sessionid);
  socket.emit('open');
  ++numUsers;
  
  socket.broadcast.emit('usernum',numUsers+'个用户');
  socket.emit('usernum',numUsers+'个用户');

  // 构造客户端对象
  var client = {
    socket:socket,
	sessionid:sessionid,
    name:'',
    color:getColor()
  }
  clientLists.push(client);

 // console.log(socket);
  //设置用户名标识
  socket.on('setusername',function(username){
	   client.name=username;
	   console.log(username+'已连接');
	   console.log('连接数:'+numUsers);
	  //广播用户已经进来啦
	  var obj={
				time:getTime(),
				color:client.color,
				text:'欢迎\'  '+username+'  \'进入聊天室',
				username:client.name
				};
	  socket.broadcast.emit('message',obj);
	  socket.emit('message',obj);
	  });
  // 对message事件的监听
  socket.on('message', function(msg){
    var obj = {time:getTime(),color:client.color};
        obj['text']=msg;
        obj['username']=client.name;      
        // 向当前用户返回消息（可以省略）
        socket.emit('message',obj);
		//socket.emit('system',obj);
        // 广播向其他用户发消息
		//console.log(id);
        socket.broadcast.emit('message',obj);
    });

    //监听出退事件
    socket.on('disconnect', function () {  
      var obj = {
        time:getTime(),
        color:client.color,
        username:'系统消息',
        text:client.name+' 断开连接',
      };
      // 广播用户已退出
      socket.broadcast.emit('userleft',obj);
	  //广播用户数量
	  --numUsers;
	  socket.broadcast.emit('usernum',numUsers+'个用户');
      console.log(obj.text);
    });

});



var getTime=function(){
  var date = new Date();
  return date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
}

var getColor=function(){
  var colors = ['aliceblue','antiquewhite','aqua','aquamarine','pink','red','green',
                'orange','blue','blueviolet','brown','burlywood','cadetblue'];
  return colors[Math.round(Math.random() * 10000 % colors.length)];
}