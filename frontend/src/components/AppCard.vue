<template>
  <div class="card ">
    <div class="card-header text-white bg-dark">
      {{ header }}
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    header: {
      required: true,
      type: String
    }
  }
}
</script>

<style style="scss" scoped>
.card .card-header {
  font-size: 1.25rem;
}
</style>
