<template>
        <div  class="ed-export cs-p">
              导入模板下载<a class="c-h" :herf="exportUrl">模板</a>
            <input  type="file" @change="importfxx(this)"  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
        </div>   
</template>
<script>
    export default {
        props:[],
        data(){
            return {

            }
        },
        methods:{
            importfxx(obj){

            }
        }
    }
</script>