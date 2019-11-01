<template>
  <el-container v-loading="isLoading">
    <el-header class="cd-title">我的共享</el-header>
    <div class="cd-bg-fff pt10 pb10 pl20 clearfix">
      <el-row>
        <el-button size="mini" @click="quitShare" :disabled="tableEmails.length===0 || tableEmails.length > 1">
          <i class="iconfont mr5 mt5">&#xe6c0;</i>取消共享</el-button>
      </el-row>
    </div>
    <div class="">
      <ym-user-table ref="refresh" @tableEmails="getCheckboxs" :url="tableUrl" :cols="tabelCol" :page="true" :type="type" :where="where"></ym-user-table>
    </div>
    <!-- 退出共享 -->
    <el-dialog :title="title" class="cd-size-small quit-share-users-pop" :close-on-click-modal="false" :visible.sync="isQuitShareUsers" append-to-body>
      <quit-share-users :shareUserData="shareUserData" @close="getCloseindex" v-if="isQuitShareUsers" />
    </el-dialog>
  </el-container>

</template>
<script>
import YmUserTable from '../components/YmUserTable';
import QuitShareUsers from '../components/QuitShareUsers';
import config from '../config';
export default {
  components: {
    YmUserTable,
    QuitShareUsers
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
      isQuitShareUsers: false,
      shareUserData: null
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

    loadRecylingFileList() {
      this.tableUrl = '/api/repos/getMyShared';
      this.tabelCol = [
        [
          //标题栏
          {
            type: 'radio',
            width: 48
          },
          {
            field: 'shareObjName',
            title: '名称',
            width: '30%',
            templet: function(d) {
              // 类型，0-文件库，1-文件夹，2-文件
              if (d.type === 0) {
                return `<span title="${d.shareObjName}">
                          <svg class="icon mr5  fz20" aria-hidden="true">
                          <use xlink:href="${d.address}"></use></svg>
                          <i class="iconfont c-h">${
                            d.encrypted ? '&#xe693;' : ''
                          }</i>
                    ${d.shareObjName}</span>`;
              } else if (d.type === 1) {
                return `<span title="${d.shareObjName}">
                          <svg class="icon mr5  fz20" aria-hidden="true">
                          <use xlink:href="${d.address}"></use></svg>
                          <i class="iconfont">${
                            d.encrypted ? '&#xe693;' : ''
                          }</i>
                    ${d.shareObjName}</span>`;
              } else if (d.type === 2) {
                return `<span title="${d.shareObjName}">
                          <svg class="icon mr5  fz20" aria-hidden="true">
                          <use xlink:href="${d.address}"></use></svg>
                          <i class="iconfont">${
                            d.encrypted ? '&#xe693;' : ''
                          }</i>
                    ${d.shareObjName}</span>`;
              }
            }
          },
          {
            field: 'size',
            title: '大小',
            width: '10%'
          },
          {
            field: 'path',
            title: '路径',
            width: '20%',
            templet: function(d) {
              if (d.type === 0) {
                return `${d.path}`;
              } else {
                return `${d.repoName}${d.path}`;
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
            field: 'shareUsers',
            title: '共享对象',
            width: '25%',
            templet: function(d) {
              let shareUsersArr = [];
              if (d.shareUsers && d.shareUsers.length > 0) {
                for (let item of d.shareUsers) {
                  if (item.name) {
                    shareUsersArr.push(item.name);
                  } else {
                    shareUsersArr.push(item.email);
                  }
                }
              }
              if (shareUsersArr.length > 1) {
                return `<span title="${shareUsersArr.join(
                  ','
                )}">${shareUsersArr.join(',')}</span>`;
              } else if (shareUsersArr.length === 1) {
                return `<span title="${shareUsersArr.join(
                  ''
                )}">${shareUsersArr.join('')}</span>`;
              } else {
                return '';
              }
            }
          }
          // { field: "cTime", title: "更新时间", width: "25%" }
        ]
      ];
    },

    quitShare() {
      let params = [];
      if (
        this.tableEmails[0].shareUsers &&
        this.tableEmails[0].shareUsers.length === 1
      ) {
        for (let item of this.tableEmails) {
          params.push({
            token: item.token,
            repoId: item.repoId,
            path: item.path,
            type: item.type,
            shareUsers: item.shareUsers,
            size: item.size
          });
        }
        this.quitShareOperation(
          '所选文件',
          '/api/repos/cancleMyShared',
          '退出共享',
          'post',
          params
        );
      } else if (
        this.tableEmails[0].shareUsers &&
        this.tableEmails[0].shareUsers.length > 1
      ) {
        this.title = '取消共享';
        this.isQuitShareUsers = true;
        this.shareUserData = this.tableEmails[0];
      }
    },

    // 退出共享
    quitShareOperation(name, url, operation, type, params) {
      this.$confirm(`此操作将${name}${operation}, 是否继续?`, '提示', {
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
      if (data.index == 1) {
        this.tableEmails = [];
        this.$refs.refresh.reloadTable();
      }
    }
  }
};
</script>
<style scope lang="less">
.layui-unselect {
  &.layui-form-radio {
    i {
      color: #ddd;
    }
    i:hover {
      color: #42a0f8;
    }
    span {
      display: none;
    }
  }
  &.layui-form-radioed {
    i {
      color: #42a0f8;
    }
  }
}
</style>
