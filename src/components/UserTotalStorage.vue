<template>
  <div class="cd-layer">
    <el-form class="cd-el-form">
      <el-form-item>
        <p>设置后容量(G)</p>
        <el-input v-model="storage" placeholder="请输入容量值" auto-complete="off">
          <template slot="append">G</template>
        </el-input>
        <p class="c-9 fz12">大于等于 0 的整数，设置为0表示重置为默认容量20G，最大容量为30G。</p>
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
  props: ['email', 'totalStorage'],
  components: {},
  data() {
    return {
      loading: false
      //storage:this.totalStorage
    };
  },
  created() {},
  watch: {},
  methods: {
    submitForm() {
      this.loading = true;
      this.$axios({
        method: 'post',
        url: '/api/user/updateTotalStorage',
        data: {
          email: this.email,
          totalStorage: this.storage
        }
      })
        .then(res => {
          if (res.data.code == 200) {
            this.loading = false;
            this.$message({
              message: res.data.message,
              type: 'success'
            });
            this.$emit('close', {
              index: 1,
              dialog: 'isUserTotalStorage'
            });
          }
        })
        .catch(error => {
          if (error.data && error.data.message) {
            this.loading = false;
            this.$message({
              type: 'warning',
              message: error.data.message
            });
            this.$emit('close', {
              index: 0,
              dialog: 'isUserTotalStorage'
            });
          }
        });
    },
    closelayer() {
      this.$emit('close', {
        index: 0,
        dialog: 'isUserTotalStorage'
      });
    }
  }
};
</script>
<style scoped lang="less">
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.demonstration {
  margin-bottom: 10px;
}

.el-form-item {
  margin-bottom: 0;
}

.el-tree {
  max-height: 230px;
}

.ed-layer {
  text-align: center;
  position: fixed;
  bottom: 10px;
  left: 0;
  width: 100%;
  border-top: 1px solid #ddd;
  padding-top: 10px;
}
</style>
