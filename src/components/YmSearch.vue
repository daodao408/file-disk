<template>
  <el-input :placeholder="searchPlaceholder" v-model="keyValue" :maxlength="40" @keyup.enter.native="doEnterSearch" @keyup.8.native="backspaceSearch"
    auto-complete="off" class="input-with-select cd-search" size="small">
    <i slot="suffix" class="el-input__icon el-icon-search cs-p" @click="doSearch()"></i>
  </el-input>
</template>
<style lang="less">
.el-select .el-input {
  width: 130px;
}

.input-with-select .el-input-group__prepend {
  background-color: #fff;
}

.cd-search {
  &.el-input {
    width: auto;
  }
  &:hover {
    .el-input__inner {
      border: 1px solid #42a0f8;
    }
    .el-input__icon {
      color: #42a0f8;
    }
  }
  .el-input__inner {
    border-top-left-radius: 25px;
    border-top-right-radius: 25px;
    border-bottom-right-radius: 25px;
    border-bottom-left-radius: 25px;
  }
  .el-input__icon {
    &:hover {
      color: #42a0f8;
    }
  }
}

.cd-search {
  float: right;
  margin-right: 0px;
  .el-input__inner {
    width: 220px;
  }
  .el-input__inner:focus {
    width: 310px;
  }
}
</style>
<script>
export default {
  props: ['searchPlaceholder'],
  data() {
    return {
      keyValue: ''
    };
  },
  methods: {
    doSearch() {
      this.$emit('search', this.keyValue);
    },
    doEnterSearch(e) {
      this.$emit('search', this.keyValue);
    },
    backspaceSearch(e) {
      this.$emit('search', this.keyValue);
    }
  },
  created() {}
};
</script>
