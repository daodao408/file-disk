<template>
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="96px">
        <el-form-item label="文件库密码" prop="password">
            <el-input type="password" auto-complete="new-password" :placeholder="['请输入文件库密码']" v-model="ruleForm.password"></el-input>
        </el-form-item>
        
        <el-form-item class="cd-sure-btn">
            <el-button class="btn" size="mini" @click="closelayer()">取消</el-button>
            <el-button class="ml20" type="primary" size="mini" @click="modifyPassword(ruleForm)" :loading="loading">确定</el-button>
        </el-form-item>
    </el-form>
</template>
<script>
import base64 from '../utils/base64';
export default {
  props: ['repoId', 'decipheringObj'],
  components: {},
  data() {
    var passwordValidate = (rule, value, callback) => {
      var passwordRegex = /^.{1,20}$/;
      if (value.length === 0) {
        callback(new Error('请输入文件库密码！'));
      } else if (!passwordRegex.test(value)) {
        callback(new Error('密码格式不正确！'));
      } else {
        callback();
      }
    };
    return {
      ruleForm: {
        id: '',
        password: ''
      },
      loading: false,
      rules: {
        password: [
          { required: true, message: '请输入文件库密码！', trigger: 'blur' },
          { min: 2, message: '密码至少需要2个字符', trigger: 'blur' },
          { validator: passwordValidate, trigger: 'blur' }
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
      let tempPassword;
      self.$refs.ruleForm.validate(valid => {
        if (valid && self.ruleForm.password) {
          tempPassword = base64.encode(self.psKey + self.ruleForm.password);
          this.loading = true;
          self
            .$axios({
              method: 'post',
              url: `/api/repos/password`,
              data: {
                password: tempPassword,
                id: this.repoId
              }
            })
            .then(res => {
              if (res.data.code == 200) {
                this.loading = false;
                this.$message({
                  type: 'success',
                  message: `解密成功`
                });
                self.$emit('close', {
                  index: 2,
                  decipheringObj: this.decipheringObj,
                  dialog: 'isDecipheringPassword'
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
        dialog: 'isDecipheringPassword'
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
