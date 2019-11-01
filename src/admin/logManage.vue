<template>
  <el-container v-loading="isLoading">
    <el-header class="cd-title">日志管理</el-header>
    <div class="cd-bg-fff pt10 pb10 pl20 clearfix">
      <el-row>
        <el-button size="mini" @click="logExport">
          <i class="iconfont mr5 mt5">&#xe6bd;</i>导出</el-button>
        <ym-date-time-query @logDateTimeQuery="logDateTimeQuery" @getStartValue="getStartValue" @getEndValue="getEndValue"></ym-date-time-query>
      </el-row>
    </div>
    <div class="">
      <ym-user-table ref="refresh" :url="tableUrl" :cols="tabelCol" :page="true" :type="type" :where="where"></ym-user-table>
    </div>
  </el-container>

</template>
<script>
import YmUserTable from '../components/YmUserTable';
import YmDateTimeQuery from '../components/YmDateTimeQuery';
import config from '../config';
import { formatDate } from '../utils/filter.js';
export default {
  components: {
    YmUserTable,
    YmDateTimeQuery
  },
  data() {
    return {
      tableUrl: '',
      tabelCol: '',
      type: 'get',
      where: {},
      //tableEmails: [],
      title: '',
      isLoading: false,
      operateTimeStart: '',
      operateTimeEnd: ''
    };
  },
  created() {
    this.loadLogsList();
  },
  watch: {
    $route: 'loadLogsList'
  },
  mounted() {},
  methods: {
    loadData() {
      this.loadLogsList();
    },
    // getCheckboxs(tableEmails) {
    //   this.tableEmails = tableEmails;
    // },

    loadLogsList() {
      this.tableUrl = `/api/logs/getLog?operateTimeStart=${
        this.operateTimeStart
      }&operateTimeEnd=${this.operateTimeEnd}`;
      this.tabelCol = [
        [
          //标题栏
          {
            field: 'operationName',
            title: '操作类型',
            width: '13%'
          },
          {
            field: 'userName',
            title: '操作人',
            width: '15%'
          },
          {
            field: 'userEmail',
            title: '操作人真实姓名',
            width: '15%'
          },
          {
            field: 'type',
            title: '操作详情',
            width: '20%',
            templet: function(d) {
              return `<span title="${d.operationDetail}${d.operationObj}">${
                d.operationDetail
              }${d.operationObj}</span>`;
            }
          },
          {
            field: 'shareUsers',
            title: '操作状态',
            width: '12%',
            templet: function(d) {
              if (d.operationResult === 1) {
                return `<span class="operation-status-container"><i class="operation-success"></i><b>操作成功</b></span>`;
              } else if (d.operationResult === 0) {
                return `<span class="operation-status-container"><i class="operation-failure"></i><b>操作失败</b></span>`;
              }
            }
          },
          {
            field: 'operationTime',
            title: '操作时间',
            width: '25%'
          }
        ]
      ];
    },

    // 开始时间和结束时间赋值
    getStartValue(startTime) {
      if (startTime) {
        this.operateTimeStart = formatDate(startTime);
      } else {
        this.operateTimeStart = '';
      }
    },

    getEndValue(endTime) {
      if (endTime) {
        this.operateTimeEnd = formatDate(endTime);
      } else {
        this.operateTimeEnd = '';
      }
    },

    // 日志导出
    logExport() {
      this.isLoading = true;
      this.$axios({
        method: 'post',
        url: `/api/logs/exportLog?operateTimeStart=${
          this.operateTimeStart
        }&operateTimeEnd=${this.operateTimeEnd}`
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

    // 日志根据时间过滤查询
    logDateTimeQuery(data) {
      if (data.startTime) {
        this.operateTimeStart = formatDate(data.startTime);
      } else {
        this.operateTimeStart = '';
      }
      if (data.endTime) {
        this.operateTimeEnd = formatDate(data.endTime);
      } else {
        this.operateTimeEnd = '';
      }
      this.loadLogsList();
    }
  }
};
</script>
<style lang="less">
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

.operation-status-container {
  display: inline-block;
  height: 28px;
  line-height: 28px;
}

.operation-status-container i {
  display: inline-block;
  font-style: normal;
  width: 10px;
  height: 10px;
  -webkit-border-radius: 10px;
  -moz-border-radius: 10px;
  border-radius: 10px;
  vertical-align: top;
  margin-top: 9px;
  margin-right: 8px;
}

.operation-status-container i.operation-success {
  background-color: #23ca85;
}

.operation-status-container i.operation-failure {
  background-color: #f05468;
}

.operation-status-container b {
  font-weight: normal;
  vertical-align: top;
}
</style>
