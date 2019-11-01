<template>
  <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="80px">
    <el-form-item label="旧密码" prop="password">
      <el-input type="password" :placeholder="['请输入旧密码']" v-model="ruleForm.password" auto-complete="off"></el-input>
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword1">
      <el-input type="password" :placeholder="['请输入新密码']" v-model="ruleForm.newPassword1" auto-complete="off"></el-input>
    </el-form-item>
    <el-form-item label="确认密码" prop="newPassword2">
      <el-input type="password" :placeholder="['请再次输入密码']" v-model="ruleForm.newPassword2" auto-complete="off"></el-input>
    </el-form-item>
    <el-form-item class="cd-sure-btn t-c">
      <el-button class="btn" style="margin-left:-80px;" size="mini" @click="closelayer()">取消</el-button>
      <el-button class="ml20" type="primary" size="mini" @click="modifyPassword(ruleForm)">确定</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
import base64 from '../utils/base64';
export default {
  components: {},
  data() {
    var newPassword1 = (rule, value, callback) => {
      if (value.length == 0) {
        callback(new Error('请输入密码！'));
      } else if (value == this.ruleForm.password) {
        callback(new Error('新密码不能和旧密码一样!'));
      } else {
        callback();
      }
    };
    var newPassword2 = (rule, value, callback) => {
      if (value.length == 0) {
        callback(new Error('请输入密码！'));
      } else if (value !== this.ruleForm.newPassword1) {
        callback(new Error('两次输入密码不一致！'));
      } else {
        callback();
      }
    };
    return {
      ruleForm: {
        password: '',
        newPassword1: '',
        newPassword2: '',
        email: ''
      },
      rules: {
        password: [
          {
            required: true,
            message: '请输入密码！',
            trigger: 'blur'
          },
          {
            min: 5,
            message: '密码至少需要5个字符',
            trigger: 'blur'
          }
        ],
        newPassword1: [
          {
            validator: newPassword1,
            required: true,
            trigger: 'blur'
          },
          {
            min: 5,
            message: '密码至少需要5个字符',
            trigger: 'blur'
          }
        ],
        newPassword2: [
          {
            validator: newPassword2,
            required: true,
            trigger: 'blur'
          },
          {
            min: 5,
            message: '密码至少需要5个字符',
            trigger: 'blur'
          }
        ]
      },
      psKey: 'cloudDisk'
    };
  },
  created() {
    let user = sessionStorage.user;
    user = JSON.parse(user);
    this.ruleForm.email = user.email;
  },
  watch: {
    $route: function() {}
  },
  methods: {
    modifyPassword(ruleForm) {
      let self = this;
      let data = {
        email: this.ruleForm.email
      };
      data.newPassword1 = base64.encode(
        this.psKey + this.ruleForm.newPassword1
      );
      data.newPassword2 = base64.encode(
        this.psKey + this.ruleForm.newPassword2
      );
      data.password = base64.encode(this.psKey + this.ruleForm.password);
      self.$refs.ruleForm.validate(valid => {
        if (valid) {
          self
            .$axios({
              method: 'post',
              url: '/api/user/updatePassword',
              data: data
            })
            .then(res => {
              if (res.data.code == 200) {
                self.$message({
                  message: res.data.message,
                  type: 'success'
                });
                self.$emit('close', {
                  index: 1,
                  dialog: 'isPassword'
                });
              }
            })
            .catch(error => {
              if (error.data && error.data.message) {
                self.$message.error(error.data.message);
              }
            });
        } else {
          return false;
        }
      });
    },
    closelayer() {
      this.$emit('close', {
        index: 0,
        dialog: 'isPassword'
      });
    }
  }
};
</script>
<style scoped lang="less">
.lh36 {
  line-height: 36px;
}

.userImage {
  text-align: center;
  padding: 20px;
  background: #f0f0f0;
  img {
    border-radius: 50%;
  }
}

.cd-sure-btn {
  .btn {
    margin-left: 40px;
  }
}
</style>
