<template>
  <div
    class="hx-sender-select-dropdown"
    v-if="show"
    :style="{
      left: left + 'px',
      top: top + 'px'
    }"
    ref="dropdown"
    @click.stop
  >
    <div class="hx-sender-select-dropdown-title">{{ data.title }}</div>
    <div class="hx-sender-select-dropdown-list">
      <div
        v-for="item in list"
        :key="item.id"
        class="hx-sender-select-dropdown-item"
        :class="{ selected: item.selected }"
        @click="_onClick(item)"
      >
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    position: {
      type: Object
    },
    value: {
      type: String,
      default: ''
    },
    data: {
      type: Object
    }
  },
  data() {
    return {
      left: -99999,
      top: -99999,
      list: [],
      margin: 5
    }
  },
  watch: {
    show: {
      handler(val) {
        if (val) {
          this._handleShow()
        } else {
          this._handleHide()
        }
      }
    }
  },
  methods: {
    _handleShow() {
      this.list = this.data.options.map(item => ({
        ...item,
        selected: item.id === this.value
      }))
      this.$nextTick(() => {
        const el = this.$refs.dropdown
        const width = el.offsetWidth
        const height = el.offsetHeight
        const windowWidth = window.innerWidth
        const windowHeight = window.innerHeight
        document.body.appendChild(el)
        if (this.position.left + width > windowWidth) {
          this.left = windowWidth - width
        } else {
          this.left = this.position.left
        }
        const _top = this.position.top + this.position.height + this.margin
        if (_top + height > windowHeight) {
          this.top = this.position.top - height - this.margin
        } else {
          this.top = _top
        }
      })
    },

    _handleHide() {
      this.left = -99999
      this.top = -99999
      this.list = []
    },

    _onClick(item) {
      this.$emit('change', item.id)
      this.$emit('update:show', false)
    }
  }
}
</script>

<style lang="less" scoped>
.hx-sender-select-dropdown {
  position: fixed;
  z-index: 1000;
  min-width: 70px;
  overflow: hidden;

  padding: 4px;
  list-style-type: none;
  background-color: #fff;
  background-clip: padding-box;
  border-radius: 8px;
  outline: none;
  box-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);

  .hx-sender-select-dropdown-title {
    font-weight: bold;
    font-size: 14px;
    padding: 8px 12px;
  }

  .hx-sender-select-dropdown-list {
    max-height: 200px;
    overflow-y: auto;

    .hx-sender-select-dropdown-item {
      display: flex;
      margin: 0;
      padding: 5px 12px;
      color: rgba(0, 0, 0, 0.88);
      font-weight: normal;
      font-size: 14px;
      line-height: 1.5;
      cursor: pointer;
      transition: all 0.2s;
      border-radius: 4px;

      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }

      &.selected {
        color: #6e4bfa;
        background-color: rgba(110, 75, 250, 0.09);
      }
    }
  }
}
</style>
