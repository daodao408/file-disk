<template>
    <el-container v-loading="isLoading">
           <el-header class="cd-title" ref="companyStyle">
                <template v-for="(item,index) in crumbs">
                    <div class="cd-crumbs"   :class="index==1&&crumbsDropdown.length>0?'cd-crumbs cd-crumbs-top':'cd-crumbs'">
                        <template v-if='index==1&&crumbsDropdown.length>0'>
                            <el-dropdown>
                            <span class="el-dropdown-link">
                                <a class="c-h cs-p cd-crumbs-a">......<i class="el-icon-arrow-down el-icon--right"></i></a>
                            </span>
                            <el-dropdown-menu slot="dropdown">
                                <template v-for="(itemDropdown,count) in crumbsDropdown">
                                    <el-dropdown-item   @click.native="getcrumbs(itemDropdown,itemDropdown.index)"><a class="c-h cs-p cd-crumbs-a">{{itemDropdown.name}}</a></el-dropdown-item>
                                </template>
                            </el-dropdown-menu>
                            </el-dropdown>
                            <span  class="ml5 mr5">></span>
                        </template>
                        <template v-if='!(index>0&&index<crumbsDropdown.length+1)'>
                            <a @click="getcrumbs(item,index)" :class="{'c-h cs-p':index<crumbs.length-1}">{{item.name}}</a> <span v-show="index<crumbs.length-1" class="ml5 mr5">></span>
                        </template>
                    </div>
                </template>
            </el-header>
           <div class="pl20 pt10 pb10">
                <div v-show="crumbs.length>1">                   
                     <el-row>
                          
                        <el-button size="mini" :disabled="tableEmails.length==0" @click="download()"><i class="iconfont mr5 mt5">&#xe687;</i>下载</el-button>
                        <el-button size="mini" :disabled="tableEmails.length==0"  @click="copyFile()"><i class="iconfont mr5 mt5">&#xe691;</i>复制</el-button>
                        <!-- <el-dropdown @command="handleClick"  size="medium" class="ml10">
                            <el-button size="mini">
                                更多菜单<i class="el-icon-arrow-down el-icon--right"></i>
                            </el-button>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item command="share" :disabled="tableEmails.length==0||tableEmails.length>1">共享</el-dropdown-item>
                        </el-dropdown-menu>
                        </el-dropdown> -->
                    </el-row>
                </div>
                <div v-show="crumbs.length==1">
                    <el-row>
                        <el-button size="mini" :disabled="tableEmails.length==0||tableEmails.length>1||tableEmails[0].type =='srepo'" @click="downloadFile()"><i class="iconfont mr5 mt5">&#xe687;</i>下载</el-button>
                        <el-button size="mini" :disabled="tableEmails.length==0||tableEmails.length>1" @click="shareOutFile()" ><i class="iconfont mr5 mt5">&#xe68f;</i>退出共享</el-button>                                               
                    </el-row>
                </div>
            </div>
            <div class="">
                <ym-user-table ref="refresh"  @tableEmails="getCheckboxs" @nextTableEvent="getNextTableEvent" :url="tableUrl" :cols="tabelCol" :page="true" :type="type" :where="where"></ym-user-table>
            </div>
            <el-dialog :title="title" class="copy-move-file-dialog cd-size-small" :close-on-click-modal="false" :visible.sync="showDialog" append-to-body>
            <copy-move-file  :checksData="tableEmails" :type="operation" @close="getCloseindex"  @getCopyMemory="getchildMemory" v-if="showDialog" />
            </el-dialog>
            <!-- <el-dialog :title="title" class="cd-size-lag"  :visible.sync="isShareFile" append-to-body>
            <share-my-file  :repoid="repoId" :path="path"  @close="getCloseindex" v-if="isShareFile" />
            </el-dialog> -->
            <!-- 分享文件 -->
            <el-dialog :title="title" class="cd-size-lag" :close-on-click-modal="false" :visible.sync="isShareFile" append-to-body>
            <share-my-file :shareNum="2" :repoid="repoId" :path="path" :type ="tableEmails[0].type" :sizeformatted ="tableEmails[0].size_formatted" v-if="isShareFile"  @close="getCloseindex" />
            </el-dialog>
             <!-- 文件库解密 -->
            <el-dialog :title="title" class="cd-size-small" :close-on-click-modal="false" :visible.sync="isDecipheringPassword" append-to-body>
              <deciphering-password :repoId="repoId" :decipheringObj="decipheringObj" @close="getCloseindex" v-if="isDecipheringPassword"/>
            </el-dialog>
    </el-container>
</template>
<script>
import YmSearch from '../components/YmSearch';
import YmUserTable from '../components/YmUserTable';
import CopyMoveFile from '../components/CopyMoveFile';
import ShareMyFile from '../components/ShareMyFile';
import DecipheringPassword from '../components/DecipheringPassword';
import config from '../config';
import base64 from '../utils/base64';
export default {
  components: {
    YmSearch,
    YmUserTable,
    CopyMoveFile,
    DecipheringPassword,
    ShareMyFile
  },
  data() {
    return {
      crumbs: [],
      crumbsDropdown: [],
      tableUrl: '',
      tabelCol: '',
      type: 'get',
      tableEmails: [],
      id: [],
      where: {},
      repoId: '',
      title: '',
      isUploaderList: false,
      showDialog: false,
      isShareFile: false,
      isLoading: false,
      isDecipheringPassword: false,
      decipheringObj: null,
      path: '',
      psKey: 'cloudDisk'
    };
  },
  created() {
    this.loadMyShareFile();
  },
  mounted() {},
  watch: {
    $route: 'loadMyShareFile'
  },
  methods: {
    getchildMemory(useMemory, totalMemory) {
      let self = this;
      self.$parent.useMemory = useMemory;
      self.$parent.totalMemory = totalMemory;
      self.$parent.memoryPercent = useMemory / totalMemory * 100;
    },
    getCheckboxs(obj) {
      this.tableEmails = obj;
    },
    getNextTableEvent(obj) {
      if (obj.data.cloudUrl) {
        return false;
      }
      this.loadMyDirent(obj);
    },
    handleClick(command) {
      if (command == 'share') {
        this.shareFile();
      }
    },
    shareFile() {
      //文件分享
      this.repoId = this.tableEmails[0].repoId
        ? this.tableEmails[0].repoId
        : 'null';
      this.title =
        this.crumbs.length == 1
          ? '共享文件库'
          : this.tableEmails[0].type == 'file' ? '共享文件' : '共享文件夹';
      this.path = this.tableEmails[0].path;
      this.isShareFile = true;
    },
    copyFile() {
      this.operation = 'copy';
      this.title = '请选择目标路径';
      this.showDialog = true;
    },
    getCloseindex(data) {
      this[data.dialog] = false;
      if (data.index == 1) {
        this.$refs.refresh.reloadTable();
      } else if (data.index == 2) {
        this.loadMyShareDirent(data.decipheringObj);
      }
    },
    getcrumbs(item, $index) {
      if (item.url && $index != this.crumbs.length - 1) {
        this.tableUrl = item.url;
        this.tabelCol = item.cols;
        this.crumbs.splice($index + 1, this.crumbs.length - 1);
        this.dpath = item.path;
        this.tableEmails = [];
        this.getCrumbsDropdown();
      } else {
        return;
      }
    },
    downloadFile() {
      for (let a of this.tableEmails) {
        if (a.type === 'srepo') {
          this.$message('不能下载文件库');
        } else {
          let self = this;
          //let seafileUrl = sessionStorage.seafileUrl;
          if (a.type === 'file') {
            self
              .$axios({
                method: 'post',
                url: '/api/repos/oneFileCheck',
                data: {
                  token: a.token,
                  seafileUrl: a.seafileUrl,
                  cloudUrl: a.cloudUrl
                }
              })
              .then(res => {
                if (res.data.code == 200) {
                  self.isLoading = false;
                  return res;
                }
              })
              .then(res => {
                let seafileUrl = sessionStorage.seafileUrl;
                window.location = `${seafileUrl}/${a.cloudUrl}`;
              })
              .catch(error => {
                if (error.data && error.data.message) {
                  self.isLoading = false;
                  self.$message(error.data.message);
                }
              });

            //window.location = `${seafileUrl}/${a.cloudUrl}`;
          } else if (a.type === 'dir') {
            self
              .$axios({
                method: 'post',
                url: '/api/repos/shareDirzips',
                data: {
                  token: a.token,
                  path: a.path
                }
              })
              .then(res => {
                if (res.data.code == 200) {
                  self.isLoading = false;
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
                  self.isLoading = false;
                  self.$message(error.data.message);
                }
              });
          }
        }
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
                this.loadMyShareDirent(obj);
              } else {
                // this.deciphering();
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
        this.loadMyShareDirent(obj);
      }
    },
    add(name, url, operation, type, keyValue) {
      this.$prompt(`请输入${name}`, `${operation}${name}`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: keyValue,
        confirmButtonClass: 'loading',
        inputPattern: /^.{0,40}$/,
        inputErrorMessage: `${name}格式不正确`
      })
        .then(({ value }) => {
          this.fullscreenLoading = true;
          let data;
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
                  message: `${name}${operation}成功`
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
    loadMyShareFile() {
      this.crumbs = [];
      this.tableUrl = '/api/repos/shareRepos';
      this.tabelCol = [
        [
          //标题栏
          { type: 'checkbox', width: 48 },
          {
            field: 'name',
            title: '名称',
            width: '40%',
            event: 'nextTableFile',
            templet: function(d) {
              // return `<a class="cs-p"><svg class="icon mr5  fz20" aria-hidden="true">
              //            <use xlink:href="${d.address}"></use>
              //       </svg><i class="iconfont">${
              //         d.encrypted ? "&#xe693;" : ""
              //       }</i> ${d.name}</a>`;
              if (d.type == 'file') {
                return `<span title="${d.name}">
                          <svg class="icon mr5  fz20" aria-hidden="true">                        
                            <use xlink:href="${d.address}"></use>
                          </svg>
                          <i class="iconfont">${
                            d.encrypted ? '&#xe693;' : ''
                          }</i> ${d.name}
                        </span>`;
              } else {
                return `<a class="cs-p" title="${
                  d.name
                }"><svg class="icon mr5  fz20" aria-hidden="true">                        
                         <use xlink:href="${d.address}"></use>
                    </svg><i class="iconfont">${
                      d.encrypted ? '&#xe693;' : ''
                    }</i> ${d.name}</a>`;
              }
            }
          },
          { field: 'size_formatted', title: '大小', width: '15%' },
          {
            field: 'type',
            title: '文件类型',
            width: '15%',
            templet: function(d) {
              return (
                '<span>' +
                (d.type == 'srepo'
                  ? '文件库'
                  : d.type == 'file' ? '文件' : '文件夹') +
                '</span>'
              );
            }
          },
          {
            field: 'modifier_name',
            title: '拥有者',
            width: '25%',
            templet: function(d) {
              return (
                '<span>' +
                (d.modifier_name + ' ( ' + d.anotherName + ' )') +
                '</span>'
              );
            }
          }
          // { field: 'time', title: '更新时间', width: '20%' }
        ]
      ];
      this.crumbs.push({
        url: this.tableUrl,
        cols: this.tabelCol,
        name: '共享给我的',
        path: 'p'
      });
    },
    shareOutFile() {
      this.$confirm('此操作将退出共享, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          let data;
          let url;
          if (this.tableEmails[0].type === 'srepo') {
            data = {
              id: this.tableEmails[0].id,
              from: this.tableEmails[0].modifier_email
            };
            url = '/api/repos/outShare';
          } else {
            data = {
              token: this.tableEmails[0].token,
              dstuserName: this.tableEmails[0].dstUserName
            };
            url = '/api/repos/outShareOne';
          }
          this.$axios({
            method: 'put',
            //url: "/api/repos/outShare",
            // data: {
            //     id:this.tableEmails[0].id,
            //     from:this.tableEmails[0].modifier_email
            // }
            url: url,
            data: data
          })
            .then(res => {
              if (res.data.code == 200) {
                this.$message({
                  type: 'success',
                  message: '退出共享成功!'
                });
                this.$refs.refresh.reloadTable();
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
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消退出共享'
          });
        });
    },
    loadMyShareDirent(obj) {
      this.tableEmails = [];
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
          { field: 'size_formatted', title: '大小', width: '20%' },
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
          { field: 'time', title: '更新时间', width: '20%' }
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
    download() {
      let self = this;
      let dirVos = [];
      for (let a of self.tableEmails) {
        dirVos.push({
          p: a.ppath,
          repoId: a.repoId,
          name: a.name
        });
      }
      self.isLoading = true;
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
              self.isLoading = false;
              return res;
            }
          })
          .then(res => {
            let seafileUrl = sessionStorage.seafileUrl;
            window.location = `${seafileUrl}${res.data.data}`;
          })
          .catch(error => {
            if (error.data && error.data.message) {
              self.isLoading = false;
              self.$message(error.data.message);
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
              self.isLoading = false;
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
              self.isLoading = false;
              self.$message(error.data.message);
            }
          });
      }
    }
  }
};
</script>

<style scoped lang="less">
.cd-file {
  padding: 0;
  width: 108px;
  position: relative;
  z-index: 33;
  &:hover {
    opacity: 1;
    .uploader-drop {
      display: block;
    }
  }
  .uploader-drop {
    width: 106px;
    border: 1px solid #ddd;
    background: #fff;
    left: 0;
    padding: 0;
    top: 38px;
    display: none;
    position: absolute;
    .uploader-btn {
      border: none;
      display: block;
    }
  }
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
</style>
