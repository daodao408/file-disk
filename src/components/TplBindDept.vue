<template>
    <div class="cd-layer tpl-bind-dept-container">
        <el-form  :model="ruleForm" :rules="rules" ref="ruleForm" class="cd-el-form" :label-position="top">
        <el-form-item>
            <div class="tips-container">请选择需要绑定的部门</div>
            <div class="custom-tree-container">
                <div class="block">
                    <el-scrollbar>
                    <el-tree class="div"
                    :data="data4"
                    :show-checkbox="true"
                    node-key="organizationName"
                    ref="tree"
                    :default-checked-keys="data5"
                    :default-expand-all="false"
                    @check="getCheckedDeptNodes"
                    :expand-on-click-node="false"
                    :check-strictly="true">
                    <span class="custom-tree-node" slot-scope="{ node, data }">
                        <span><i class="iconfont" v-if="data.email">&#xe694;</i>{{ data.organizationName }}</span>
                    </span>
                    </el-tree>
                    </el-scrollbar>
                </div>
                <div class="block bind-dept-right-zone">
                  <div class="div">
                      <div class="chose-dept-title">已选择<span>{{peoples.length}}</span>个部门</div>
                      <el-scrollbar>
                        <div class="chose-dept-content"  v-for="(item,index) in peoples"><span :title="item.organizationName">{{item.organizationName}}</span><i @click="delChoseDept(index)" class="iconfont dept-close-icon">&#xe679;</i></div>
                      </el-scrollbar>  
                  </div>
                    
                        
                      
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
  props: ['templateId', 'checkedDeptObj'],
  components: {},
  data() {
    return {
      data4: [],
      data5: [],
      loading: false,
      peoples: []
    };
  },
  created() {
    this.setTitle();
  },
  watch: {
    templateId(newVal, oldVal) {
      this.ruleForm.anotherName = '';
    }
  },
  methods: {
    setTitle() {
      this.loadcheckList();
      this.loadobjList();
    },
    submitForm(formName) {
      let postData = [];
      if (this.peoples.length === 0) {
        postData.push({
          hideEmail: '',
          tId: this.templateId
        });
      } else {
        postData = this.peoples;
      }

      this.loading = true;
      this.$axios({
        method: 'post',
        url: '/api/template/addTemplate',
        data: postData
      })
        .then(res => {
          if (res.data.code == 200) {
            this.loading = false;
            this.$message({ message: res.data.message, type: 'success' });
            this.$emit('close', {
              index: 1,
              dialog: 'isTplBindDept'
            });
          }
        })
        .catch(error => {
          if (error.data && error.data.message) {
            this.loading = false;
            this.$message({ type: 'warning', message: error.data.message });
            this.$emit('close', {
              index: 0,
              dialog: 'isTplBindDept'
            });
          }
        });
    },
    closelayer() {
      this.$emit('close', {
        index: 0,
        dialog: 'isTplBindDept'
      });
    },
    loadcheckList() {
      for (let a of this.checkedDeptObj) {
        this.data5.push(a.organizationName);
        this.peoples.push({
          deptId: a.id,
          hideEmail: a.hideEmail,
          tId: this.templateId,
          rId: a.rId,
          organizationName: a.organizationName
        });
      }
    },
    getCheckedDeptNodes(node, checkedNodes) {
      let arr = this.$refs.tree.getCheckedNodes();
      this.peoples = [];
      for (let a of arr) {
        this.peoples.push({
          deptId: a.id,
          hideEmail: a.hideEmail,
          tId: this.templateId,
          rId: a.rId,
          organizationName: a.organizationName
        });
      }
    },
    loadobjList() {
      this.$axios({
        method: 'get',
        url: `/api/organization`
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
    delChoseDept(index) {
      this.$refs.tree.setChecked(this.peoples[index], false, false);
      this.peoples.splice(index, 1);
    },
    getCheckedDeptObj(node, childrenNodes) {
      // if (node.children) {
      //   for (let i = 0; i < node.children.length; i++) {
      //     const child = node.children[i];
      //     childrenNodes.push(child);
      //     if (!child.children || child.children.length === 0) {
      //       continue;
      //     }
      //     return this.getCheckedDeptObj(child.children, childrenNodes);
      //   }
      // }
      // //   if (arr.children.length > 0) {
      // //     tempArr.push({
      // //       id: arr.id,
      // //       organizationName: arr.organizationName
      // //     });
      // //     for (var i = 0; i < arr.children.length; i++) {
      // //       let tempTreeData = arr.children[i];
      // //       tempArr.push({
      // //         id: tempTreeData.id,
      // //         organizationName: tempTreeData.organizationName
      // //       });
      // //       if (arr.children[i].children.length > 0) {
      // //         this.getCheckedDeptObj(arr.children[i].children);
      // //       } else {
      // //         return tempArr;
      // //       }
      // //     }
      // //   }
      // return childrenNodes;
    }
  }
};
</script>
<style lang="less">
.tpl-bind-dept-container {
  .tips-container {
    margin-top: -15px;
  }
  .block {
    height: 260px;
  }
  .custom-tree-container {
    display: flex;
    border: 1px solid #ddd;
    // margin: 0 10px;
    box-sizing: border-box;
    .block {
      .el-scrollbar {
        height: 260px;
        .el-scrollbar__wrap {
          overflow-x: hidden;
          overflow-y: auto;
          .div {
            &.el-tree {
              max-height: none;
              .custom-tree-node {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 14px;
                padding-right: 8px;
                span {
                  display: inline-block;
                  max-width: 180px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }
              }
            }
            max-height: 260px;
          }
        }
      }
      // overflow-y: scroll;
      flex: 1;
      & + .block {
        border-left: 1px solid #ddd;
      }
      &.bind-dept-right-zone {
        height: 260px;
        .chose-dept-title {
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
          .el-scrollbar__wrap {
            overflow-x: hidden;
            overflow-y: auto;
            .chose-dept-content {
              padding-left: 10px;
              box-sizing: border-box;
              position: relative;
              height: 40px;
              line-height: 40px;
              span {
                display: inline-block;
                max-width: 180px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              i {
                &.dept-close-icon {
                  position: absolute;
                  top: 0;
                  left: 86%;
                  cursor: pointer;
                }
              }
            }
          }
        }
      }
    }
  }
  .el-form-item {
    margin-bottom: 0;
  }
}
</style>
