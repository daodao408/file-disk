<template>
    <el-container v-loading="isLoading">
        <el-header class="cd-title">我的共享</el-header>
        <div class="cd-bg-fff pt10 pb10 pl10 clearfix">
            <el-row>
                <el-button size="mini" @click="quitShare" :disabled="tableEmails.length===0"><i class="iconfont mr5 mt5">&#xe68f;</i>退出共享</el-button>  
                <!-- <ym-search :searchPlaceholder="'请输入关键字搜索全部文件'"/>            -->
            </el-row>
        </div>            
        <!-- <div class="">
              <ym-user-table ref="refresh" @tableEmails="getCheckboxs" :url="tableUrl" :cols="tabelCol" :page="true" :type="type" :where="where"></ym-user-table>
        </div> -->
        <div>
          <el-table
            v-loading="loading" 
            element-loading-text="正在加载......"
            :data="tableData"
            @row-click="rowClick"
            border
            style="width: 100%">
            <!-- <el-table-column width="80">
              <template slot-scope="props">
                  <span class="tran_box">
                    <el-checkbox v-model="props.row.selected"></el-checkbox>
                  </span>
              </template>
            </el-table-column> -->
            <el-table-column label="" width="50">
              <template scope="scope">
                <el-radio :label="scope.$index" v-model="radio" @change.native="getCurrentRow(scope.$index,scope.row)">&nbsp;</el-radio>
              </template>
            </el-table-column>
            <el-table-column
              prop="shareObjName"
              label="名称">
            </el-table-column>
            <el-table-column
              prop="size"
              label="大小">
            </el-table-column>
            <el-table-column
              prop="path"
              label="路径">
            </el-table-column>
            <el-table-column
              prop="type"
              label="文件类型">
            </el-table-column>
            <el-table-column
              prop="shareUsers"
              label="共享对象">
            </el-table-column>
            <el-table-column
              prop="cTime"
              label="更新时间">
            </el-table-column>
          </el-table>
          <el-pagination
            @size-change="handleSizeChange"
            background
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50]"
            :page-size="limit"
            layout="prev, pager, next, jumper, total, sizes"
            :total="totalCount">
          </el-pagination>
        </div>
    </el-container>
    
</template>
<script>
//import YmUserTable from "../components/YmUserTable";

import config from '../config';
export default {
  // components: {
  //   YmUserTable
  // },
  data() {
    return {
      tableUrl: '',
      tabelCol: '',
      type: 'get',
      where: {},
      tableEmails: [],
      title: '',
      isLoading: false,
      currentPage: 1,
      limit: 10,
      tableData: [],
      totalCount: 0,
      templateSelection: null
    };
  },
  created() {
    this.loadData(1, 10);
  },
  watch: {
    // $route: "loadData"
  },
  mounted() {},
  methods: {
    loadData(currentPage, limit) {
      //this.loadRecylingFileList();
      this.$axios({
        method: 'get',
        url:
          '/api/repos/getMyShared?page=' +
          currentPage +
          '&limit=' +
          limit +
          '&t=' +
          Date.parse(new Date()) / 1000
      })
        .then(res => {
          if (res.data.code == 200) {
            this.tableData = res.data.data;
            this.totalCount = res.data.count;
          }
        })
        .catch(error => {
          this.$message({ type: 'warning', message: error.message });
        });
    },
    rowClick(row, column, cell, event) {
      this.currentId = row.id;
    },
    getCurrentRow(index, row) {
      console.log(index);
      console.log(row);
      this.templateSelection = row;
    },
    getCheckboxs(tableEmails) {
      this.tableEmails = tableEmails;
    },

    loadRecylingFileList() {
      this.tableUrl = '/api/repos/getMyShared';
      this.tabelCol = [
        [
          //标题栏
          { type: 'checkbox' },
          {
            field: 'shareObjName',
            title: '名称',
            width: '20%',
            templet: function(d) {
              // 类型，0-文件库，1-文件夹，2-文件
              if (d.type === 0) {
                return `<span>
                          <svg class="icon mr5  fz20" aria-hidden="true">
                          <use xlink:href="#icon-yunpantubiao-11"></use>
                          <i class="iconfont c-h">${
                            d.encrypted ? '&#xe693;' : ''
                          }</i>
                    ${d.shareObjName}</span>`;
              } else if (d.type === 1) {
                return `<span>
                          <svg class="icon mr5  fz20" aria-hidden="true">
                          <use xlink:href="#icon-yunpantubiao-7"></use>
                          <i class="iconfont">${
                            d.encrypted ? '&#xe693;' : ''
                          }</i>
                    ${d.shareObjName}</span>`;
              } else if (d.type === 2) {
                return `<span>
                          <svg class="icon mr5  fz20" aria-hidden="true">
                          <use xlink:href="#icon-yunpantubiao-48"></use>
                          <i class="iconfont">${
                            d.encrypted ? '&#xe693;' : ''
                          }</i>
                    ${d.shareObjName}</span>`;
              }
            }
          },
          { field: 'size', title: '大小', width: '8%' },
          {
            field: 'path',
            title: '路径',
            width: '19%'
            // templet: function(d) {
            //   if (d.type === 0) {
            //     return ``;
            //   } else {
            //     let tempRepoName, tempPath;
            //     if (!d.repoName) {
            //       tempRepoName = "";
            //     } else {
            //       tempRepoName = d.repoName;
            //     }
            //     if (!d.path) {
            //       tempPath = "";
            //     } else {
            //       tempPath = d.path;
            //     }
            //     return `${tempRepoName}${tempPath}`;
            //   }
            // }
          },
          {
            field: 'type',
            title: '文件类型',
            width: '8%',
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
            width: '20%',
            templet: function(d) {
              let shareUsersArr = [];
              if (d.shareUsers && d.shareUsers.length > 0) {
                for (let item of d.shareUsers) {
                  shareUsersArr.push(item.name);
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
          },
          { field: 'cTime', title: '更新时间', width: '25%' }
        ]
      ];
    },

    handleSizeChange(limit) {
      this.pageSize = limit;
      this.currentPage = 1;
      this.loadData(1, limit);
      // console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage;
      this.loadData(currentPage, this.pageSize);
      // console.log(`当前页: ${val}`);
    },

    quitShare() {
      let params = [];
      console.log(this.tableEmails);
      for (let item of this.tableEmails) {
        // if (item.type === 0) {
        //   params.push({
        //     token: item.token,
        //     repoId: item.repoId,
        //     path: "",
        //     type: item.type,
        //     shareUsers: item.shareUsers
        //   });
        // } else {
        //   params.push({
        //     token: item.token,
        //     repoId: item.repoId,
        //     path: item.path,
        //     type: item.type,
        //     shareUsers: item.shareUsers
        //   });
        // }
        params.push({
          token: item.token,
          repoId: item.repoId,
          path: item.path,
          type: item.type,
          shareUsers: item.shareUsers
        });
      }
      this.quitShareOperation(
        '所选文件',
        '/api/repos/cancleMyShared',
        '退出共享',
        'post',
        params
      );
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
              this.isLoading = false;
              this.$message({
                type: 'warning',
                message: error.message
              });
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
};
</script>
<style>
.tran_box .el-checkbox__inner {
  border-radius: 9px;
}
</style>
