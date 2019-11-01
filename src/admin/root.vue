<template>
    <div class="layui-layout layui-layout-admin el-aside-container clearfloat">
        <div class="layui-header ymheader clearfix" v-if="!readyShowContent">
                <el-header>
                    <div class="pull-left mt15">
                        <img src="../assets/images/logo.png" alt="">
                    </div>
                    <div class="pull-right mt10 cd-dropdown">
                    <div class="user-image">
                        <img :src="imgUrl" alt="">
                    </div>
                        <!-- <i class="iconfont c-h user-icon">&#xe6a6;</i> -->
                        <el-dropdown @command="handleCommand" class="mr20 cs-p">
                        <span class="el-dropdown-link">
                            {{anotherName}}<i class="el-icon-arrow-down el-icon--right"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item command="a">基本资料</el-dropdown-item>
                            <el-dropdown-item command="b">修改密码</el-dropdown-item>
                            <el-dropdown-item command="c" divided>退出</el-dropdown-item>
                        </el-dropdown-menu>
                        </el-dropdown>
                    </div>
                </el-header>
        </div>
        <el-aside v-if="!readyShowContent">
                    <el-scrollbar>
                        <el-menu
                        :default-active="defaultActive"
                        class="el-menu-vertical-demo"
                        :router="true">
                        <template>
                                <el-menu-item :index="item.MenuUrl"  v-for="(item,index) in adminMenus">
                                    <i class="iconfont mr5" v-html="item.Icon"></i>
                                    <span slot="title">{{item.MenuName}}</span>
                                </el-menu-item>
                            </template>
                        </el-menu>
                    </el-scrollbar>
                    <div class="cd-v">
                      <div class="memory">
                        <span class="memory_left">{{useMemory}}G/{{totalMemory}}G</span>
                        <span class="memory_right">已用/总量</span>
                      </div>
                      <el-progress class="progress" v-if="memoryPercent <= 60" :percentage="memoryPercent" :show-text="false" color="#23ca85"></el-progress>
                      <el-progress class="progress" v-if="memoryPercent > 60 && memoryPercent <= 80" :percentage="memoryPercent" :show-text="false" color="#f6c92e"></el-progress>
                      <el-progress class="progress" v-if="memoryPercent > 80" :percentage="memoryPercent" :show-text="false" color="#f05468"></el-progress>
                      <p class="fz12">V100R001C00B017</p>
                    </div>
        </el-aside>
        <div class="layui-body layui-tab-content ed-tab-content" style="bottom:0;" :style="readyShowContent?'top:0;left:0;':''">
            <router-view></router-view>
        </div>
        <el-dialog :title="titleView" class="cd-size-litter title-no" :visible.sync="isBasic" append-to-body>
            <ym-basic @close="getCloseindex" v-if="isBasic" @senUrl="getUrl" />
        </el-dialog>
        <el-dialog :title="titleView" class="cd-size-small" :close-on-click-modal="false" :visible.sync="isPassword" append-to-body>
            <ym-password @close="getCloseindexNoimgrefresh" v-if="isPassword" />
        </el-dialog>
    </div>
</template>
<style lang="less">
@import '../assets/less/basis.less';
@import '../assets/less/main.less';
.el-aside-container {
  .cd-v {
    position: absolute;
    left: 0;
    width: 199px;
    bottom: 20px;
    text-align: center;
    background-color: #fff;
  }
  .memory_left {
    font-size: 12px;
    text-align: left;
    color: #333;
  }
  .memory_right {
    font-size: 12px;
    text-align: right;
    margin-left: 30px;
    color: #999;
  }
  .progress {
    width: 85%;
    margin: auto;
    margin-bottom: 10px;
    .el-progress-bar {
      .el-progress-bar__outer {
        height: 8px;
        -webkit-border-radius: 0;
        -moz-border-radius: 0;
        border-radius: 0;
        .el-progress-bar__inner {
          -webkit-border-radius: 0;
          -moz-border-radius: 0;
          border-radius: 0;
        }
      }
    }
  }
  .ymheader {
    background-color: #ebf0f4 !important;
    .clearfix;
    .cd-dropdown {
      .el-dropdown {
        vertical-align: top;
        .mt10;
      }
    }
  }
  .cd-logo {
    line-height: 60px;
    width: 150px;
    font-size: 25px;
    color: white;
    text-align: center;
  }
  .cd-memory {
    width: 200px;
    padding: 20px 10px;
    background: #f0f0f0;
  }
  .cd-close {
    width: 100px;
  }
  .ed-logout {
    .layui-nav-child {
      left: -80px;
    }
  }
  .user-icon {
    font-size: 30px !important;
    vertical-align: top;
  }
  .el-menu-vertical-demo {
    border: none !important;
  }
  .el-aside {
    width: 200px !important;
    position: fixed;
    height: 100vh;
    border-right: 1px solid #e6e6e6;
    .el-menu-item {
      height: 48px;
      line-height: 48px;
      i {
        &.iconfont {
          color: #333;
        }
      }
    }
  }

  .user-image {
    text-align: center;
    background: #f0f0f0;
    display: inline-block;
    width: 30px;
    height: 30px;
    vertical-align: top;
    margin-top: 5px;
    img {
      border-radius: 50%;
      width: 30px;
      height: 30px;
    }
  }
  .el-scrollbar {
    height: calc(100% - 126px);
    .el-scrollbar__wrap {
      overflow-x: hidden;
      overflow-y: auto;
    }
  }
  .el-menu-item.is-active:hover {
    background: #f00;
  }
  .el-menu-item:focus,
  .el-menu-item:hover {
    background: #eaf5ff;
  }
  .el-menu-item:focus {
    background: #fff;
  }
  .el-menu-item.is-active:focus,
  .el-menu-item.is-active:hover {
    background: #42a0f8;
  }
  .el-menu-item.is-active {
    background: #42a0f8;
    color: #fff;
    i {
      &.iconfont {
        color: #fff;
      }
    }
  }
}
.title-no {
  .el-dialog__header {
    display: none;
  }
  .el-dialog__body {
    padding: 0 !important;
  }
}
</style>
<script>
import YmHeader from '../components/YmHeader';
import adminMenus from '../config/adminMenus';
import siteMenus from '../config/siteMenus';
import * as types from '../store/types';
import { mapState } from 'vuex';
import YmBasic from '../components/YmBasic';
import YmPassword from '../components/YmPassword';

export default {
  components: {
    YmHeader,
    YmBasic,
    YmPassword
  },
  data() {
    return {
      useMemory: 0,
      totalMemory: 0,
      memoryPercent: 0,
      imgUrl: '',
      readyShowContent: false,
      isBasic: false,
      isPassword: false,
      adminMenus: [],
      mine: false,
      anotherName: '',
      msg: '',
      titleView: '',
      rootData: '',
      defaultActive: ''
    };
  },
  mounted() {
    this.loadProgree();
    this.defaultActive = this.$router.history.current.path;
  },
  computed: mapState({
    title: state => state.title,
    token: state => state.token
  }),
  methods: {
    basic() {
      this.titleView = '基本资料';
      this.isBasic = true;
    },
    password() {
      this.titleView = '修改密码';
      this.isPassword = true;
    },
    getUrl(url) {
      this.imgUrl = url;
    },
    updateCity(str) {
      //    console.log(str);
    },
    showMine() {
      this.mine = !this.mine;
    },
    handleCommand(command) {
      if (command == 'a') {
        this.basic();
      } else if (command == 'b') {
        this.password();
      } else if (command == 'c') {
        this.logout();
      }
    },
    loadProgree() {
      layui.use(['element'], function() {
        let element = layui.element;
      });
    },
    logout() {
      let selt = this;
      selt
        .$axios({
          method: 'get',
          url: '/api/login/logout'
        })
        .then(res => {
          if (res.data.code == 200) {
            //sessionStorage.removeItem("user");
            localStorage.setItem('requireAuthFlag', false);
            localStorage.clear();
            this.$store.commit(types.LOGOUT);
            this.$router.push({
              path: '/'
            });
          }
        })
        .catch(error => {
          if (error.data && error.data.message) {
            this.$message({ type: 'warning', message: error.data.message });
          }
        });
    },
    getCloseindex(data) {
      this[data.dialog] = false;
      if (data.index == 1) {
        this.getImg();
        setTimeout(() => {
          this.logout();
        }, 2000);
      }
    },
    getCloseindexNoimgrefresh(data) {
      this[data.dialog] = false;
      if (data.index == 1) {
        setTimeout(() => {
          this.logout();
        }, 2000);
      }
    },
    getImg() {
      let selt = this;
      selt
        .$axios({
          method: 'get',
          url: '/api/user/getUserPhoto'
        })
        .then(res => {
          if (res.data.code == 200) {
            selt.imgUrl = res.data.data.url;
          }
        })
        .catch(error => {
          if (error.data && error.data.message) {
            this.$message({ type: 'warning', message: error.data.message });
          }
        });
      return false;
    },
    getMemory() {
      if (sessionStorage.getItem('token')) {
        this.$axios({
          method: 'get',
          url: '/api/user/getUserMsg'
        })
          .then(res => {
            if (res.data.code == 200) {
              this.useMemory = (
                parseInt(res.data.data.usedStorage) /
                (1000 * 1000 * 1000)
              ).toFixed(2);
              this.totalMemory = (
                parseInt(res.data.data.totalStorage) /
                (1000 * 1000 * 1000)
              ).toFixed(2);
              this.memoryPercent = this.useMemory / this.totalMemory * 100;
            }
          })
          .catch(error => {
            if (error.data && error.data.message) {
              this.$message({ type: 'warning', message: error.data.message });
            }
          });
        return false;
      }
    }
  },
  created() {
    this.getMemory();
    this.getImg();
    if (sessionStorage.getItem('isStaff') == '1') {
      this.adminMenus = adminMenus;
    } else if (sessionStorage.getItem('isStaff') == '2') {
      let tempAdminMenus = [];
      tempAdminMenus = adminMenus.concat();
      for (let index of tempAdminMenus.keys()) {
        if (tempAdminMenus[index].MenuName === '日志管理') {
          tempAdminMenus.splice(index, 1);
        }
      }
      this.adminMenus = tempAdminMenus;
    } else if (sessionStorage.getItem('isStaff') == '0') {
      this.adminMenus = siteMenus;
    }
    let user = sessionStorage.user;
    if (user) {
      user = JSON.parse(user);
      this.anotherName = user.username;
    }
  }
};
</script>
