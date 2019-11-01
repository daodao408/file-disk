<template>
  <div class="share-my-file-container">
    <el-form class="cd-el-form">
      <el-form-item label="共享对象">
        <el-select v-model="shareType" clearable @change="handleItemChange" style="width:100%" placeholder="请选择">
          <el-option class="share-my-file-options" v-show="type != 'file'" v-for="item in options" :label="item.label" :value="item.value">
          </el-option>
          <el-option class="share-my-file-options" v-show="type == 'file'" v-for="item in optionsFile" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-show="shareType == '2'">
        <!-- <el-select
                v-model="selectValues"
                multiple
                style="width:100%"
                @visible-change="setTagTitle"
                placeholder="请选择">
                <el-option
                v-for="item in objSelect"
                :label="item.name"
                :value="item.id">
                </el-option>
            </el-select> -->
        <div class="tips-container">请选择需要共享给的群组</div>
        <div class="custom-tree-container">
          <div class="block" style="width:50%;">
            <el-scrollbar>
              <el-checkbox-group v-model="checkedGroupNames" @change="handleCheckedGroupChange">
                <el-checkbox v-for="group in groupObj" :label="group.name" :title="group.name">{{group.name}}</el-checkbox>
              </el-checkbox-group>
            </el-scrollbar>
          </div>
          <div class="block checked-group-zone" style="width:50%;">
              <div class="chose-dept-title">已选择<span>{{checkedGroupNames.length}}</span>个群组</div>
              <el-scrollbar>
                  <div class="">
                      <div class="chose-dept-content" v-for="(item,index) in checkedGroupNames" :title="item"><span>{{item}}</span><i @click="delChoseGroup(index)" class="iconfont dept-close-icon">&#xe679;</i></div>
                  </div>
              </el-scrollbar>    
          </div> 
        </div>
      </el-form-item>
      <el-form-item v-show="shareType == '1'">
        <div class="tips-container">请选择需要共享给的用户</div>
        <div class="custom-tree-container">
            <div class="block">
                <el-scrollbar>
                <el-tree class="div-container"
                :data="data4"
                show-checkbox
                node-key="email"
                ref="tree"
                :default-checked-keys="data5"
                :default-expand-all="false"
                @check-change="getCheckedNodes"
                :expand-on-click-node="false">
                <span class="custom-tree-node" slot-scope="{ node, data }">
                    <span :title="(data.userName == ''? data.organizationName:  data.organizationName+'( '+data.userName+' )')"><i class="iconfont" v-if="data.email">&#xe694;</i>{{ (data.userName == ''? data.organizationName:  data.organizationName+'( '+data.userName+' )') }}</span>
                </span>
                </el-tree>
                </el-scrollbar>
            </div>
            <div class="block checked-user-zone">
                <div class="chose-dept-title">已选择<span>{{peoples.length}}</span>个用户</div>
                <el-scrollbar>
                    <div class="div-container">
                        <div class="check-user-container" v-for="(item,index) in peoples"><i class="iconfont">&#xe694;</i><span :title="item.organizationName+'( '+item.anotherName+' )'">{{item.organizationName+'( '+item.anotherName+' )'}}</span><b @click="delChoseUser(index)" class="iconfont dept-close-icon">&#xe679;</b></div>
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
  props: ['repoid', 'path', 'type', 'sizeformatted', 'shareNum'],
  components: {},
  data() {
    return {
      objSelect: [],
      groupObj: [],
      checkedGroupNames: [],
      checkedGroupIds: [],
      keyValue: '',
      options: [
        {
          value: '1',
          label: '用户'
        },
        {
          value: '2',
          label: '群组'
        }
      ],
      optionsFile: [
        {
          value: '1',
          label: '用户'
        }
      ],
      shareType: '1',
      selectValues: [],
      oldSelectValues: [],
      data4: [],
      data5: [],
      peoples: [],
      oldPeoples: [],
      selectIndex: '1',
      loading: false
    };
  },
  created() {
    this.setTitle();
  },
  watch: {
    path(newVal, oldVal) {
      this.shareType = [];
      this.selectValues = [];
      this.setTitle();
    }
  },
  methods: {
    append(data) {
      const newChild = {
        id: id++,
        label: 'testtest',
        children: []
      };
      if (!data.children) {
        this.$set(data, 'children', []);
      }
      data.children.push(newChild);
    },
    getCheckedNodes(data, checked, indeterminate) {
      let arr = this.$refs.tree.getCheckedNodes();
      this.peoples = [];
      for (let a of arr) {
        if (a.email) {
          this.peoples.push({
            email: a.email,
            organizationName: a.organizationName,
            anotherName: a.userName
          });
        }
      }
    },
    getShareUsers() {
      let self = this;
      layui.use(['layer'], function() {
        self
          .$axios({
            method: 'post',
            url: `/api/repos/sharedUser`,
            data: {
              p: self.path,
              repoId: self.repoid,
              type: self.type,
              shareNum: self.shareNum
            }
          })
          .then(res => {
            if (res.data.code == 200) {
              for (let a of res.data.data) {
                self.data5.push(a.user_info.name);
                self.peoples.push({
                  email: a.user_info.name,
                  organizationName: a.user_info.nickname,
                  anotherName: a.user_info.anotherName
                });
                self.oldPeoples.push({
                  email: a.user_info.name,
                  organizationName: a.user_info.nickname,
                  anotherName: a.user_info.anotherName
                });
              }
              self.loadobjList();
            }
          })
          .catch(function(error) {
            if (error && error.message) {
              layui.layer.msg(error.message);
            }
          });
      });
    },
    submitForm() {
      let self = this;
      let Users = [];
      let Group = [];
      let count = 0;
      for (let a of this.peoples) {
        Users.push({
          username: a.email,
          permission: 'r'
        });
        if (this.shareType == 1) {
          for (let b of this.oldPeoples) {
            if (a.email == b.email) {
              count++;
            }
          }
        }
      }
      if (count == this.peoples.length && count != 0) {
        this.$message({
          type: 'warning',
          message: '所有选中用户已经被共享过了！'
        });
        return false;
      }
      count = 0;
      for (let a of this.checkedGroupIds) {
        Group.push({
          group_id: a,
          permission: 'r'
        });
        if (this.shareType == 2) {
          for (let b of this.oldSelectValues) {
            if (a == b) {
              ++count;
            }
          }
        }
      }
      if (count == this.checkedGroupIds.length && count != 0) {
        this.$message({
          type: 'warning',
          message: '所有选中群组已经被共享过了！'
        });
        return false;
      }
      let param = {
        Dirs: [
          {
            path: self.path,
            repoId: self.repoid,
            type: self.type,
            size_formatted: self.sizeformatted,
            shareNum: self.shareNum
          }
        ],
        Users: Users,
        Group: Group
      };
      if (param.Users.length == 0 && param.Group.length == 0) {
        layui.layer.msg('请选择共享的对象');
        return false;
      }
      this.loading = true;
      self
        .$axios({
          method: 'post',
          url: `/api/repos/shareDirsOrRepos`,
          data: param
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
              dialog: 'isShareFile'
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
              dialog: 'isShareFile'
            });
          }
        });
    },
    handleItemChange(val) {
      this.selectIndex = val;
    },
    remove(node, data) {
      const parent = node.parent;
      const children = parent.data.children || parent.data;
      const index = children.findIndex(d => d.id === data.id);
      children.splice(index, 1);
    },
    setTitle() {
      this.shareGroups();
      this.getShareUsers();
    },
    loadobjList() {
      let self = this;
      layui.use(['layer'], function() {
        self
          .$axios({
            method: 'post',
            url: `/api/repos/queryUser`,
            data: {
              p: self.path,
              repoId: self.repoid,
              type: self.type,
              shareNum: self.shareNum
            }
          })
          .then(res => {
            if (res.data.code == 200) {
              self.data4 = res.data.data;
            }
          })
          .catch(function(error) {
            if (error && error.message) {
              layui.layer.msg(error.message);
            }
          });
      });
    },
    queryGroups() {
      let self = this;
      layui.use(['form', 'layer'], function() {
        let form = layui.form;
        self
          .$axios({
            method: 'post',
            url: `/api/repos/queryGroup`,
            data: {
              p: self.path,
              repoId: self.repoid,
              type: self.type,
              shareNum: self.shareNum
            }
          })
          .then(res => {
            if (res.data.code == 200) {
              for (let a of res.data.data) {
                // self.objSelect.push({
                //   id: a.id,
                //   name: a.name
                // });
                self.groupObj.push({
                  id: a.id,
                  name: a.name
                });
              }
            }
          })
          .catch(function(error) {
            if (error && error.message) {
              layui.layer.msg(error.message);
            }
          });
      });
    },
    shareGroups() {
      let self = this;
      layui.use(['form', 'layer'], function() {
        let form = layui.form;
        self
          .$axios({
            method: 'post',
            //url:`/api/repos/sharedGroup?p=${self.path}&repoId=${self.repoid}&type=${self.type}&shareNum=${self.shareNum}`,
            url: `/api/repos/sharedGroup`,
            data: {
              p: self.path,
              repoId: self.repoid,
              type: self.type,
              shareNum: self.shareNum
            }
          })
          .then(res => {
            if (res.data.code == 200) {
              for (let a of res.data.data) {
                self.selectValues.push(a.group_info.id);
                self.oldSelectValues.push(a.group_info.id);
                // self.objSelect.push({
                //   id: a.group_info.id,
                //   name: a.group_info.name
                // });
                self.checkedGroupNames.push(a.group_info.name);
                self.checkedGroupIds.push(a.group_info.id);
                self.groupObj.push({
                  id: a.group_info.id,
                  name: a.group_info.name
                });
              }
              self.queryGroups();
            }
          })
          .catch(function(error) {
            if (error && error.message) {
              layui.layer.msg(error.message);
            }
          });
      });
    },
    closelayer() {
      this.$emit('close', {
        index: 0,
        dialog: 'isShareFile',
        message: '取消共享'
      });
    },
    cancelHandler() {
      // console.log('关闭')
    },
    setTagTitle() {
      var tagTextList = document
        .querySelector('.share-my-file-container')
        .querySelectorAll('.el-select__tags-text');
      tagTextList.forEach(item => {
        item.setAttribute('title', item.innerText);
      });
    },
    handleCheckedGroupChange() {
      this.checkedGroupIds = this.getGroupIdArr();
    },
    delChoseGroup(index) {
      this.checkedGroupIds = this.getGroupIdArr();
      this.checkedGroupNames.splice(index, 1);
      this.checkedGroupIds.splice(index, 1);
    },
    delChoseUser(index) {
      this.$refs.tree.setChecked(this.peoples[index], false, false);
      this.peoples.splice(index, 1);
    },
    getGroupIdArr() {
      let groupIdArr = [];
      for (let index of this.groupObj.keys()) {
        for (let idx of this.checkedGroupNames.keys()) {
          if (this.groupObj[index].name === this.checkedGroupNames[idx]) {
            groupIdArr.push(this.groupObj[index].id);
          }
        }
      }
      return groupIdArr;
    }
  }
};
</script>
<style lang="less">
.share-my-file-container {
  .el-form-item {
    margin-bottom: 20px;
    .el-form-item__content {
      height: auto;
      .tips-container {
        height: 14px;
        line-height: 14px;
        margin-bottom: 10px;
      }
    }
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
    span {
      display: inline-block;
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .block {
    height: 260px;
  }
  .demonstration {
    margin-bottom: 10px;
  }
  .el-scrollbar {
    height: 100%;
    .el-scrollbar__wrap {
      overflow-x: hidden;
      overflow-y: auto;
      position: relative;
    }
  }

  .el-select__tags-text {
    display: inline-block;
    width: 165px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .el-select {
    .el-tag__close.el-icon-close {
      right: -5px;
      top: -7px;
    }
  }
  .el-select {
    .el-input {
      width: 100%;
    }
  }
  .custom-tree-container {
    display: flex;
    border: 1px solid #ddd; // margin: 0 10px;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    .block {
      .el-scrollbar {
        height: 100%;
      }
      .div-container {
        &.el-tree {
          max-height: none;
        }
        .check-user-container {
          width: 100%;
          padding-left: 10px;
          -webkit-box-sizing: border-box;
          -moz-box-sizing: border-box;
          box-sizing: border-box;
          position: relative;
          z-index: 9;
          i {
            &.iconfont {
              color: #42a0f8;
            }
          }
          span {
            display: inline-block;
            max-width: 75%;
            margin-left: 3px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            vertical-align: top;
          }
          b {
            position: absolute;
            display: inline-block;
            font-weight: normal;
            width: 14px;
            height: 14px;
            top: 0;
            left: 86%;
            z-index: 10;
            cursor: pointer;
          }
        }
      } // overflow-y: scroll;
      flex: 1;
      & + .block {
        border-left: 1px solid #ddd;
      }
      .el-checkbox-group {
        padding-top: 10px;
        .el-checkbox {
          display: inline-block;
          width: 100%;
          padding-left: 20px;
          height: 24px;
          line-height: 24px;
          -webkit-box-sizing: border-box;
          -moz-box-sizing: border-box;
          box-sizing: border-box;
          .el-checkbox__label {
            display: inline-block;
            max-width: 85%;
            overflow: hidden;
            text-overflow: ellipsis;
            vertical-align: top;
            margin-top: 2px;
          }
        }
        .el-checkbox + .el-checkbox {
          margin-left: 0;
        }
      }
      .chose-dept-title {
        width: 100%;
        height: 40px;
        line-height: 40px;
        text-indent: 8px;
        border-bottom: 1px solid #e5e5e5;
      }
      .chose-dept-title span {
        color: green;
        padding: 0 5px;
      }
      .chose-dept-content {
        width: 95%;
        padding-left: 8px;
        height: 36px;
        box-sizing: border-box;
        position: relative;
        z-index: 9;
        span {
          display: inline-block;
          max-width: 80%;
          height: 36px;
          line-height: 36px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .dept-close-icon {
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
    .checked-group-zone,
    .checked-user-zone {
      .el-scrollbar {
        height: calc(100% - 42px);
        overflow-x: hidden;
      }
    }
    .checked-user-zone {
      width: 50%;
      .el-scrollbar {
        .el-scrollbar__bar {
          z-index: 11;
        }
      }
    }
  }
}
.el-select-dropdown__wrap {
  .el-select-dropdown__list {
    .el-select-dropdown__item {
      &.share-my-file-options {
        max-width: 612px;
      }
    }
  }
}
</style>
