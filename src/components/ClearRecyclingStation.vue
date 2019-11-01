<template>
    <div class="clear-recycling-station-container" v-loading="isLoading">
        <el-form  :model="ruleForm"  ref="ruleForm" class="cd-el-form" label-width="110px">
          <label class="clear-label">需要清空的时间段</label>
          <div class="clear-recycling-select-container">
            <el-select v-model="ruleForm.selectValue" placeholder="请选择需要清空的时间段">
              <el-option
                class="clear-recycling-dialog-select-options"
                v-for="item in ruleForm.selectOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
          
          <el-form-item class="cd-sure-btn">
              <el-button size="mini" class="btn"  @click="closelayer()">取消</el-button>
              <el-button class="ml20 btn-danger" type="danger" size="mini" @click="submitForm('ruleForm')" :loading="loading">清空</el-button>
          </el-form-item>
        </el-form>
    </div>
</template>
<script>
export default {
  components: {},
  data() {
    return {
      loading: false,
      ruleForm: {
        selectOptions: [
          {
            value: '2',
            label: '2天前'
          },
          {
            value: '7',
            label: '一周前'
          },
          {
            value: '0',
            label: '全部'
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
      for (let index in this.ruleForm.selectOptions) {
        if (value === this.ruleForm.selectOptions[index].value) {
          return this.ruleForm.selectOptions[index].label;
        }
      }
    },
    submitForm(formName) {
      this.loading = true;
      if (this.ruleForm.selectValue === '') {
        this.loading = false;
        this.$message({
          type: 'warning',
          message: '请选择需要清除的时间段'
        });
      } else {
        let labelTxt = this.getSelctLabel(this.ruleForm.selectValue);
        this.$confirm(`此操作将清空${labelTxt}数据, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            let params = {
              day: parseInt(this.ruleForm.selectValue)
            };
            this.isLoading = true;
            this.$axios({
              method: 'post',
              url: '/api/trash/delList',
              data: params
            })
              .then(res => {
                if (res.data.code == 200) {
                  this.isLoading = false;
                  this.loading = false;
                  this.$message({
                    type: 'success',
                    message: `清空${labelTxt}数据成功!`
                  });
                  this.$emit('close', {
                    index: 1,
                    dialog: 'isClearRecylingStation'
                  });
                }
              })
              .catch(error => {
                if (error.data && error.data.message) {
                  this.isLoading = false;
                  this.loading = false;
                  this.$emit('close', {
                    index: 0,
                    dialog: 'isClearRecylingStation'
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
        dialog: 'isClearRecylingStation'
      });
    }
  }
};
</script>
<style lang="less">
.clould-disk {
  .reycling-station-clear-dialog {
    .el-dialog__body {
      padding-left: 0 !important;
      padding-right: 0 !important;
      .cd-el-form {
        .el-form-item {
          padding: 0 20px 0 20px;
          margin-bottom: 0;
        }
        .cd-sure-btn {
          &:before {
            background-color: transparent;
          }
          &:after {
            background-color: transparent;
          }
        }
      }
      .el-loading-mask {
        .el-loading-spinner {
          top: calc(28vh);
          left: 50%;
          margin-left: -50%;
          position: fixed;
        }
      }
    }
  }
}
.clear-recycling-station-container {
  .clear-label {
    display: inline-block;
    width: 100%;
    padding-left: 20px;
    padding-right: 20px;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }
  .clear-recycling-select-container {
    width: 100%;
    padding-left: 20px;
    padding-right: 20px;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    .el-select {
      width: 100%;
      margin-top: 10px;
    }
  }

  .el-input.el-input--suffix {
    width: 100%;
  }
  .cd-sure-btn .btn {
    margin-left: 20px;
  }
}
</style>
