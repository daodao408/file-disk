<template>
  <div class="uploader-list">
     <el-scrollbar>
      <slot :file-list="fileList">
        <ul class="uploader-list-scrollbar">
          <li v-for="file in fileList" :key="file.id">
            <uploader-file :file="file" :list="true"></uploader-file>
          </li>
        </ul>
      </slot>
     </el-scrollbar>
  </div>
</template>

<script>
  import UploaderFile from './file.vue'

  const COMPONENT_NAME = 'uploader-list'

  export default {
    props:['title','fileLists'],
    name: COMPONENT_NAME,
    computed: {
      fileList () {
        return this.fileLists
      }
    },
    components: {
      UploaderFile
    }
  }
</script>

<style>
  .yofc-upload-list .el-dialog__body{
     padding: 0!important; 
  }
  .uploader-list {
    position: relative;
  }
  .uploader-list > ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .uploader-list-scrollbar{
    max-height: 300px!important;
  }
</style>
