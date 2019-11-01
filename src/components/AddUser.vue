<template>
  <div class="add-user-container">
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" class="cd-el-form" label-width="80px">
      <el-form-item label="用户名" prop="anotherName">
        <el-input v-model="ruleForm.anotherName" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="用户姓名" prop="nickname">
        <el-input v-model="ruleForm.nickname" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="部门" prop="department">
        <el-input placeholder="输选择部门" v-model="departmentName" readonly auto-complete="off" @focus="inputTree =true">
        </el-input>
        <div class="input-tree" v-show="inputTree">
          <el-scrollbar>
            <el-tree class="filter-tree" :data="eventCategoryTree" :props="defaultProps" :default-expand-all="false" :filter-node-method="filterNode"
              @node-click="handleNodeClick" ref="tree2">
              <span class="custom-tree-node" slot-scope="{ node, data }">
                <span :title="data.organizationName">{{ data.organizationName }}</span>
              </span>
            </el-tree>
          </el-scrollbar>
        </div>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="ruleForm.email" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="passwordNoBase64">
        <el-input type="password" v-model="ruleForm.passwordNoBase64" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="checkPassNoBase64">
        <el-input type="password" v-model="ruleForm.checkPassNoBase64" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item class="cd-sure-btn t-c">
        <el-button size="mini" @click="close()">取消</el-button>
        <el-button type="primary" size="mini" @click="submitForm('ruleForm')" :loading="loading">确定</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import base64 from '../utils/base64';
export default {
  components: {},
  data() {
    var validatePass = (rule, value, callback) => {
      if (value.length == 0) {
        callback(new Error('请输入密码'));
      } else if (value !== this.ruleForm.passwordNoBase64) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    return {
      ruleForm: {
        nickname: '',
        anotherName: '',
        email: '',
        department: '',
        passwordNoBase64: '',
        password: '',
        checkPassNoBase64: '',
        checkPass: ''
      },
      loading: false,
      departmentName: '',
      eventCategoryTree: [],
      inputTree: false,
      rules: {
        nickname: [
          {
            required: true,
            message: '请输入用户姓名',
            trigger: 'blur'
          },
          {
            max: 20,
            message: '用户名最多20个字符',
            trigger: 'blur'
          }
        ],
        anotherName: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            max: 20,
            message: '用户姓名最多20个字符',
            trigger: 'blur'
          }
        ],
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          },
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: 'blur,change'
          }
        ],
        passwordNoBase64: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          {
            min: 5,
            message: '密码至少需要5个字符',
            trigger: 'blur'
          }
        ],
        department: [
          {
            required: true,
            message: '请选择部门'
          }
        ],
        checkPassNoBase64: [
          {
            validator: validatePass,
            required: true,
            trigger: 'blur'
          },
          {
            min: 5,
            message: '密码至少需要5个字符',
            trigger: 'blur'
          }
        ]
      },
      psKey: 'cloudDisk'
    };
  },
  created() {
    this.setTitle();
  },
  watch: {
    $route: function() {
      this.setTitle();
    }
  },
  methods: {
    setTitle() {
      this.loadTree();
    },
    submitForm(ruleForm) {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.ruleForm.checkPass = base64.encode(
            this.psKey + this.ruleForm.checkPassNoBase64
          );
          this.ruleForm.password = base64.encode(
            this.psKey + this.ruleForm.passwordNoBase64
          );
          this.loading = true;
          this.$axios({
            method: 'post',
            url: '/api/user/addUser',
            data: this.ruleForm
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
                  dialog: 'isAddUser'
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
              }
            });
        } else {
          this.loading = false;
          return false;
        }
      });
    },
    loadTree() {
      this.$axios({
        method: 'get',
        url: '/api/organization'
      })
        .then(res => {
          if (res.data.code == 200) {
            this.eventCategoryTree = res.data.data;
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
    },
    handleNodeClick(data) {
      this.departmentName = data.organizationName;
      this.ruleForm.department = data.id;
      this.inputTree = false;
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    close() {
      this.$emit('close', {
        index: 0,
        dialog: 'isAddUser'
      });
    },
    cancelHandler() {}
  }
};
</script>
<style lang="less">
/* .cd-user-layer{
        margin: 10px 50px 10px 10px;
    } */

.add-user-container {
  .cd-sure-btn {
    .el-form-item__content {
      padding-right: 80px;
    }
  }
  .demo-ruleForm {
    padding: 20px 30px 10px;
    .el-form-item__label {
      line-height: 25px !important;
      height: 25px;
      display: block;
    }
  }
  .input-tree {
    border: 1px solid #ddd;
    height: 320px;
    position: absolute;
    left: 0;
    top: 40px;
    width: 100%;
    .el-scrollbar {
      height: 100%;
      background: #fff;
      z-index: 18;
      .el-scrollbar__wrap {
        position: relative;
        overflow-x: hidden;
        overflow-y: auto;
        .el-tree {
          z-index: 17;
          width: 100%;
          max-height: none;
          .custom-tree-node {
            span {
              display: inline-block;
              max-width: 180px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }
      .el-scrollbar__bar {
        z-index: 18;
      }
    }
  }
}
</style>
