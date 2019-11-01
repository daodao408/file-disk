<template>
  <div class="cd-layer">
    <el-form :model="ruleForm" ref="ruleForm" :rules="rules" class="cd-el-form" label-width="110px">
      <el-form-item label="文件库名称:" prop="name">
        <el-input v-model="ruleForm.name" auto-complete="off" :placeholder="['请输入文件库名称']"></el-input>
      </el-form-item>
      <el-form-item label="加密" prop="delivery">
        <el-switch v-model="ruleForm.delivery"></el-switch>
      </el-form-item>
      <el-form-item v-if="ruleForm.delivery" label="密码:" prop="password">
        <el-input type="password" :placeholder="['请输入密码']" v-model="ruleForm.password" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item v-if="ruleForm.delivery" label="确认密码:" prop="confirmpassword">
        <el-input type="password" :placeholder="['请再次输入密码']" v-model="ruleForm.confirmpassword" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item class="cd-sure-btn">
        <el-button size="mini" class="btn" @click="closelayer()">取消</el-button>
        <el-button class="ml20" type="primary" size="mini" @click="submitForm('ruleForm')" :loading="loading">确定</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import base64 from '../utils/base64';
export default {
  props: ['groupid'],
  components: {},
  data() {
    var validateConfirmPwd = (rule, value, callback) => {
      if (value.length == 0) {
        callback(new Error('请输入密码！'));
      } else if (value !== this.ruleForm.password) {
        callback(new Error('两次输入密码不一致！'));
      } else {
        callback();
      }
    };
    return {
      loading: false,
      ruleForm: {
        name: '',
        password: '',
        confirmpassword: '',
        base64Password: '',
        delivery: false
      },
      rules: {
        name: [
          {
            required: true,
            message:
              '文件库名称格式不正确，不能为空，只能输入数字、字母、中文和、[].-_()，长度在80个字符以内！',
            trigger: 'blur'
          },
          {
            pattern: /^(?=[\u4e00-\u9fa5a-zA-Z0-9\.\-\、\[\]\_\(\)]+[\u4e00-\u9fa5a-zA-Z0-9\.\-\、\[\]\s\_\(\)]+[\u4e00-\u9fa5a-zA-Z0-9\.\-\、\[\]\_\(\)]$).{1,80}$|^[\u4e00-\u9fa5a-zA-Z0-9\-\、\[\]\.\_\(\)]{1,80}$/,
            message:
              '文件库名称格式不正确，不能为空，只能输入数字、字母、中文和、[].-_()，长度在80个字符以内！'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入密码！',
            trigger: 'blur'
          },
          {
            min: 2,
            message: '密码至少需要2个字符',
            trigger: 'change'
          },
          {
            max: 20,
            message: '密码不能超过20个字符',
            trigger: 'change'
          }
        ],
        confirmpassword: [
          {
            validator: validateConfirmPwd,
            required: true,
            trigger: 'blur'
          },
          {
            min: 2,
            message: '确认密码至少需要2个字符',
            trigger: 'change'
          },
          {
            max: 20,
            message: '确认密码不能超过20个字符',
            trigger: 'change'
          }
        ]
      },
      psKey: 'cloudDisk'
    };
  },
  created() {
    this.setTitle();
  },
  destroyed() {
    this.$destroy();
  },
  watch: {},
  methods: {
    setTitle() {
      // this.loadobjList();
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.loading = true;
          if (!this.ruleForm.delivery) {
            this.ruleForm.password = '';
          } else {
            this.ruleForm.base64Password = base64.encode(
              this.psKey + this.ruleForm.password
            );
          }
          let url, data, method;
          if (this.groupid) {
            (url = '/api/group/creatShareResource'),
              (method = 'post'),
              (data = {
                name: this.ruleForm.name,
                password: this.ruleForm.base64Password,
                groupId: this.groupid
              });
          } else {
            (url = '/api/repos/insertRepo'),
              (method = 'put'),
              (data = {
                name: this.ruleForm.name,
                password: this.ruleForm.base64Password
              });
          }
          this.$axios({
            method: 'get',
            url: '/api/queryRePos/' + this.ruleForm.name
          }).then(res => {
            if (res.data.code == 200) {
              if (res.data.data == false) {
                //debugger
                this.$axios({
                  method: method,
                  url: url,
                  data: data
                })
                  .then(res => {
                    if (res.data.code == 200) {
                      this.loading = false;
                      this.$message({
                        message: res.data.message,
                        type: 'success'
                      });
                      this.$emit('close', {
                        index: 1,
                        dialog: 'isAddMyRepo'
                      });
                    }
                  })
                  .catch(error => {
                    if (error.data && error.data.message) {
                      this.loading = false;
                      this.$message({
                        type: 'warning',
                        message: error.data.message
                      });
                      this.$emit('close', {
                        index: 0,
                        dialog: 'isAddMyRepo'
                      });
                    }
                  });
              } else {
                this.loading = false;
                this.$message({
                  type: 'warning',
                  message: '文件库已经存在,无法重复创建'
                });
              }
            }
          });
        }
      });
    },
    closelayer() {
      this.$emit('close', {
        index: 0,
        dialog: 'isAddMyRepo'
      });
    }
  }
};
</script>
<style scoped lang="less">
.cd-sure-btn .btn {
  margin-left: 20px;
}
</style>
