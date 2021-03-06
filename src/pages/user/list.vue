<template>
<content-container :disable-test-banner="true">
  <div slot="header">
    <el-menu :router="true" default-active="/users" mode="horizontal" class="header-menu">
      <el-menu-item :route="{ name: 'TeamOverview' }" index="/team">
        Overview
      </el-menu-item>

      <el-menu-item :route="{ name: 'ListUser' }" index="/users">
        Users
      </el-menu-item>
    </el-menu>
  </div>

  <div slot="content-header">
    <el-row>
      <el-col :span="16">
        <filter-button :current="filter" :draft="filterDraft" @cancel="resetFilter" @clear="clearFilter">
          <filter-condition v-model="filterDraft" statement-key="role" :default="{ '$eq': '' }">
            <span slot="key">Role</span>

            <div slot="comparison" slot-scope="scope">
              <select @input="scope.setValue($event.target.value)" :value="scope.value">
                <option value="">Please select a role</option>
                <option v-for="role in roles" :key="role" :value="role">is {{$t(`enums.user.role.${role}`)}}</option>
              </select>
            </div>
          </filter-condition>
        </filter-button>

        <search-input :value="searchKeyword"></search-input>
      </el-col>

      <el-col :span="8">
        <div class="text-right">
          <el-button-group>
            <router-link :to="{ name: 'NewUser' }" class="el-button el-button--small is-plain">
              <span class="with-icon">
                <span class="icon-wrapper">
                  <icon name="plus" scale="0.6"></icon>
                </span>
                <span>Add</span>
              </span>
            </router-link>
          </el-button-group>
        </div>
      </el-col>
    </el-row>
  </div>

  <div slot="content-body">
    <div class="data full">
      <query-result :is-loading="isLoading" :total-count="totalCount" :all-count="allCount" :page="page">
        <el-table :data="users" slot="content">
          <el-table-column prop="name" label="USER">
            <template slot-scope="scope">
              <router-link :to="{ name: 'ShowUser', params: { id: scope.row.id } }" class="primary">
                <span>{{scope.row.username}}</span>
                <span v-if="scope.row.name"> ({{scope.row.name}})</span>
              </router-link>
            </template>
          </el-table-column>

          <el-table-column prop="status" label="ROLE" width="150">
            <template slot-scope="scope">
              <span v-if="currentUser.id === scope.id">
                {{$t(`enums.user.role.${scope.row.role}`)}}
              </span>
              <a v-else @click="openChangeRoleDialog(scope.row)" href="javascript:;">
                <span>{{$t(`enums.user.role.${scope.row.role}`)}}</span>
              </a>
            </template>
          </el-table-column>

          <el-table-column prop="updatedAt" label="UPDATED" align="right" width="200">
            <template slot-scope="scope">
              {{scope.row.updatedAt | moment}}
            </template>
          </el-table-column>
        </el-table>
      </query-result>
    </div>
  </div>

  <div slot="launchable" class="launchable">
    <el-dialog :show-close="false" :visible="isChangeRoleDialogVisible" title="Change Role" width="300px">
      <el-form @submit.native.prevent="updateRole()" label-width="50px" size="small">
        <el-form-item label="Role" required>
          <el-select v-model="roleDraft.value">
            <el-option v-for="role in roles" :key="role" :label="$t(`enums.user.role.${role}`)" :value="role"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button :disabled="isUpdatingRole" @click="closeChangeRoleDialog()" plain size="small">Cancel</el-button>
        <el-button :loading="isUpdatingRole" @click="updateRole()" type="primary" size="small">Save</el-button>
      </div>
    </el-dialog>
  </div>
</content-container>
</template>

<script>
import { ROLES } from '@/env'
import freshcom from '@/freshcom-sdk'
import withLiveMode from '@/helpers/with-live-mode'

import listPageMixinFactory from '@/mixins/list-page'
let ListPageMixin = listPageMixinFactory({ listMethodName: 'listUser' })

export default {
  name: 'ListUser',
  mixins: [ListPageMixin],
  data () {
    return {
      roles: ROLES,
      users: [],

      targetUser: {},
      roleDraft: {},
      isChangeRoleDialogVisible: false,
      isUpdatingRole: false,

      isLoading: false,
      allCount: 0,
      totalCount: 0
    }
  },
  created () {
    this.listUser()
  },
  computed: {
    currentUser () {
      return this.$store.state.session.user
    }
  },
  methods: {
    listUser () {
      this.isLoading = true

      return withLiveMode(() => {
        return freshcom.listUser({
          search: this.searchKeyword,
          filter: JSON.stringify(this.filter),
          page: this.page
        }).then(response => {
          this.users = response.data
          this.allCount = response.meta.allCount
          this.totalCount = response.meta.totalCount

          this.isLoading = false
        }).catch(errors => {
          this.isLoading = false
        })
      })
    },

    openChangeRoleDialog (user) {
      this.isChangeRoleDialogVisible = true
      this.targetUser = user
      this.roleDraft = {
        id: user.id,
        type: 'Role',
        value: user.role
      }
    },

    closeChangeRoleDialog () {
      this.isChangeRoleDialogVisible = false
    },

    updateRole () {
      this.isUpdatingRole = true

      withLiveMode(() => {
        return freshcom.changeUserRole(this.roleDraft.id, this.roleDraft).then(response => {
          this.targetUser.role = response.data.role
          this.$message({
            showClose: true,
            message: `Role changed successfully.`,
            type: 'success'
          })

          this.isUpdatingRole = false
          this.closeChangeRoleDialog()
        }).catch(errors => {
          this.isUpdatingRole = false
          throw errors
        })
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
