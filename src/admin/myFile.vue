<template>
  <el-container v-loading="fullscreenLoading">
    <uploader :options="options"
              ref="uploader"
              :autoStart="false"
              @files-added="onFileAdded"
              @file-progress="onUploadProgress"
              class="uploader-example"
              :file-status-text="statusText"
              @file-error="fileError"
              @file-success="fileSuccess"
              @file-complete="fileComplete">
      <el-header class="cd-title"
                 ref="companyStyle">
        <template v-for="(item,index) in crumbs">
          <div class="cd-crumbs"
               :title="item.name"
               :class="index==1&&crumbsDropdown.length>0?'cd-crumbs cd-crumbs-top':'cd-crumbs'"
               :key="index">
            <template v-if='index==1&&crumbsDropdown.length>0'>
              <el-dropdown>
                <span class="el-dropdown-link">
                  <a class="c-h cs-p cd-crumbs-a">......
                    <i class="el-icon-arrow-down el-icon--right"></i>
                  </a>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <template v-for="(itemDropdown,count) in crumbsDropdown">
                    <el-dropdown-item @click.native="getcrumbs(itemDropdown,itemDropdown.index)"
                                      :key="count">
                      <a class="c-h cs-p cd-crumbs-a">{{itemDropdown.name}}</a>
                    </el-dropdown-item>
                  </template>
                </el-dropdown-menu>
              </el-dropdown>
              <span class="ml5 mr5">></span>
            </template>
            <template v-if='!(index>0&&index<crumbsDropdown.length+1)'>
              <a @click="getcrumbs(item,index)"
                 :class="{'c-h cs-p':index<crumbs.length-1}">{{item.name}}</a>
              <span v-show="index<crumbs.length-1"
                    class="ml5 mr5">></span>
            </template>
          </div>
        </template>
      </el-header>
      <uploader-unsupport></uploader-unsupport>
      <div class="cd-bg-fff pt10 pb10 pl20 btn-container clearfix">
        <div v-show="crumbs.length > 1"
             class="pull-left clearfloat">
          <el-row>
            <el-dropdown size="medium"
                         v-show="!searchFlag">
              <el-button size="mini">
                <i class="iconfont">&#xe685;</i>上传
                <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <uploader-drop>
                  <el-dropdown-item class="cloudDisk-dropdown-item">
                    <uploader-btn>上传文件</uploader-btn>
                  </el-dropdown-item>
                  <el-dropdown-item v-if="!isIeBrowser"
                                    class="cloudDisk-dropdown-item">
                    <uploader-btn :directory="true">上传文件夹</uploader-btn>
                  </el-dropdown-item>
                </uploader-drop>
              </el-dropdown-menu>
            </el-dropdown>
            <el-button size="mini"
                       @click="download"
                       :disabled="((searchFlag&&(tableEmails.length==0||tableEmails.length>1)))">
              <i class="iconfont mr5 mt5">&#xe687;</i>下载</el-button>
            <el-dropdown @command="handleClick"
                         size="medium">
              <el-button size="mini">
                更多菜单
                <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="share"
                                  :disabled="tableEmails.length==0||tableEmails.length>1">共享</el-dropdown-item>
                <el-dropdown-item command="add"
                                  v-show="!searchFlag">新建文件夹</el-dropdown-item>
                <el-dropdown-item command="dels"
                                  :disabled="((tableEmails.length==0&&!searchFlag)||(searchFlag&&(tableEmails.length==0||tableEmails.length>1)))">删除</el-dropdown-item>
                <el-dropdown-item command="reNameDir"
                                  v-show="fileType"
                                  :disabled="tableEmails.length==0||tableEmails.length>1">重命名</el-dropdown-item>
                <el-dropdown-item command="reNameFile"
                                  v-show="!fileType"
                                  :disabled="tableEmails.length==0||tableEmails.length>1">重命名</el-dropdown-item>
                <el-dropdown-item command="moveFile"
                                  :disabled="((tableEmails.length==0&&!searchFlag)||(searchFlag&&(tableEmails.length==0||tableEmails.length>1)))">移动</el-dropdown-item>
                <el-dropdown-item command="copyFile"
                                  :disabled="((tableEmails.length==0&&!searchFlag)||(searchFlag&&(tableEmails.length==0||tableEmails.length>1)))">复制</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-row>
        </div>
        <div v-show="crumbs.length==1"
             class="pull-left">
          <el-row>
            <el-button size="mini"
                       @click="addMyRepo">
              <i class="iconfont mr5 mt5">&#xe890;</i>新建文件库</el-button>
            <el-button size="mini"
                       @click="changePassword()"
                       :disabled="fileEncrypted">
              <i class="iconfont mr5 mt5">&#xe697;</i>修改密码</el-button>
            <el-button type="danger"
                       plain
                       size="mini"
                       @click="deleteRepo"
                       :disabled="tableEmails.length==0||tableEmails.length>1">
              <i class="iconfont mr5 mt5">&#xe682;</i>删除</el-button>
            <el-dropdown @command="handleClick"
                         size="medium">
              <el-button size="mini">
                更多菜单
                <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="share"
                                  :disabled="tableEmails.length==0||tableEmails[0].type =='file'||tableEmails.length>1">共享</el-dropdown-item>
                <el-dropdown-item command="reNameRepo"
                                  :disabled="tableEmails.length==0||tableEmails.length>1">重命名</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <!-- <ym-search @search="searchData" :searchPlaceholder="'请输入关键字搜索文件'"/> -->
          </el-row>
        </div>
        <div class="pull-right pr20 my-file-search">
          <ym-search @search="searchData"
                     :searchPlaceholder="'请输入关键字搜索文件'" />
        </div>
      </div>
      <div class="">
        <ym-user-table ref="refresh"
                       @tableEmails="getCheckboxs"
                       @nextTableEvent="getNextTableEvent"
                       :url="tableUrl"
                       :cols="tabelCol"
                       :page="true"
                       :type="type"
                       :where="where"></ym-user-table>
      </div>
      <!-- <div id="uploaderList" v-show="isUploaderList">
                        <uploader-list :loading="loading"></uploader-list>
                    </div> -->
    </uploader>
    <!-- 文件上传 -->
    <el-dialog :title="'文件上传'"
               class="cd-size-middle yofc-upload-list"
               :close-on-click-modal="false"
               :before-close="closeUpload"
               :visible.sync="isUploaderList"
               append-to-body>
      <ym-list :fileLists="fileList" />
    </el-dialog>
    <!-- 文件复制移动 -->
    <el-dialog :title="title"
               class="cd-size-small my-file-copy-move-dialog"
               :close-on-click-modal="false"
               :visible.sync="showDialog"
               append-to-body>
      <copy-move-file :checksData="tableEmails"
                      :type="operation"
                      v-if="showDialog"
                      @getCopyMemory="getchildMemory"
                      @close="getCloseindex" />
    </el-dialog>
    <!-- 分享文件 -->
    <el-dialog :title="title"
               class="cd-size-lag"
               :close-on-click-modal="false"
               :visible.sync="isShareFile"
               append-to-body>
      <share-my-file :shareNum="1"
                     :repoid="repoId"
                     :path="spath"
                     :type="tableEmails[0].type"
                     :sizeformatted="tableEmails[0].size_formatted"
                     v-if="isShareFile"
                     @close="getCloseindex" />
    </el-dialog>
    <!-- 新建文件库 -->
    <el-dialog :title="title"
               class="cd-size-small"
               :close-on-click-modal="false"
               :visible.sync="isAddMyRepo"
               append-to-body>
      <add-my-repo @close="getCloseindex"
                   v-if="isAddMyRepo" />
    </el-dialog>
    <!-- 文件库修改密码 -->
    <el-dialog :title="title"
               class="cd-size-small"
               :close-on-click-modal="false"
               :visible.sync="isFilePassword"
               append-to-body>
      <file-password :repoId="repoId"
                     @close="getCloseindex"
                     v-if="isFilePassword" />
    </el-dialog>
    <!-- 文件库解密 -->
    <el-dialog :title="title"
               class="cd-size-small"
               :close-on-click-modal="false"
               :visible.sync="isDecipheringPassword"
               append-to-body>
      <deciphering-password :repoId="repoId"
                            :decipheringObj="decipheringObj"
                            @close="getCloseindex"
                            v-if="isDecipheringPassword" />
    </el-dialog>
  </el-container>
</template>
<script>
import YmSearch from '../components/YmSearch';
import YmCrumbs from '../components/YmCrumbs';
import YmUserTable from '../components/YmUserTable';
import CopyMoveFile from '../components/CopyMoveFile';
import FilePassword from '../components/FilePassword';
import DecipheringPassword from '../components/DecipheringPassword';
import ShareMyFile from '../components/ShareMyFile';
import AddMyRepo from '../components/AddMyRepo';
import YmList from '../components/YmList';
import config from '../config';
import { mapGetters } from 'vuex';
import tree_renderVue from '../components/tree_render.vue';
import base64 from '../utils/base64';
export default {
  components: {
    YmSearch,
    YmUserTable,
    YmCrumbs,
    CopyMoveFile,
    ShareMyFile,
    AddMyRepo,
    FilePassword,
    DecipheringPassword,
    YmList
  },
  data () {
    return {
      isIeBrowser: false,
      showDialog: false,
      isAddMyRepo: false,
      isUpdateSuccess: false,
      title: '',
      operation: '',
      spath: '', //分享使用，避免分享的时候修改了路径path
      path: '',
      crumbs: [],
      crumbsDropdown: [],
      fileList: [],
      tableUrl: '',
      tabelCol: '',
      type: 'get',
      tableEmails: [],
      id: [],
      where: {},
      repoId: '',
      fileEncrypted: true,
      fileType: true,
      options: {
        allowDuplicateUploads: true,
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
      attrs: {
        accept: 'image/*'
      },
      statusText: {
        success: '成功',
        error: '出错',
        uploading: '上传中',
        paused: '暂停中',
        waiting: '等待中'
      },
      fullscreenLoading: false,
      isUploaderList: false,
      isShareFile: false,
      isFilePassword: false,
      isDecipheringPassword: false,
      psKey: 'cloudDisk',
      decipheringObj: null,
      keyWords: '',
      searchFlag: false
    };
  },
  created () {
    this.loadMyFile();
    if (!!window.ActiveXObject || 'ActiveXObject' in window) {
      this.isIeBrowser = true;
    }
  },
  computed: mapGetters({
    reloadTable: 'GET_MSG'
  }),
  mounted () {
    window.addEventListener(
      'message',
      e => {
        console.log(e)
      },
      false
    )
  },
  watch: {
    $route: 'loadMyFile'
  },
  methods: {
    searchData (keyValue) {
      this.keyWords = keyValue;
      if (this.keyWords) {
        this.loadUserList(this.keyWords);
        this.searchFlag = true;
      } else {
        // 关键字为空的时候回到文件库界面
        this.loadMyFile();
        this.searchFlag = false;
      }
    },
    // 搜索关键字
    loadUserList (keyWords) {
      let tempKeyWords = encodeURIComponent(keyWords);
      this.tableEmails = [];
      this.tableUrl = `/api/repos/elasticsearchSearch?keyword=${tempKeyWords}`;
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
            width: '30%',
            event: 'nextTableFile',
            templet: function (d) {
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
          { field: 'size_formatted', title: '大小', width: '10%' },
          {
            field: 'type',
            title: '文件类型',
            width: '10%',
            templet: function (d) {
              return (
                '<span>' + (d.type == 'dir' ? '文件夹' : '文件') + '</span>'
              );
            }
          },
          {
            field: 'ppath',
            title: '路径',
            width: '25%',
            templet: function (d) {
              return `<span title="${d.libName}${d.ppath}">${d.libName}${
                d.ppath
                }</span>`;
            }
          },
          {
            field: 'time',
            title: '更新时间',
            width: '20%',
            templet: function (d) {
              return `<span title="${d.time}">${d.time}</span>`;
            }
          }
        ]
      ];
      // 面包屑变为关键字的搜索结果
      if (this.crumbs.length === 1) {
        this.crumbs.push({
          name: `“${this.keyWords}”的搜索结果`
        });
      } else if (this.crumbs.length > 1) {
        this.crumbs.splice(1, this.crumbs.length - 1, {
          name: `“${this.keyWords}”的搜索结果`
        });
      }
      this.getCrumbsDropdown();
    },
    getchildMemory (useMemory, totalMemory) {
      let self = this;
      self.$parent.useMemory = useMemory;
      self.$parent.totalMemory = totalMemory;
      self.$parent.memoryPercent = useMemory / totalMemory * 100;
    },
    closeUpload (done) {
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
      this.$refs.uploader.uploader.cancel();
      done();
    },
    start () {
      this.$refs.uploader.autoStart = true;
    },
    fileSuccess (rootFile, file, message, chunk) { },
    fileComplete (rootFile) {
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
    fileError () {
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
    handleClick (command) {
      if (command == 'share') {
        this.shareFile();
      } else if (command == 'reNameRepo') {
        this.renameRepo();
      } else if (command == 'reNameDir') {
        this.reNameDir();
      } else if (command == 'reNameFile') {
        this.reNameFile();
      } else if (command == 'add') {
        this.addMyFile();
      } else if (command == 'dels') {
        this.deleteFile();
      } else if (command == 'moveFile') {
        this.moveFile();
      } else if (command == 'copyFile') {
        this.copyFile();
      }
    },
    getcrumbs (item, $index) {
      if (item.url && $index != this.crumbs.length - 1) {
        this.tableUrl = item.url;
        this.tabelCol = item.cols;
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
        this.tableEmails = [];
        this.getCrumbsDropdown();
      } else {
        return;
      }
    },
    onFileAdded (files, fileList) {
      let self = this;
      let validate = true;
      let leftOver = 0;
      let memory = 0;
      let pro1 = null;
      let pro2 = null;
      let parentDir = '';
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
                  if (files[i].parent.name != null) {
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
                      return;
                    } else if (files[i].name.length > 80) {
                      validate = false;
                      self.fullscreenLoading = false;
                      self.$refs.uploader.uploader.cancel();
                      self.$message({
                        type: 'warning',
                        message: '文件长度在80个字符以内！'
                      });
                      return;
                    } else {
                      if (files[i].parent.path != null) {
                        parentDir =
                          this.$refs.uploader.uploader.opts.query.parent_dir +
                          files[i].parent.path;
                      } else {
                        parentDir = this.$refs.uploader.uploader.opts.query
                          .parent_dir;
                      }
                      pro1 = self
                        .$axios({
                          method: 'post',
                          url: '/api/repos/checkSameName',
                          data: {
                            repoId: this.repoId,
                            parentDir: parentDir,
                            fileName: files[i].name
                          }
                        })
                        .then(res => {
                          if (res.data.data == true) {
                            validate = false;
                            self.fullscreenLoading = false;
                            self.$refs.uploader.uploader.cancel();
                            self.$message({
                              type: 'warning',
                              message: '文件或文件夹在回收站已存在'
                            });
                          }
                        })
                        .catch(error => { });
                    }
                  } else if (files[i].name.length > 80) {
                    validate = false;
                    self.fullscreenLoading = false;
                    self.$refs.uploader.uploader.cancel();
                    self.$message({
                      type: 'warning',
                      message: '文件长度在80个字符以内！'
                    });
                    return;
                  } else {
                    pro2 = self
                      .$axios({
                        method: 'post',
                        url: '/api/repos/checkSameName',
                        data: {
                          repoId: this.repoId,
                          parentDir: this.$refs.uploader.uploader.opts.query
                            .parent_dir,
                          fileName: files[i].name
                        }
                      })
                      .then(res => {
                        if (res.data.data == true) {
                          validate = false;
                          self.fullscreenLoading = false;
                          self.$refs.uploader.uploader.cancel();
                          self.$message({
                            type: 'warning',
                            message: '文件或文件夹在回收站已存在'
                          });
                        }
                      })
                      .catch(error => { });
                  }
                }
                Promise.all([pro1, pro2]).then(function () {
                  if (validate) {
                    self.$refs.uploader.uploader.resume();
                    self.fullscreenLoading = false;
                    self.fileList = fileList;
                    self.isUploaderList = true;
                  }
                });
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
    onUploadProgress (Number) { },
    getCheckboxs (obj) {
      this.tableEmails = obj;
      if (this.tableEmails.length == 1) {
        if (this.tableEmails[0].type == 'dir') {
          this.fileType = true;
        } else if (this.tableEmails[0].type == 'file') {
          this.fileType = false;
        }
      }
      if (obj.length == 1 && obj[0].encrypted) {
        this.fileEncrypted = false;
      } else {
        this.fileEncrypted = true;
      }
    },
    getNextTableEvent (obj) {
      this.path = obj.data.path;
      this.loadMyDirent(obj);
    },
    loadMyFile () {
      this.crumbs = [];
      this.tableUrl = '/api/repos?type=mine';
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
            width: '45%',
            event: 'nextTableFile',
            templet: function (d) {
              return `<a class="cs-p" title="${
                d.name
                }"><svg class="icon mr5  fz20" aria-hidden="true">
                        <use xlink:href="${d.address}"></use>
                    </svg><i class="iconfont">${
                d.encrypted ? '&#xe693;' : ''
                }</i> ${d.name}</a>`;
            }
          },
          { field: 'size_formatted', title: '大小', width: '20%' },
          {
            field: 'type',
            title: '文件类型',
            width: '10%',
            templet: function (d) {
              return '<span>文件库</span>';
            }
          },
          {
            field: 'time',
            title: '更新时间',
            width: '20%',
            templet: function (d) {
              return `<span title="${d.time}">${d.time}</span>`;
            }
          }
        ]
      ];
      this.crumbs.push({
        url: this.tableUrl,
        cols: this.tabelCol,
        name: '我的文件库',
        path: 'p'
      });
    },
    getUrl (obj) {
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
            this.$message({ type: 'warning', message: error.data.message });
          }
        });
    },
    addMyRepo () {
      //新建文件库
      this.title = '新建文件库';
      this.isAddMyRepo = true;
    },
    changePassword () {
      this.title = '修改密码';
      this.repoId = this.tableEmails[0].id;
      this.isFilePassword = true;
    },
    shareFile () {
      //文件分享
      this.repoId = this.tableEmails[0].repoId
        ? this.tableEmails[0].repoId
        : 'null';
      this.title =
        this.crumbs.length == 1
          ? '共享文件库'
          : this.tableEmails[0].type == 'file' ? '共享文件' : '共享文件夹';
      this.spath = this.tableEmails[0].path;
      this.isShareFile = true;
    },
    copyFile () {
      //文件复制
      this.operation = 'copy';
      this.title = '请选择目标路径';
      this.showDialog = true;
    },
    moveFile () {
      //文件移动
      this.operation = 'move';
      this.title = '请选择目标路径';
      this.showDialog = true;
    },
    loadMyDirent (obj) {
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
                this.decipheringObj = this.obj;
                this.title = '解密';
                this.isDecipheringPassword = true;
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
    add (name, url, operation, type, keyValue, inputPattern, inputErrorMessage) {
      let self = this;
      let regex = /^(?=[\u4e00-\u9fa5a-zA-Z0-9\.\-\、\[\]\_\(\)]+[\u4e00-\u9fa5a-zA-Z0-9\.\-\、\[\]\s\_\(\)]+[\u4e00-\u9fa5a-zA-Z0-9\.\-\、\[\]\_\(\)]$).{1,80}$|^[\u4e00-\u9fa5a-zA-Z0-9\-\、\[\]\.\_\(\)]{1,80}$/;
      if (inputPattern != null) {
        regex = inputPattern;
      }
      let msg = '只能输入数字、字母、中文和、[].-_()，长度在80个字符以内！';
      if (inputErrorMessage != null) {
        msg = inputErrorMessage;
      }
      this.$prompt(`请输入${name}`, `${operation}`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: keyValue,
        confirmButtonClass: 'loading',
        inputPattern: regex,
        closeOnClickModal: false,
        inputType: 'text',
        inputErrorMessage: `${name}格式不正确，不能为空，${msg}`
      })
        .then(({ value }) => {
          this.fullscreenLoading = true;
          let data;
          if (name == '文件夹名称' && operation == '新建文件夹') {
            let tempPath = '';
            if (this.crumbs.length == 2) {
              tempPath = this.dpath + value;
            } else if (this.crumbs.length > 2) {
              tempPath = this.dpath + '/' + value;
            }
            data = {
              repoId: this.repoId,
              p: tempPath,
              operation: 'mkdir'
            };
          } else if (name == '文件库名称' && operation == '重命名文件库') {
            data = {
              op: 'rename',
              repoName: value,
              id: this.repoId
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
            if (name == '文件夹名称' && operation == '重命名文件夹') {
              data = {
                operation: 'rename',
                newname: value,
                p: self.tableEmails[0].path,
                repoId: self.repoId
              };
            } else if (name == '文件名称' && operation == '重命名文件') {
              data = {
                operation: 'rename',
                newname: value,
                p: self.tableEmails[0].path,
                repoId: self.repoId
              };
            }
          }
          this.$axios({
            method: type,
            url: url,
            data: data
          })
            .then(res => {
              if (res.data.code == 200) {
                this.tableEmails = [];
                this.$message({
                  type: 'success',
                  message: `${operation}成功`
                });
                this.fullscreenLoading = false;
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
    del (name, url, operation, type, params) {
      this.$confirm(
        `此操作将${operation}该${name}, 是否继续?若存在已删除的子文件将会合并显示在回收站中!`,
        '提示',
        {
          closeOnClickModal: false,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.fullscreenLoading = true;
          this.$axios({
            method: type,
            url: url,
            data: params
          })
            .then(res => {
              if (res.data.code == 200) {
                setTimeout(() => {
                  this.getMemory();
                }, 3000);
                this.fullscreenLoading = false;
                this.$message({
                  type: 'success',
                  message: `${name}${operation}成功!`
                });
                this.tableEmails = [];
                if (
                  this.crumbs[1] &&
                  this.crumbs[1].name.indexOf('搜索结果') > -1 &&
                  this.$refs.refresh.tableObj.config.page.curr
                ) {
                  this.$refs.refresh.reloadTable(
                    this.$refs.refresh.getCurrentCur()
                  );
                } else {
                  this.$refs.refresh.reloadTable();
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
        })
        .catch(() => {
          this.fullscreenLoading = false;
          this.$message({
            type: 'info',
            message: `已取消${operation}`
          });
        });
    },
    deleteRepo () {
      let id = [];
      for (let a of this.tableEmails) {
        let item = {};
        item.id = a.id;
        id.push(item);
      }
      this.del('文件库', '/api/repos/delRepo', '删除', 'post', id);
    },
    deleteFile () {
      let params = [];
      for (let a of this.tableEmails) {
        params.push({
          p: a.ppath,
          repoId: a.repoId,
          name: a.name,
          type: a.type
        });
      }
      this.del('文件或文件夹', '/api/repos/dels', '删除', 'post', params);
    },
    showMyDirent (obj) {
      this.searchFlag = false;
      this.tableEmails = [];
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
          { type: 'checkbox', width: 48 },
          {
            field: 'name',
            title: '名称',
            width: '45%',
            event: 'nextTableFile',
            templet: function (d) {
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
          { field: 'size_formatted', title: '大小', width: '20%' },
          {
            field: 'type',
            title: '文件类型',
            width: '10%',
            templet: function (d) {
              return (
                '<span>' + (d.type == 'dir' ? '文件夹' : '文件') + '</span>'
              );
            }
          },
          {
            field: 'time',
            title: '更新时间',
            width: '20%',
            templet: function (d) {
              return `<span title="${d.time}">${d.time}</span>`;
            }
          }
        ]
      ];
      if (!(this.crumbs[this.crumbs.length - 1].url == this.tableUrl)) {
        //防止卡住多次运行此方法，支持幂操作
        if (this.crumbs[1] && this.crumbs[1].name.indexOf('搜索结果') > -1) {
          let tempCrumbsArr = [];
          if (obj && obj.data) {
            // 添加文件库路径
            tempCrumbsArr.push({
              name: obj.data.libName,
              path: ''
            });
            let splitPathArr = obj.data.path.split('/');
            if (obj.data.path && splitPathArr.length > 0) {
              for (let index of splitPathArr.keys()) {
                if (index != 0 && index === 1) {
                  // 添加第一个文件夹路径
                  tempCrumbsArr.push({
                    name: splitPathArr[index],
                    path: `${splitPathArr[index]}`
                  });
                } else if (index != 0 && index >= 2) {
                  // 添加第二个文件夹路径（/第一个文件夹/第二个文件夹，以此类推）
                  let tempValue = splitPathArr[1];
                  for (let idx = 1; idx <= index; idx++) {
                    if (idx > 1) {
                      tempValue += '/' + splitPathArr[idx];
                    }
                  }
                  tempCrumbsArr.push({
                    name: splitPathArr[index],
                    path: tempValue
                  });
                }
              }
            }
          }
          // 当搜索出结果之后点击文件夹，把相应的name和url加入到面包屑
          if (tempCrumbsArr.length > 0) {
            this.crumbs.splice(1, 1);
            for (let idx of tempCrumbsArr.keys()) {
              this.crumbs.push({
                url:
                  `/api/repos/dirent?p=` +
                  encodeURIComponent(`/${tempCrumbsArr[idx].path}`),
                cols: this.tabelCol,
                name: `${tempCrumbsArr[idx].name}`,
                path: `/${tempCrumbsArr[idx].path}`
              });
            }
          }
        } else {
          this.crumbs.push({
            url: this.tableUrl,
            cols: this.tabelCol,
            name: obj.data.name,
            path: obj.data.path
          });
        }
        this.getCrumbsDropdown();
      }
    },
    getCrumbsDropdown () {
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
    addMyFile () {
      this.add('文件夹名称', '/api/repos/insertDir', '新建文件夹', 'put');
    },
    reNameFile () {
      this.repoId = this.tableEmails[0].repoId;
      this.add(
        '文件名称',
        '/api/repos/file',
        '重命名文件',
        'post',
        this.tableEmails[0].name,
        /^.{1,80}$/,
        '长度在80个字符以内！'
      );
    },
    reNameDir () {
      this.repoId = this.tableEmails[0].repoId;
      this.add(
        '文件夹名称',
        '/api/repos/dir',
        '重命名文件夹',
        'post',
        this.tableEmails[0].name
      );
    },
    renameRepo () {
      this.repoId = this.tableEmails[0].repoId;
      this.add(
        '文件库名称',
        '/api/repos',
        '重命名文件库',
        'post',
        this.tableEmails[0].name
      );
    },
    getMemory () {
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
              this.$message({ type: 'warning', message: error.data.message });
            }
          });
      }
    },
    getCloseindex (data) {
      this[data.dialog] = false;
      if (data.index == 1) {
        this.$refs.refresh.reloadTable();
        this.tableEmails = [];
      } else if (data.index == 2) {
        this.tableEmails = [];
        this.showMyDirent(data.decipheringObj);
        this.$refs.refresh.reloadTable();
      }
    },
    download () {
      let self = this;
      layui.use(['layer'], function () {
        if (self.tableEmails.length < 1) {
          layui.layer.msg('请勾选要下载的文件或文件夹');
          return false;
        }
        let dirVos = [];
        for (let a of self.tableEmails) {
          dirVos.push({
            p: a.ppath,
            repoId: a.repoId,
            name: a.name
          });
        }
        self.fullscreenLoading = true;
        if (dirVos.length == 1 && self.tableEmails[0].type == 'file') {
          self
            .$axios({
              method: 'post',
              url: '/api/repos/oneFile',
              data: {
                p: self.tableEmails[0].path,
                repoId: self.tableEmails[0].repoId
              }
            })
            .then(res => {
              if (res.data.code == 200) {
                self.fullscreenLoading = false;
                return res;
              }
            })
            .then(res => {
              let seafileUrl = sessionStorage.seafileUrl;
              window.location = `${seafileUrl}${res.data.data}`;
            })
            .catch(error => {
              if (error.data && error.data.message) {
                self.fullscreenLoading = false;
                layui.layer.msg(error.data.message);
              }
            });
        } else {
          self
            .$axios({
              method: 'post',
              url: '/api/repos/filezips',
              data: dirVos
            })
            .then(res => {
              if (res.data.code == 200) {
                self.fullscreenLoading = false;
                return res;
              }
            })
            .then(res => {
              let seafileUrl = sessionStorage.seafileUrl;
              window.location = `${seafileUrl}/seafhttp/zip/${
                res.data.data.zip_token
                }`;
            })
            .catch(error => {
              if (error.data && error.data.message) {
                self.fullscreenLoading = false;
                layui.layer.msg(error.data.message);
              }
            });
        }
      });
    }
  }
};
</script>

<style scoped lang="less">
.uploader-drop {
  padding: 0;
  border: none;
  background-color: #fff;
}
.uploader-drop .uploader-btn {
  border: none;
  padding: 0;
}
.uploader-drop .uploader-btn:hover {
  background: #ecf5ff;
}
.uploader-list {
  max-height: 400px;
}
.cd-crumbs-top {
  vertical-align: top;
}
.cd-crumbs a {
  display: inline-block;
  max-width: 180px;
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
.uploader-example .uploader-file-status > span > i {
  display: none !important;
}
.btn-container {
  width: 100%;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  -ms-box-sizing: border-box;
  box-sizing: border-box;
}
// .my-file-search {
//   width: 30%;
// }
// .my-file-search .cd-search {
//   width: 220px !important;
// }
</style>
