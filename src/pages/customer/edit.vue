<template>
<content-container @locale-changed="reload" :ready="isReady">
  <div slot="header">
    <el-menu :router="true" default-active="/customers" mode="horizontal" class="header-menu">
      <el-menu-item :route="{ name: 'ListCustomer' }" index="/customers">
        Customers
      </el-menu-item>
    </el-menu>
  </div>

  <div slot="content-header">
    <h1>Edit customer</h1>

    <div class="pull-right">
      <el-button @click="back()" plain size="small">
        Cancel
      </el-button>

      <el-button @click="submit()" type="primary" size="small">
        Save
      </el-button>
    </div>
  </div>

  <div slot="content-body">
    <div class="data">
      <el-row>
        <el-col :span="14" :offset="5">
          <el-form @submit.native.prevent="submit()" label-width="100px" size="small">
            <customer-fieldset v-model="customerDraft" :errors="errors"></customer-fieldset>
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
</template>

<script>
import _ from 'lodash'
import freshcom from '@/freshcom-sdk'

import Customer from '@/models/customer'
import CustomerFieldset from '@/components/customer-fieldset'

import resourcePageMixinFactory from '@/mixins/resource-page'
let ResourcePageMixin = resourcePageMixinFactory({ loadMethodName: 'loadCustomer' })

export default {
  name: 'EditCustomer',
  mixins: [ResourcePageMixin],
  components: {
    CustomerFieldset
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
      customer: Customer.objectWithDefaults(),
      customerDraft: Customer.objectWithDefaults(),

      isUpdating: false,
      errors: {}
    }
  },
  methods: {
    loadCustomer () {
      this.isLoading = true

      return freshcom.retrieveCustomer(this.id).then(response => {
        this.customer = response.data
        this.customerDraft = _.cloneDeep(response.data)

        this.isLoading = false
      }).catch(response => {
        this.errors = response.errors
        this.isLoading = false

        throw response
      })
    },

    submit () {
      this.isUpdating = true

      freshcom.updateCustomer(this.customerDraft.id, this.customerDraft).then(() => {
        this.$message({
          showClose: true,
          message: `Customer saved successfully.`,
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
      this.$store.dispatch('pushRoute', { name: 'ShowCustomer', params: { id: this.customer.id } })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
