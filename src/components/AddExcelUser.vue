<template>
    <el-container>
        <el-form  class="cd-el-form add-excel-user-form">
        <el-form-item>
            <el-upload
              class="upload-demo"
              action="/api/user/addExcelUser"
              :before-upload="beforeUpload"
              :on-success="fileSuccess"
              :on-error="fileError"
              :show-file-list=false
              :limit="1">
              <el-button  type="text" size="mini">
                <i class="iconfont">&#xe685;</i>
                <span class="excel-user-text">已有导入模板<br>点击立即上传</span>
              </el-button>
            </el-upload>
            <el-button type="text" size="mini" @click="download()">
              <i class="iconfont">&#xe687;</i>
              <span class="excel-user-text">没有导入模板<br>点击下载模板</span>
            </el-button>
            
        </el-form-item>
        </el-form>
    </el-container>
</template>
<script>
export default {
  components: {},
  data() {
    return {
      loading: false
    };
  },
  methods: {
    download() {
      this.loading = true;
      this.$axios({
        method: 'get',
        url: '/api/user/exportExcelTemplet'
      })
        .then(res => {
          if (res.data.code == 200) {
            this.loading = false;
            this.$message({
              type: 'success',
              message: res.data.message
            });
            window.location = res.data.data;
          }
        })
        .catch(error => {
          if (error.data && error.data.message) {
            this.isLoading = false;
            this.$message({
              type: 'warning',
              message: error.data.message
            });
          }
        });
    },
    beforeUpload(file) {
      let fileSuffix = file.name.substring(file.name.lastIndexOf('.') + 1);
      const isExcel = fileSuffix === 'xls' || fileSuffix === 'xlsx';
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isExcel) {
        this.$message.error('导入用户请上传xls或者xlsx文件！');
      }
      if (!isLt2M) {
        this.$message.error('导入用户大小不能超过 2MB！');
      }
      if (isExcel && isLt2M) {
        this.loading = true;
      }
      return isExcel && isLt2M;
    },
    fileSuccess(res, file) {
      this.loading = false;
      if (res.data.length == 3) {
        this.$message({
          type: 'success',
          message: `${res.data[0]},${res.data[1]}`
        });
        window.location = res.data[2];
        this.$emit('close', {
          index: 0,
          dialog: 'isAddExcelUser'
        });
      } else {
        this.$message({
          type: 'success',
          message: res.data[0]
        });
        this.$emit('close', {
          index: 1,
          dialog: 'isAddExcelUser'
        });
      }
    },
    fileError(error) {
      this.loading = false;
      let a = JSON.parse(error.message);
      if (a.code === 401) {
        this.$router.push({ path: '/login' });
      }
      this.$message({
        type: 'warning',
        message: a.message
      });
    },
    closelayer() {
      this.$emit('close', {
        index: 0,
        dialog: 'isAddExcelUser'
      });
    }
  }
};
</script>
<style scoped lang="less">
.add-excel-user {
  .add-excel-user-form {
    width: 100%;
    text-align: center;
    .el-button {
      padding: 0;
      width: 160px;
      height: 160px;
      border: 1px solid #ddd;
      -webkit-border-radius: 0;
      -moz-border-radius: 0;
      border-radius: 0;
      white-space: normal;
      margin-top: 20px;
      margin-bottom: 15px;
      &:focus {
        border: 1px solid #42a0f8;
        span {
          line-height: normal;
          height: auto;
          &.excel-user-text {
            color: #42a0f8;
          }
        }
      }
      &:hover {
        border: 1px solid #42a0f8;
        span {
          line-height: normal;
          height: auto;
          &.excel-user-text {
            color: #42a0f8;
          }
        }
      }
      i {
        &.iconfont {
          display: inline-block;
          font-size: 40px;
          width: 100%;
        }
      }
      span {
        line-height: normal;
        height: auto;
        &.excel-user-text {
          display: inline-block;
          width: 100%;
          margin-top: 20px;
          color: #666;
        }
      }
    }
  }
}
.upload-demo {
  display: inline-block;
  vertical-align: top;
  margin-right: 40px;
}
</style>
