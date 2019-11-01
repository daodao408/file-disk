<template>
    <div class="switch-identity-container" v-loading="isLoading">
        <el-form :model="switchIdentityForm" ref="switchIdentityForm" class="cd-el-form" label-width="110px">
          <label class="clear-label">选择身份</label>
          <el-select style="width:100%; margin-top:10px;" v-model="switchIdentityForm.selectValue" placeholder="请选择需要切换的身份">
            <el-option
              v-for="item in switchIdentityForm.selectOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-form-item class="cd-sure-btn">
              <el-button size="mini" class="btn"  @click="closelayer()">取消</el-button>
              <el-button class="ml20" type="primary" size="mini" @click="submitForm('switchIdentityForm')" :loading="loading">确定</el-button>
          </el-form-item>
        </el-form>
    </div>
</template>
<script>
export default {
  props: ['email'],
  components: {},
  data() {
    return {
      loading: false,
      switchIdentityForm: {
        selectOptions: [
          {
            value: '0',
            label: '用户'
          },
          {
            value: '2',
            label: '部门管理员'
          },
          {
            value: '1',
            label: '管理员'
          }
        ],
        selectValue: '',
        selectLabel: ''
      },
      isLoading: false
    };
  },
  created() {},
  methods: {
    getSelctLabel(value) {
      let obj = {};
      for (let index in this.switchIdentityForm.selectOptions) {
        if (value === this.switchIdentityForm.selectOptions[index].value) {
          return this.switchIdentityForm.selectOptions[index].label;
        }
      }
    },
    submitForm(formName) {
      this.loading = true;
      if (this.switchIdentityForm.selectValue === '') {
        this.loading = false;
        this.$message({
          type: 'warning',
          message: '请选择需要切换的身份'
        });
      } else {
        let labelTxt = this.getSelctLabel(this.switchIdentityForm.selectValue);
        this.$confirm(`此操作将切换用户身份, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            let params = {
              roleCode: parseInt(this.switchIdentityForm.selectValue),
              email: this.email
            };
            this.isLoading = true;
            this.$axios({
              method: 'post',
              url: '/api/user/switchRole',
              data: params
            })
              .then(res => {
                if (res.data.code == 200) {
                  this.isLoading = false;
                  this.loading = false;
                  this.$message({
                    type: 'success',
                    message: `切换用户身份成功!`
                  });
                  this.$emit('close', {
                    index: 1,
                    dialog: 'isSwitchIdentity'
                  });
                }
              })
              .catch(error => {
                if (error.data && error.data.message) {
                  this.isLoading = false;
                  this.loading = false;
                  this.$message.error(error.data.message);
                  this.$emit('close', {
                    index: 0,
                    dialog: 'isSwitchIdentity'
                  });
                }
              });
          })
          .catch(() => {
            this.isLoading = false;
            this.loading = false;
            this.$message({
              type: 'info',
              message: `已取消`
            });
          });
      }
    },
    closelayer() {
      this.$emit('close', {
        index: 0,
        dialog: 'isSwitchIdentity'
      });
    }
  }
};
</script>
<style lang="less">
.switch-identity-container {
  .clear-label {
    display: inline-block;
    width: 100%;
  }
  .el-select {
    width: 100%;
    margin-top: 10px;
  }
  .el-input.el-input--suffix {
    width: 100%;
  }
  .cd-sure-btn .btn {
    margin-left: 20px;
  }
}
</style>
