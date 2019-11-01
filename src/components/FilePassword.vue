<template>
  <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="80px">
    <el-form-item label="旧密码" prop="password">
      <el-input type="password" :placeholder="['请输入旧密码']" v-model="ruleForm.password" auto-complete="off"></el-input>
    </el-form-item>
    <el-form-item label="新密码" prop="password1">
      <el-input type="password" :placeholder="['请输入新密码']" v-model="ruleForm.password1" auto-complete="off"></el-input>
    </el-form-item>
    <el-form-item label="确认密码" prop="password2">
      <el-input type="password" :placeholder="['请再次输入密码']" v-model="ruleForm.password2" auto-complete="off"></el-input>
    </el-form-item>
    <el-form-item class="cd-sure-btn t-c">
      <el-button class="btn" size="mini" style="margin-left:-80px;" @click="closelayer()">取消</el-button>
      <el-button class="ml20" type="primary" size="mini" @click="modifyPassword(ruleForm)" :loading="loading">确定</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
import base64 from '../utils/base64';
export default {
  props: ['repoId'],
  components: {},
  data() {
    var password1 = (rule, value, callback) => {
      if (value.length == 0) {
        callback(new Error('请输入密码！'));
      } else if (value == this.ruleForm.password) {
        callback(new Error('新密码不能和旧密码一样!'));
      } else {
        callback();
      }
    };
    var password2 = (rule, value, callback) => {
      if (value.length == 0) {
        callback(new Error('请输入密码！'));
      } else if (value !== this.ruleForm.password1) {
        callback(new Error('两次输入密码不一致！'));
      } else {
        callback();
      }
    };
    return {
      ruleForm: {
        id: '',
        password: '',
        password1: '',
        password2: ''
      },
      loading: false,
      rules: {
        password: [
          {
            required: true,
            message: '请输入密码！',
            trigger: 'blur'
          },
          {
            min: 2,
            message: '密码至少需要2个字符',
            trigger: 'blur'
          }
        ],
        password1: [
          {
            validator: password1,
            required: true,
            trigger: 'blur'
          },
          {
            min: 2,
            message: '密码至少需要2个字符',
            trigger: 'blur'
          }
        ],
        password2: [
          {
            validator: password2,
            required: true,
            trigger: 'blur'
          },
          {
            min: 2,
            message: '密码至少需要2个字符',
            trigger: 'blur'
          }
        ]
      },
      psKey: 'cloudDisk'
    };
  },
  created() {},
  watch: {
    $route: function() {}
  },
  methods: {
    modifyPassword(ruleForm) {
      let self = this;
      self.$refs.ruleForm.validate(valid => {
        if (valid) {
          //debugger;
          this.loading = true;
          let data = {};
          data.id = self.repoId;
          data.password = base64.encode(self.psKey + self.ruleForm.password);
          data.password1 = base64.encode(self.psKey + self.ruleForm.password1);
          data.password2 = base64.encode(self.psKey + self.ruleForm.password2);
          self
            .$axios({
              method: 'post',
              url: '/api/repos/changePassword',
              data: data
            })
            .then(res => {
              if (res.data.code == 200) {
                this.loading = false;
                self.$message({
                  message: res.data.message,
                  type: 'success'
                });
                self.$emit('close', {
                  index: 1,
                  dialog: 'isFilePassword'
                });
              }
            })
            .catch(error => {
              if (error.data && error.data.message) {
                this.loading = false;
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
        dialog: 'isFilePassword'
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
