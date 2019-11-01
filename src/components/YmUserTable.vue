<template>
  <div class="clouddisk-table-container clearfix" v-loading.fullscreen.lock="fullscreenLoading">
    <div>
      <table class="layui-hide" id="test" lay-filter="table"></table>
    </div>
    <div class="table-count-info" ref="tableInfo"></div>
  </div>
</template>
<script>
export default {
  props: ['url', 'cols', 'page', 'type', 'where'],
  data() {
    return {
      tableObj: '',
      fullscreenLoading: false,
      tempLimit: '',
      tableArr: '',
      currentCur: null
    };
  },
  created() {},
  watch: {
    $route: 'loadData',
    url(newVal, oldVal) {
      this.loadData();
    }
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      let selt = this;
      selt.tableArr = [];
      this.fullscreenLoading = true;
      if (!selt.tempLimit) {
        selt.tempLimit = 10;
      }
      layui.use(['table'], function() {
        let table = layui.table;
        let element = layui.element;
        let $ = layui.$;
        selt.tableObj = table.render({
          elem: '#test',
          skin: 'line',
          even: false,
          method: selt.type,
          url: selt.url,
          cols: selt.cols,
          id: 'tableReload',
          response: {
            statusName: 'code',
            statusCode: 200
          },
          limit: selt.tempLimit,
          limits: [10, 20, 50],
          where: selt.where,
          page: Object.assign(selt.page, {
            layout: ['prev', 'page', 'next', 'limit', 'skip']
          }),
          done: function(res, curr, count) {
            if (res.count === 0) {
              selt.$refs.tableInfo.innerHTML = '';
            } else if (res.count > 0) {
              selt.$refs.tableInfo.innerHTML = `列表包含<span>${
                this.page.count
              }</span>条数据，共<span>${
                this.page.pages
              }</span>页，当前为第<span>${this.page.curr}</span>页`;
            }

            selt.currentCur = curr;
            selt.tableArr = [];
            selt.fullscreenLoading = false;
            selt.tempLimit = selt.tableObj.config.limit;
            // 删除当前页最后一条数据，跳转上一页
            if (res.data && res.data.length === 0 && curr > 1) {
              //selt.tableObj.config.page.curr = curr - 1;
              selt.reloadTable(curr);
            }
          }
        });
        table.on('tool(table)', function(obj) {
          if (obj.event === 'nextTable') {
            selt.$emit('nextTableEvent', obj);
          } else if (obj.event === 'isActive') {
            selt.$emit('isActive', obj);
          } else if (obj.event === 'nextTableFile') {
            if (obj.data.type == 'file') {
              return false;
            }
            selt.$emit('nextTableEvent', obj);
          }
        });
        table.on('checkbox(table)', function(obj) {
          if (obj.checked) {
            if (obj.type == 'all') {
              // 设置头部checkbox选中
              $('.layui-table thead tr')
                .find('.layui-form-checkbox')
                .siblings('input')[0].checked = true;
              // 添加头部checkbox选中样式
              $('.layui-table thead tr')
                .find('.layui-form-checkbox')
                .addClass('layui-form-checked');
              let tempValue = table.cache['tableReload'].concat();
              selt.tableArr = tempValue;
              selt.$emit('tableEmails', tempValue);
              return false;
            } else {
              // 如果点击之后个数与表格展示的总数相等，则头部checkbox选中，否则不选中
              if (
                selt.tableArr.length + 1 ===
                table.cache['tableReload'].length
              ) {
                $('.layui-table thead tr')
                  .find('.layui-form-checkbox')
                  .siblings('input')[0].checked = true;
                $('.layui-table thead tr')
                  .find('.layui-form-checkbox')
                  .addClass('layui-form-checked');
              } else {
                $('.layui-table thead tr')
                  .find('.layui-form-checkbox')
                  .siblings('input')[0].checked = false;
                $('.layui-table thead tr')
                  .find('.layui-form-checkbox')
                  .removeClass('layui-form-checked');
              }
              selt.tableArr.push(obj.data);
            }
          } else {
            if (obj.type == 'all') {
              // 设置头部checkbox未选中
              $('.layui-table thead tr')
                .find('.layui-form-checkbox')
                .siblings('input')[0].checked = false;
              // 添加头部checkbox未选中样式
              $('.layui-table thead tr')
                .find('.layui-form-checkbox')
                .removeClass('layui-form-checked');
              selt.tableArr = [];
              selt.$emit('tableEmails', []);
              return false;
            } else {
              $('.layui-table thead tr')
                .find('.layui-form-checkbox')
                .siblings('input')[0].checked = false;
              // 添加头部checkbox未选中样式
              $('.layui-table thead tr')
                .find('.layui-form-checkbox')
                .removeClass('layui-form-checked');
              // selt.tableArr.splice(
              //   selt.tableArr.findIndex(
              //     item => item.LAY_TABLE_INDEX === obj.data.LAY_TABLE_INDEX
              //   ),
              //   1
              // );
            }
          }
          selt.tableArr = table.checkStatus('tableReload').data;
          selt.$emit('tableEmails', selt.tableArr);
        });
        table.on('radio(table)', function(obj) {
          selt.tableArr.length = 0;
          selt.tableArr.push(obj.data);
          selt.$emit('tableEmails', selt.tableArr);
        });
      });
    },
    reloadTable(curr) {
      this.fullscreenLoading = true;
      if (curr) {
        // 删除当前页最后一条数据，跳转上一页
        this.tableObj.reload({
          page: {
            curr: curr - 1
          },
          where: this.where
        });
      } else {
        this.tableObj.reload('tableReload', {
          where: this.where
        });
      }
    },

    // 设置表格全部取消选中
    setTableNoSelected() {
      let $ = layui.$;
      // 设置表格头部head的checkbox未选中，以及移除选中的样式
      $('.layui-table thead tr')
        .find('.layui-form-checkbox')
        .removeClass('layui-form-checked');
      $('.layui-table thead tr')
        .find('.layui-form-checkbox')
        .siblings('input')[0].checked = false;
      // 表格tr循环，设置表格每一行的checkbox未选中，以及移除选中的样式
      let checkbox = $('.layui-table tbody tr');
      $.each(checkbox, function(key, val) {
        $(val)
          .find('.layui-form-checkbox')
          .removeClass('layui-form-checked');
        $(val)
          .find('.layui-form-checkbox')
          .siblings('input')[0].checked = false;
      });
      this.tableArr = [];
      this.$emit('tableEmails', []);
    },

    //获取表格当前页
    getCurrentCur() {
      return this.currentCur;
    }
  }
};
</script>
<style lang="less">
.clouddisk-table-container {
  position: relative;
  padding-bottom: 20px;
  .layui-table-box thead {
    tr {
      background-color: #fff;
      th {
        padding: 6px 0;
        .layui-table-cell {
          color: #999;
          padding: 0 6px;
        }
      }
    }
  }
  .layui-table-box tr {
    &.layui-table-hover {
      background-color: #eaf5ff;
      .layui-table-grid-down {
        display: none;
      }
    }
    &:hover {
      background-color: #eaf5ff;
    }
  }
  .layui-table {
    tbody tr {
      &:hover {
        background-color: #eaf5ff;
      }
      td {
        padding: 6px 0;
        .layui-table-cell {
          padding: 0 6px;
          a {
            color: #666;
            &.cs-p {
              &:hover {
                color: #42a0f8;
              }
            }
          }
        }
      }
    }
  }

  .layui-table-box {
    border-bottom: 1px solid #e6e6e6;
  }
  .layui-table-page {
    float: right;
    text-align: right;
    width: 100%;
    padding-top: 20px;
    padding-right: 20px;
    height: auto;
    border: none;
    input {
      cursor: pointer;
      &:hover {
        border: 1px solid #42a0f8 !important;
      }
      &:focus {
        border: 1px solid #42a0f8 !important;
      }
    }
    select {
      cursor: pointer;
      &:hover {
        border: 1px solid #42a0f8 !important;
      }
      &:focus {
        border: 1px solid #42a0f8 !important;
      }
    }
    button {
      cursor: pointer;
      &:hover {
        border: 1px solid #42a0f8 !important;
      }
      &:focus {
        border: 1px solid #42a0f8 !important;
      }
    }
    a {
      cursor: pointer;
      &:hover {
        color: #42a0f8;
      }
    }
  }
  .table-count-info {
    position: absolute;
    left: 20px;
    bottom: 20px;
    width: 40%;
    white-space: nowrap;
    color: #999;
    span {
      color: #333;
      padding: 0 4px;
    }
  }
}
</style>
