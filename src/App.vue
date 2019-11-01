<template>
    <router-view v-if="isRouterAlive"></router-view>
</template>
<script>
export default {
    components:{
    },
    provide() {
      return {
           reload:this.reload
      }
    },
    data (){
      return {
          isRouterAlive:true
      }
    },
    methods:{
        reload() {
          this.isRouterAlive = false;
          this.$nextTick(function(){
            this.isRouterAlive = true;
          })
        }
    },
    created(){
      // console.log('app初始化')
      
    }
}
</script>