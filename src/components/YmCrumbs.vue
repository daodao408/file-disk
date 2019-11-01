<template>
    <el-breadcrumb separator-class="el-icon-arrow-right">
       <el-breadcrumb-item  :to="{ path: '/admin/myFile?'+item.name}"  v-for="item in crumbs">{{item.name}}</el-breadcrumb-item>
    </el-breadcrumb>
</template>
<script>
    export default {
        props:['crumbs','text'],
        components:{

        },
        data(){
            return {
            }
        },
        created(){
        },
        watch:{
            '$route':function(){
                this.setTitle()
            },
            'crumbs':function(newVal,oldVal){
            }
        },
        mounted(){
             this.setTitle()
        },
        methods:{   
            setTitle(){
            },
            changeCrumbs(item){
               console.log(item);
            }
        }
    }
</script>
<style>

</style>
