<template>
    <el-container v-loading="isLoading">
        <el-header class="cd-title">用户管理</el-header>
        <div class="cd-bg-fff pt10 pb10 pl20 pr20 clearfix">
            <el-row>
                <el-button size="mini" @click="addUser()"><i class="iconfont mr5 mt5">&#xe890;</i>新建用户</el-button>
                <el-button type="danger" plain size="mini" @click="delUser()" :disabled="tableEmails.length==0"><i class="iconfont mr5 mt5">&#xe682;</i>删除</el-button>
                <el-button size="mini" @click="resetPassword()" :disabled="tableEmails.length==0"><i class="iconfont mr5 mt5">&#xe697;</i>重置密码</el-button>
                <el-button size="mini" @click="UserTotalStorage()" :disabled="tableEmails.length==0||tableEmails.length>1"><i class="iconfont mr5 mt5">&#xe695;</i>设置容量</el-button>
                <el-button size="mini" @click="switchRole()" v-show="manageDepartmentId == ''" :disabled="tableEmails.length==0||tableEmails.length>1"><i class="iconfont mr5 mt5">&#xe696;</i>切换身份</el-button>
                    <el-dropdown @command="handleClick"  size="medium">
                    <el-button size="mini">
                        更多操作<i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="import" v-if="!isDepartmentAdminFlag">用户导入</el-dropdown-item>
                        <el-dropdown-item command="export">用户导出</el-dropdown-item>                   
                    </el-dropdown-menu>
                </el-dropdown>
                <ym-search @search="searchData" :searchPlaceholder="'请输入关键字搜索用户'"/>
            </el-row>
        </div>            
        <div class="">
              <ym-user-table ref="refresh" @isActive="getActive" @tableEmails="getCheckboxs" :url="tableUrl" :cols="tabelCol" :page="true" :type="type" :where="where"></ym-user-table>
        </div>
        <el-dialog :title="title" class="cd-size-small" :close-on-click-modal="false"  :visible.sync="isUserTotalStorage" append-to-body>
          <user-total-storage :email="tableEmails[0].email" :totalStorage="totalStorage" @close="getCloseindex" v-if="isUserTotalStorage" />
        </el-dialog>
        <el-dialog :title="title" class="cd-size-small" :close-on-click-modal="false" :visible.sync="isAddUser" append-to-body>
          <add-user  @close="getCloseindex" v-if="isAddUser" />
        </el-dialog>
        <el-dialog :title="title" class="cd-size-small add-excel-user" :close-on-click-modal="false" :visible.sync="isAddExcelUser" append-to-body>
          <add-excel-user  @close="getCloseindex" v-if="isAddExcelUser" />
        </el-dialog>
        <!-- 切换身份 -->
        <el-dialog :title="title" class="cd-size-small" :close-on-click-modal="false" :visible.sync="isSwitchIdentity" append-to-body>
          <switch-identity @close="getCloseindex" :email="checkUserEmail" v-if="isSwitchIdentity" />
        </el-dialog>
    </el-container>
</template>
<script>
import YmUserTable from '../components/YmUserTable';
import UserTotalStorage from '../components/UserTotalStorage';
import AddUser from '../components/AddUser';
import AddExcelUser from '../components/AddExcelUser';
import YmSearch from '../components/YmSearch';
import SwitchIdentity from '../components/SwitchIdentity';

import config from '../config';
export default {
  components: {
    YmUserTable,
    UserTotalStorage,
    AddUser,
    AddExcelUser,
    YmSearch,
    SwitchIdentity
  },
  data() {
    return {
      keyUser: '',
      tableUrl: '',
      tabelCol: '',
      type: 'get',
      where: {},
      tableEmails: [],
      totalStorage: '',
      isUserTotalStorage: false,
      isAddUser: false,
      isAddExcelUser: false,
      title: '',
      isLoading: false,
      manageDepartmentId: '',
      isSwitchIdentity: false,
      checkUserEmail: '',
      isDepartmentAdminFlag: false
    };
  },
  created() {
    let user = sessionStorage.getItem('user');
    user = JSON.parse(user);
    this.manageDepartmentId = user.manageDepartmentId;
  },
  watch: {
    $route: 'loadData'
  },
  mounted() {
    this.loadData();
    if (
      sessionStorage.getItem('isStaff') &&
      sessionStorage.getItem('isStaff') == '2'
    ) {
      this.isDepartmentAdminFlag = true;
    }
  },
  methods: {
    searchData(keyValue) {
      this.keyUser = keyValue;
      this.loadUserList();
    },
    loadData() {
      this.loadUserList();
    },
    handleClick(command) {
      if (command == 'import') {
        this.addExcelUser();
      } else if (command == 'export') {
        this.exportExcelUser();
      }
    },
    addUser() {
      this.isAddUser = true;
      this.title = '新建用户';
    },
    getCloseindex(data) {
      this[data.dialog] = false;
      if (data.index == 1) {
        this.tableEmails = [];
        this.$refs.refresh.reloadTable();
      }
    },
    getCheckboxs(tableEmails) {
      this.tableEmails = tableEmails;
    },
    getActive(obj) {
      let params = {
        email: obj.data.email,
        statusCode: obj.data.isActive == 1 ? 0 : 1
      };
      this.isLoading = true;
      this.$axios({
        method: 'post',
        url: '/api/user/updateStatus',
        data: params
      })
        .then(res => {
          if (res.data.code == 200) {
            this.isLoading = false;
            this.$message({
              type: 'success',
              message: res.data.message
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
    },
    addExcelUser() {
      this.isAddExcelUser = true;
      this.title = '导入用户';
    },
    exportExcelUser() {
      this.isLoading = true;
      this.$axios({
        method: 'post',
        url: '/api/user/exportUserToExcel'
      })
        .then(res => {
          if (res.data.code == 200) {
            this.isLoading = false;
            this.$message({
              type: 'success',
              message: res.data.message
            });
            window.location = res.data.data;
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
    },
    delUser() {
      //this.del('用户','/api/user/deleteUser','删除','post');
      this.deleteUser('用户', '/api/user/getUserGroups', '删除', 'post');
    },
    resetPassword() {
      this.del('用户密码', `/api/user/resetPassword`, '重置', 'post');
    },
    switchRole() {
      //this.del('用户身份', `/api/user/switchRole`, '切换', 'post');
      this.checkUserEmail = this.tableEmails[0].email;
      this.title = '切换身份';
      this.isSwitchIdentity = true;
    },
    loadUserList() {
      let tempKeyWords = encodeURIComponent(this.keyUser);
      this.tableUrl = `/api/user/selectAllUsers?queryKey=${tempKeyWords}`;

      this.tabelCol = [
        [
          //标题栏
          { type: 'checkbox', width: 48 },
          { field: 'anotherName', title: '用户名', width: '10%' },
          { field: 'nickname', title: '姓名', width: '10%' },
          {
            field: 'isStaff',
            title: '用户身份',
            width: '11%',
            templet: function(d) {
              if (d.isStaff == 1) {
                return '管理员';
              } else if (d.isStaff == 2) {
                return '部门管理员';
              } else {
                return '用户';
              }
            }
          },
          {
            title: '状态',
            width: '5%',
            templet: function(d) {
              return `${d.isActive == 1 ? '激活' : '锁定'}`;
            }
          },
          {
            title: '已用空间/总容量',
            width: '10%',
            templet: function(d) {
              return `${d.usedStorage == null ? '0' : d.usedStorage}/${
                d.totalStorage
              }`;
            }
          },
          { field: 'departmentName', title: '所属根部门', width: '11%' },
          { field: 'createTime', title: '创建时间', width: '15%' },
          { field: 'lastTime', title: '最近登录时间', width: '15%' },
          {
            title: '激活/锁定',
            event: 'isActive',
            width: '8%',
            templet: function(d) {
              return `<button class="layui-btn layui-btn-normal layui-btn-sm">${
                d.isActive == 0 ? '激活' : '锁定'
              }</button>`;
            }
          }
        ]
      ];
    },
    UserTotalStorage() {
      this.title = '设置容量';
      this.totalStorage = this.tableEmails[0].shorage;
      this.isUserTotalStorage = true;
    },
    del(name, url, operation, type) {
      this.$confirm(`此操作将${operation}该${name}, 是否继续?`, '提示', {
        closeOnClickModal: false,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          let data;
          if (operation == '删除') {
            let emails = [];
            for (let a of this.tableEmails) {
              emails.push(a.email);
            }
            data = {
              emails: emails
            };
          } else if (operation == '重置') {
            let email = [];
            for (let a of this.tableEmails) {
              email.push({ email: a.email });
            }
            data = email;
          } else if (operation == '切换') {
            data = {
              roleCode: this.tableEmails[0].isStaff == 1 ? '0' : '1',
              email: this.tableEmails[0].email
            };
          }
          this.isLoading = true;
          this.$axios({
            method: type,
            url: url,
            data: data
          })
            .then(res => {
              if (res.data.code == 200) {
                this.isLoading = false;
                if (operation == '重置') {
                  this.$message({
                    type: 'success',
                    message: res.data.data
                  });
                } else {
                  this.$message({
                    type: 'success',
                    message: `${name}${operation}成功!`
                  });
                }
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

    deleteUser(name, url, operation, type) {
      let email = [];
      for (let a of this.tableEmails) {
        email.push({ email: a.email });
      }
      this.$axios({
        method: type,
        url: url,
        data: email
      }).then(res => {
        if (res.data.code == 200) {
          this.isLoading = false;
          if (res.data.data === 'success') {
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
                  url: '/api/user/delUserGroups',
                  data: email
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
          } else if (res.data.data === '用户创建了群组，是否确定要删除？') {
            this.$confirm(`用户创建了群组，是否确定要删除？`, '提示', {
              closeOnClickModal: false,
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })
              .then(() => {
                this.isLoading = true;
                this.$axios({
                  method: type,
                  url: '/api/user/delUserGroups',
                  data: email
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
          }
        }
      });
    }
  }
};
</script>