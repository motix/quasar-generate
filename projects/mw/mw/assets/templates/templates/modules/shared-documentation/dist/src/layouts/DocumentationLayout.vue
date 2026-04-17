<template>
  <QPagePadding padding>
    <RouterView />
  </QPagePadding>
</template>

<style lang="scss" scoped>
:deep() code {
  background-color: $accent;
  color: #fff;
}

:deep() table {
  border-spacing: 0px;

  th {
    font-size: 1.1em;
    font-weight: 500;
  }

  th,
  td {
    padding: 7px 16px;
    vertical-align: top;
  }

  td {
    border-top: solid 1px $table-border-color;
  }
}
</style>
