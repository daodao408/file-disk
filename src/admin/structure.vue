<template>
  <div class="strcuture-container">
    <el-row>
      <el-col :span="9">
        <el-header class="mt20" v-if="isDepartmentAdminFlag">
          <button class="layui-btn layui-btn-normal layui-btn-fluid" style="cursor: initial" disabled @click="append({id:''})">组织架构</button>
        </el-header>
        <el-header class="mt20" v-else>
          <button class="layui-btn layui-btn-normal layui-btn-fluid" @click="append({id:''})">新建根部门</button>
        </el-header>
        <div class="el-scroll-strcuture-container">
          <el-scrollbar wrap-class="list">
            <el-tree :data="eventCategoryTree" :show-checkbox="false" node-key="id" highlight-current :default-expand-all="false" :expand-on-click-node="false"
              @node-click="handleNodeClick">
              <span class="custom-tree-node" slot-scope="{ node, data }">
                <span>{{ data.organizationName }}</span>
                <span>
                  <el-button type="text" size="mini" @click="() => remove(node, data)">
                    <i class="iconfont">&#xe682;</i>
                  </el-button>
                  <el-button type="text" size="mini" @click="() => append(data)">
                    <i class="iconfont">&#xe6a5;</i>
                  </el-button>
                </span>
              </span>
            </el-tree>
          </el-scrollbar>
        </div>
      </el-col>
      <el-col :span="15">
        <el-header class="cd-title" v-show='crumbs.length==0'>组织架构</el-header>
        <el-header class="cd-title" v-show='crumbs.length!=0'>
          <div class="cd-crumbs" v-for="(item,index) in crumbs" :key="index">
            <a :title="item.organizationName">{{item.organizationName}}</a>
            <span v-show="index<crumbs.length-1" class="ml5 mr5">></span>
          </div>
        </el-header>
        <div class="pl20 pt10 pb10" style="border-bottom: 1px solid #e6e6e6;">
          <el-row>
            <el-button size="mini" @click="addOrganizationPeople()" :disabled="!parentId">
              <i class="iconfont mr5 mt5">&#xe683;</i>添加</el-button>
            <el-button type="danger" plain size="mini" @click="delOrganizationPeople()" :disabled="!parentId||tableEmails.length==0">
              <i class="iconfont mr5 mt5">&#xe682;</i>删除</el-button>
          </el-row>
        </div>
        <div style="width: 100%;">
          <ym-user-table ref="refresh" @tableEmails="getCheckboxs" @nextTableEvent="getNextTableEvent" :url="tableUrl" :cols="tabelCol"
            :page="true" :type="type" :where="where"></ym-user-table>
        </div>
      </el-col>
    </el-row>
    <el-dialog :title="title" class="cd-size-small" :close-on-click-modal="false" :visible.sync="isAddOrganizationPeople" append-to-body>
      <add-structure-people @close="getCloseindex" @refreshTable="reloadPeopleTable" v-if="isAddOrganizationPeople" />
    </el-dialog>
  </div>
</template>
<script>
import YmSearch from '../components/YmSearch'
import TreeRender from '../components/tree_render.vue'
import YmUserTable from '../components/YmUserTable'
import addStructurePeople from '../components/addStructurePeople.vue'
import config from '../config'
export default {
  components: {
    YmUserTable,
    addStructurePeople
  },
  data() {
    return {
      isAddOrganizationPeople: false,
      title: '',
      where: {},
      tableUrl: '',
      tabelCol: '',
      tableEmails: [],
      crumbs: [],
      type: 'get',
      pId: '',
      id: '',
      parentId: '',
      eventCategoryTree: [],
      isDepartmentAdminFlag: false
    }
  },
  created() {
    this.websocketListener()
  },
  watch: {
    $route: 'loadOrganizationData'
  },
  mounted() {
    // this.$nextTick(function() {
    this.loadOrganizationTree()
    if (
      sessionStorage.getItem('isStaff') &&
      sessionStorage.getItem('isStaff') == '2'
    ) {
      this.isDepartmentAdminFlag = true
    }
    // this.loadOrganizationPeople();
    // });
  },
  methods: {
    websocketListener() {
      console.log(window.location.host)
      var websocket
      var url = window.location.host
      //var url = "localhost:8080";
      let self = this
      // 首先判断是否 支持 WebSocket
      if ('WebSocket' in window) {
        // websocket = new WebSocket("ws://localhost:8080/cloudDiskHandler");
        websocket = new WebSocket('ws://' + url + '/websocket/cloudDiskHandler')
      } else if ('MozWebSocket' in window) {
        websocket = new MozWebSocket(
          'ws://' + url + '/websocket/cloudDiskHandler'
        )
      } else {
        websocket = new SockJS('http://' + url + '/socketJs/cloudDiskHandler')
      }

      // 打开连接时
      websocket.onopen = function(evnt) {
        console.log('  websocket.onopen  ')
      }

      // 收到消息时
      websocket.onmessage = function(evnt) {
        console.log(evnt.data)
        self.$message({
          message: evnt.data
        })
      }

      websocket.onerror = function(evnt) {
        console.log('  websocket.onerror  ')
      }

      websocket.onclose = function(evnt) {
        console.log('  websocket.onclose  ')
      }

      function say() {
        //客户端主动发消息
        // websocket.send("client socket success");
      }
    },
    loadOrganizationTree() {
      let self = this
      //layui.layer.load();
      self
        .$axios({
          method: 'get',
          url: '/api/organization'
        })
        .then(res => {
          if (res.data.code == 200) {
            document.querySelector('.el-loading-mask').style.display = 'none'
            //layui.layer.closeAll('loading');
            self.eventCategoryTree = res.data.data
          }
        })
        .catch(error => {
          document.querySelector('.el-loading-mask').style.display = 'none'
          if (error && error.data && error.data.message) {
            //layui.layer.closeAll('loading')
            //layui.layer.msg(error.data.message)
            this.$message({
              type: 'warning',
              message: error.data.message
            })
          }
        })
    },
    getCheckboxs(tableEmails) {
      this.tableEmails = []
      for (let a of tableEmails) {
        this.tableEmails.push({
          id: a.id
        })
      }
    },
    getNextTableEvent(obj) {},
    loadOrganizationPeople() {
      this.$refs.refresh.$el.parentElement.style.display = 'inline-block'
      this.tableEmails = []
      this.tableUrl = '/api/organization/people?id=' + this.parentId
      this.tabelCol = [
        [
          {
            type: 'checkbox',
            width: 48
          },
          {
            field: 'anotherName',
            title: '用户名',
            width: '20%',
            templet: function(d) {
              return `<span title="${d.anotherName}">${d.anotherName}</span>`
            }
          },
          {
            field: 'nickname',
            title: '姓名',
            width: '20%',
            templet: function(d) {
              return `<span title="${d.anotherName}">${d.nickname}</span>`
            }
          },
          {
            field: 'email',
            title: '邮箱',
            width: '30%',
            templet: function(d) {
              return d.email == 'admin@seafile.local'
                ? 'admin@wh.hb.pro'
                : d.email
            }
          },
          {
            field: 'isStaff',
            title: '用户身份',
            width: '25%',
            templet: function(d) {
              if (d.isStaff == 1) {
                return '管理员'
              } else if (d.isStaff == 2) {
                return '部门管理员'
              } else {
                return '用户'
              }
            }
          }
        ]
      ]
    },
    addOrganizationPeople() {
      this.isAddOrganizationPeople = true
      this.title = '添加成员'
    },
    reloadPeopleTable() {
      let self = this
      self.loadOrganizationTree()
      self.$refs.refresh.reloadTable()
    },
    /*
      addOrganizationPeople() {
        let self = this;
        if (self.parentId == "") {
          self.parentId = null;
        }
        layui.use(["layer"], function() {
          layui.layer.open({
            type: 2,
            maxmin: true,
            area: ["500px", "400px"],
            title: "添加成员",
            content:
              "#/admin/structure/addPeople/" +
              self.parentId +
              "?readyShowContent=true",
            end: function() {
              // self.loadOrganizationTree()
              self.$refs.refresh.reloadTable();
            }
          });
        });
      },
      */
    delOrganizationPeople() {
      if (this.tableEmails.length < 1) {
        this.$message({
          type: 'warning',
          message: '请先勾选要删除的成员'
        })
        return false
      }
      this.$confirm('确定删除吗?', '提示', {
        closeOnClickModal: false,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$axios({
            method: 'post',
            url: '/api/organization/people/delete',
            data: this.tableEmails
          })
            .then(res => {
              if (res.data.code == 200) {
                this.$refs.refresh.reloadTable()
                this.tableEmails = []
                this.$message({
                  type: 'success',
                  message: '删除成功!'
                })
              }
            })
            .catch(error => {
              if (error.data && error.data.message) {
                this.$message({
                  type: 'warning',
                  message: error.data.message
                })
              }
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    getCloseindex(data) {
      this[data.dialog] = false
      if (data.index == 1) {
        this.tableEmails = []
        this.$refs.refresh.reloadTable()
      }
    },
    refreshTable() {
      this.$refs.refresh.reloadTable()
    },
    append(data) {
      this.$prompt('请输入部门名称', '新建部门', {
        closeOnClickModal: false,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^.{1,20}$/,
        inputErrorMessage: '名称格式不正确'
      })
        .then(({ value }) => {
          this.$axios({
            method: 'put',
            url: '/api/organization',
            data: {
              pId: data.id,
              organizationName: value
            }
          })
            .then(res => {
              if (res.data.code == 200) {
                this.$message({
                  type: 'success',
                  message: '部门新建成功'
                })
                if (data.id) {
                  data.children = res.data.data
                } else {
                  this.eventCategoryTree = res.data.data
                }
              }
            })
            .catch(error => {
              if (error.data && error.data.message) {
                this.$message({
                  type: 'warning',
                  message: error.data.message
                })
              }
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '取消输入'
          })
        })
    },

    remove(node, data) {
      let self = this
      this.$confirm('此操作将删除该部门, 是否继续?', '提示', {
        closeOnClickModal: false,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$axios({
            method: 'post',
            url: '/api/organization/delete',
            data: [
              {
                id: data.id
              }
            ]
          })
            .then(res => {
              if (res.data.code == 200) {
                this.$message({
                  type: 'success',
                  message: '删除成功!'
                })
                const parent = node.parent
                const children = parent.data.children || parent.data
                const index = children.findIndex(d => d.id === data.id)
                children.splice(index, 1)
                if (self.crumbs.length > 1) {
                  self.parentId = node.parent.data.id
                  self.loadOrganizationPeople()
                  self.crumbs.splice(self.crumbs.length - 1, 1)
                } else if (self.crumbs.length === 1) {
                  self.crumbs.length = 0
                  self.$refs.refresh.$el.parentElement.style.display = 'none'
                  self.parentId = ''
                  self.$refs.refresh.reloadTable()
                }
              }
            })
            .catch(error => {
              if (error.data && error.data.message) {
                this.$message({
                  type: 'warning',
                  message: error.data.message
                })
              }
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    addOrganizationInit() {
      this.pId = ''
      this.addOrganization()
    },
    renderContent(h, { node, data, store }) {
      return `
          <span class="custom-tree-node">
            <span>{node.organizationName}</span>
            <span>
              <el-button size="mini" type="text" on-click={ () => this.append(data) }>Append</el-button>
              <el-button size="mini" type="text" on-click={ () => this.remove(node, data) }>Delete</el-button>
            </span>
          </span>`
    },
    handleNodeClick(data, node) {
      this.pId = data.pId
      this.parentId = data.id
      this.crumbs = []
      this.getCrumbs(node) //获取当前部门的层级
      this.loadOrganizationPeople()
    },
    getCrumbs(node) {
      if (node.level != 1) {
        this.getCrumbs(node.parent)
      }
      this.crumbs.push(node.data)
    }
  }
}
</script>

<style scored lang="less">
.strcuture-container {
  // .el-loading-mask {
  //   .el-loading-spinner {
  //     top: 50%;
  //     left: 50%;
  //     text-align: left;
  //     margin-left: -21px;
  //     margin-top: -21px;
  //     position: absolute;
  //   }
  // }
  .el-col-9 {
    height: calc(100vh - 60px);
  }
  .el-col-15 {
    min-height: calc(100vh - 60px);
    border-left: 1px solid #ddd;
  }
  .el-scroll-strcuture-container {
    height: calc(100vh - 150px);
    padding-bottom: 20px;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    .el-scrollbar {
      height: 100%;
      .el-tree {
        max-height: none;
      }
    }
  }
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
    &:hover {
      color: #42a0f8;
    }
  }
  .el-scroll-strcuture-container .el-button + .el-button {
    margin-right: 20px;
    margin-left: 5px;
  }
  .layui-table td,
  .layui-table th,
  .layui-table-view {
    border-top: none;
  }
}
</style>
