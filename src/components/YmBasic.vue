<template>
  <div id="cdBasis">
    <div class="userImage">
      <div class="user-size">
        <img :src="imgUrl" alt="">
      </div>
      <el-upload class="upload-demo" action="/api/user/photoUpload" :before-upload="beforeUpload" :on-error="imgUploadError" :on-success="imgUploadSuccess"
        :show-file-list="false">
        <el-button size="small" type="text">更换头像</el-button>
      </el-upload>
    </div>
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" class="cd-form">
      <el-form-item class="cd-user-name" label="姓名：" prop="userName">
        <div class="clearfix">
          <div class="pull-left" style="width:70%">
            <el-input v-model="ruleForm.userName" :class="{'isEdit':isEdit}" :disabled="isEdit" auto-complete="off"></el-input>
          </div>
          <div class="pull-right lh36 ml20">
            <el-button size="small" class="iconfont fz20 name-edit-btn" type="text" @click="editUserName()">&#xe67d;</el-button>
            <!-- <span class="iconfont fz20 cs-p c-h" @click="editUserName()">&#xe6a0;</span> -->
          </div>
        </div>
      </el-form-item>
      <el-form-item class="cd-user-name" label="账号：">
        {{anotherName}}
      </el-form-item>
      <el-form-item class="cd-user-name" label="部门：">
        {{departmentName}}
      </el-form-item>
      <el-form-item class="cd-user-name" label="邮箱：">
        {{email=="admin@seafile.local"?"admin@wh.hb.pro":email}}
      </el-form-item>
      <el-form-item class="t-c">
        <el-button type="primary" class="people-confirm-btn" size="big" @click="submitForm('ruleForm')" :loading="loading">确定</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import config from '../config';
export default {
  components: {},
  data() {
    return {
      imgUrl: '',
      keyValue: '',
      repoId: '',
      type: '',
      path: '',
      userName: '',
      anotherName: '',
      email: '',
      departmentName: '',
      isEdit: true,
      ruleForm: {
        userName: ''
      },
      rules: {
        userName: [
          {
            required: true,
            message: '请输入姓名',
            trigger: 'blur'
          },
          {
            max: 20,
            message: '姓名最多20个字符',
            trigger: 'blur'
          }
        ]
      }
    };
  },
  created() {
    this.getInformation();
    this.getImg();
  },
  watch: {},
  methods: {
    imgUploadSuccess() {
      this.$message.success('头像更换成功!');
      this.getImg();
    },
    imgUploadError() {
      this.$message.error('头像更换失败!');
    },
    beforeUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },
    editUserName() {
      this.isEdit = !this.isEdit;
    },
    submitForm(ruleForm) {
      this.$refs[ruleForm].validate(valid => {
        if (valid) {
          let selt = this;
          this.loading = true;
          selt
            .$axios({
              method: 'post',
              url: '/api/user/updateUser',
              data: {
                email: selt.email,
                nickname: selt.ruleForm.userName
              }
            })
            .then(res => {
              if (res.data.code == 200) {
                selt.loading = false;
                let user = sessionStorage.getItem('user');
                user = JSON.parse(user);
                user.nickname = selt.ruleForm.userName;
                sessionStorage.user = JSON.stringify(user);
                this.$message({
                  message: res.data.message,
                  type: 'success'
                });
                this.$emit('close', {
                  index: 0,
                  dialog: 'isBasic'
                });
              }
            })
            .catch(error => {
              if (error.data && error.data.message) {
                selt.loading = false;
                this.$message(error.data.message);
              }
            });
          return false;
        }
      });
    },
    getImg() {
      this.$axios({
        method: 'get',
        url: '/api/user/getUserPhoto'
      })
        .then(res => {
          if (res.data.code == 200) {
            this.imgUrl = res.data.data.url;
            this.$emit('senUrl', this.imgUrl);
          }
        })
        .catch(error => {
          if (error.data && error.data.message) {
            this.$message({
              type: 'warning',
              message: error.data.message
            });
          }
        });
      return false;
    },
    getInformation() {
      if(sessionStorage.getItem('token')){
        this.$axios({
          method: 'get',
          url: '/api/user/getUserMsg'
        })
        .then(res => {
          if (res.data.code == 200) {
            this.ruleForm.userName = res.data.data.nickname;
            this.departmentName = res.data.data.departmentName;
            this.email = res.data.data.email;
            this.anotherName = res.data.data.anotherName;
          }
        })
        .catch(error => {
          if (error.data && error.data.message) {
            this.$message({
              type: 'warning',
              message: error.data.message
            });
          }
        });
        return false;
      }      
    }
  }
};
</script>
<style lang="less">
.cd-user-layer {
  margin: 10px;
}

.layui-input {
  width: 200px;
  &.isEdit {
    border-color: #fff;
    &:hover,
    &:focus,
    &:active {
      border-color: #fff !important;
    }
  }
}

// .layui-input-block {
//   margin-left: 80px;
// }

.layui-form-label {
  width: 50px;
}

.lh36 {
  line-height: 36px;
}

.userImage {
  text-align: center;
  padding: 25px 0;
  background: #f0f3f5;
  img {
    border-radius: 50%;
  }
  .upload-demo {
    .el-button--small {
      font-size: 14px;
    }
  }
}

.cd-user-name {
  // .layui-input-block {
  //   margin-left: 70px;
  // }
  .layui-form-label {
    padding-right: 0;
  }
}

.cd-form {
  //padding: 20px 10px 10px 50px;
  width: 100%;
  padding: 20px 20px 0 20px;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  // .btn {
  //   margin-left: 60px;
  // }
  // .el-button {
  //   margin-left: -130px;
  // }
  .el-form-item {
    margin-bottom: 8px;
    .el-form-item__label {
      width: 65px;
    }
    .el-form-item__content {
      margin-left: 0px;
      .el-button--text:hover {
        color: #66b1ff;
      }
      .people-confirm-btn {
        width: 100%;
        text-align: center;
        margin-bottom: 10px;
      }
    }
  }
}

.user-size {
  img {
    width: 60px;
    height: 60px;
  }
}
</style>
