<template>
  <el-container class="reycling-station-container" v-loading="isLoading">
    <el-header class="cd-title">文件回收站</el-header>
    <div class="cd-bg-fff pl20 pr20 el-alert-container">
      <el-alert title="30天前删除的文件库会被自动清空" type="info" show-icon>
      </el-alert>
    </div>
    <div class="cd-bg-fff pt10 pb10 pl20 clearfix">
      <el-row>
        <el-button type="danger" plain size="mini" @click="clearFile">
          <i class="iconfont mr5 mt5">&#xe682;</i>清空</el-button>
        <el-button size="mini" @click="restoreFile" :disabled="tableEmails.length===0">
          <i class="iconfont mr5 mt5">&#xe6a4;</i>还原</el-button>
      </el-row>
    </div>
    <div class="">
      <ym-user-table ref="refresh" @tableEmails="getCheckboxs" :url="tableUrl" :cols="tabelCol" :page="true" :type="type" :where="where"></ym-user-table>
    </div>
    <!-- 清空回收站 -->
    <el-dialog :title="title" class="cd-size-small reycling-station-clear-dialog" :close-on-click-modal="false" :visible.sync="isClearRecylingStation" append-to-body>
      <clear-recyling-station @close="getCloseindex" v-if="isClearRecylingStation" />
    </el-dialog>
  </el-container>

</template>
<script>
import YmUserTable from '../components/YmUserTable';
import config from '../config';
import ClearRecylingStation from '../components/ClearRecyclingStation';
export default {
  components: {
    YmUserTable,
    ClearRecylingStation
  },
  data() {
    return {
      tableUrl: '',
      tabelCol: '',
      type: 'get',
      where: {},
      tableEmails: [],
      title: '',
      isLoading: false,
      isClearRecylingStation: false
    };
  },
  created() {
    this.loadData();
  },
  watch: {
    $route: 'loadData'
  },
  mounted() {},
  methods: {
    loadData() {
      this.loadRecylingFileList();
    },
    getCheckboxs(tableEmails) {
      this.tableEmails = tableEmails;
    },
    clearFile() {
      //清空回收站
      this.tableEmails = [];
      this.$refs.refresh.setTableNoSelected();
      this.title = '清空回收站';
      this.isClearRecylingStation = true;
    },

    restoreFile() {
      let params = [];
      for (let a of this.tableEmails) {
        if (a.firstRecoverParnt) {
          this.$message({
            message: `请先恢复勾选数据的父文件夹`,
            type: 'warning'
          });
          return;
        } else {
          if (a.type === 0) {
            params.push({
              repoId: a.repoId,
              type: a.type,
              commitId: a.commitId,
              size: a.size,
              objName: a.objName
            });
          } else {
            params.push({
              p: `${a.parentDir}${a.objName}`,
              repoId: a.repoId,
              type: a.type,
              commitId: a.commitId,
              size: a.size,
              objName: a.objName
            });
          }
        }
      }
      this.restoreFileOperation(
        '文件',
        '/api/trash/revertList',
        '还原',
        'post',
        params
      );
    },

    loadRecylingFileList() {
      this.tableUrl = '/api/trash/queryTrashList';
      this.tabelCol = [
        [
          //标题栏
          {
            type: 'checkbox',
            width: 48
          },
          {
            field: 'objName',
            title: '名称',
            width: '30%',
            templet: function(d) {
              // 类型，0-文件库，1-文件夹，2-文件
              if (d.type === 0) {
                return `<span title="${d.objName}">
                          <svg class="icon mr5  fz20" aria-hidden="true">
                          <use xlink:href="${d.address}"></use></svg>
                          <i class="iconfont c-h">${
                            d.encrypted ? '&#xe693;' : ''
                          }</i>
                    ${d.objName}</span>`;
              } else if (d.type === 1) {
                return `<span title="${d.objName}">
                          <svg class="icon mr5  fz20" aria-hidden="true">
                          <use xlink:href="${d.address}"></use></svg>
                          <i class="iconfont">${
                            d.encrypted ? '&#xe693;' : ''
                          }</i>
                    ${d.objName}</span>`;
              } else if (d.type === 2) {
                return `<span title="${d.objName}">
                          <svg class="icon mr5  fz20" aria-hidden="true">
                          <use xlink:href="${d.address}"></use></svg>
                          <i class="iconfont">${
                            d.encrypted ? '&#xe693;' : ''
                          }</i>
                    ${d.objName}</span>`;
              }
            }
          },
          {
            field: 'size',
            title: '大小',
            width: '10%'
          },
          {
            field: 'parentDir',
            title: '路径',
            width: '20%',
            templet: function(d) {
              if (d.type === 0) {
                return `/`;
              } else {
                return `${d.repoName}${d.parentDir}`;
              }
            }
          },
          {
            field: 'type',
            title: '文件类型',
            width: '10%',
            templet: function(d) {
              if (d.type === 0) {
                return '<span>文件库</span>';
              } else if (d.type === 1) {
                return '<span>文件夹</span>';
              } else if (d.type === 2) {
                return '<span>文件</span>';
              }
            }
          },
          {
            field: 'delTime',
            title: '删除时间',
            width: '25%'
          }
        ]
      ];
    },

    // 清空删除文件或者文件库
    restoreFileOperation(name, url, operation, type, params) {
      this.$confirm(`此操作将${operation}该${name}, 是否继续?`, '提示', {
        closeOnClickModal: false,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.isLoading = true;
          this.$axios({
            method: type,
            url: url,
            data: params
          })
            .then(res => {
              if (res.data.code == 200) {
                setTimeout(() => {
                  this.getMemory();
                }, 3000);
                this.isLoading = false;
                this.$message({
                  type: 'success',
                  message: `${name}${operation}成功!`
                });
                this.tableEmails = [];
                this.$refs.refresh.reloadTable();
              }
            })
            .catch(error => {
              if (error.data && error.data.message) {
                this.isLoading = false;
                this.$message({
                  type: 'warning',
                  message: error.data.message
                });
                this.$refs.refresh.reloadTable();
              }
            });
        })
        .catch(() => {
          this.isLoading = false;
          this.$message({
            type: 'info',
            message: `已取消${operation}`
          });
        });
    },
    getCloseindex(data) {
      this[data.dialog] = false;
      this.tableEmails = [];
      if (data.index == 1) {
        this.tableEmails = [];
        this.$refs.refresh.reloadTable();
      }
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
              self.$parent.useMemory = (
                parseInt(res.data.data.usedStorage) /
                (1000 * 1000 * 1000)
              ).toFixed(2);
              self.$parent.totalMemory = (
                parseInt(res.data.data.totalStorage) /
                (1000 * 1000 * 1000)
              ).toFixed(2);
              self.$parent.memoryPercent =
                self.$parent.useMemory / self.$parent.totalMemory * 100;
            }
          })
          .catch(error => {
            if (error.data && error.data.message) {
              this.$message({
                type: 'warning',
                message: error.data.message
              });
            }
          });
      }
    }
  }
};
</script>
<style lang="less">
.reycling-station-container {
  .el-alert-container {
    .el-alert--info {
      background-color: #f2f9ff;
      border: 1px solid #96ccff;
      color: #666;
      font-size: 14px;
      margin-top: 6px;
      .el-icon-info {
        color: #42a0f8;
      }
      .el-alert__closebtn {
        font-size: 14px;
      }
    }
  }
  .el-button--mini {
    span {
      display: inline-block;
      height: 16px;
      line-height: 16px;
      .iconfont {
        vertical-align: top;
      }
    }
  }
}
</style>
