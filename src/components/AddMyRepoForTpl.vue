<template>
  <div class="cd-layer">
    <el-form :model="ruleForm" ref="ruleForm" class="cd-el-form" label-width="110px">
      <el-form-item label="新建文件库：" prop="name" :rules="[
            {required: true, message: '文件库名称格式不正确，不能为空，只能输入数字、字母、中文和、[].-_()，长度在80个字符以内！', trigger: 'blur'},
            {pattern: /^(?=[\u4e00-\u9fa5a-zA-Z0-9\.\-\、\[\]\_\(\)]+[\u4e00-\u9fa5a-zA-Z0-9\.\-\、\[\]\s\_\(\)]+[\u4e00-\u9fa5a-zA-Z0-9\.\-\、\[\]\_\(\)]$).{1,80}$|^[\u4e00-\u9fa5a-zA-Z0-9\-\、\[\]\.\_\(\)]{1,80}$/, message: '文件库名称格式不正确，不能为空，只能输入数字、字母、中文和、[].-_()，长度在80个字符以内！'}
            ]">
        <el-input v-model="ruleForm.name" auto-complete="off"></el-input>
      </el-form-item>
      <!-- <el-form-item label="加密" prop="delivery"
        
        >
            <el-switch v-model="ruleForm.delivery"></el-switch>
        </el-form-item> -->
      <!-- <el-form-item v-if="ruleForm.delivery" label="密码：" 
            :rules="[
            {required: true, message: '密码不能为空', trigger: 'blur'},
            {min: 2, message: '密码至少需要2个字符', trigger: 'change'},
            {max: 20, message: '密码不能超过20个字符', trigger: 'change'}
            ]"
            prop="password">
            <el-input type="password" v-model="ruleForm.password"></el-input>
        </el-form-item> -->
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
  props: ['repoType', 'templateId'],
  components: {},
  data() {
    return {
      loading: false,
      ruleForm: {
        name: '',
        password: '',
        delivery: false
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
          // if (!this.ruleForm.delivery) {
          //   this.ruleForm.password = "";
          // }
          let url, data, method;
          url = '/api/template/repos';
          method = 'put';
          data = {
            name: this.ruleForm.name,
            type: this.repoType,
            tId: this.templateId
          };
          this.$axios({
            method: 'put',
            url: '/api/template/repos',
            data: {
              name: this.ruleForm.name,
              type: this.repoType,
              tId: this.templateId
            }
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
                  dialog: 'isAddMyRepoForTpl'
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
              }
            });
        }
      });
    },
    closelayer() {
      this.$emit('close', {
        index: 0,
        dialog: 'isAddMyRepoForTpl'
      });
    }
  }
};
</script>
<style scoped lang="less">
.cd-sure-btn .btn {
  margin-left: 20px;
}
.cd-sure-btn {
  margin-top: 40px;
}
</style>
