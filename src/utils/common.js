export default {
    getRandomString(prefix){
        prefix=prefix||''
        return prefix+Date.now()+Math.floor(Math.random () * 1000);
    },
    ajaxGet(url){
        //  Promise实现了 node.js的异步机制
        return new Promise(function(resolve, reject){
            let xml = new XMLHttpRequest();
            xml.open('GET',url,true);
            xml.onload = resolve;
            xml.onerror = reject;
            xml.send();
        } )
    },
    showMsg(){
        layui.layer.open({            
            type:2,
            shade:0,
            skin:'layui-layer-molv',
            anim: 4,
            offset:'rb',
            area: ['400px', '500px'],
            title:'我是谁？',
            content:'/static/msg.html'});
    }
}