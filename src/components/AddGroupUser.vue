<template>
    <div class="cd-layer add-group-user-container">
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" class="cd-el-form" :label-position="top">
        <el-form-item>
            <div class="tips-container">请选择需要添加的成员</div>
            <div class="custom-tree-container">
                <div class="block">
                    <el-scrollbar class="chose-group-user-tree-scrollbar">
                    <el-tree
                    :data="data4"
                    show-checkbox
                    node-key="email"
                    ref="tree"
                    :default-checked-keys="data5"
                    :default-expand-all="false"
                    @check-change="getCheckedNodes"
                    :expand-on-click-node="false">
                    <span class="custom-tree-node" slot-scope="{ node, data }">
                        <span><i class="iconfont" v-if="data.email">&#xe694;</i>{{ data.organizationName }}</span>
                    </span>
                    </el-tree>
                    </el-scrollbar>
                </div>
                <div class="block chose-group-user">
                    <div class="chose-group-user-title">已选择<span>{{peoples.length}}</span>个群组</div>
                    <el-scrollbar>
                        <div>
                            <!-- <div  v-for="item in peoples"><i class="iconfont">&#xe694;</i>{{item.organizationName}}</div> -->
                            <div class="chose-group-user-content" v-for="(item,index) in peoples"><i class="iconfont group-user-icon">&#xe694;</i><span :title="item.organizationName">{{item.organizationName}}</span><i @click="delChoseGroupUser(index)" class="iconfont group-user-close-icon">&#xe679;</i></div>
                        </div>
                    </el-scrollbar>    
                </div>
            </div>
        </el-form-item>
        <el-form-item class="t-c cd-sure-btn">
            <el-button size="mini" @click="closelayer()">取消</el-button>
            <el-button class="ml20" type="primary" size="mini" @click="submitForm()" :loading="loading">确定</el-button>
        </el-form-item>
        </el-form>
    </div>
</template>
<script>
export default {
  props: ['groupid'],
  components: {},
  data() {
    return {
      data4: [],
      data5: [],
      loading: false,
      oldPeoples: [],
      peoples: []
    };
  },
  created() {
    this.setTitle();
  },
  watch: {
    groupid(newVal, oldVal) {
      this.inputTree = false;
      this.ruleForm.anotherName = '';
    }
  },
  methods: {
    append(data) {
      const newChild = { id: id++, label: 'testtest', children: [] };
      if (!data.children) {
        this.$set(data, 'children', []);
      }
      data.children.push(newChild);
    },
    setTitle() {
      this.loadcheckList();
      //this.loadobjList();
    },
    submitForm(formName) {
      this.loading = true;
      let emails = [];
      let count = 0;
      if (this.peoples.length == 0) {
        this.loading = false;
        this.closelayer();
        return false;
      }
      for (let a of this.peoples) {
        emails.push(a.email);
        for (let b of this.oldPeoples) {
          if (a.email == b.email) {
            count++;
          }
        }
      }
      if (count == this.peoples.length && count != 0) {
        this.$message({
          type: 'warning',
          message: '所有选中用户已经在群组里了！'
        });
        this.loading = false;
        return false;
      }
      let param = {
        emails: emails,
        groupId: this.groupid
      };
      this.$axios({
        method: 'post',
        url: '/api/group/addGroupUsers',
        data: param
      })
        .then(res => {
          if (res.data.code == 200) {
            this.loading = false;
            this.$message({ message: res.data.message, type: 'success' });
            this.$emit('close', {
              index: 1,
              dialog: 'isAddGroupUser'
            });
          }
        })
        .catch(error => {
          if (error.data && error.data.message) {
            this.loading = false;
            this.$message({ type: 'warning', message: error.data.message });
            this.$emit('close', {
              index: 0,
              dialog: 'isAddGroupUser'
            });
          }
        });
    },
    closelayer() {
      this.$emit('close', {
        index: 0,
        dialog: 'isAddGroupUser'
      });
    },
    loadcheckList() {
      this.$axios({
        method: 'post',
        url: `/api/group/queryGroupUser/` + this.groupid
      })
        .then(res => {
          if (res.data.code == 200) {
            for (let a of res.data.data) {
              this.data5.push(a.email);
              this.peoples.push({
                email: a.email,
                organizationName: a.name
              });
              this.oldPeoples.push({
                email: a.email,
                organizationName: a.name
              });
            }
            this.loadobjList();
          }
        })
        .catch(error => {
          if (error.data && error.data.message) {
            this.$message({ type: 'warning', message: erro.data.message });
          }
        });
    },
    getCheckedNodes(data, checked, indeterminate) {
      let arr = this.$refs.tree.getCheckedNodes();
      this.peoples = [];
      for (let a of arr) {
        if (a.email) {
          this.peoples.push({
            email: a.email,
            organizationName: a.organizationName
          });
        }
      }
    },
    loadobjList() {
      this.$axios({
        method: 'get',
        url: `/api/organization/queryUser`
      })
        .then(res => {
          if (res.data.code == 200) {
            this.data4 = res.data.data;
          }
        })
        .catch(error => {
          if (error.data && error.data.message) {
            this.$message({ type: 'warning', message: error.data.message });
          }
        });
    },
    delChoseGroupUser(index) {
      this.$refs.tree.setChecked(this.peoples[index], false, false);
      this.peoples.splice(index, 1);
    }
  }
};
</script>
<style lang="less">
.add-group-user-container {
  .tips-container {
    margin-top: -15px;
  }
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
    i {
      &.iconfont {
        color: #42a0f8;
      }
    }
  }
  .block {
    height: 260px;
    &.chose-group-user {
      .chose-group-user-title {
        width: 100%;
        height: 40px;
        line-height: 40px;
        text-indent: 10px;
        border-bottom: 1px solid #e5e5e5;
        span {
          color: green;
          padding: 0 5px;
        }
      }
      .el-scrollbar {
        height: 220px;
        overflow-x: hidden;
        .el-scrollbar__wrap {
          height: 100%;
          overflow-x: hidden;
          overflow-y: auto;
        }
        .el-scrollbar__bar {
          z-index: 11;
        }
        .chose-group-user-content {
          width: 95%;
          padding-left: 8px;
          height: 36px;
          box-sizing: border-box;
          position: relative;
          z-index: 9;
          .group-user-icon {
            color: #42a0f8;
            vertical-align: top;
            margin-right: 4px;
          }
          span {
            display: inline-block;
            max-width: 80%;
            height: 36px;
            line-height: 38px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .group-user-close-icon {
            position: absolute;
            top: -3px;
            left: 90%;
            width: 14px;
            height: 14px;
            cursor: pointer;
            z-index: 10;
          }
        }
      }
    }
  }

  .demonstration {
    margin-bottom: 10px;
  }
  .custom-tree-container {
    display: flex;
    border: 1px solid #ddd;
    // margin: 0 10px;
    box-sizing: border-box;
    .block {
      .chose-group-user-tree-scrollbar {
        &.el-scrollbar {
          height: 100%;
          .el-scrollbar__wrap {
            overflow-x: hidden;
            overflow-y: auto;
            .el-tree {
              max-height: none;
            }
          }
        }
      }
      flex: 1;
      & + .block {
        border-left: 1px solid #ddd;
      }
    }
  }
  .demonstration {
    margin-bottom: 10px;
  }
  .el-form-item {
    margin-bottom: 0;
  }
  .ed-layer {
    text-align: center;
    position: fixed;
    bottom: 10px;
    left: 0;
    width: 100%;
    border-top: 1px solid #ddd;
    padding-top: 10px;
  }
}
</style>
