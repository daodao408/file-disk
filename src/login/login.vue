<template>
  <div class="login-container">
    <el-form class="login-form" autoComplete="off" :model="loginForm" :rules="loginRules" ref="loginForm" label-position="left">
      <div class="title-container">
        <!-- <h3 class="title">系统登录</h3> -->
      </div>
      <el-form-item prop="username">
        <span class="svg-container svg-container_login">
          <!-- <svg-icon icon-class="user" /> -->
          <i class="iconfont">&#xe694;</i>
        </span>
        <el-input name="username" type="text" maxlength="50" v-model="loginForm.username" @change="checkUserName" auto-complete="off" placeholder="请输入账号"
        />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <!-- <svg-icon icon-class="password" /> -->
          <i class="iconfont">&#xe693;</i>
        </span>
        <el-input name="password" :type="passwordType" maxlength="50" @keyup.enter.native="handleLogin" v-model="loginForm.password" autoComplete="new-password"
          placeholder="请输入密码" />
        <span class="show-pwd" @click="showPwd">
          <!-- <svg-icon icon-class="eye" /> -->
          <i class="iconfont">&#xe69e;</i>
        </span>
      </el-form-item>
      <div>
        <el-checkbox v-model="loginForm.checked" class="pull-left">记住密码</el-checkbox>
        <!-- <div class="pull-right">忘记密码?</div> -->
      </div>

      <el-button type="primary" class="login-btn" :loading="loading" @click.native.prevent="handleLogin">立即登录</el-button>

      <!--<div class="tips">
        <span>账号 : admin</span>
        <span>密码 : 随便填</span>
      </div>
      <div class="tips">
        <span style="margin-right:18px;">账号 : editor</span>
        <span>密码 : 随便填</span>
      </div>-->

      <!--<el-button class="thirdparty-button" type="primary" @click="showDialog=true">第三方登录</el-button>-->
    </el-form>

    <el-dialog title="第三方登录" :visible.sync="showDialog" append-to-body>
      本地不能模拟，请结合自己业务进行模拟！！！
      <br/>
      <br/>
      <br/>
      <social-sign />
    </el-dialog>

  </div>
</template>

<script>
import { isvalidUsername } from '../utils/validate';
import SocialSign from './socialsignin';
import * as types from '../store/types';
import base64 from '../utils/base64';
export default {
  components: {
    SocialSign
  },
  name: 'login',
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value.length < 5) {
        callback(new Error('密码不能小于5位'));
      } else if (value.length > 40) {
        callback(new Error('密码不能大于40位'));
      } else {
        callback();
      }
    };
    const validateUsername = (rule, value, callback) => {
      if (value.length < 1) {
        callback(new Error('请输入用户名'));
      } else if (value.length > 40) {
        callback(new Error('用户名不能大于40位'));
      } else {
        callback();
      }
    };
    return {
      loginForm: {
        username: '',
        password: '',
        checked: false,
        departmentName: '',
        nickname: '',
        email: '',
        manageDepartmentId: ''
      },
      loginRules: {
        username: [
          {
            required: true,
            trigger: 'blur',
            validator: validateUsername
          }
        ],
        password: [
          {
            required: true,
            trigger: 'blur',
            validator: validatePassword
          }
        ]
      },
      passwordType: 'password',
      loading: false,
      showDialog: false,
      psKey: 'cloudDisk'
    };
  },
  watch: {
    'loginForm.username': 'checkUserName'
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = '';
      } else {
        this.passwordType = 'password';
      }
    },
    handleLogin() {
      let self = this;
      let ps = base64.encode(`${self.psKey}${this.loginForm.password}`);
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true;
          let params = {
            anotherName: this.loginForm.username,
            password: ps,
            remember: this.loginForm.checked ? '1' : '0'
          };
          let tempUser = sessionStorage.getItem('user');
          if (!this.loginForm.checked && tempUser) {
            sessionStorage.removeItem('user');
            this.clearCookie();
          }
          this.$axios({
            method: 'post',
            url: '/api/login/toLogin',
            data: params
          })
            .then(res => {
              if (res.data.code == 200) {
                this.loading = false;
                (this.loginForm.departmentName = res.data.data.departmentName),
                  (this.loginForm.nickname = res.data.data.nickname);
                this.loginForm.email = res.data.data.email;
                this.loginForm.manageDepartmentId =
                  res.data.data.manageDepartmentId;
                sessionStorage.user = JSON.stringify({
                  username: this.loginForm.username,
                  password: ps,
                  checked: this.loginForm.checked,
                  departmentName: this.loginForm.departmentName,
                  nickname: this.loginForm.nickname,
                  email: this.loginForm.email,
                  manageDepartmentId: this.loginForm.manageDepartmentId
                });
                localStorage.setItem('requireAuthFlag', true);
                localStorage.user = JSON.stringify({
                  username: this.loginForm.username,
                  password: ps,
                  checked: this.loginForm.checked,
                  departmentName: this.loginForm.departmentName,
                  nickname: this.loginForm.nickname,
                  email: this.loginForm.email,
                  manageDepartmentId: this.loginForm.manageDepartmentId
                });
                if (this.loginForm.checked) {
                  this.setCookie(
                    this.loginForm.username,
                    ps,
                    this.loginForm.checked,
                    7
                  );
                } else {
                  this.clearCookie();
                }
                // sessionStorage.token = res.data.data.token;
                this.$store.commit(types.LOGIN, res.data.data.token);
                localStorage.setItem('token', res.data.data.token);
                // this.$store.state.token = res.data.data.token;
                sessionStorage.isStaff = res.data.data.isStaff;
                sessionStorage.seafileUrl = res.data.data.seafileUrl;
                sessionStorage.manageDepartmentId =
                  res.data.data.manageDepartmentId;
                localStorage.isStaff = res.data.data.isStaff;
                localStorage.seafileUrl = res.data.data.seafileUrl;
                localStorage.manageDepartmentId =
                  res.data.data.manageDepartmentId;
                this.$router.push({
                  path: '/admin/myFile'
                });
              } else {
                this.loading = false;
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
          return false;
        }
      });
    },
    checkUserName(value) {
      if (
        this.getValueFromCookie().username &&
        this.getValueFromCookie().username === value
      ) {
        this.loginForm.password = this.getValueFromCookie().password;
      } else {
        this.loginForm.password = '';
      }
    },
    //设置cookie
    setCookie(u_name, u_pwd, u_remember, exdays) {
      var exdate = new Date(); //获取时间
      exdate.setTime(exdate.getTime() + 24 * 60 * 60 * 1000 * exdays); //保存的天数
      //字符串拼接cookie
      window.document.cookie =
        'userName' + '=' + u_name + ';path=/;expires=' + exdate.toGMTString();
      window.document.cookie =
        'usePwd' + '=' + u_pwd + ';path=/;expires=' + exdate.toGMTString();
      window.document.cookie =
        'userRemember' +
        '=' +
        u_remember +
        ';path=/;expires=' +
        exdate.toGMTString();
    },
    //读取cookie
    getCookie() {
      if (document.cookie.length > 0) {
        var arr = document.cookie.split('; '); //这里显示的格式需要切割一下自己可输出看下
        for (var i = 0; i < arr.length; i++) {
          // 因为base64编码中密文有“=”，所以只能通过第一个“=”的位置进行分割
          if (arr[i].indexOf('=') > -1) {
            let arrKey = arr[i].substring(0, arr[i].indexOf('='));
            let arrValue = arr[i].substring(
              arr[i].indexOf('=') + 1,
              arr[i].length
            );
            if (arrKey === 'userName') {
              this.loginForm.username = arrValue;
            } else if (arrKey === 'usePwd') {
              this.loginForm.password = base64
                .decode(arrValue)
                .substring(this.psKey.length, base64.decode(arrValue).length);
            } else if (arrKey === 'userRemember' && arrValue === 'true') {
              this.loginForm.checked = true;
            } else if (arrKey === 'userRemember' && arrValue === 'false') {
              this.loginForm.checked = false;
            }
          }
        }
      }
    },
    getValueFromCookie: function() {
      let tempUserName = {};
      if (document.cookie.length > 0) {
        var arr = document.cookie.split('; '); //这里显示的格式需要切割一下自己可输出看下
        for (var i = 0; i < arr.length; i++) {
          // 因为base64编码中密文有“=”，所以只能通过第一个“=”的位置进行分割
          if (arr[i].indexOf('=') > -1) {
            let arrKey = arr[i].substring(0, arr[i].indexOf('='));
            let arrValue = arr[i].substring(
              arr[i].indexOf('=') + 1,
              arr[i].length
            );
            if (arrKey === 'userName') {
              tempUserName.username = arrValue;
            } else if (arrKey === 'usePwd') {
              tempUserName.password = base64
                .decode(arrValue)
                .substring(this.psKey.length, base64.decode(arrValue).length);
            } else if (arrKey === 'userRemember' && arrValue === 'true') {
              tempUserName.checked = true;
            } else if (arrKey === 'userRemember' && arrValue === 'false') {
              tempUserName.checked = false;
            }
          }
        }
      }
      return tempUserName;
    },
    //清除cookie
    clearCookie() {
      this.setCookie('', '', '', -1); //修改2值都为空，天数为负1天就好了
    }
  },
  created() {
    this.getCookie();
    this.$store.commit(types.TITLE, 'Login');
  },
  destroyed() {}
};
</script>

<style rel="stylesheet/less" lang="less">
@bg: #2d3a4b;
@light_gray: #eee;

/* reset element-ui css */

.login-container {
  background: url('../assets/images/login_bg.png') no-repeat center center;
  .el-input {
    display: inline-block;
    height: 40px;
    width: 85%;
    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px; // padding: 12px 5px 12px 15px;
      padding-left: 10px;
      color: #333;
      height: 40px;
      &:-webkit-autofill {
        -webkit-box-shadow: 0 0 0px 1000px #fff inset !important;
        -webkit-text-fill-color: @bg !important;
      }
    }
  }
  .el-form-item {
    // border: 1px solid rgba(255, 255, 255, 0.1);
    background: #fff;
    border-radius: 5px;
    color: #454545;
    //margin-bottom: 30px; //     &:hover{
    //   border-color: #409EFF;
    // }
    .el-form-item__content {
      line-height: 38px !important;
    }
  }
}
</style>

<style rel="stylesheet/less" lang="less" scoped>
@bg: #2d3a4b;
@dark_gray: #889aa4;
@light_gray: #eee;

.login-container {
  position: fixed;
  height: 100%;
  width: 100%;
  background-color: @bg;
  .login-form {
    position: absolute;
    width: 400px;
    height: 220px;
    top: 50%;
    left: 50%;
    margin-left: -200px;
    margin-top: -110px;
    .pull-left {
      margin-top: -2px;
    }
    .login-btn {
      width: 100%;
      margin-top: 40px;
    }
  }
  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;
    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }
  .svg-container {
    // padding: 6px 5px 6px 15px;
    padding-left: 10px;
    color: @dark_gray;
    vertical-align: top;
    width: 30px;
    display: inline-block;
    &_login {
      font-size: 20px;
    }
  }
  .title-container {
    position: relative;
    .title {
      font-size: 26px;
      font-weight: 400;
      color: @light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }
  .show-pwd {
    position: absolute;
    right: 10px;
    top: 0px;
    font-size: 16px;
    color: @dark_gray;
    cursor: pointer;
    user-select: none;
  }
  .thirdparty-button {
    position: absolute;
    right: 35px;
    bottom: 28px;
  }
}
</style>
