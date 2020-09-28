<template>
  <vue-ladda
    type="submit"
    data-style="expand-right"
    :loading="loading"
    :button-class="`btn btn-${type}`"
    ><slot></slot
  ></vue-ladda>
</template>

<script>
import VueLadda from 'vue-ladda'

export default {
  components: {
    VueLadda
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'success'
    }
  }
}
</script>
