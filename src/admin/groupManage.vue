<template>
  <el-container v-loading="fullscreenLoading" class="group-manage">
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
          <el-button size="mini" @click="addGroup">
            <i class="iconfont mr5 mt5">&#xe698;</i>新建</el-button>
          <el-button size="mini" @click="delGroups" :disabled="tableEmails.length==0||tableEmails.length>1||!owner">
            <i class="iconfont mr5 mt5">&#xe68f;</i>解散群组</el-button>
          <el-dropdown @command="handleClickCommand" size="medium">
            <el-button size="mini">
              更多菜单
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="quitGroups" :disabled="tableEmails.length==0||tableEmails.length>1||owner">退出群组</el-dropdown-item>
              <el-dropdown-item command="transferGroup" :disabled="tableEmails.length==0||tableEmails.length>1||!owner">转让群组</el-dropdown-item>
              <el-dropdown-item command="reGroupName" :disabled="tableEmails.length==0||tableEmails.length>1||!owner">重命名</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-row>
      </div>
      <el-tabs v-model="activeName" @tab-click="handleClick" v-show="crumbs.length>1">
        <el-tab-pane label="群组文件" name="first">
          <div class="cd-bg-fff pl20 pt10 pb10 clearfix">
            <el-button size="mini" @click="addMyRepo()" v-show="crumbs.length==2">
              <i class="iconfont mr5 mt5">&#xe890;</i>新建文件库</el-button>
            <el-button size="mini" @click="delshare()" v-show="crumbs.length==2" :disabled="tableEmails.length==0||tableEmails.length>1">
              <i class="iconfont mr5 mt5">&#xe684;</i>取消共享</el-button>
            <el-dropdown v-show="crumbs.length>2&&ownerRepo||crumbs.length>2&&hide" size="medium">
              <el-button size="mini">
                <i class="iconfont">&#xe685;</i>上传
                <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <uploader-drop>
                  <el-dropdown-item class="cloudDisk-dropdown-item">
                    <uploader-btn>上传文件</uploader-btn>
                  </el-dropdown-item>
                  <el-dropdown-item v-show="!hide" class="cloudDisk-dropdown-item">
                    <uploader-btn v-if="!isIeBrowser" :directory="true">上传文件夹</uploader-btn>
                  </el-dropdown-item>
                </uploader-drop>
              </el-dropdown-menu>
            </el-dropdown>
            <el-button size="mini" @click="download" v-show="crumbs.length>2" :disabled="tableEmails.length==0">
              <i class="iconfont mr5 mt5">&#xe687;</i>下载</el-button>
            <el-dropdown @command="handleClickCommand" size="medium">
              <el-button size="mini">
                更多菜单
                <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <!--  <el-dropdown-item command="deleterepot" v-show="crumbs.length==2" :disabled="tableEmails.length==0||tableEmails.length>1">删除</el-dropdown-item> -->
                <el-dropdown-item command="renameRepo" v-show="crumbs.length==2" :disabled="!(tableEmails.length==1&&reRepoName)">重命名</el-dropdown-item>
                <el-dropdown-item command="changePassword" v-show="crumbs.length==2" :disabled="!(tableEmails.length==1&&fileEncrypted&&reRepoName)">修改密码</el-dropdown-item>
                <el-dropdown-item command="deleteFile" v-show="crumbs.length>2&&ownerRepo||crumbs.length>2&&isStaff==1&&hide" :disabled="tableEmails.length==0">删除</el-dropdown-item>
                <el-dropdown-item command="addMyDir" v-show="crumbs.length>2&&ownerRepo">新建文件夹</el-dropdown-item>
                <el-dropdown-item command="renameRepo" v-show="crumbs.length>2&&ownerRepo" :disabled="tableEmails.length==0||tableEmails.length>1">重命名</el-dropdown-item>
                <el-dropdown-item command="moveFile" v-show="crumbs.length>2&&ownerRepo" :disabled="tableEmails.length==0">移动</el-dropdown-item>
                <el-dropdown-item command="copyFile" v-show="crumbs.length>2" :disabled="tableEmails.length==0">复制</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </el-tab-pane>
        <el-tab-pane label="群组成员" name="second" class="ml20">
          <div class="cd-bg-fff pt10 pb10  clearfix" v-show='ownerDelMember'>
            <el-button size="mini" @click="addGroupUsers">
              <i class="iconfont mr5 mt5">&#xe683;</i>添加成员</el-button>
            <el-button type="danger" plain size="mini" @click="delGroupUsers" :disabled="tableEmails.length==0">
              <i class="iconfont mr5 mt5">&#xe682;</i>删除成员</el-button>
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
    <el-dialog :title="title" class="cd-size-lag" :close-on-click-modal="false" :visible.sync="isTransferGroup" append-to-body>
      <transfer-group @close="getCloseindex" :groupid="gropeId" v-if="isTransferGroup" />
    </el-dialog>
    <el-dialog :title="title" class="cd-size-lag" :close-on-click-modal="false" :visible.sync="isAddGroupUser" append-to-body>
      <add-group-user @close="getCloseindex" :groupid="groupId" v-if="isAddGroupUser" />
    </el-dialog>
    <!-- 新建文件库 -->
    <el-dialog :title="title" class="cd-size-small" :close-on-click-modal="false" :visible.sync="isAddMyRepo" append-to-body>
      <add-my-repo :groupid="groupId" @close="getCloseindex" v-if="isAddMyRepo" />
    </el-dialog>
    <!-- 文件复制移动 -->
    <el-dialog :title="title" class="cd-size-small group-copy-move-dialog" :close-on-click-modal="false" :visible.sync="showDialog" append-to-body>
      <copy-move-file :checksData="tableEmails" :type="operation" @getCopyMemory="getchildMemory" @close="getCloseindex" v-if="showDialog"
      />
    </el-dialog>
    <!-- 文件库修改密码 -->
    <el-dialog :title="title" class="cd-size-small" :close-on-click-modal="false" :visible.sync="isFilePassword" append-to-body>
      <file-password :repoId="repoId" @close="getCloseindex" v-if="isFilePassword" />
    </el-dialog>
  </el-container>
</template>
<script>
import YmUserTable from '../components/YmUserTable';
import TransferGroup from '../components/TransferGroup';
import AddGroupUser from '../components/AddGroupUser';
import CopyMoveFile from '../components/CopyMoveFile';
import FilePassword from '../components/FilePassword';
import AddMyRepo from '../components/AddMyRepo';
import YmList from '../components/YmList';
import config from '../config';
import tree_renderVue from '../components/tree_render.vue';
import base64 from '../utils/base64';
export default {
  components: {
    YmUserTable,
    TransferGroup,
    AddGroupUser,
    AddMyRepo,
    CopyMoveFile,
    FilePassword,
    YmList
  },
  data() {
    return {
      psKey: 'cloudDisk',
      fileList: [],
      tableUrl: '',
      tabelCol: '',
      tableEmails: [],
      type: 'get',
      where: '',
      isIeBrowser: false,
      owner: false,
      ownerDelMember: false,
      hide: false,
      isStaff: '',
      ownerRepo: false,
      fileEncrypted: true,
      reRepoName: true,
      isUpdateSuccess: false,
      crumbs: [],
      crumbsDropdown: [],
      title: '',
      gropeId: '',
      groupId: '',
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
          upload_token: sessionStorage.getItem('token'),
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
      isTransferGroup: false,
      isAddGroupUser: false,
      isAddMyRepo: false,
      fullscreenLoading: false,
      isUploaderList: false,
      isFilePassword: false,
      tabIndex: '0'
    };
  },
  created() {
    this.getInformation();
    if (!!window.ActiveXObject || 'ActiveXObject' in window) {
      this.isIeBrowser = true;
    }
  },
  watch: {
    $route: 'loadGroupManage'
  },
  mounted() {
    this.loadGroupManage();
  },
  methods: {
    getchildMemory(useMemory, totalMemory) {
      let self = this;
      self.$parent.useMemory = useMemory;
      self.$parent.totalMemory = totalMemory;
      self.$parent.memoryPercent = useMemory / totalMemory * 100;
    },
    loadGroupManage() {
      this.tableUrl = '/api/group/queryGroups/';
      this.tabelCol = [
        [
          //标题栏
          {
            type: 'checkbox',
            width: 48
          },
          {
            field: 'name',
            title: '群组名称',
            width: '35%',
            event: 'nextTable',
            templet: function(d) {
              return '<a class="cs-p">' + d.name + '</a>';
            }
          },
          {
            field: 'anotherName',
            title: '拥有者',
            width: '30%',
            templet: function(d) {
              return d.nickName == undefined
                ? d.anotherName
                : d.nickName + ' ( ' + d.anotherName + ' )';
            }
          },
          {
            field: 'ctime',
            title: '创建时间',
            width: '30%'
          }
        ]
      ];
      this.crumbs.push({
        url: this.tableUrl,
        cols: this.tabelCol,
        name: '群组管理',
        path: 'p'
      });
    },
    handleClickCommand(command) {
      if (command == 'quitGroups') {
        this.quitGroups();
      } else if (command == 'transferGroup') {
        this.transferGroup();
      } else if (command == 'reGroupName') {
        this.reGroupName();
      } else if (command == 'deleteFile') {
        this.deleteFile();
      } else if (command == 'addMyDir') {
        this.addMyDir();
      } else if (command == 'download') {
        this.download();
      } else if (command == 'renameRepo') {
        this.renameRepo();
      } else if (command == 'deleterepot') {
        this.deleterepot();
      } else if (command == 'moveFile') {
        this.moveFile();
      } else if (command == 'copyFile') {
        this.copyFile();
      } else if (command == 'changePassword') {
        this.changePassword();
      }
    },
    handleClick(tab, event) {
      let tempArr = [];
      if (tab.index == 1) {
        this.activeName = 'second';
        for (let a of this.crumbs) {
          if (a.name == this.groupName) {
            this.crumbs[1].url = '/api/group/queryGroupUser/' + this.gropeId;
          }
        }
        if (this.crumbs.length === 2 && this.tabIndex === '1') {
          tempArr = this.tableEmails;
        }
        this.loadQueryGroupUser(this.gropeId);
        this.tabIndex = tab.index;
      } else if (tab.index == 0) {
        this.activeName = 'first';
        for (let a of this.crumbs) {
          if (a.name == this.groupName) {
            this.crumbs[1] = a;
          }
        }
        if (this.crumbs.length === 2 && this.tabIndex === '0') {
          tempArr = this.tableEmails;
        }
        this.loadGroupFile();
        this.tabIndex = tab.index;
      }
      this.crumbs.splice(2, this.crumbs.length - 1);
      this.tableEmails = tempArr;
    },
    getNextTableEvent(obj) {
      if (this.crumbs.length > 1) {
        if (this.crumbs.length == 2) {
          this.ownerRepo = obj.data.ownerRepo;
          this.hide = obj.data.hide;
        }
        this.loadMyDirent(obj);
      } else {
        this.gropeId = obj.data.id;
        this.groupId = obj.data.id;
        this.owner = obj.data.owner ? true : false;
        this.ownerDelMember = obj.data.owner ? true : false;
        this.activeName = 'first';
        this.groupName = obj.data.name;
        this.loadGroupFile();
      }
    },
    getcrumbs(item, $index) {
      if (item.url && $index != this.crumbs.length - 1) {
        this.tableUrl = item.url;
        this.tabelCol = item.cols;
        // 个人文件库和部门文件库层级
        if ($index == 1) {
          this.where = {
            groupId: this.gropeId
          };
        }
        this.crumbs.splice($index + 1, this.crumbs.length - 1);
        this.dpath = item.path;
        this.path = item.path;
        if (this.crumbs.length > 2) {
          this.tableEmails = [];
        }

        if (
          (item.path != 'p' && this.ownerRepo && this.crumbs.length > 2) ||
          (this.hide && this.crumbs.length > 2)
        ) {
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
        this.getCrumbsDropdown();
      } else {
        return;
      }
    },
    loadQueryGroupUser(id) {
      this.tableEmails = [];
      this.tableUrl = '/api/group/queryGroupUser/' + id;
      if (this.ownerDelMember) {
        this.tabelCol = [
          [
            //标题栏
            {
              type: 'checkbox',
              width: 48
            },
            {
              field: 'name',
              title: '姓名',
              width: '35%'
            },
            {
              field: 'email',
              title: '邮箱',
              width: '30%',
              templet: function(d) {
                return d.email == 'admin@seafile.local'
                  ? 'admin@wh.hb.pro'
                  : d.email;
              }
            },
            {
              field: 'role',
              title: '用户角色',
              width: '30%',
              templet: function(d) {
                return (
                  '<span>' + (d.is_admin ? '群主' : '群组成员') + '</span>'
                );
              }
            }
          ]
        ];
      } else {
        this.tabelCol = [
          [
            {
              field: 'name',
              title: '姓名',
              width: '40%'
            },
            {
              field: 'email',
              title: '邮箱',
              width: '30%',
              templet: function(d) {
                return d.email == 'admin@seafile.local'
                  ? 'admin@wh.hb.pro'
                  : d.email;
              }
            },
            {
              field: 'role',
              title: '用户角色',
              width: '30%',
              templet: function(d) {
                return (
                  '<span>' + (d.is_admin ? '群主' : '群组成员') + '</span>'
                );
              }
            }
          ]
        ];
      }

      if (this.crumbs.length === 1) {
        // 当面包屑长度为1 第一次进入tab页就新增群组文件和群组成员的路由
        this.crumbs.push({
          url: this.tableUrl,
          cols: this.tabelCol,
          name: this.groupName,
          path: 'p'
        });
      } else if (this.crumbs.length === 2) {
        // 当面包屑长度为2 切换tab页替换相应的路由
        this.crumbs.splice(1, 1, {
          url: this.tableUrl,
          cols: this.tabelCol,
          name: this.groupName,
          path: 'p'
        });
      }
    },
    loadGroupFile() {
      this.tableEmails = [];
      this.tableUrl = '/api/group/sharedGroup';
      this.where = {
        groupId: this.gropeId
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
                        <use xlink:href="#icon-wenjianku"></use>
                    </svg><i class="iconfont">${
                      d.encrypted ? '&#xe693;' : ''
                    }</i>${d.name}</a>`;
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
              return '<span>文件库</span>';
            }
          },
          {
            field: 'owner_nickname',
            title: '拥有者',
            width: '20%',
            templet: function(d) {
              return d.anotherName == undefined
                ? d.owner_nickname
                : d.owner_nickname + ' ( ' + d.anotherName + ' )';
            }
          }
        ]
      ];
      if (this.crumbs.length === 1) {
        // 当面包屑长度为1 第一次进入tab页就新增群组文件和群组成员的路由
        this.crumbs.push({
          url: this.tableUrl,
          cols: this.tabelCol,
          name: this.groupName,
          path: 'p'
        });
      } else if (this.crumbs.length === 2) {
        // 当面包屑长度为2 切换tab页替换相应的路由
        this.crumbs.splice(1, 1, {
          url: this.tableUrl,
          cols: this.tabelCol,
          name: this.groupName,
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
                this.deciphering();
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
      if (this.ownerRepo || this.hide) {
        //解决不是拥有者也去查询上传链接，导致报错的问题
        this.getUrl({
          p: obj.data.path,
          repoId: obj.data.repoId
        });
      }
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
        '/api/repos/dirent?p=' + encodeURIComponent(obj.data.path);
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
              if (d.type == 'dir') {
                return `<a class="cs-p" title="${d.name}">
                            <svg class="icon mr5  fz20" aria-hidden="true">
                            <use xlink:href="${d.address}"></use>
                        </svg>
                    ${d.name}</a>`;
              } else {
                return `<span title="${d.name}">
                            <svg class="icon mr5  fz20" aria-hidden="true">
                            <use xlink:href="${d.address}"></use>
                        </svg>
                    ${d.name}</span>`;
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
        (this.$refs.companyStyle.$el.clientWidth - 40) / 127;
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
    transferGroup() {
      this.gropeId = this.tableEmails[0].id;
      this.title = '群组转让';
      this.isTransferGroup = true;
    },
    reGroupName() {
      this.gropeId = this.tableEmails[0].id;
      this.add(
        '群组',
        '/api/group/reGroupName',
        '重命名',
        'post',
        this.tableEmails[0].name,
        /^[\u4e00-\u9fa5a-zA-Z0-9\-\_]{1,40}$/,
        '只能输入数字、字母、中文和-_，长度在40个字符以内！'
      );
    },
    addGroup() {
      this.add(
        '群组',
        '/api/group/addGroup',
        '新建',
        'post',
        null,
        /^[\u4e00-\u9fa5a-zA-Z0-9\-\_]{1,40}$/,
        '只能输入数字、字母、中文和-_，长度在40个字符以内！'
      );
    },
    addMyRepo() {
      //新建文件库
      this.title = '新建文件库';
      this.isAddMyRepo = true;
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
          if (value != '') {
            value = base64.encode(this.psKey + value);
          }
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
    add(name, url, operation, type, keyName, inputPattern, inputErrorMessage) {
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
        inputValue: keyName,
        confirmButtonClass: 'loading',
        closeOnClickModal: false,
        inputPattern: regex,
        inputErrorMessage: `${name}格式不正确，不能为空，${msg}`
      })
        .then(({ value }) => {
          if (value) {
            let data = {};
            if (name == '群组' && operation == '新建') {
              data = {
                name: value
              };
            } else if (name == '文件库' && operation == '新建') {
              data = {
                name: value,
                groupId: this.gropeId
              };
            } else if (name == '群组' && operation == '重命名') {
              data = {
                name: value,
                groupId: this.gropeId
              };
            } else if (name == '文件夹' && operation == '新建') {
              data = {
                repoId: this.repoId,
                p: this.dpath + '/' + value,
                operation: 'mkdir'
              };
            } else if (name == '密码' && operation == '解密') {
              data = {
                password: value,
                id: this.repoId
              };
            } else if (name == '文件库' && operation == '重命名') {
              data = {
                op: 'rename',
                repoName: value,
                id: this.repoId
              };
            } else {
              if (value == this.tableEmails[0].name) {
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
                  repoId: this.repoId
                };
              } else if (name == '文件' && operation == '重命名') {
                data = {
                  operation: 'rename',
                  newname: value,
                  p: this.tableEmails[0].path,
                  repoId: this.repoId
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
          }
        })
        .catch(() => {
          this.fullscreenLoading = false;
          this.$message({
            type: 'info',
            message: '取消输入'
          });
        });
    },
    addGroupUsers() {
      this.title = '添加成员';
      this.isAddGroupUser = true;
    },
    del(name, url, operation) {
      let self = this;
      let tempMessage = '';
      if (url === '/api/repos/delRepo') {
        tempMessage = '若存在已删除的子文件将会合并显示在回收站中';
      }
      if (url === '/api/repos/dels') {
        tempMessage = '若存在已删除的子文件将会合并显示在回收站中';
      }
      this.$confirm(
        `此操作将${operation}该${name}, 是否继续?` + tempMessage,
        '提示',
        {
          closeOnClickModal: false,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
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
                type: a.type
              });
            }
            data = param;
          } else if (
            operation == '删除' &&
            this.crumbs.length == 2 &&
            name != '群组成员'
          ) {
            let param = [];
            for (let a of this.tableEmails) {
              param.push({
                id: a.id
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
                setTimeout(function() {
                  self.getMemory();
                }, 3000);
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
    delGroups() {
      this.del('群组', '/api/group/delGroups/', '解散');
    },
    quitGroups() {
      this.del('群组', '/api/group/quitGroups/', '退出');
    },
    delGroupUsers() {
      this.del('群组成员', '/api/group/delGroupUsers/', '删除');
    },
    getCheckboxs(tableEmails) {
      // debugger
      this.tableEmails = tableEmails;
      if (tableEmails.length == 1 && tableEmails[0].encrypted) {
        this.fileEncrypted = true;
      } else {
        this.fileEncrypted = false;
      }
      if (tableEmails.length == 1 && tableEmails[0].ownerRepo == 'true') {
        this.reRepoName = true;
      } else {
        this.reRepoName = false;
      }
      if (tableEmails.length == 1 && tableEmails[0].owner == 'true') {
        this.owner = true;
      } else {
        this.owner = false;
      }
    },
    getMemory() {
      let self = this;
      if (sessionStorage.getItem('token')) {
        self
          .$axios({
            method: 'get',
            url: '/api/user/getUserMsg'
          })
          .then(res => {
            if (res.data.code == 200) {
              self.$parent.useMemory = (
                parseInt(res.data.data.usedStorage) /
                (1000 * 1000 * 1000)
              ).toFixed(2);
              self.$parent.totalMemory = (
                parseInt(res.data.data.totalStorage) /
                (1000 * 1000 * 1000)
              ).toFixed(2);
              self.$parent.memoryPercent =
                self.$parent.useMemory / self.$parent.totalMemory * 100;
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
    },
    getCloseindex(data) {
      this[data.dialog] = false;
      if (data.index == 1) {
        this.$refs.refresh.reloadTable();
        this.tableEmails = [];
      }
    },
    openEditLayer() {
      layui.layer.open({
        type: 2,
        shade: 0,
        maxmin: true,
        area: ['600px', '550px'],
        title: '添加' + this.pageTitle,
        content:
          '#/admin/article/' +
          this.artType +
          '/edit/add?title=文章&readyShowContent=true'
      });
    },
    changePassword() {
      this.title = '修改密码';
      this.repoId = this.tableEmails[0].id;
      this.isFilePassword = true;
    },
    addMyDir() {
      this.add('文件夹', '/api/repos/insertDir', '新建', 'put');
    },
    deleterepot() {
      this.del('文件库', '/api/repos/delRepo', '删除');
    },
    deleteFile() {
      this.del('文件或者文件夹', '/api/repos/dels', '删除');
    },
    renameRepo() {
      this.repoId = this.tableEmails[0].repoId;
      let type = this.tableEmails[0].type;
      if (type == 'repo') {
        this.add(
          '文件库',
          '/api/repos',
          '重命名',
          'post',
          this.tableEmails[0].name
        );
      } else if (type == 'dir') {
        this.add(
          '文件夹',
          '/api/repos/dir',
          '重命名',
          'post',
          this.tableEmails[0].name
        );
      } else if (type == 'file') {
        this.add(
          '文件',
          '/api/repos/file',
          '重命名',
          'post',
          this.tableEmails[0].name,
          /^.{1,80}$/,
          '长度在80个字符以内！'
        );
      }
    },
    delshare() {
      this.del('文件库', '/api/group/delSharedGroup', '取消分享');
    },
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
          url: '/api/user/getLeftStorage'
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
                        '文件夹格式不正确，不能为空,只能输入数字、字母、中文和、[]-_.()，长度在80个字符以内！'
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
            self.$message({
              type: 'warning',
              message: error.data.message
            });
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
    fileSuccess() {},
    fileComplete(rootFile) {
      this.isUpdateSuccess = true;
      //全部上传成功后同步数据
      this.$axios({
        method: 'post',
        url: '/api/repos/fileUploadSuccess',
        data: {
          repoId: this.repoId,
          ppath: this.crumbs[this.crumbs.length - 1].path,
          libName: this.crumbs[1].name
        }
      })
        .then(res => {
          if (res.data.code == 200) {
          }
        })
        .catch(error => {
          if (error.data && error.data.message) {
            this.$message({ type: 'warning', message: error.data.message });
          }
        });
      this.tableEmails = [];
      this.$refs.refresh.reloadTable();
      setTimeout(() => {
        this.getMemory();
      }, 3000);
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
    copyFile() {
      //文件复制
      this.operation = 'copy';
      this.title = '复制到你要保存的路径';
      this.showDialog = true;
    },
    moveFile() {
      //文件移动
      this.operation = 'move';
      this.title = '移动到你要保存的路径';
      this.showDialog = true;
    },
    getUrl(obj) {
      layui.layer.load();
      this.$axios({
        method: 'get',
        url:
          '/api/repos/uploadFile?p=' +
          encodeURIComponent(obj.p) +
          '&repoId=' +
          obj.repoId
      })
        .then(res => {
          if (res.data.code == 200) {
            this.$refs.uploader.uploader.opts.target =
              '/seafhttp/upload-aj/' + res.data.data;
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
          url: '/api/repos/oneFile',
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
          url: '/api/repos/filezips',
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
    getInformation() {
      if (sessionStorage.getItem('token')) {
        this.$axios({
          method: 'get',
          url: '/api/user/getUserMsg'
        }).then(res => {
          if (res.data.code == 200) {
            this.isStaff = res.data.data.isStaff;
          }
        });
      }
    }
  }
};
</script>
<style lang="less">
.group-manage {
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
</style>
