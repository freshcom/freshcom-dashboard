import _ from 'lodash'

import PaymentAPI from '@/api/payment'
import RefundAPI from '@/api/refund'
import JSONAPI from '@/jsonapi'
import CardAPI from '@/api/card'
import Payment from '@/models/payment'

const MT = {
  SET_RECORD: 'SET_RECORD',
  SET_RECORD_DRAFT: 'SET_RECORD_DRAFT',
  RESET_RECORD: 'RESET_RECORD',
  SET_RECORDS: 'SET_RECORDS',
  SELECTABLE_CARDS_LOADING: 'SELECTABLE_CARDS_LOADING',
  SELECTABLE_CARDS_CHANGED: 'SELECTABLE_CARDS_CHANGED',
  SELECTABLE_CARDS_RESET: 'SELECTABLE_CARDS_RESET'
}

export default {
  namespaced: true,
  state: {
    record: Payment.objectWithDefaults(),
    recordDraft: Payment.objectWithDefaults(),
    records: [],
    selectableCards: []
  },
  actions: {
    setRecordDraft ({ commit }, record) {
      commit(MT.SET_RECORD_DRAFT, record)
    },

    resetRecord ({ commit }) {
      commit(MT.RESET_RECORD)
    },

    getPayment ({ state, commit, rootState }, actionPayload) {
      let options = _.merge({}, actionPayload, { locale: rootState.resourceLocale })
      return PaymentAPI.getRecord(actionPayload.id, options).then(response => {
        let apiPayload = response.data
        let payment = JSONAPI.deserialize(apiPayload.data, apiPayload.included)

        return payment
      }).catch(error => {
        throw JSONAPI.deserializeErrors(error.response.data.errors)
      })
    },

    createRecord (context, recordDraft) {
      let apiPayload = { data: JSONAPI.serialize(recordDraft) }
      return PaymentAPI.createRecord(recordDraft.order.id, apiPayload).then(response => {
        return JSONAPI.deserialize(response.data.data)
      }).then(record => {
        context.commit(MT.SET_RECORD, record)

        return record
      }).catch(error => {
        throw JSONAPI.deserializeErrors(error.response.data.errors)
      })
    },

    updateRecord ({ state, commit, rootState }, actionPayload) {
      let apiPayload = { data: JSONAPI.serialize(actionPayload.recordDraft) }

      let options = _.merge({}, actionPayload, { locale: rootState.resourceLocale })
      return PaymentAPI.updateRecord(actionPayload.id, apiPayload, options).then(response => {
        let apiPayload = response.data
        let record = JSONAPI.deserialize(apiPayload.data, apiPayload.included)
        commit(MT.SET_RECORD, record)

        return record
      }).catch(error => {
        throw JSONAPI.deserializeErrors(error.response.data.errors)
      })
    },

    loadRecords ({ state, commit, rootState }, actionPayload) {
      actionPayload = _.merge({}, actionPayload, { locale: rootState.resourceLocale })

      return PaymentAPI.queryRecord(actionPayload).then(response => {
        return { meta: response.data.meta, resources: JSONAPI.deserialize(response.data.data) }
      }).then(response => {
        commit(MT.SET_RECORDS, response.resources)

        return response
      })
    },

    deletePayment ({ commit }, id) {
      return PaymentAPI.deleteRecord(id).then(response => {
        return response
      })
    },

    loadCards ({ commit, rootState }, actionPayload) {
      actionPayload = _.merge({}, actionPayload, { locale: rootState.resourceLocale })

      return CardAPI.queryRecord(actionPayload).then(response => {
        let apiPayload = response.data
        return { meta: response.data.meta, resources: JSONAPI.deserialize(apiPayload.data, apiPayload.included) }
      }).then(response => {
        return response.resources
      })
    },

    createRefund ({ rootState }, refundDraft) {
      let apiPayload = { data: JSONAPI.serialize(refundDraft) }
      let payment = refundDraft.payment

      return RefundAPI.createRecord(refundDraft.payment.id, apiPayload).then(() => {
        let options = { locale: rootState.resourceLocale, include: 'refunds' }
        return PaymentAPI.getRecord(payment.id, options)
      }).then(response => {
        let apiPayload = response.data
        let payment = JSONAPI.deserialize(apiPayload.data, apiPayload.included)

        return payment
      }).catch(error => {
        throw JSONAPI.deserializeErrors(error.response.data.errors)
      })
    }
  },

  mutations: {
    [MT.RESET_RECORD] (state) {
      state.record = Payment.objectWithDefaults()
      state.recordDraft = Payment.objectWithDefaults()
    },

    [MT.SET_RECORD] (state, record) {
      state.record = record
      state.recordDraft = record
    },

    [MT.SET_RECORD_DRAFT] (state, recordDraft) {
      state.recordDraft = recordDraft
    },

    [MT.SET_RECORDS] (state, records) {
      state.records = records
    },

    [MT.SELECTABLE_CARDS_CHANGED] (state, cards) {
      state.selectableCards = cards
      state.isLoadingSelectableCards = false
    },

    [MT.SELECTABLE_CARDS_LOADING] (state) {
      state.isLoadingSelectableCards = true
    },

    [MT.SELECTABLE_CARDS_RESET] (state) {
      state.isLoadingSelectableCards = true
      state.selectableCards = []
    }
  }
}
