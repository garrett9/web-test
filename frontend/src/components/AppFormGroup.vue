<template>
  <div class="form-group row">
    <label
      class="col-sm-12"
      :class="{ 'col-md-3 col-form-label text-md-right': !fullWidth }"
      >{{ label }}</label
    >
    <div class="col-sm-12" :class="{ 'col-md-6': !fullWidth }">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      required: true,
      type: String
    },
    fullWidth: {
      default: false,
      type: Boolean
    }
  }
}
</script>
