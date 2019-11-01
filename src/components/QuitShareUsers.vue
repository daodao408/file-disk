<template>
    <div class="quit-share-users-container" v-loading="isLoading">
        <el-form :model="ruleForm" ref="ruleForm" class="cd-el-form">
          <div class="quit-share-label-btn clearfix">
            <label style="float:left;">是否取消对所有对象的共享</label>
            <el-switch
              v-model="ruleForm.checkFlag"
              inactive-text="否"
              active-text="是" 
              @change="switchChange(ruleForm.checkFlag)"
              style="float:right;">
            </el-switch>
          </div>
          <div class="share-users-list-container">
          <el-scrollbar>
            <div class="share-users-list clearfix"  v-for="(item,index) in shareUserArr">
                <div class="share-users-list-text" :title="item.name">{{item.name}}</div>
                <div class="share-users-close-btn" :class="item.shareFlag ? 'share-users-close-btn-active' : 'share-users-close-btn-disable'" @click="cancleShareClick(index)">{{item.shareFlagText}}</div>
            </div>
          </el-scrollbar>
          </div>
          <el-form-item class="cd-sure-btn t-c">
              <el-button size="mini" class="btn" @click="closelayer()">取消</el-button>
              <el-button class="ml20" type="primary" size="mini" @click="submitForm('ruleForm')" :loading="loading">确定</el-button>
          </el-form-item>
        </el-form>
    </div>
</template>
<script>
export default {
  props: ['shareUserData'],
  components: {},
  data() {
    return {
      loading: false,
      ruleForm: {
        checkFlag: false,
        selectLabel: ''
      },
      isLoading: false,
      shareUserArr: []
    };
  },
  created() {
    this.getshareUserData();
  },
  // watch() {
  //   // shareUserArr(oldValue,newValue) => {
  //   // }
  // },
  methods: {
    getshareUserData() {
      if (
        this.shareUserData &&
        this.shareUserData.shareUsers &&
        this.shareUserData.shareUsers.length > 1
      ) {
        for (let item of this.shareUserData.shareUsers) {
          if (!item.name) {
            this.shareUserArr.push({
              name: item.email,
              shareFlag: true,
              shareFlagText: '取消'
            });
          } else {
            this.shareUserArr.push({
              name: item.name,
              shareFlag: true,
              shareFlagText: '取消'
            });
          }
        }
      }
    },
    cancleShareClick(index) {
      this.shareUserArr[index].shareFlag = !this.shareUserArr[index].shareFlag;
      if (this.shareUserArr[index].shareFlag === false) {
        this.shareUserArr[index].shareFlagText = '已取消';
      } else {
        this.shareUserArr[index].shareFlagText = '取消';
      }
    },
    switchChange(swtitchFlag) {
      if (swtitchFlag) {
        for (let item of this.shareUserArr) {
          item.shareFlag = false;
          item.shareFlagText = '已取消';
        }
      } else {
        for (let item of this.shareUserArr) {
          item.shareFlag = true;
          item.shareFlagText = '取消';
        }
      }
    },
    submitForm(formName) {
      let tempSharUserArr = [];
      for (let i = 0; i < this.shareUserArr.length; i++) {
        if (!this.shareUserArr[i].shareFlag) {
          tempSharUserArr.push(this.shareUserData.shareUsers[i]);
        }
      }
      let params = [
        {
          token: this.shareUserData.token,
          repoId: this.shareUserData.repoId,
          path: this.shareUserData.path,
          type: this.shareUserData.type,
          shareUsers: tempSharUserArr,
          size: this.shareUserData.size
        }
      ];
      if (tempSharUserArr.length === 0) {
            this.$message({
            type: 'warning',
            message: '请选择需要取消共享对象!'
          });   
        return;
      }
      this.loading = true;
      this.$confirm(`此操作将取消所选共享, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.isLoading = true;
          this.$axios({
            method: 'post',
            url: '/api/repos/cancleMyShared',
            data: params
          })
            .then(res => {
              if (res.data.code == 200) {
                this.isLoading = false;
                this.loading = false;
                this.$message({
                  type: 'success',
                  message: `取消所选共享成功!`
                });
                this.$emit('close', {
                  index: 1,
                  dialog: 'isQuitShareUsers'
                });
              }
            })
            .catch(error => {
              if (error.data && error.data.message) {
                this.isLoading = false;
                this.loading = false;
                this.$message({
                  type: 'info',
                  message: error.data.message
                });
                this.$emit('close', {
                  index: 0,
                  dialog: 'isQuitShareUsers'
                });
              }
            });
        })
        .catch(error => {
          this.isLoading = false;
          this.loading = false;
          this.$message({
            type: 'info',
            message: `已取消`
          });
        });
    },
    closelayer() {
      this.$emit('close', {
        index: 0,
        dialog: 'isQuitShareUsers'
      });
    }
  }
};
</script>
<style lang="less">
.quit-share-users-pop {
  .el-dialog__body {
    padding: 10px 0 0 0 !important;
  }
}

.quit-share-users-container {
  .cd-el-form {
    .quit-share-label-btn {
      padding: 0 20px;
    }
    .cd-sure-btn {
      margin-top: 8px;
      .btn {
        margin-left: 0;
      }
    }
    .cd-sure-btn:before {
      background: none;
    }
    .cd-sure-btn:after {
      background: none;
    }
  }
  .share-users-list-container {
    width: 100%;
    height: 360px;
    padding-left: 20px;
    padding-top: 10px;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    //overflow-y: auto;
    .el-scrollbar {
      width: 100%;
      height: 100%;

      .el-scrollbar__wrap {
        overflow-x: hidden;
        .share-users-list {
          width: 100%;
          height: auto;
          margin-bottom: 10px;
          .share-users-list-text {
            float: left;
            max-width: 180px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            height: 32px;
            line-height: 32px;
            box-sizing: border-box;
            position: relative;
            margin-top: 8px;
          }
          .share-users-close-btn {
            float: right;
            width: 84px;
            height: 28px;
            line-height: 28px;
            text-align: center;
            background: #fff;
            border: 1px solid #dcdfe6;
            font-size: 14px;
            font-style: normal;
            font-weight: normal;
            margin-top: 6px;
            margin-right: 20px;
            cursor: pointer;
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
          }
          .share-users-close-btn-active {
            color: #409eff;
          }
          .share-users-close-btn-disable {
            color: #ccc;
          }
        }
        .share-users-list:last-child {
          margin-bottom: 5px;
        }
      }
    }
  }
}
</style>
