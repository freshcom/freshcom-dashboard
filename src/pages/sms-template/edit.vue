<template>
<content-container @locale-changed="reload" :ready="isReady">
  <div slot="header">
    <el-menu :router="true" default-active="/sms-templates" mode="horizontal" class="header-menu">
      <el-menu-item :route="{ name: 'ListSms' }" index="/sms">
        SMS
      </el-menu-item>
      <el-menu-item :route="{ name: 'ListSmsTemplate' }" index="/sms-templates">
        Templates
      </el-menu-item>
    </el-menu>
  </div>

  <div slot="content-header">
    <h1>Edit SMS template</h1>

    <div class="pull-right">
      <el-button @click="back()" plain size="small">
        Cancel
      </el-button>

      <el-button :loading="isUpdating" @click="submit()" type="primary" size="small">
        Save
      </el-button>
    </div>
  </div>

  <div slot="content-body">
    <div class="data">
      <el-row>
        <el-col :span="14" :offset="5">
          <el-form @submit.native.prevent="submit()" label-width="100px" size="small">
            <sms-template-fieldset v-model="smsTemplateDraft" :errors="errors"></sms-template-fieldset>
          </el-form>
        </el-col>
      </el-row>
    </div>

    <div class="foot">
      <el-button @click="back()" plain size="small">
        Cancel
      </el-button>

      <el-button :loading="isUpdating" @click="submit()" type="primary" size="small" class="pull-right">
        Save
      </el-button>
    </div>
  </div>
</content-container>

<!-- <div class="page-wrapper">
  <div>
    <el-menu :router="true" default-active="/sms-templates" mode="horizontal" class="secondary-nav">
      <el-menu-item :route="{ name: 'ListSms' }" index="/sms">SMS</el-menu-item>
      <el-menu-item :route="{ name: 'ListSmsTemplate' }" index="/sms-templates">Templates</el-menu-item>
    </el-menu>
    <locale-selector class="pull-right"></locale-selector>
  </div>

  <div>
    <el-card class="main-card">
      <div slot="header">
        <div v-if="isViewingTestData" class="test-data-banner">
          <div class="banner-content">TEST DATA</div>
        </div>
        <span style="line-height: 36px;">Edit SMS template</span>

        <div style="float: right;">
          <el-button @click="back()" plain size="small">
            Cancel
          </el-button>

          <el-button @click="submit()" type="primary" size="small">
            Save
          </el-button>
        </div>
      </div>

      <div class="data">
        <el-form @submit.native.prevent="submit()" label-width="150px" size="small">
          <sms-template-fieldset v-model="smsTemplateDraft" :errors="errors"></sms-template-fieldset>
        </el-form>
      </div>

      <div class="footer">
        <el-button @click="back()" plain size="small">
          Cancel
        </el-button>

        <el-button @click="submit()" type="primary" class="pull-right" size="small">
          Save
        </el-button>
      </div>
    </el-card>
  </div>
</div> -->
</template>

<script>
import _ from 'lodash'
import freshcom from '@/freshcom-sdk'

import SmsTemplate from '@/models/sms-template'
import SmsTemplateFieldset from '@/components/sms-template-fieldset'

import resourcePageMixinFactory from '@/mixins/resource-page'
let ResourcePageMixin = resourcePageMixinFactory({ loadMethodName: 'loadSmsTemplate' })

export default {
  name: 'EditSmsTemplate',
  mixins: [ResourcePageMixin],
  components: {
    SmsTemplateFieldset
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      isLoading: false,
      smsTemplate: SmsTemplate.objectWithDefaults(),
      smsTemplateDraft: SmsTemplate.objectWithDefaults(),

      isUpdating: false,
      errors: {}
    }
  },
  created () {
    this.loadSmsTemplate()
  },
  methods: {
    loadSmsTemplate () {
      this.isLoading = true

      return freshcom.retrieveSmsTemplate(this.id).then(response => {
        this.smsTemplate = response.data
        this.smsTemplateDraft = _.cloneDeep(response.data)

        this.isLoading = false
      }).catch(errors => {
        this.isLoading = false
        throw errors
      })
    },

    submit () {
      this.isUpdating = true

      return freshcom.updateSmsTemplate(
        this.smsTemplateDraft.id,
        this.smsTemplateDraft
      ).then(smsTemplate => {
        this.$message({
          showClose: true,
          message: `SMS template saved successfully.`,
          type: 'success'
        })

        this.isUpdating = false
        this.back()
      }).catch(response => {
        this.errors = response.errors
        this.isUpdating = false
        throw response
      })
    },

    defaultBack () {
      this.$store.dispatch('pushRoute', { name: 'ShowSmsTemplate', params: { id: this.smsTemplate.id } })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
