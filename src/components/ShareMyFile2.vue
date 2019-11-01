<template>
    <div class="share-my-file-container">
        <el-form  class="cd-el-form" >
            <el-form-item label="共享对象">
                <el-select v-model="shareType" clearable @change="handleItemChange" style="width:100%" placeholder="请选择">
                    <el-option
                     v-show="type != 'file'"
                    v-for="item in options"
                    :key="item.id"
                    :label="item.label"
                    :value="item.value">
                    </el-option>
                    <el-option
                     v-show="type == 'file'"
                     v-for="item in optionsFile"
                    :key="item.id"
                    :label="item.label"
                    :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
        <el-form-item label="群组" v-show="shareType == '2'">
            <el-select
                v-model="selectValues"
                multiple
                style="width:100%"
                @visible-change="setTagTitle"
                placeholder="请选择">
                <el-option
                v-for="item in objSelect"
                :key="item.id"
                :label="item.name"
                :value="item.id">
                </el-option>
            </el-select>
        </el-form-item>
        <el-form-item>
        <div class="custom-tree-container"  v-show="shareType == '1'">
            <div class="block">
                <el-scrollbar>
                <el-tree class="div"
                :data="data4"
                show-checkbox
                node-key="email"
                ref="tree"
                :default-checked-keys="data5"
                :default-expand-all="false"
                @check-change="getCheckedNodes"
                :expand-on-click-node="false">
                <span class="custom-tree-node" slot-scope="{ node, data }">
                    <span><i class="iconfont" v-if="data.email">&#xe694;</i>{{ (data.userName == ''? data.organizationName:  data.organizationName+'( '+data.userName+' )') }}</span>
                </span>
                </el-tree>
                </el-scrollbar>
            </div>
            <div class="block">
                <el-scrollbar>
                    <div class="div">
                        <div  v-for="item in peoples"><i class="iconfont">&#xe694;</i>{{item.organizationName+'( '+item.anotherName+' )'}}</div>
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
      keyValue: '',
      options: [{ value: '1', label: '用户' }, { value: '2', label: '群组' }],
      optionsFile: [{ value: '1', label: '用户' }],
      shareType: [],
      selectValues: [],
      oldSelectValues: [],
      data4: [],
      data5: [],
      peoples: [],
      oldPeoples: [],
      selectIndex: 0,
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
      const newChild = { id: id++, label: 'testtest', children: [] };
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
      for (let a of this.selectValues) {
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
      if (count == this.selectValues.length && count != 0) {
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
      if (self.selectIndex == 0) {
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
            this.$message({ message: res.data.message, type: 'success' });
            this.$emit('close', {
              index: 1,
              dialog: 'isShareFile'
            });
          }
        })
        .catch(error => {
          if (error.data && error.data.message) {
            this.loading = false;
            this.$message({ type: 'warning', message: error.data.message });
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
                self.objSelect.push({
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
                self.objSelect.push({
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
    }
  }
};
</script>
<style lang="less">
.share-my-file-container {
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
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
      width: 242px;
    }
  }
  .custom-tree-container {
    display: flex;
    border: 1px solid #ddd;
    // margin: 0 10px;
    box-sizing: border-box;
    .block {
      .div {
        max-height: 260px;
        padding-right: 8px;
      }
      // overflow-y: scroll;
      flex: 1;
      & + .block {
        border-left: 1px solid #ddd;
      }
    }
  }
}
</style>
