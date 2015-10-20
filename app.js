//引入程序包
var express = require('express')
  , path = require('path')
  , db= require('mysql')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);


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

//设置日志级别
io.set('log level', 1); 

var numUsers = 0;
//WebSocket连接监听
io.on('connection', function (socket) {
  //console.log(socket);
  //通知客户端已连接
  socket.emit('open');
  ++numUsers;
  socket.broadcast.emit('usernum',numUsers+'个用户');
  socket.emit('usernum',numUsers+'个用户');
 
  
  // 打印握手信息
  // console.log(socket.handshake);

  // 构造客户端对象
  var client = {
    socket:socket,
    name:'',
    color:getColor()
  }
  //设置用户名标识
  socket.on('setusername',function(msg){
	   client.name=msg;
	   console.log(msg+'已连接');
	   console.log('连接数:'+numUsers);
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
        socket.broadcast.emit('message',obj);
    });

    //监听出退事件
    socket.on('disconnect', function () {  
      var obj = {
        time:getTime(),
        color:client.color,
        username:'系统消息',
        text:client.name+'断开连接',
      };
      // 广播用户已退出
      socket.broadcast.emit('userleft',obj);
	  //广播用户数量
	  --numUsers;
	  socket.broadcast.emit('usernum',numUsers+'个用户');
      console.log(obj.text);
    });

});


//express基本配置
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});


app.configure('development', function(){
  app.use(express.errorHandler());
});

// 指定webscoket的客户端的html文件
app.get('/', function(req, res){
  res.sendfile('views/chat.html');
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
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