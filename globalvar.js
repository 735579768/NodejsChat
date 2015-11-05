global.sessionid=null;
global.debug=function(obj){
	console.log("--------------------------------------------------------------")
	console.log(obj);
	 //io.sockets.emit('debug',obj);
	};
global.getMessage=function(client,msg){
    var obj = {
		sid:client.socket.id,
		time:getTime(),
		color:client.color,
		text:msg,
		username:client.name
		};
		return obj;	
	};
global.getTime=function(){
  var date = new Date();
  return date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
}

global.getColor=function(){
  return '#666;';
}