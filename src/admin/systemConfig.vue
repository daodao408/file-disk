<template>
    <el-container v-loading="fullscreenLoading" class="system-config">
        <uploader :options="options" ref="uploader" :autoStart="false" @files-added="onFileAdded" @file-progress="onUploadProgress"
            class="uploader-example" :file-status-text="statusText" @file-error="fileError" @file-success="fileSuccess" @file-complete="fileComplete">
            <el-header class="cd-title" ref="companyStyle">
                <template v-for="(item,index) in crumbs">
                    <div class="cd-crumbs" :class="index==1&&crumbsDropdown.length>0?'cd-crumbs cd-crumbs-top':'cd-crumbs'">
                        <template v-if='index==1&&crumbsDropdown.length>0'>
                            <el-dropdown>
                                <span class="el-dropdown-link">
                                    <a class="c-h cs-p cd-crumbs-a">......
                                        <i class="el-icon-arrow-down el-icon--right"></i>
                                    </a>
                                </span>
                                <el-dropdown-menu slot="dropdown">
                                    <template v-for="(itemDropdown,count) in crumbsDropdown">
                                        <el-dropdown-item @click.native="getcrumbs(itemDropdown,itemDropdown.index)">
                                            <a class="c-h cs-p cd-crumbs-a">{{itemDropdown.name}}</a>
                                        </el-dropdown-item>
                                    </template>
                                </el-dropdown-menu>
                            </el-dropdown>
                            <span class="ml5 mr5">></span>
                        </template>
                        <template v-if='!(index>0&&index<crumbsDropdown.length+1)'>
                            <a @click="getcrumbs(item,index)" :class="{'c-h cs-p':index<crumbs.length-1}">{{item.name}}</a>
                            <span v-show="index<crumbs.length-1" class="ml5 mr5">></span>
                        </template>
                    </div>
                </template>
            </el-header>
            <div class="cd-bg-fff pt10 pb10 pl20 clearfix" v-show="crumbs.length==1">
                <el-row>
                    <el-button size="mini" @click="addTempalte">
                        <i class="iconfont mr5 mt5">&#xe6a5;</i>新建模板</el-button>
                    <el-button type="danger" plain size="mini" @click="delTemplate" :disabled="tableEmails.length==0">
                        <i class="iconfont mr5 mt5">&#xe682;</i>删除</el-button>
                    <el-button size="mini" @click="renameTemplate" :disabled="tableEmails.length==0||tableEmails.length>1">
                        <i class="iconfont mr5 mt5">&#xe67d;</i>重命名</el-button>
                    <el-button size="mini" @click="tplBindDept" :disabled="tableEmails.length==0||tableEmails.length>1">
                        <i class="iconfont mr5 mt5">&#xe7c4;</i>绑定部门</el-button>
                         <el-button size="mini" @click="synchronizationData" :disabled="tableEmails.length==0||tableEmails.length>1||!idDeparment">
                        <i class="iconfont mr5 mt5">&#xe6a4;</i>同步数据</el-button>
                </el-row>
            </div>
            <el-tabs v-model="activeName" @tab-click="handleClick" v-show="crumbs.length>1">
                <el-tab-pane label="个人文件库" name="first">
                    <div class="cd-bg-fff pt10 pb10 pl20 clearfix" v-show="crumbs.length == 2">
                        <el-button size="mini" @click="addMyRepo" v-show="crumbs.length==2">
                            <i class="iconfont mr5 mt5">&#xe890;</i>新建文件库</el-button>
                        <el-button type="danger" plain size="mini" @click="deleteRepot" :disabled="tableEmails.length==0">
                            <i class="iconfont mr5 mt5">&#xe682;</i>删除</el-button>
                        <el-button size="mini" @click="renameRepo" :disabled="tableEmails.length==0||tableEmails.length>1">
                            <i class="iconfont mr5 mt5">&#xe67d;</i>重命名</el-button>
                        <!-- <el-button size="mini" @click="changePassword" :disabled="fileEncrypted">
                            <i class="iconfont mr5 mt5">&#xe697;</i>修改密码</el-button> -->
                    </div>
                    <div class="cd-bg-fff pt10 pb10 pl20 clearfix" v-show="crumbs.length > 2 && this.repoType == 1">
                        <el-button size="mini" @click="download" :disabled="tableEmails.length==0">
                            <i class="iconfont mr5 mt5">&#xe687;</i>下载</el-button>
                        <el-button size="mini" @click="deleteTplFile" :disabled="tableEmails.length==0">
                            <i class="iconfont mr5 mt5">&#xe682;</i>删除</el-button>
                        <el-button size="mini" @click="addTplDir">
                            <i class="iconfont mr5 mt5">&#xe890;</i>新建文件夹</el-button>
                        <el-dropdown @command="handleClickCommand" size="medium">
                            <el-button size="mini">
                                更多菜单
                                <i class="el-icon-arrow-down el-icon--right"></i>
                            </el-button>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item command="renameRepo" :disabled="!(tableEmails.length==1)">重命名</el-dropdown-item>
                                <!-- <el-dropdown-item command="changePassword" :disabled="!(tableEmails.length==1&&fileEncrypted&&reRepoName)">修改密码</el-dropdown-item> -->
                            </el-dropdown-menu>
                        </el-dropdown>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="部门文件库" name="second">
                    <div class="cd-bg-fff pt10 pb10 pl20 clearfix" v-show="crumbs.length == 2">
                        <el-button size="mini" @click="addMyRepo" v-show="crumbs.length==2">
                            <i class="iconfont mr5 mt5">&#xe890;</i>新建文件库</el-button>
                        <el-button type="danger" plain size="mini" @click="deleteRepot" :disabled="tableEmails.length==0||tableEmails.length>1">
                            <i class="iconfont mr5 mt5">&#xe682;</i>删除</el-button>
                        <el-button size="mini" @click="renameRepo" :disabled="tableEmails.length==0||tableEmails.length>1">
                            <i class="iconfont mr5 mt5">&#xe67d;</i>重命名</el-button>
                        <!-- <el-button size="mini" @click="changePassword" :disabled="fileEncrypted">
                            <i class="iconfont mr5 mt5">&#xe697;</i>修改密码</el-button> -->
                    </div>
                    <div class="cd-bg-fff pt10 pb10 pl20 clearfix" v-show="crumbs.length > 2 && this.repoType == 0">
                        <el-dropdown v-show="crumbs.length > 2 && this.repoType === 0" size="medium">
                            <el-button size="mini">
                                <i class="iconfont">&#xe685;</i>上传
                                <i class="el-icon-arrow-down el-icon--right"></i>
                            </el-button>
                            <el-dropdown-menu slot="dropdown">
                                <uploader-drop>
                                    <el-dropdown-item class="cloudDisk-dropdown-item">
                                        <uploader-btn>上传文件</uploader-btn>
                                    </el-dropdown-item>
                                    <el-dropdown-item class="cloudDisk-dropdown-item">
                                        <uploader-btn v-if="!isIeBrowser" :directory="true">上传文件夹</uploader-btn>
                                    </el-dropdown-item>
                                </uploader-drop>
                            </el-dropdown-menu>
                        </el-dropdown>
                        <el-button size="mini" @click="download" :disabled="tableEmails.length==0">
                            <i class="iconfont mr5 mt5">&#xe687;</i>下载</el-button>
                        <el-button size="mini" @click="deleteTplFile" :disabled="tableEmails.length==0">
                            <i class="iconfont mr5 mt5">&#xe682;</i>删除</el-button>
                        <el-button size="mini" @click="addTplDir">
                            <i class="iconfont mr5 mt5">&#xe890;</i>新建文件夹</el-button>
                        <el-dropdown @command="handleClickCommand" size="medium">
                            <el-button size="mini">
                                更多菜单
                                <i class="el-icon-arrow-down el-icon--right"></i>
                            </el-button>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item command="renameRepo" :disabled="!(tableEmails.length==1)">重命名</el-dropdown-item>
                                <!-- <el-dropdown-item command="changePassword" v-show="crumbs.length > 2 && this.repoType === 1" :disabled="!(tableEmails.length==1&&fileEncrypted&&reRepoName)">修改密码</el-dropdown-item> -->
                            </el-dropdown-menu>
                        </el-dropdown>
                    </div>
                </el-tab-pane>
            </el-tabs>
            <ym-user-table ref="refresh" @tableEmails="getCheckboxs" @nextTableEvent="getNextTableEvent" :url="tableUrl" :cols="tabelCol"
                :page="true" :type="type" :where="where"></ym-user-table>
            <!-- 文件上传 -->
            <el-dialog :title="'文件上传'" class="cd-size-middle yofc-upload-list" :close-on-click-modal="false" :before-close="closeUpload"
                :visible.sync="isUploaderList" append-to-body>
                <ym-list :fileLists="fileList" />
            </el-dialog>
        </uploader>
        <!-- 绑定模板 -->
        <el-dialog :title="title" class="cd-size-lag" :close-on-click-modal="false" :visible.sync="isTplBindDept" append-to-body>
            <tpl-bind-dept @close="getCloseindex" :templateId="templateId" :checkedDeptObj="checkedDeptObj" v-if="isTplBindDept" />
        </el-dialog>
        <!-- 新建文件库 -->
        <el-dialog :title="title" class="cd-size-small" :close-on-click-modal="false" :visible.sync="isAddMyRepoForTpl" append-to-body>
            <add-my-repo-for-tpl @close="getCloseindex" :repoType="repoType" :templateId="templateId" v-if="isAddMyRepoForTpl" />
        </el-dialog>
        <!-- 文件库修改密码 -->
        <el-dialog :title="title" class="cd-size-small" :close-on-click-modal="false" :visible.sync="isFilePassword" append-to-body>
            <file-password :repoId="repoId" @close="getCloseindex" v-if="isFilePassword" />
        </el-dialog>
    </el-container>
</template>
<script>
import YmUserTable from '../components/YmUserTable';
import TplBindDept from '../components/TplBindDept';
import FilePassword from '../components/FilePassword';
import AddMyRepoForTpl from '../components/AddMyRepoForTpl';
import YmList from '../components/YmList';
import config from '../config';
import tree_renderVue from '../components/tree_render.vue';
import { formatDate } from '../utils/filter.js';
export default {
  components: {
    YmUserTable,
    TplBindDept,
    AddMyRepoForTpl,
    FilePassword,
    YmList
  },
  data() {
    return {
      fileList: [],
      tableUrl: '',
      tabelCol: '',
      tableEmails: [],
      type: 'get',
      where: '',
      isIeBrowser: false,
      owner: false,
      ownerRepo: false,
      fileEncrypted: true,
      reRepoName: true,
      idDeparment: false,
      isUpdateSuccess: false,
      crumbs: [],
      crumbsDropdown: [],
      title: '',
      gropeId: '',
      groupId: '',
      templateId: '',
      templateName: '',
      repoType: '', //0--群组文件库  1--个人文件库
      repoId: '',
      dpath: '',
      path: '',
      obj: '',
      activeName: 'first',
      groupName: '',
      operation: '',
      options: {
        target: '',
        relativePath: '/',
        query: {
          upload_token: this.rootToken,
          parent_dir: '/',
          retJson: '1'
        },
        testChunks: false,
        chunkSize: 1024 * 1024 * 1024 * 20
      },
      statusText: {
        success: '成功',
        error: '出错',
        uploading: '上传中',
        paused: '暂停中',
        waiting: '等待中'
      },
      showDialog: false,
      isTplBindDept: false,
      isAddMyRepoForTpl: false,
      fullscreenLoading: false,
      isUploaderList: false,
      isFilePassword: false,
      rootToken: '',
      checkedDeptObj: null,
      tabIndex: '0'
    };
  },
  created() {
    this.getRootToken();
    this.loadTemplateInfo();
    this.websocketListener();
    if (!!window.ActiveXObject || 'ActiveXObject' in window) {
      this.isIeBrowser = true;
    }
  },
  beforeRouteLeave(to, from, next) {
    if (this.$store.state.token) {
      this.$axios({
        method: 'post',
        url: '/api/template/liveTemplate',
        data: {
          id: this.templateId
        }
      })
        .then(res => {
          if (res.data.code == 200) {
            if (res.data.data === true) {
              this.$confirm(
                '您的模板数据已发生改变，是否同步最后一次操作的模板？',
                '提示',
                {
                  closeOnClickModal: false,
                  confirmButtonText: '同步',
                  cancelButtonText: '取消',
                  type: 'warning'
                }
              )
                .then(() => {
                  this.synchronizationData();
                  next(true);
                })
                .catch(() => {
                  next(true);
                });
            } else {
              next(true);
            }
          }
        })
        .catch(error => {
          if (error.data && error.data.message) {
            this.fullscreenLoading = false;
            this.$message({
              type: 'warning',
              message: error.data.message
            });
          }
        });
    } else {
      if (to.path == '/login') {
        //如果是登录页面路径，就直接next()
        next();
      } else {
        //不然就跳转到登录；
        next('/login');
      }
    }
  },
  watch: {
    $route: 'loadTemplateInfo'
  },
  mounted() {},
  methods: {
    websocketListener() {
      console.log(window.location.host);
      var websocket;
      var url = window.location.host;
      //var url = "localhost:8080";
      let self = this;
      // 首先判断是否 支持 WebSocket
      if ('WebSocket' in window) {
        // websocket = new WebSocket("ws://localhost:8080/cloudDiskHandler");
        websocket = new WebSocket(
          'ws://' + url + '/websocket/cloudDiskHandler'
        );
      } else if ('MozWebSocket' in window) {
        websocket = new MozWebSocket(
          'ws://' + url + '/websocket/cloudDiskHandler'
        );
      } else {
        websocket = new SockJS('http://' + url + '/socketJs/cloudDiskHandler');
      }

      // 打开连接时
      websocket.onopen = function(evnt) {
        console.log('  websocket.onopen  ');
      };

      // 收到消息时
      websocket.onmessage = function(evnt) {
        console.log(evnt.data);
        self.$message({
          message: evnt.data
        });
        self.$refs.refresh.reloadTable();
      };

      websocket.onerror = function(evnt) {
        console.log('  websocket.onerror  ');
      };

      websocket.onclose = function(evnt) {
        console.log('  websocket.onclose  ');
      };

      function say() {
        //客户端主动发消息
        // websocket.send("client socket success");
      }
    },
    loadTemplateInfo() {
      this.tableUrl = '/api/template';
      this.tabelCol = [
        [
          //标题栏
          {
            type: 'checkbox',
            width: 48
          },
          {
            field: 'templateName',
            title: '模板名称',
            width: '20%',
            event: 'nextTable',
            templet: function(d) {
              return '<a class="cs-p">' + d.templateName + '</a>';
            }
          },
          {
            field: 'onwer',
            title: '创建人',
            width: '10%',
            templet: function(d) {
              return d.nickName == undefined
                ? d.onwer
                : d.nickName + ' ( ' + d.onwer + ' )';
            }
          },
          {
            field: 'deparment',
            title: '绑定部门',
            width: '20%',
            templet: function(d) {
              let deptNameArr = [];
              if (d.deparment && d.deparment.length > 0) {
                for (let deptName of d.deparment) {
                  deptNameArr.push(deptName.organizationName);
                }
              }
              if (deptNameArr.length > 1) {
                return `${deptNameArr.join(',')}`;
              } else if (deptNameArr.length === 1) {
                return `${deptNameArr.join('')}`;
              } else {
                return '';
              }
            }
          },
          {
            title: '同步状态',
            width: '15%',
            templet: function(d) {
              if (d.bindTime == null || d.deparment.length == 0) {
                return '';
              } else if (d.synchronizationStatus) {
                return `<span class="operation-status-container"><i class = "operation-synchronizing"></i><b>数据同步中</b></span>`;
              } else if (d.isUpdate === '1') {
                return `<span class="operation-status-container"><i class = "operation-success"></i><b>已同步</b></span>`;
              } else {
                return `<span class="operation-status-container"><i class = "operation-failure"></i><b>未同步</b></span>`;
              }
            }
          },
          {
            field: 'bindTime',
            title: '同步时间',
            width: '15%',
            templet: function(d) {
              return d.deparment.length == 0 ? '' : `${formatDate(d.bindTime)}`;
            }
          },
          {
            field: 'updateTime',
            title: '更新时间',
            width: '15%',
            templet: function(d) {
              return `${formatDate(d.updateTime)}`;
            }
          }
        ]
      ];
      this.crumbs.push({
        url: this.tableUrl,
        cols: this.tabelCol,
        name: '模板配置',
        path: 'p'
      });
    },
    handleClickCommand(command) {
      if (command == 'renameRepo') {
        this.renameRepo();
      } else if (command == 'changePassword') {
        this.changePassword();
      }
    },
    // 点击文件库tab切换
    handleClick(tab, event) {
      let tempArr = [];
      if (tab.index == 1) {
        this.repoType = 0;
        this.activeName = 'second';
        if (this.crumbs.length === 2 && this.tabIndex === '1') {
          tempArr = this.tableEmails;
        }
        this.loadPersonalFile(this.templateId, this.repoType);
        for (let a of this.crumbs) {
          if (a.name == '部门文件库') {
            this.crumbs[1] = a;
          }
        }
        this.tabIndex = tab.index;
      } else if (tab.index == 0) {
        this.repoType = 1;
        this.activeName = 'first';
        if (this.crumbs.length === 2 && this.tabIndex === '0') {
          tempArr = this.tableEmails;
        }
        this.loadPersonalFile(this.templateId, this.repoType);
        for (let a of this.crumbs) {
          if (a.name == this.templateName) {
            this.crumbs[1] = a;
          }
        }
        this.tabIndex = tab.index;
      }
      this.crumbs.splice(2, this.crumbs.length - 1);
      this.tableEmails = tempArr;
    },
    getNextTableEvent(obj) {
      if (this.crumbs.length > 1) {
        this.loadMyDirent(obj);
      } else {
        this.templateId = obj.data.id;
        this.repoType = 1;
        this.activeName = 'first';
        this.templateName = obj.data.templateName;
        this.loadPersonalFile(this.templateId, this.repoType);
      }
    },
    getcrumbs(item, $index) {
      if (item.url && $index != this.crumbs.length - 1) {
        this.tableUrl = item.url;
        this.tabelCol = item.cols;
        // 个人文件库和部门文件库层级
        if ($index == 1 && item.url && item.url.indexOf('type=') != -1) {
          if (parseInt(item.url.split('type=')[1]) === 0) {
            // type=0 部门文件库
            this.activeName = 'second';
          } else if (parseInt(item.url.split('type=')[1]) === 1) {
            // type=1 个人文件库
            this.activeName = 'first';
          }
        }
        this.crumbs.splice($index + 1, this.crumbs.length - 1);
        this.dpath = item.path;
        this.path = item.path;
        if (item.path != 'p') {
          this.getUrl({
            p: item.path,
            repoId: this.repoId
          });
          if (/^\/{0,1}$/.test(item.path)) {
            this.$refs.uploader.uploader.opts.query.parent_dir = item.path;
          } else {
            this.$refs.uploader.uploader.opts.query.parent_dir =
              item.path + '/';
          }
        }
        if (this.crumbs.length > 2) {
          this.tableEmails = [];
        }
        this.getCrumbsDropdown();
      } else {
        return;
      }
    },
    loadPersonalFile(templateId, repoType) {
      this.tableEmails = [];
      this.tableUrl =
        '/api/template/repos?tId=' + templateId + '&type=' + repoType;
      this.where = {
        templateId: this.templateId
      };
      this.tabelCol = [
        [
          //标题栏
          {
            type: 'checkbox',
            width: 48
          },
          {
            field: 'name',
            title: '名称',
            width: '35%',
            event: 'nextTableFile',
            templet: function(d) {
              return `<a class="cs-p" title="${
                d.name
              }"><svg class="icon mr5  fz20" aria-hidden="true">
                        <use xlink:href="${d.address}"></use>
                    </svg><i class="iconfont">${
                      d.encrypted ? '&#xe693;' : ''
                    }</i> ${d.name}</a>`;
            }
          },
          {
            field: 'size_formatted',
            title: '大小',
            width: '20%'
          },
          {
            field: 'type',
            title: '文件类型',
            width: '20%',
            templet: function(d) {
              if (d.type === 'repo') {
                return '<span>文件库</span>';
              }
            }
          },
          {
            field: 'time',
            title: '更新时间',
            width: '20%'
          }
        ]
      ];

      if (this.crumbs.length === 1) {
        // 当面包屑长度为1 第一次进入tab页就新增个人文件库和部门文件库的路由
        this.crumbs.push({
          url: this.tableUrl,
          cols: this.tabelCol,
          name: this.templateName,
          path: 'p'
        });
      } else if (this.crumbs.length === 2) {
        // 当面包屑长度为2 切换tab页替换相应的路由
        this.crumbs.splice(1, 1, {
          url: this.tableUrl,
          cols: this.tabelCol,
          name: this.templateName,
          path: 'p'
        });
      }
    },
    loadMyDirent(obj) {
      this.obj = obj;
      if (obj.data.encrypted) {
        //是否加密
        this.repoId = obj.data.repoId;
        // this.path = obj.data.path;
        this.obj = obj;
        this.$axios({
          method: 'get',
          url: '/api/decrypt/getPass?repoId=' + this.repoId
        })
          .then(res => {
            if (res.data.code == 200) {
              if (res.data.data) {
                this.showMyDirent(obj);
              } else {
                //this.deciphering();
              }
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
      } else {
        this.showMyDirent(obj);
      }
    },
    showMyDirent(obj) {
      this.tableEmails = [];
      //解决不是拥有者也去查询上传链接，导致报错的问题
      this.getUrl({
        p: obj.data.path,
        repoId: obj.data.repoId
      });
      if (/^\/{0,1}$/.test(obj.data.path)) {
        this.$refs.uploader.uploader.opts.query.parent_dir = obj.data.path;
      } else {
        this.$refs.uploader.uploader.opts.query.parent_dir =
          obj.data.path + '/';
      }
      this.path = obj.data.path;
      this.repoId = obj.data.repoId;
      this.dpath = obj.data.path;
      this.where = {
        repoId: this.repoId
      };
      this.tableUrl =
        '/api/template/repos/dirent?p=' + encodeURIComponent(obj.data.path);
      this.tabelCol = [
        [
          //标题栏
          {
            type: 'checkbox',
            width: 48
          },
          {
            field: 'name',
            title: '名称',
            width: '35%',
            event: 'nextTableFile',
            templet: function(d) {
              if (d.type === 'file') {
                return `<span title="${d.name}">
                            <svg class="icon mr5  fz20" aria-hidden="true">
                            <use xlink:href="${d.address}"></use>
                        </svg>
                    ${d.name}</span>`;
              } else {
                return `<a class="cs-p" title="${d.name}">
                            <svg class="icon mr5  fz20" aria-hidden="true">
                            <use xlink:href="${d.address}"></use>
                        </svg>
                    ${d.name}</a>`;
              }
            }
          },
          {
            field: 'size_formatted',
            title: '大小',
            width: '20%'
          },
          {
            field: 'type',
            title: '文件类型',
            width: '20%',
            templet: function(d) {
              return (
                '<span>' + (d.type == 'dir' ? '文件夹' : '文件') + '</span>'
              );
            }
          },
          {
            field: 'time',
            title: '更新时间',
            width: '20%'
          }
        ]
      ];
      if (!(this.crumbs[this.crumbs.length - 1].url == this.tableUrl)) {
        //防止卡住多次运行此方法，支持幂操作
        this.crumbs.push({
          url: this.tableUrl,
          cols: this.tabelCol,
          name: obj.data.name,
          path: obj.data.path
        });
        this.getCrumbsDropdown();
      }
    },
    getCrumbsDropdown() {
      this.crumbsDropdown = [];
      let crumbsNum =
        this.crumbs.length -
        (this.$refs.companyStyle.$el.clientWidth - 40) / 100 -
        1;
      if (crumbsNum > 0) {
        this.crumbs.forEach((item, index) => {
          if (index > 0 && crumbsNum > 0) {
            item.index = index;
            this.crumbsDropdown.push(item);
            crumbsNum--;
          }
        });
      }
    },
    addMyFile() {
      this.add('文件库', '/api/group/creatShareResource', '新建', 'post');
    },
    renameTemplate() {
      this.templateId = this.tableEmails[0].id;
      this.add(
        '模板',
        '/api/template',
        '重命名',
        'post',
        this.tableEmails[0].templateName
      );
    },
    addTempalte() {
      this.add('模板', '/api/template', '新建', 'put');
    },
    addMyRepo() {
      //新建文件库
      this.title = '新建文件库';
      this.isAddMyRepoForTpl = true;
    },
    deciphering() {
      this.$prompt(``, `解密`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'password',
        closeOnClickModal: false,
        confirmButtonClass: 'loading',
        inputPattern: /^.{1,20}$/,
        inputErrorMessage: `密码格式不正确`
      })
        .then(({ value }) => {
          this.fullscreenLoading = true;
          this.$axios({
            method: 'post',
            url: `/api/repos/password`,
            data: {
              password: value,
              id: this.repoId
            }
          })
            .then(res => {
              if (res.data.code == 200) {
                this.fullscreenLoading = false;
                this.$message({
                  type: 'success',
                  message: `解密成功`
                });
                this.tableEmails = [];
                this.showMyDirent(this.obj);
                this.$refs.refresh.reloadTable();
              }
            })
            .catch(error => {
              if (error.data && error.data.message) {
                this.fullscreenLoading = false;
                this.$message({
                  type: 'warning',
                  message: error.data.message
                });
              }
            });
        })
        .catch(() => {
          this.fullscreenLoading = false;
          this.$message({
            type: 'info',
            message: '取消输入'
          });
        });
    },
    add(name, url, operation, type, keyValue, inputPattern, inputErrorMessage) {
      let self = this;
      let regex = /^(?=[\u4e00-\u9fa5a-zA-Z0-9\.\-\、\[\]\_\(\)]+[\u4e00-\u9fa5a-zA-Z0-9\.\-\、\[\]\s\_\(\)]+[\u4e00-\u9fa5a-zA-Z0-9\.\-\、\[\]\_\(\)]$).{1,80}$|^[\u4e00-\u9fa5a-zA-Z0-9\-\、\[\]\.\_\(\)]{1,80}$/;
      if (inputPattern != null) {
        regex = inputPattern;
      }
      let msg = '只能输入数字、字母、中文和、[].-_()，长度在80个字符以内！';
      if (inputErrorMessage != null) {
        msg = inputErrorMessage;
      }
      this.$prompt(`请输入${name}名称`, `${operation}${name}`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: keyValue,
        closeOnClickModal: false,
        confirmButtonClass: 'loading',
        inputPattern: regex,
        inputErrorMessage: `${name}格式不正确，不能为空，${msg}`
      })
        .then(({ value }) => {
          let data = {};
          if (name == '密码' && operation == '解密') {
            data = {
              password: value,
              id: this.repoId
            };
          } else if (name == '文件夹' && operation == '新建') {
            data = {
              repoId: this.repoId,
              p: this.dpath + '/' + value,
              operation: 'mkdir',
              tId: this.templateId
            };
          } else if (name == '模板' && operation == '新建') {
            data = {
              templateName: value
            };
          } else {
            if (value == self.tableEmails[0].name) {
              this.fullscreenLoading = false;
              this.$message({
                type: 'warning',
                message: '修改名称和原名称相同'
              });
              return;
            }
            if (name == '文件夹' && operation == '重命名') {
              data = {
                operation: 'rename',
                newname: value,
                p: this.tableEmails[0].path,
                repoId: this.repoId,
                tId: this.templateId
              };
            } else if (name == '文件库' && operation == '重命名') {
              data = {
                name: value,
                rootRepoId: this.repoId,
                tId: this.templateId
              };
            } else if (name == '模板' && operation == '重命名') {
              if (value == self.tableEmails[0].templateName) {
                this.fullscreenLoading = false;
                this.$message({
                  type: 'warning',
                  message: '修改名称和原名称相同'
                });
                return;
              }
              data = {
                id: this.templateId,
                templateName: value
              };
            } else if (name == '文件' && operation == '重命名') {
              if (value == '') {
                this.$message({
                  type: 'warning',
                  message: '重命名文件名不能为空'
                });
                return;
              }
              data = {
                operation: 'rename',
                newname: value,
                p: this.tableEmails[0].path,
                repoId: this.repoId,
                tId: this.templateId
              };
            }
          }

          this.fullscreenLoading = true;
          this.$axios({
            method: type,
            url: url,
            data: data
          })
            .then(res => {
              if (res.data.code == 200) {
                this.fullscreenLoading = false;
                this.$message({
                  type: 'success',
                  message: `${name}${operation}成功`
                });
                this.tableEmails = [];
                if (operation == '解密') {
                  this.showMyDirent(this.obj);
                }
                this.$refs.refresh.reloadTable();
              }
            })
            .catch(error => {
              if (error.data && error.data.message) {
                this.fullscreenLoading = false;
                this.$message({
                  type: 'warning',
                  message: error.data.message
                });
              }
            });
        })
        .catch(() => {
          this.fullscreenLoading = false;
          this.$message({
            type: 'info',
            message: '取消输入'
          });
        });
    },
    tplBindDept() {
      this.title = '绑定部门';
      this.isTplBindDept = true;
    },
    synchronizationData() {
      this.$axios({
        method: 'post',
        url: '/api/template/synchronizationData',
        data: {
          id: this.templateId
        }
      })
        .then(res => {
          if (res.data.code == 200) {
            this.$message({
              type: 'success',
              message: res.data.data
            });
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
    del(name, url, operation) {
      this.$confirm(`此操作将${operation}选中${name}, 是否继续?`, '提示', {
        closeOnClickModal: false,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          let data;
          if (operation == '取消分享') {
            data = {
              shares: this.tableEmails,
              groupId: this.groupId
            };
          } else if (operation == '删除' && this.crumbs.length > 2) {
            let param = [];
            for (let a of this.tableEmails) {
              param.push({
                p: a.ppath,
                repoId: a.repoId,
                name: a.name,
                type: a.type,
                tId: this.templateId
              });
            }
            data = param;
          } else if (operation == '删除' && this.crumbs.length == 2) {
            let param = [];
            for (let a of this.tableEmails) {
              param.push({
                //id: a.id
                rootRepoId: a.repoId,
                name: a.name,
                tId: this.templateId
              });
            }
            data = param;
          } else {
            data = this.tableEmails;
          }
          this.fullscreenLoading = true;
          this.$axios({
            method: 'post',
            url: url,
            data: data
          })
            .then(res => {
              if (res.data.code == 200) {
                this.fullscreenLoading = false;
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
                this.fullscreenLoading = false;
                this.$message({
                  type: 'warning',
                  message: error.data.message
                });
              }
            });
        })
        .catch(() => {
          this.fullscreenLoading = false;
          let messageTip = `已取消${operation}`;
          if (operation == '取消分享') {
            messageTip = '已取消共享';
          }
          this.$message({
            type: 'info',
            //message: `已取消${operation}`
            message: messageTip
          });
        });
    },
    delTemplate() {
      this.del('模板', '/api/template/delete', '删除');
    },
    getCheckboxs(obj) {
      // console.log(this.idDeparment)
      this.tableEmails = obj;
      if (this.crumbs.length == 1 && obj.length > 0) {
        this.templateId = obj[0].id;
        this.checkedDeptObj = obj[0].deparment;
      }
      if (this.crumbs.length == 1 && obj.length == 1) {
        if (obj[0].deparment.length > 0) {
          this.idDeparment = true;
        } else {
          this.idDeparment = false;
        }
      }
      if (obj.length == 1 && obj[0].encrypted) {
        this.fileEncrypted = false;
      } else {
        this.fileEncrypted = true;
      }
    },
    getCloseindex(data) {
      this[data.dialog] = false;
      if (data.index == 1) {
        this.$refs.refresh.reloadTable();
        this.tableEmails = [];
      }
    },
    changePassword() {
      this.title = '修改密码';
      this.repoId = this.tableEmails[0].id;
      this.isFilePassword = true;
    },
    addTplDir() {
      this.add('文件夹', '/api/template/insertTemplateDir', '新建', 'put');
    },
    deleteRepot() {
      this.del('文件库', '/api/template/repos/delete', '删除');
    },
    deleteTplFile() {
      this.del(
        '模板文件或者文件夹',
        '/api/template/delTemplateDirOrFile',
        '删除'
      );
    },
    renameRepo() {
      this.repoId = this.tableEmails[0].repoId;
      let type = this.tableEmails[0].type;
      if (type == 'repo') {
        this.add(
          '文件库',
          '/api/template/repos',
          '重命名',
          'post',
          this.tableEmails[0].name
        );
      } else if (type == 'dir') {
        this.add(
          '文件夹',
          '/api/template/reNameTemplateDir',
          '重命名',
          'post',
          this.tableEmails[0].name
        );
      } else if (type == 'file') {
        this.add(
          '文件',
          '/api/template/reNameTemplateFile',
          '重命名',
          'post',
          this.tableEmails[0].name,
          /^.{1,80}$/,
          '长度在80个字符以内！'
        );
      }
    },
    // delshare() {
    //   this.del("文件库", "/api/group/delSharedGroup", "取消分享");
    // },
    onFileAdded(files, fileList) {
      let self = this;
      let validate = true;
      let leftOver = 0;
      let memory = 0;
      for (let a of files) {
        memory += parseInt(a.size);
      }
      self
        .$axios({
          method: 'get',
          url: '/api/template/leftOver'
        })
        .then(res => {
          if (res.data.code == 200) {
            leftOver = res.data.data;
            if (files.length <= 300) {
              if (memory < leftOver) {
                this.fullscreenLoading = true;
                for (let i = 0; i < files.length; i++) {
                  if (
                    files[i].parent != null &&
                    !/^(?=[\u4e00-\u9fa5a-zA-Z0-9\.\-\、\[\]\_\(\)]+[\u4e00-\u9fa5a-zA-Z0-9\.\-\、\[\]\s\_\(\)]+[\u4e00-\u9fa5a-zA-Z0-9\.\-\、\[\]\_\(\)]$).{1,80}$|^[\u4e00-\u9fa5a-zA-Z0-9\-\、\[\]\.\_\(\)]{1,80}$/.test(
                      files[i].parent.name
                    )
                  ) {
                    validate = false;
                    self.fullscreenLoading = false;
                    self.$refs.uploader.uploader.cancel();
                    self.$message({
                      type: 'warning',
                      message:
                        '文件夹格式不正确，不能为空，只能输入数字、字母、中文和、[]-_.()，长度在80个字符以内！'
                    });
                  } else if (files[i].name.length > 80) {
                    validate = false;
                    self.fullscreenLoading = false;
                    self.$refs.uploader.uploader.cancel();
                    self.$message({
                      type: 'warning',
                      message: '文件长度在80个字符以内！'
                    });
                  }
                }
                if (validate) {
                  self.$refs.uploader.uploader.resume();
                  self.fullscreenLoading = false;
                  self.fileList = fileList;
                  self.isUploaderList = true;
                }
              } else {
                self.$refs.uploader.uploader.cancel();
                self.$message({
                  type: 'warning',
                  message: '当前用户存储空间不足！'
                });
              }
            } else {
              self.$refs.uploader.uploader.cancel();
              self.$message({
                type: 'warning',
                message: '文件过多，单次最多可上传300个文件！'
              });
            }
          }
        })
        .catch(error => {
          if (error.data && error.data.message) {
            self.$message({ type: 'warning', message: error.data.message });
          }
        });
    },
    closeUpload(done) {
      this.$refs.uploader.uploader.cancel();
      //取消文件上传记录日志
      if (!this.isUpdateSuccess) {
        this.$axios({
          method: 'post',
          url: '/api/logs/savelog',
          data: {
            logKey: '173',
            operationResult: '1'
          }
        });
      }
      this.isUpdateSuccess = false;
      done();
    },
    start() {
      this.$refs.uploader.autoStart = true;
    },
    onUploadProgress() {},
    fileSuccess() {
      this.$axios({
        method: 'post',
        url: '/api/template/uploudClose',
        data: {
          id: this.templateId
        }
      });
    },
    fileComplete(rootFile) {
      this.tableEmails = [];
      this.$refs.refresh.reloadTable();
      this.isUpdateSuccess = true;
      //上传成功记录日志
      this.$axios({
        method: 'post',
        url: '/api/logs/savelog',
        data: {
          logKey: '172',
          operationResult: '1'
        }
      });
    },
    fileError() {
      //上传失败记录日志
      this.$axios({
        method: 'post',
        url: '/api/logs/savelog',
        data: {
          logKey: '172',
          operationResult: '0'
        }
      });
    },
    getUrl(obj) {
      this.$axios({
        method: 'get',
        url:
          '/api/template/uploadtoken?p=' +
          encodeURIComponent(obj.p) +
          '&repoId=' +
          obj.repoId
      })
        .then(res => {
          if (res.data.code == 200) {
            this.$refs.uploader.uploader.opts.target =
              '/seafhttp/upload-aj/' + res.data.data;
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
    download() {
      let dirVos = [];
      for (let a of this.tableEmails) {
        dirVos.push({
          p: a.ppath,
          repoId: a.repoId,
          name: a.name
        });
      }
      this.fullscreenLoading = true;
      if (dirVos.length == 1 && this.tableEmails[0].type == 'file') {
        this.$axios({
          method: 'post',
          url: '/api/template/oneFile',
          data: {
            p: this.tableEmails[0].path,
            repoId: this.tableEmails[0].repoId
          }
        })
          .then(res => {
            if (res.data.code == 200) {
              this.fullscreenLoading = false;
              return res;
            }
          })
          .then(res => {
            let seafileUrl = sessionStorage.seafileUrl;
            window.location = `${seafileUrl}${res.data.data}`;
          })
          .catch(error => {
            if (error.data && error.data.message) {
              this.fullscreenLoading = false;
              this.$message({
                type: 'warning',
                message: error.data.message
              });
            }
          });
      } else {
        this.$axios({
          method: 'post',
          url: '/api/template/filezips',
          data: dirVos
        })
          .then(res => {
            if (res.data.code == 200) {
              this.fullscreenLoading = false;
              let seafileUrl = sessionStorage.seafileUrl;
              window.location = `${seafileUrl}/seafhttp/zip/${
                res.data.data.zip_token
              }`;
            }
          })
          .catch(error => {
            if (error.data && error.data.message) {
              this.fullscreenLoading = false;
              this.$message({
                type: 'warning',
                message: error.data.message
              });
            }
          });
      }
    },
    getRootToken() {
      this.$axios({
        method: 'get',
        url: '/api/template/token'
      })
        .then(res => {
          if (res.code == 200) {
            this.rootToken = res.data;
            layui.layer.closeAll('loading');
          }
        })
        .catch(error => {
          if (error.data && error.data.message) {
            layui.layer.closeAll('loading');
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

<style lang="less">
.system-config {
  .el-tabs {
    .el-tabs__header {
      margin-bottom: 0;
    }
    .el-button {
      margin-right: 7px;
      padding: 7px 10px;
      &.el-button--default {
        color: #42a0f8;
        &.is-disabled {
          color: #c0c4cc;
          &:focus {
            color: #c0c4cc;
          }
          &:hover {
            color: #c0c4cc;
          }
        }
      }
    }
    .el-button + .el-button {
      margin-left: 0;
    }
    .el-dropdown {
      .el-button--mini,
      .el-button--mini.is-round {
        padding: 7px 10px;
      }
    }
  }
}
.el-tabs__header .el-tabs__nav-wrap {
  padding-left: 20px !important;
}

.uploader-drop {
  padding: 0 !important;
  border: none !important;
  background-color: #fff !important;
}

.uploader-drop .uploader-btn {
  border: none;
  padding: 0;
}

.uploader-drop .uploader-btn:hover {
  background: #ecf5ff !important;
}

.uploader-list {
  max-height: 260px;
}

.cd-crumbs-top {
  vertical-align: top;
}

.cd-crumbs-a {
  display: inline-block;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 16px;
}

.cloudDisk-dropdown-item {
  padding: 0 !important;
}

.cloudDisk-dropdown-item .uploader-btn {
  width: 100%;
  padding: 0 17px !important;
  line-height: 30px;
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
  background-color: #f6c92e;
  -webkit-border-radius: 10px;
  -moz-border-radius: 10px;
  border-radius: 10px;
  vertical-align: top;
  margin-top: 9px;
  margin-right: 5px;
}

.operation-status-container i.operation-synchronizing {
  background-color: #f6c92e;
}

.operation-status-container i.operation-success {
  background-color: #23ca85;
}

.operation-status-container i.operation-failure {
  background-color: #f05468;
}

.updata-time-detail b {
  font-weight: normal;
  vertical-align: top;
}
</style>
