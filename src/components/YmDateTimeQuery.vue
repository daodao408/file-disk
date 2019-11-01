<template>
    <div class="el-log-timer-query">
        <span class="el-log-timer-query-text">时间查询:</span>
        <el-date-picker
          popper-class="log-time-picker"
          v-model="startVal"
          type="datetime"
          prefix-icon="el-icon-date"
          clear-icon="el-icon-circle-close-outline"
          size="mini"
          :picker-options="startDateOpt"
          placeholder="开始时间"
          @change="startValChange">
        </el-date-picker>
      <span class="el-log-timer-query-line">-</span>
      <el-date-picker
          popper-class="log-time-picker"
          v-model="endVal"
          type="datetime"
          prefix-icon="el-icon-date"
          clear-icon="el-icon-circle-close-outline"
          size="mini" 
          :picker-options="endDateOpt"
          placeholder="结束时间"
          @change="endValChange">
        </el-date-picker>
      <el-button class="el-log-timer-query-btn" size="mini" @click="dateTimeQuery"><i class="iconfont mr5 mt5">&#xe68a;</i>查询</el-button>   
    </div> 
</template>
<style lang="less">
.el-log-timer-query {
  float: right;
  margin-right: 10px;
  position: relative;
  .el-log-timer-query-text {
    display: inline-block;
    margin-right: 5px;
  }
  .el-input--mini {
    .el-input__inner {
      height: 32px;
      line-height: 32px;
    }
  }
  .el-log-timer-query-line {
    display: inline-block;
    margin-left: 4px;
    margin-right: 4px;
    color: #ccc;
  }
  .el-log-timer-query-btn {
    display: inline-block;
    margin-left: 20px;
  }
}
.log-time-picker {
  .el-date-picker__editor-wrap {
    .el-time-panel {
      width: 160px;
    }  
  }
}
</style>
<script>
export default {
  props: [],
  data() {
    return {
      startVal: '',
      endVal: '',
      // 校验时间控件
      startDateOpt: {
        disabledDate: time => {
          return time.getTime() > Date.now();
        }
      },
      endDateOpt: {
        disabledDate: time => {
          return (
            // 86400000为一天24小时的时间戳
            new Date(this.startVal).getTime() > time.getTime() + 86399999 ||
            time.getTime() > Date.now()
          );
        }
      }
    };
  },
  methods: {
    // 查询按钮点击
    dateTimeQuery() {
      this.$emit('logDateTimeQuery', {
        startTime: this.startVal,
        endTime: this.endVal
      });
    },
    startValChange(value) {
      if (value) {
        this.startVal = value;
      } else {
        this.startVal = '';
      }
      this.$emit('getStartValue', this.startVal);
    },
    endValChange(value) {
      if (value) {
        this.endVal = value;
      } else {
        this.endVal = '';
      }
      this.$emit('getEndValue', this.endVal);
    }
  },
  created() {
    // 默认一周前
    // let currTimesstamp = Date.parse(new Date());
    // this.startVal = formatDate(currTimesstamp - 7 * 24 * 3600 * 1000);
    // this.endVal = formatDate(currTimesstamp);
  }
};
</script>