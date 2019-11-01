<template>
  <div class="cd-layer">
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" class="cd-el-form" :label-position="top">
      <el-form-item label="群组转让给：" prop="anotherName">
        <el-input placeholder="请输入用户名称,只能转给一个人!" v-model="ruleForm.anotherName" @focus="inputTree =true" auto-complete="off">
        </el-input>
        <div class="input-tree" v-show="inputTree">
          <el-scrollbar>
            <el-tree class="filter-tree" :data="data4" :default-expand-all="false" :filter-node-method="filterNode" @node-click="handleNodeClick"
              ref="tree">
              <span class="custom-tree-node" slot-scope="{ node, data }">
                <span>
                  <i class="iconfont" v-if="data.email">&#xe694;</i>{{ data.organizationName }}</span>
              </span>
            </el-tree>
          </el-scrollbar>
        </div>
      </el-form-item>
      <el-form-item class="t-c cd-sure-btn">
        <el-button size="mini" @click="closelayer()">取消</el-button>
        <el-button class="ml20" type="primary" size="mini" @click="submitForm('ruleForm')" :loading="loading">确定</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  props: ['groupid'],
  components: {},
  data() {
    return {
      obj: [],
      path: '',
      keyValue: '',
      data4: [],
      loading: false,
      ruleForm: {
        anotherName: '',
        groupId: this.groupid,
        email: ''
      },
      rules: {
        anotherName: [
          {
            required: true,
            message: '请输入用户名称',
            trigger: 'change'
          },
          {
            min: 0,
            max: 20,
            message: '长度在 0 到 20 个字符',
            trigger: 'change'
          }
        ]
      },
      inputTree: false,
      selectValue: '',
      selectTree: false
    };
  },
  created() {
    this.setTitle();
  },
  watch: {
    groupid(newVal, oldVal) {
      this.inputTree = false;
      this.ruleForm.anotherName = '';
    },
    'ruleForm.anotherName': function(val) {
      if (this.selectValue != val) {
        this.selectTree = false;
      }
      this.$refs.tree.filter(val);
    }
  },
  methods: {
    append(data) {
      const newChild = {
        id: id++,
        label: 'testtest',
        children: []
      };
      if (!data.children) {
        this.$set(data, 'children', []);
      }
      data.children.push(newChild);
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.organizationName.indexOf(value) !== -1;
    },
    setTitle() {
      this.loadobjList();
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (!this.selectTree) {
            this.$message({
              type: 'warning',
              message: '请选择部门下的成员'
            });
            return false;
          }
          this.loading = true;
          this.$axios({
            method: 'post',
            url: '/api/group/transferGroup',
            data: {
              email: this.ruleForm.email,
              groupId: this.groupid
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
                  dialog: 'isTransferGroup'
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
                  dialog: 'isTransferGroup'
                });
              }
            });
        }
      });
    },
    closelayer() {
      this.$emit('close', {
        index: 0,
        dialog: 'isTransferGroup'
      });
    },
    handleNodeClick(data) {
      // debugger
      if (data.email) {
        this.ruleForm.anotherName = data.organizationName;
        this.ruleForm.email = data.email;
        this.inputTree = false;
        this.selectTree = true;
        this.selectValue = data.organizationName;
      } else {
        //    this.$message('请选择部门下的成员');
      }
    },
    loadobjList() {
      this.$axios({
        method: 'get',
        url: `/api/organization/queryUser`
      })
        .then(res => {
          if (res.data.code == 200) {
            this.data4 = res.data.data;
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
