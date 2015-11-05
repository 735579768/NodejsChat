var debug=function(obj){
	console.log("--------------------------------------------------------------")
	console.log(obj);
	 //io.sockets.emit('debug',obj);
	};
var sockets={
	run:function(io){
		var numUsers = 0;
		var clientLists=new Array();
		//WebSocket连接监听
		io.on('connection', function (socket) {
		  //默认进入同一个房间
		  socket.leave(socket.id);
		  socket.join('default');
		  //添加入聊天室
		  debug('socket.id:'+socket.id);
		  debug('socket.rooms:'+socket.rooms);
		  debug('socket.sessionid:'+sessionid);
		  //通知客户端已连接
		  
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
		
		 //加入房间;
		   socket.on('join room',function(roomid){
			//保证自己只在一个房间
			var isjoin=true;
			for(var a in socket.rooms){
				var roomname=socket.rooms[a];
				if(roomname==roomid){
					isjoin=false;
					}else{
					 io.sockets.to(roomname).emit('message',getMessage(client,'离开房间'));
					socket.leave(roomname);
					}	
				}
			if(isjoin){
				socket.join(roomid);
				//对当前房间进行回复
				io.sockets.in(roomid).emit('message',getMessage(client,client.name+'进入'+roomid+'号房间'));
			}else{
				socket.emit('message',getMessage(client,'您已经在房间内!'));
				}
		   });
		   
		  //设置用户名标识
		  socket.on('setusername',function(username){
			   client.name=username;
			   console.log(username+'已连接');
			   console.log('连接数:'+numUsers);
			  
			  io.sockets.emit('message',getMessage(client,'欢迎\'  '+username+'  \'进入聊天室'));
			  //广播用户已经进来啦
			  //socket.broadcast.emit('message',getMessage(client,'欢迎\'  '+username+'  \'进入聊天室'));
			  //socket.emit('message',obj);
			  });
		  // 对message事件的监听
		  socket.on('message', function(msg){
				//取当前实例所在房间
				for(var a in socket.rooms){
				 io.sockets.to(socket.rooms[a]).emit('message',getMessage(client,msg));
				}
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
		
			socket.on('error', function (err) { 	
				console.error(err.stack); // TODO, cleanup 
			});
		
		});		
		}
	};
module.exports=sockets;