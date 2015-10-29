
$(function () {
var content = $('#content');
var status = $('#status');
var input = $('#input');
var myName = '游客'+Math.floor(Math.random()*100);
var socket=null;
window.disconn=function(){
	socket.disconnect();
	socket=null;
	status.text('未连接');
	};
window.chatconn=function(){
		if(socket)return;
			//建立websocket连接对象
		socket = io.connect('http://localhost:3000',{'force new connection': true});				

		//收到server的连接确认
		socket.on('open',function(){
			status.text('连接成功,输入消息:');
			//设置用户名
			socket.emit('setusername',myName);
		});
	
		//监听system事件，判断welcome或者disconnect，打印系统消息信息
		socket.on('system',function(json){
			var p = '';
			if(myName==json.text) status.text(myName + ': ').css('color', json.color);
			p = '<p style="color:'+json.color+'">系统消息 @ '+ json.time+ ' : 欢迎 ' + json.text +'</p>';
			content.prepend(p);
		});
	   socket.on('userleft',function(json){
		p = '<p style="color:'+json.color+'">系统消息 @ '+ json.time+ ' : 拜拜 ' + json.text +'</p>';
		content.prepend(p);
		});
		//监听message事件，打印消息信息
		socket.on('message',function(json){
			var p = '<p><span style="color:'+json.color+';">' + json.username+'</span> @ '+ json.time+ ' : '+json.text+'</p>';
			content.prepend(p);
		});	
		
		socket.on('usernum',function(num){
			$('#numusers').html(num+'个');
		});	
	};
	//通过“回车”提交聊天信息
	input.keydown(function(e) {
		if (e.keyCode === 13) {
			if(!socket){
				alert('没有连接');
				return false;
				}
			var msg = $(this).val();
			if (!msg) return;
			socket.emit('message',msg);
			$(this).val('');
		}
	});
});