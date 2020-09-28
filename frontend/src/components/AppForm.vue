<template>
  <form ref="form" @submit.prevent.stop="$emit('submit')">
    <slot></slot>
  </form>
</template>

<style style="scss">
form .form-errors {
  color: #dc3545;
  padding-left: 1.25rem;
  margin-bottom: 0rem;
}
</style>

<script>
import { each } from 'lodash'
import $ from 'jquery'

export default {
  props: {
    errors: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  watch: {
    /**
     * Watch for changes in the errors of the form.
     *
     * @param {Object} The updated errors.
     */
    errors: function(errors) {
      const form = $(this.$refs.form)
      form.find('.is-invalid').removeClass('is-invalid')
      form.find('.form-errors').remove()

      each(errors, (errorList, key) => {
        const input = form.find('[name="' + key + '"]')
        const errorBlock = $('<ul class="form-errors form-text"></ul>')
        errorList.forEach(error => {
          errorBlock.append('<li>' + error + '</li>')
        })

        input.after(errorBlock)
        input.addClass('is-invalid')
      })
    }
  }
}
</script>
