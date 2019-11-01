<template>
    <div class="cd-layer" v-loading="fullscreenLoading">
        <el-form  class="cd-el-form">
        <el-form-item>
            <div class="copy-move-file-scrollbar">
                <el-scrollbar>
                    <el-tree
                    :data="data4"
                    :show-checkbox="false"
                    node-key="email"
                    ref="tree"
                    :default-checked-keys="data5"
                    :default-expand-all="false"
                    @node-click="handleNodeClick"
                    :expand-on-click-node="true">
                    <span class="custom-tree-node" slot-scope="{ node, data }">
                        <span><i class="iconfont" v-if="data.email">&#xe694;</i>{{ data.name }}</span>
                    </span>
                    </el-tree>
                </el-scrollbar>
            </div>
        </el-form-item>
        <el-form-item class="t-c cd-sure-btn">
            <el-button size="mini" @click="closelayer()"  :disabled="closeLoading">取消</el-button>
            <el-button class="ml20" type="primary" size="mini" @click="submitForm()" :loading="loading">确定</el-button>
        </el-form-item>
        </el-form>
    </div>
</template>
<script>
export default {
  props: ['title', 'checksData', 'type'],
  components: {},
  data() {
    return {
      obj: [],
      path: '',
      keyValue: '',
      data4: [],
      loading: false,
      fullscreenLoading: false,
      useMemory: '',
      totalMemory: '',
      closeLoading: false
    };
  },
  created() {
    this.parent_index = parent.layer.getFrameIndex(window.name);
    this.setTitle();
  },
  watch: {
    $route: function() {
      this.setTitle();
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.fullscreenLoading = true;
    });
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
      this.loadobjList();
    },
    submitForm() {
      let self = this;
      if (!this.keyValue) {
        this.$message('请选择路径');
        return false;
      }
      let arr = [];
      for (let a of this.checksData) {
        arr.push({
          src_repo_id: a.repoId,
          src_parent_dir: a.ppath,
          src_dirent_name: a.name,
          dst_repo_id: this.keyValue.repoId,
          dst_parent_dir: this.keyValue.path,
          operation: this.type,
          dirent_type: a.type
        });
      }
      this.closeLoading = true;
      this.loading = true;
      this.$axios({
        method: 'post',
        url: '/api/repos/copyAndMove',
        data: arr
      })
        .then(res => {
          if (res.data.code == 200) {
            setTimeout(() => {
              this.getMemory();
            }, 3000);
          }
        })
        .catch(error => {
          if (error.data && error.data.message) {
            this.closeLoading = false;
            this.loading = false;
            this.$message({ type: 'warning', message: error.data.message });
            this.$emit('close', {
              index: 0,
              dialog: 'showDialog'
            });
          }
        });
    },
    getMemory() {
      let self = this;
      if (sessionStorage.getItem('token')) {
        self
          .$axios({
            method: 'get',
            url: '/api/user/getUserMsg'
          })
          .then(res => {
            if (res.data.code == 200) {
              self.useMemory = (
                parseInt(res.data.data.usedStorage) /
                (1000 * 1000 * 1000)
              ).toFixed(2);
              self.totalMemory = (
                parseInt(res.data.data.totalStorage) /
                (1000 * 1000 * 1000)
              ).toFixed(2);
            }
            this.loading = false;
            this.closeLoading = false;
            this.$message({ message: res.data.message, type: 'success' });
            this.$emit('close', {
              index: 1,
              dialog: 'showDialog'
            });
            this.$emit('getCopyMemory', self.useMemory, self.totalMemory);
          })
          .catch(error => {
            if (error.data && error.data.message) {
              this.$message({ type: 'warning', message: error.data.message });
            }
          });
      }
    },
    closelayer() {
      this.$emit('close', {
        index: 0,
        dialog: 'showDialog'
      });
    },
    handleNodeClick(data) {
      this.keyValue = data;
    },
    loadobjList() {
      let self = this;
      self.loading = true;
      layui.use(['layer'], function() {
        self
          .$axios({
            method: 'get',
            url: `/api/repos/tree`
          })
          .then(res => {
            if (res.data.code == 200) {
              self.loading = false;
              self.fullscreenLoading = false;
              self.data4 = res.data.data;
            }
          })
          .catch(function(error) {
            if (error && error.message) {
              self.loading = false;
              layui.layer.msg(error.message);
            }
          });
      });
    }
  }
};
</script>
<style lang="less">
.clould-disk {
  .my-file-copy-move-dialog {
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
          top: calc(45vh);
          left: 50%;
          margin-left: -50%;
          position: fixed;
        }
      }
    }
  }
  .group-copy-move-dialog {
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
          top: calc(45vh);
          left: 50%;
          margin-left: -50%;
          position: fixed;
        }
      }
    }
  }
  .copy-move-file-dialog {
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
          top: calc(45vh);
          left: 50%;
          margin-left: -50%;
          position: fixed;
        }
      }
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
}
.el-form-item {
  margin-bottom: 0;
  .copy-move-file-scrollbar {
    height: 260px;
    .el-scrollbar {
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
}
</style>
