<template>
  <el-form ref="addStructurePeople" :model="addStructurePeople" label-width="50px" class="cd-el-form" size="small">
    <el-form-item label="成员:">
      <el-select v-model="value5" multiple placeholder="请选择" :filterable="true" class="el-input cd-select-input" name="people"
        @change="setTagTitle">
        <el-option class="add-structure-people-options" collapse-tags=true v-for="opt in peopleSelect" :key="opt.id" :title="opt.nickname + ' ( '+ opt.anotherName+' )'" :label="opt.nickname + ' ( '+ opt.anotherName+' )'"
          :value="opt.id">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item class="cd-sure-btn">
      <el-button class="btn" size="mini" @click="closeLayer()">取消</el-button>
      <el-button size="mini" class="ml20" type="primary" :loading="loading" @click="submitForm('addStructurePeople')">确定</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  components: {},
  data() {
    return {
      keyValue: '',
      pId: '',
      peopleSelect: '',
      value5: [],
      loading: false
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
  mounted() {
    this.$nextTick(() => {
      let arrowUpObj = document.querySelector('.el-icon-arrow-up');
      arrowUpObj.addEventListener('click', function(e) {
        if (arrowUpObj.className.indexOf('is-reverse') > -1) {
          arrowUpObj.className =
            'el-select__caret el-input__icon el-icon-arrow-up';
          document.querySelector('.el-select-dropdown').style.display = 'none';
          e.stopPropagation();
        } else {
          arrowUpObj.className =
            'el-select__caret el-input__icon el-icon-arrow-up is-reverse';
          document.querySelector('.el-select-dropdown').style.display = 'block';
          document.querySelector('.el-select-dropdown').style.top =
            document.documentElement.clientHeight * 0.15 +
            50 +
            25 +
            parseInt(document.querySelector('.el-input__inner').style.height) +
            'px';
          document.querySelector('.el-select-dropdown').style.left =
            e.x - 340 + 'px';
          // document.querySelector('.el-select-dropdown').style.left = document.documentElement.clientWidth *
          //   0.5 - document.querySelector('.el-dialog').style.width + 'px';
        }
      });
    });
  },
  methods: {
    setTagTitle() {
      setTimeout(() => {
        var tagTextList = document.querySelectorAll('.el-select__tags-text');
        tagTextList.forEach(item => {
          item.setAttribute('title', item.innerText);
        });
      }, 100);
    },
    setTitle() {
      let self = this;
      this.loadPeopleList();
      self.pId = this.pId = this.$parent.$parent.parentId;
    },
    submitForm() {
      let self = this;
      let param = [];
      for (let a of self.value5) {
        param.push({
          id: a,
          department: self.pId
        });
      }
      this.loading = true;
      self
        .$axios({
          method: 'put',
          url: '/api/organization/people',
          data: param
        })
        .then(res => {
          if (res.data.code == 200) {
            this.loading = false;
            self.$message({
              message: res.data.message,
              type: 'success'
            });
            this.$emit('refreshTable');
            this.$emit('close', {
              index: 0,
              dialog: 'isAddOrganizationPeople'
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
              dialog: 'isAddOrganizationPeople'
            });
          }
        });
      return false;
    },
    loadPeopleList() {
      this.$axios({
        method: 'get',
        url: '/api/organization/SelectPeople'
      })
        .then(res => {
          if (res.data.code == 200) {
            this.peopleSelect = res.data.data;
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
    closeLayer() {
      this.$emit('close', {
        index: 0,
        dialog: 'isAddOrganizationPeople'
      });
    },
    cancelHandler() {
      // console.log('关闭')
    }
  }
};
</script>
<style lang="less">
.cd-sure-btn .btn {
  margin-left: 70px;
}

.el-select__tags-text {
  display: inline-block;
  width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.el-tag__close.el-icon-close {
  top: -5px !important;
}

.el-select-dropdown__wrap {
  .el-select-dropdown__list {
    .el-select-dropdown__item {
    &.add-structure-people-options {
      max-width: 344px;
    }
      &.selected {
        span {
          display: inline-block;
          max-width: 85%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}

.el-popup-parent--hidden .el-popper .popper__arrow {
  top: -6px;
  left: 50%;
  margin-right: 3px;
  border-top-width: 0;
  border-bottom-color: #fff;
}

.el-icon-arrow-up {
  pointer-events: none;
}

.el-icon-arrow-up::before {
  pointer-events: auto;
}
</style>
